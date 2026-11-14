import type { Request, Response, NextFunction } from 'express';
import type { Fields, Files } from 'formidable';

export interface RequestWithFiles extends Request {
  fields?: Fields;
  files?: Files;
}

export interface RequestWithBodyType extends Request {
  body: {
    [name: string]: string | unknown;
  }
}

export type ControllerType = (
  req: RequestWithBodyType,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<Response<any, Record<string, any>> | undefined>;