import type  { ErrorRequestHandler } from 'express';
import type { ErrorResponseType } from '@/types/errors';
import AppError from '@/utils/appError';

const globalErrorHandler: ErrorRequestHandler = (
  error,
  _,
  res,
  _1
) => {
  console.log('error ocurred', error);

  if (error instanceof AppError) {
    const {
      status,
      statusCode,
      message,
      errors
    } = error;

    const responseData: ErrorResponseType = { status };
    
    if (message && message.trim().length > 1) {
      responseData.message = message;
    }

    if (errors && Object.keys(errors).length > 0) {
      responseData.errors = errors;
    }

    res.status(statusCode).json(responseData);
    return;
  }

  res.status(500).json({
    status: 'error',
    message: error.message || 'Something went wong'
  });
};

export default globalErrorHandler;