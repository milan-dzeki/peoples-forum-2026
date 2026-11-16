import type { ValidatableFile } from '@/types/services/validators/fileValidatorService';
import AppError from '@/utils/appError';

class FileValidatorService {
  private handleResult({ errors, shouldThrowError }: {
    errors: string[];
    shouldThrowError: boolean
  }): string {
    if (shouldThrowError && errors.length > 0) {
      throw new AppError(400, errors[0] ?? 'Validation error');
    }

    return errors.join('. ');
  }

  private isValidatableFile(file: unknown): file is ValidatableFile {
    if (typeof file !== 'object' || file === null) {
      return false;
    }

    const candidate = file as Record<string, unknown>;

    return (
      typeof candidate.size === 'number' &&
      typeof candidate.path === 'string' &&
      typeof candidate.type === 'string'
    );
  }

  validate({
    file,
    maxAllowedSize,
    allowedTypes,
    entityName,
    shouldThrowError = false
  }: {
    file: unknown;
    maxAllowedSize: {
      value: number;
      text: string;
    };
    allowedTypes: string[];
    entityName?: string;
    shouldThrowError?: boolean
  }): string {
    if (!this.isValidatableFile(file)) {
    const errorMsg = 'Invalid file format provided';

    if (shouldThrowError) {
      throw new AppError(400, errorMsg);
    }

    return errorMsg;
  }

    const errors: string[] = [];

    if (file.size > maxAllowedSize.value) {
      errors.push(`${entityName ?? 'File'} must be under ${maxAllowedSize.text}`)
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`${entityName ?? 'File'} type is not allowed. It can only be one of these: ${allowedTypes.join(', ')}`);
    }

    return this.handleResult({ errors, shouldThrowError });
  }
}

export default FileValidatorService;