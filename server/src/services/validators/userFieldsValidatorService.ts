import StringRequestFieldValidatorService from '@/services/validators/stringRequestFieldValidatorService';
import FileValidatorService from './fileValidatorService';
import userModelValidationConfig from '@/dataConfigs/modelValidators/userModelValidationConfig';
import { PHOTO_FILE_VALIDATION } from '@/dataConfigs/fileValidationConfigs';
import AppError from '@/utils/appError';

interface Dependencies {
  stringRequestFieldValidatorService: StringRequestFieldValidatorService;
  fileValidatorService: FileValidatorService;
}

class UserFieldsValidatorService {
  constructor (private readonly dependencies: Dependencies) {}

  private validateName ({
    field,
    fieldName,
    shouldThrowError = false
  }: {
    field: unknown;
    fieldName: 'firstName' | 'lastName',
    shouldThrowError?: boolean;
  }): string {
    const { stringRequestFieldValidatorService } = this.dependencies;
    const {
      requiredErrorMsg,
      minLength,
      maxLength,
      maxWordsAllowed
    } = userModelValidationConfig[fieldName];

    return stringRequestFieldValidatorService.validate({
      field,
      options: {
        minLength,
        maxLength,
        maxWordsAllowed
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
}

export default UserFieldsValidatorService;