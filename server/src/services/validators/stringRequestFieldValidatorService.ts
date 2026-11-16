import { type StringRequestFieldValidatorServiceParams } from '@/types/services/validators/stringRequestFieldValidatorService';
import AppError from '@/utils/appError';

class StringRequestFieldValidatorService {
  private handleResult ({ errors, shouldThrowError }: {
    errors: string[];
    shouldThrowError: boolean
  }): string {
    if (shouldThrowError && errors.length > 0) {
      throw new AppError(400, errors[0] ?? 'Validation error');
    }

    return errors.join('. ');
  }

  validate ({
    field,
    options = {},
    fieldName,
    requiredErrorMsg,
    shouldThrowError = false
  }: StringRequestFieldValidatorServiceParams): string {
    const errors: string[] = [];

    if (typeof field !== 'string' || field.trim().length === 0) {
      errors.push(requiredErrorMsg ??`Invalid ${fieldName ?? 'field'}: text is required.`);
      return this.handleResult({ errors, shouldThrowError });
    }

    const value = field.trim();

    if (options.minLength && value.length < options.minLength.value) {
      errors.push(options.minLength.errorMsg);
    }

    if (options.maxLength && value.length > options.maxLength.value) {
      errors.push(options.maxLength.errorMsg);
    }

    if (options.maxWordsAllowed) {
      const wordCount = value.split(/\s+/).length;
      if (wordCount > options.maxWordsAllowed.value) {
        errors.push(options.maxWordsAllowed.errorMsg);
      }
    }

    return this.handleResult({ errors, shouldThrowError });
  }
}

export default StringRequestFieldValidatorService;