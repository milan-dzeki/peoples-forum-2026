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

export interface StringRequestFieldValidatorServiceParams {
  field: unknown;
  options?: StringValidateOptions;
  requiredErrorMsg?: string;
  fieldName?: string;
  shouldThrowError?: boolean;
}