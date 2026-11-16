import { isEmail } from 'validator';
import type { SignupRequestFields, SignupServiceParams } from '@/types/services/auth/signupService';
import type { CreateUserData } from '@/types/services/usersService';
import { SIGNUP_ALLOWED_FIELD_NAMES } from '@/constants/users';
import { PHOTO_FILE_VALIDATION } from '@/dataConfigs/fileValidationConfigs';
import { RESOURCE_TYPES } from '@/constants/cloudinary';
import { REFRESH_TOKEN } from '@/dataConfigs/tokens';
import AppError from '@/utils/appError';
import StringRequestFieldValidatorService from '@/services/validators/stringRequestFieldValidatorService';
import userModelValidationConfig from '@/dataConfigs/modelValidators/userModelValidationConfig';
import UsersService from '@/services/usersService';
import ErrorsService from '@/services/errorsService';
import FileValidatorService from '@/services/validators/fileValidatorService';
import CloudinaryManagementService from '@/services/cloudinaryManagementService';
import SessionService from './sessionService';
import formatUserForResponse from '@/utils/formatUserForResponse';
import TokenService from './tokenService';
import PasswordService from './passwordService';

interface Dependencies {
  stringValidatorService: StringRequestFieldValidatorService;
  fileValidatorService: FileValidatorService;
  usersService: UsersService;
  errorsService: ErrorsService;
  cloudinaryManagementService: CloudinaryManagementService;
  tokenService: TokenService;
  sessionService: SessionService;
  passwordService: PasswordService;
}

class SignupService {
  constructor(private readonly dependencies: Dependencies) {}

  private async validateEmail (providedEmail: unknown) {
    const { email } = userModelValidationConfig;

    if (!providedEmail) {
      return email.requiredErrorMsg;
    }

    if (typeof providedEmail !== 'string' || !isEmail(providedEmail)) {
      return email.invalidEmailErrorMsg;
    }

    const emailTaken = await this.dependencies.usersService.isEmailTaken(providedEmail)

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
      firstName: this.dependencies.stringValidatorService.validate({
        field: firstNameVal,
        options: {
          minLength: firstName.minLength,
          maxLength: firstName.maxLength,
          maxWordsAllowed: firstName.maxWordsAllowed,
        },
      }),
      lastName: this.dependencies.stringValidatorService.validate({
        field: lastNameVal,
        options: {
          minLength: lastName.minLength,
          maxLength: lastName.maxLength,
          maxWordsAllowed: lastName.maxWordsAllowed,
        },
      }),
      email: await this.validateEmail(emailVal),
      password: this.dependencies.stringValidatorService.validate({
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
            profilePhoto: this.dependencies.fileValidatorService.validate({
              file: profileImageFile,
              maxAllowedSize: PHOTO_FILE_VALIDATION.allowedSize,
              allowedTypes: PHOTO_FILE_VALIDATION.allowedTypes,
              entityName: 'Profile image',
            }),
          }
        : {}),
    };


    this.dependencies.errorsService.throwFieldsErrorIfDataInvalid(errors);

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

  private async prepareUserData({ fields, file }: { fields: SignupRequestFields; file: File & { path: string } | undefined }): Promise<CreateUserData> {
    const { passwordService } = this.dependencies;

    const hashedPassword = await passwordService.hashPassword(fields.password);
    const uploadedProfilePhoto = file
      ? await this.dependencies.cloudinaryManagementService.uploadSingleFile({ file, resourceType: RESOURCE_TYPES.IMAGE })
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

      const newUser = await this.dependencies.usersService.create(createData);

      const accessToken = this.dependencies.tokenService.createAccessToken(
        newUser._id.toString()
      );
  
      const refreshToken = this.dependencies.tokenService.generateRandomToken();
  
      const refreshTokenHash = this.dependencies.tokenService.hashToken(refreshToken);
  
      await this.dependencies.sessionService.create({
        user: newUser._id.toString(),
        refreshTokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN.duration)
      });

      return {
        user: formatUserForResponse(newUser),
        accessToken,
        refreshToken
      };
    } catch (error: unknown) {
      if (profileImagePublicIdForCleanUp) {
        await this.dependencies.cloudinaryManagementService.deleteSingleFile({
          publicId: profileImagePublicIdForCleanUp,
          resourceType: RESOURCE_TYPES.IMAGE
        });
      }

      throw error;
    }
  }
}

export default SignupService;