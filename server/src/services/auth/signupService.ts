import { isEmail } from 'validator';
import bcrypt from 'bcryptjs';
import type { SignupRequestFields, SignupServiceParams } from '@/types/services/auth/signupService';
import type { CreateUserData } from '@/types/services/usersService';
import { SIGNUP_ALLOWED_FIELD_NAMES } from '@/constants/users';
import { PHOTO_FILE_VALIDATION } from '@/dataConfigs/fileValidationConfigs';
import { RESOURCE_TYPES } from '@/constants/cloudinary';
import AppError from '@/utils/appError';
import StringRequestFieldValidator from '@/services/validators/stringRequestFieldValidator';
import userModelValidationConfig from '@/dataConfigs/modelValidators/userModelValidationConfig';
import UsersService from '@/services/usersService';
import ErrorsService from '@/services/errorsService';
import FileValidator from '@/services/validators/fileValidator';
import CloudinaryManagementService from '@/services/cloudinaryManagementService';
import createTokenAndFormatUserForResponse from '@/utils/createTokenAndFormatUserForResponse';

class SignupService {
  constructor(
    private readonly stringValidator: StringRequestFieldValidator,
    private readonly fileValidator: FileValidator,
    private readonly usersService: UsersService,
    private readonly errorsService: ErrorsService,
    private readonly cloudinaryManagementService: CloudinaryManagementService
  ) {}

  private async validateEmail (providedEmail: unknown) {
    const { email } = userModelValidationConfig;

    if (!providedEmail) {
      return email.requiredErrorMsg;
    }

    if (typeof providedEmail !== 'string' || !isEmail(providedEmail)) {
      return email.invalidEmailErrorMsg;
    }

    const emailTaken = await this.usersService.isEmailTaken(providedEmail)

    if (emailTaken) {
      return email.emailExistsInDatabaseErrorMsg;
    }
    
    return '';
  }

  private validatePasswordConfirmation(providedPassword: unknown, providedPasswordConfirm: unknown): string {
    const { passwordConfirm } = userModelValidationConfig;

    if (!providedPasswordConfirm || typeof providedPasswordConfirm !== 'string') {
      return passwordConfirm.requiredErrorMsg;
    }

    if (providedPassword !== providedPasswordConfirm) {
      return passwordConfirm.passwordsNotSameErrorMgs;
    }

    return '';
  }

  private async validate (request: SignupServiceParams): Promise<{ fields: SignupRequestFields; file: File & { path: string } | undefined }> {
    if (!request || !request.fields) {
      throw new AppError(400, 'Request invalid. No data found');
    }

    if (Object.keys(request.fields).some((fieldName) => !SIGNUP_ALLOWED_FIELD_NAMES.includes(fieldName))) {
      throw new AppError(422, 'Invalid field names provided.');
    }

    const { fields, files } = request;

    const { firstName, lastName, password } = userModelValidationConfig;

    const firstNameVal = fields.firstName?.trim() ?? '';
    const lastNameVal = fields.lastName?.trim() ?? '';
    const emailVal = fields.email?.trim().toLowerCase() ?? '';
    const passwordVal = fields.password ?? '';
    const passwordConfirmVal = fields.passwordConfirm ?? '';
    const profileImageFile = files?.profileImage;

    const errors = {
      firstName: this.stringValidator.validate({
        field: firstNameVal,
        options: {
          minLength: firstName.minLength,
          maxLength: firstName.maxLength,
          maxWordsAllowed: firstName.maxWordsAllowed,
        },
      }),
      lastName: this.stringValidator.validate({
        field: lastNameVal,
        options: {
          minLength: lastName.minLength,
          maxLength: lastName.maxLength,
          maxWordsAllowed: lastName.maxWordsAllowed,
        },
      }),
      email: await this.validateEmail(emailVal),
      password: this.stringValidator.validate({
        field: passwordVal,
        options: {
          minLength: password.minLength,
          maxLength: password.maxLength,
        },
      }),
      passwordConfirm: this.validatePasswordConfirmation(
        passwordVal,
        passwordConfirmVal,
      ),
      ...(profileImageFile
        ? {
            profilePhoto: this.fileValidator.validate({
              file: profileImageFile,
              maxAllowedSize: PHOTO_FILE_VALIDATION.allowedSize,
              allowedTypes: PHOTO_FILE_VALIDATION.allowedTypes,
              entityName: 'Profile image',
            }),
          }
        : {}),
    };


    this.errorsService.throwFieldsErrorIfDataInvalid(errors);

    return {
      fields: {
        firstName: firstNameVal,
        lastName: lastNameVal,
        email: emailVal,
        password: passwordVal,
      },
      file: profileImageFile,
    };
  }

  private async hashPassword (password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      if (!hashedPassword) {
        throw new AppError(500, 'Failed to setup password. Try again.');
      }

      return hashedPassword;
    } catch {
      throw new AppError(500, 'Failed to setup password. Try again.');
    }
  }

  private async prepareUserData({ fields, file }: { fields: SignupRequestFields; file: File & { path: string } | undefined }): Promise<CreateUserData> {
    const hashedPassword = await this.hashPassword(fields.password);
    const uploadedProfilePhoto = file
      ? await this.cloudinaryManagementService.uploadSingleFile({ file, resourceType: RESOURCE_TYPES.IMAGE })
      : { secure_url: null, public_id: null };

    return {
      firstName: fields.firstName,
      lastName: fields.lastName,
      fullName: `${fields.firstName} ${fields.lastName}`,
      email: fields.email,
      password: hashedPassword,
      profileImageUrl: uploadedProfilePhoto.secure_url,
      profileImagePublicId: uploadedProfilePhoto.public_id
    };
  }

  async execute(request: SignupServiceParams) {
    let profileImagePublicIdForCleanUp: string | null = null;
    try {
      const validatedData = await this.validate(request);
      
      const createData = await this.prepareUserData(validatedData);
      profileImagePublicIdForCleanUp = createData.profileImagePublicId || null;

      const newUser = await this.usersService.create(createData);
      const { user, token } = createTokenAndFormatUserForResponse(newUser);

      return { user, token };
    } catch (error: unknown) {
      if (profileImagePublicIdForCleanUp) {
        await this.cloudinaryManagementService.deleteSingleFile({
          publicId: profileImagePublicIdForCleanUp,
          resourceType: RESOURCE_TYPES.IMAGE
        });
      }

      throw error;
    }
  }
}

export default SignupService;