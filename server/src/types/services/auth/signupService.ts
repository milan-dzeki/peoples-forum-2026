import { ApiFilesType } from '@/types/common';

export interface SignupServiceParams {
  fields: Record<string, string>;
  files: ApiFilesType;
}

export interface SignupRequestFields {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}