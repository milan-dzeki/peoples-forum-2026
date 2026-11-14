import type { RequestHandler } from 'express';
import type { ControllerType } from '@/types/request';

const catchAsync = (
  controller: ControllerType
): RequestHandler => {
  const handler: RequestHandler = (req, res, next) => {
    controller(req, res, next).catch((error: unknown) => next(error));
  };
  return handler;
};

export default catchAsync;