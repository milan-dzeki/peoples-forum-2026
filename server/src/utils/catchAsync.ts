import type { Request, RequestHandler } from 'express';
import type { ControllerType } from '@/types/request';

const catchAsync = <R extends Request>(
  controller: ControllerType<R>
): RequestHandler => {
  const handler: RequestHandler = (req, res, next) => {
    controller(req as R, res, next).catch((error: unknown) => next(error));
  };
  return handler;
};

export default catchAsync;