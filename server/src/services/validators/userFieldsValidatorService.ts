import StringRequestFieldValidatorService from '@/services/validators/stringRequestFieldValidatorService';
import FileValidatorService from './fileValidatorService';
import userModelValidationConfig from '@/dataConfigs/modelValidators/userModelValidationConfig';

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

  firstName (field: unknown, shouldThrowError: boolean = false) {
    return this.validateName({
      field,
      fieldName: 'firstName',
      shouldThrowError
    });
  }

  lastName (field: unknown, shouldThrowError: boolean = false) {
    return this.validateName({
      field,
      fieldName: 'lastName',
      shouldThrowError
    }); 
  }
}

export default UserFieldsValidatorService;