import StringRequestFieldValidatorService from '@/services/validators/stringRequestFieldValidatorService';
import FileValidatorService from './fileValidatorService';
import userModelValidationConfig from '@/dataConfigs/modelValidators/userModelValidationConfig';
import { PHOTO_FILE_VALIDATION } from '@/dataConfigs/fileValidationConfigs';
import AppError from '@/utils/appError';
import PasswordService from '../auth/passwordService';

interface Dependencies {
  stringRequestFieldValidatorService: StringRequestFieldValidatorService;
  fileValidatorService: FileValidatorService;
  passwordService: PasswordService;
}

class UserFieldsValidatorService {
  constructor (private readonly dependencies: Dependencies) {}

  private validateName ({
    field,
    fieldName,
    shouldThrowError = false
  }: {
    field: unknown;
    fieldName: 'firstName' | 'lastName' | 'password',
    shouldThrowError?: boolean;
  }): string {
    const { stringRequestFieldValidatorService } = this.dependencies;

    const config = userModelValidationConfig[fieldName];
    const {
      requiredErrorMsg,
      minLength,
      maxLength
    } = config;

    return stringRequestFieldValidatorService.validate({
      field,
      options: {
        minLength,
        maxLength,
        ...('maxWordsAllowed' in config ? {
          maxWordsAllowed: config.maxWordsAllowed
        } : {})
      },
      requiredErrorMsg,
      shouldThrowError
    });
  }

  firstName (field: unknown, shouldThrowError: boolean = false): string {
    return this.validateName({
      field,
      fieldName: 'firstName',
      shouldThrowError
    });
  }

  lastName (field: unknown, shouldThrowError: boolean = false): string {
    return this.validateName({
      field,
      fieldName: 'lastName',
      shouldThrowError
    }); 
  }

  profilePhoto (profileImageFile: unknown, shouldThrowError: boolean = false): string {
    const { fileValidatorService } = this.dependencies;

    const error = fileValidatorService.validate({
      file: profileImageFile,
      maxAllowedSize: PHOTO_FILE_VALIDATION.allowedSize,
      allowedTypes: PHOTO_FILE_VALIDATION.allowedTypes,
      entityName: 'Profile image',
    });

    if (error && shouldThrowError) {
      throw new AppError(400, error);
    }

    return error;
  }

  async currentPassword (userPasswordHash: string, providedPassword: unknown): Promise<void> {
    if (!providedPassword || typeof providedPassword !== 'string') {
      throw new AppError(422, 'Invalid credentials.');
    }

    const { passwordService } = this.dependencies;

    const isValid = await passwordService.comparePasswords(providedPassword, userPasswordHash);
    if (!isValid) {
      throw new AppError(422, 'Invalid credentials.');
    }
  }

  password (field: unknown, shouldThrowError: boolean = false): string {
    return this.validateName({
      field,
      fieldName: 'password',
      shouldThrowError
    }); 
  }

  passwordConfirm ({
    providedPassword,
    providedPasswordConfirm,
    shouldThrowError = false
  }: {
    providedPassword: unknown;
    providedPasswordConfirm: unknown;
    shouldThrowError?: boolean;
  }): string {
    const { passwordConfirm } = userModelValidationConfig;

    if (!providedPasswordConfirm || typeof providedPasswordConfirm !== 'string') {
      if (shouldThrowError) {
        throw new AppError(400, passwordConfirm.requiredErrorMsg);
      }
      return passwordConfirm.requiredErrorMsg;
    }

    if (providedPassword !== providedPasswordConfirm) {
      if (shouldThrowError) {
        throw new AppError(400, passwordConfirm.passwordsNotSameErrorMgs);
      }
      return passwordConfirm.passwordsNotSameErrorMgs;
    }

    return '';
  }
}

export default UserFieldsValidatorService;