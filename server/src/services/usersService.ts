import User, { type UserSchemaType } from '@/models/users/userModel';
import { USER_FIELD_NAMES } from '@/constants/users';
import type { ClientSession } from 'mongoose';
import type { CreateUserData } from '@/types/services/usersService';
import AppError from '@/utils/appError';
import UserFieldsValidatorService from '@/services/validators/userFieldsValidatorService';
import ErrorsService from '@/services/errorsService';
import CloudinaryManagementService from './cloudinaryManagementService';
import { RESOURCE_TYPES } from '@/constants/cloudinary';
import SessionService from './auth/sessionService';
import withTransaction from '@/utils/withTansaction';
import PasswordService from './auth/passwordService';

const { EMAIL, PASSWORD, PROFILE_IMAGE_PUBLIC_ID } = USER_FIELD_NAMES;

interface Dependencies {
  userFieldsValidatorService: UserFieldsValidatorService;
  errorsService: ErrorsService;
  cloudinaryManagementService: CloudinaryManagementService;
  sessionService: SessionService;
  passwordService: PasswordService;
}

class UsersService {
  constructor (private readonly dependencies: Dependencies) {}

  async isEmailTaken (email: string): Promise<boolean> {
    const exists = await User.exists({ [EMAIL]: email });
    return !!exists;
  }

  async create (data: CreateUserData, session: ClientSession): Promise<UserSchemaType> {
    const [user] = await User.create([data], { session });
    if (!user) {
      throw new AppError(500, 'User creation failed.');
    }
    return user;
  }

  async getById (id: string): Promise<UserSchemaType | null> {
    return await User.findById(id);
  }

  async getByIdAndThrowIfNotFound (id: string, select: string = ''): Promise<UserSchemaType> {
    const user = await User.findById(id).select(select);
    if (!user) {
      throw new AppError(404, 'Account not found');
    }

    return user;
  }

  async getByEmail (providedEmail: string): Promise<UserSchemaType> {
    const user = await User.findOne({ [EMAIL]: providedEmail.toLowerCase() }).select(`+${PASSWORD}`);

    if (!user) {
      throw new AppError(404, 'Invalid credentials.');
    }
    return user;
  }

  async updateNames ({
    userId,
    firstName,
    lastName
  }: {
    userId: string;
    firstName: unknown;
    lastName: unknown;
  }): Promise<{ firstName: string; lastName: string; fullName: string }> {
    const { userFieldsValidatorService, errorsService } = this.dependencies;

    const errors = {
      firstName: userFieldsValidatorService.firstName(firstName),
      lastName: userFieldsValidatorService.lastName(lastName)
    };
  
    errorsService.throwFieldsErrorIfDataInvalid(errors);

    const user = await this.getByIdAndThrowIfNotFound(userId);
    user.firstName = firstName as string;
    user.lastName = lastName as string;
    user.fullName = `${firstName} ${lastName}`;
    await user.save();

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName
    };
  }

  async updateProfileImage (userId: string, profileImageFile: unknown): Promise<string> {
    const { userFieldsValidatorService, cloudinaryManagementService } = this.dependencies;

    userFieldsValidatorService.profilePhoto(profileImageFile, true);
    const user = await this.getByIdAndThrowIfNotFound(userId, `+${PROFILE_IMAGE_PUBLIC_ID}`);

    const oldProfileImagePublicId = user.profileImagePublicId;

    const uploadedProfileImage = await cloudinaryManagementService.uploadSingleFile({
      file: profileImageFile as File & { path: string },
      resourceType: RESOURCE_TYPES.IMAGE
    });

    user.profileImageUrl = uploadedProfileImage.secure_url;
    user.profileImagePublicId = uploadedProfileImage.public_id;
    await user.save();

    if (oldProfileImagePublicId) {
      await cloudinaryManagementService.deleteSingleFile({
        publicId: oldProfileImagePublicId,
        resourceType: RESOURCE_TYPES.IMAGE
      });
    }

    return user.profileImageUrl;
  }

  async removeProfileImage (userId: string): Promise<void> {
    const user = await this.getByIdAndThrowIfNotFound(userId, `+${PROFILE_IMAGE_PUBLIC_ID}`);
    if (!user.profileImageUrl || !user.profileImagePublicId) {
      throw new AppError(404, 'No image to remove');
    }

    const { cloudinaryManagementService } = this.dependencies;

    await cloudinaryManagementService.deleteSingleFile({
      publicId: user.profileImagePublicId,
      resourceType: RESOURCE_TYPES.IMAGE,
      shouldThrowError: true
    });

    user.profileImageUrl = null;
    user.profileImagePublicId = null;
    await user.save();
  }

  async changePassword ({
    userId,
    currentPassword,
    newPassword,
    newPasswordConfirm
  }: {
    userId: string;
    currentPassword: unknown;
    newPassword: unknown;
    newPasswordConfirm: unknown;
  }) {
    const user = await this.getByIdAndThrowIfNotFound(userId, `+${PASSWORD}`);

    const { userFieldsValidatorService, sessionService, passwordService } = this.dependencies;

    await userFieldsValidatorService.currentPassword(user.password, currentPassword);
    userFieldsValidatorService.password(newPassword, true);
    userFieldsValidatorService.passwordConfirm({
      providedPassword: newPassword,
      providedPasswordConfirm: newPasswordConfirm,
      shouldThrowError: true
    });

    const hashedNewPassword = await passwordService.hashPassword(newPassword as string);

    user.password = hashedNewPassword;
    
    await withTransaction(async (mongoSession) => {
      await user.save({ session: mongoSession });
      await sessionService.revokeForAllDevices(user._id.toString(), mongoSession);
    });
  }

  async deactivateAccount (userId: string, password: unknown): Promise<void> {
    const user = await this.getByIdAndThrowIfNotFound(userId, `+${PASSWORD}`);

    const { userFieldsValidatorService, sessionService } = this.dependencies;

    await userFieldsValidatorService.currentPassword(user.password, password);

    user.deactivated = true;

    await withTransaction(async (mongoSession) => {
      await user.save({ session: mongoSession });
      await sessionService.revokeForAllDevices(user._id.toString(), mongoSession);
    });
  };
}

export default UsersService;