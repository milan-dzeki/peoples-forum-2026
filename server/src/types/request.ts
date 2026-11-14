import type { Request } from 'express';
import type { Fields, Files } from 'formidable';

export interface RequestWithFiles extends Request {
  fields?: Fields;
  files?: Files;
}