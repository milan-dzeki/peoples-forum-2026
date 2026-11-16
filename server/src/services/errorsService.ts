import { MultipleErrorsType } from '@/types/errors';
import AppError from '@/utils/appError';

class ErrorsService {
  throwFieldsErrorIfDataInvalid (errors: object) {
    Object.keys(errors).forEach((error) => {
      if (!errors[error as keyof typeof errors]) {
        delete errors[error as keyof typeof errors];
      }
    });

    if (Object.keys(errors).some((error) => errors[error as keyof typeof errors] !== null)) {
      throw new AppError(400, 'Invalid fields provided', errors as MultipleErrorsType);
    }
  }
}

export default ErrorsService;