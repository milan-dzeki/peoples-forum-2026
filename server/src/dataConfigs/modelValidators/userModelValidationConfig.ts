const FIELDS_ALLOWED_LENGTHS = {
  firstName: {
    minLength: 2,
    maxlength: 20,
    maxWords: 2
  },
  lastName: {
    minLength: 2,
    maxLength: 20,
    maxWords: 2
  },
  password: {
    minLength: 6,
    maxLength: 20
  }
};

const userModelValidationConfig = {
  firstName: {
    requiredErrorMsg: 'First Name is required.',
    minLength: {
      value: FIELDS_ALLOWED_LENGTHS.firstName.minLength,
      errorMsg: `First Name must have at least ${FIELDS_ALLOWED_LENGTHS.firstName.minLength} characters.`
    },
    maxLength: {
      value: FIELDS_ALLOWED_LENGTHS.firstName.maxlength,
      errorMsg: `First Name must have no more than ${FIELDS_ALLOWED_LENGTHS.firstName.maxlength} characters.`
    },
    maxWordsAllowed: {
      value: FIELDS_ALLOWED_LENGTHS.firstName.maxWords,
      errorMsg: `No more that ${FIELDS_ALLOWED_LENGTHS.firstName.maxWords} are allowed.`
    }
  },
  lastName: {
    requiredErrorMsg: 'Last Name is required.',
    minLength: {
      value: FIELDS_ALLOWED_LENGTHS.lastName.minLength,
      errorMsg: `Last Name must have at least ${FIELDS_ALLOWED_LENGTHS.lastName.minLength} characters.`
    },
    maxLength: {
      value: FIELDS_ALLOWED_LENGTHS.lastName.maxLength,
      errorMsg: `Last Name must have no more than ${FIELDS_ALLOWED_LENGTHS.lastName.maxLength} characters.`
    },
    maxWordsAllowed: {
      value: FIELDS_ALLOWED_LENGTHS.lastName.maxWords,
      errorMsg: `No more that ${FIELDS_ALLOWED_LENGTHS.lastName.maxWords} words are allowed.`
    }
  },
  email: {
    requiredErrorMsg: 'Email is required.',
    invalidEmailErrorMsg: 'Email with valid format is required.',
    emailExistsInDatabaseErrorMsg: 'Email is already taken.'
  },
  password: {
    requiredErrorMsg: 'Password is required.',
    minLength: {
      value: FIELDS_ALLOWED_LENGTHS.password.minLength,
      errorMsg: `Password must contain at least ${FIELDS_ALLOWED_LENGTHS.password.minLength} characters`
    },
    maxLength: {
      value: FIELDS_ALLOWED_LENGTHS.password.maxLength,
      errorMsg: `Password must not exceed ${FIELDS_ALLOWED_LENGTHS.password.maxLength} characters.`
    }
  },
  passwordConfirm: {
    requiredErrorMsg: 'Password confirmation is required.',
    passwordsNotSameErrorMgs: 'Passwords must be the same.'
  }
};

export default userModelValidationConfig;