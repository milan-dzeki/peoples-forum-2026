export interface MultipleErrorsType {
  [errorName: string]: string | object | unknown[];
}

export interface ErrorResponseType {
  status: string;
  message?: string;
  errors?: MultipleErrorsType;
}