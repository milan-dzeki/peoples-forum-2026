interface StringValidateOptions {
  minLength?: {
    value: number;
    errorMsg: string;
  };
  maxLength?: {
    value: number;
    errorMsg: string;
  };
  maxWordsAllowed?: {
    value: number;
    errorMsg: string;
  };
}

export interface StringRequestFieldValidatorParams {
  field: unknown;
  options?: StringValidateOptions;
  shouldThrowError?: boolean;
}