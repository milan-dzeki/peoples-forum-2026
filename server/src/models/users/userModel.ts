import {
  Schema,
  models,
  model,
  type HydratedDocument,
  type InferSchemaType
} from 'mongoose';
import { isEmail } from 'validator';
import DATABASE_MODEL_NAMES from '@/constants/databaseModels';
import { USER_FIELD_NAMES } from '@/constants/users';
import userModelValidationConfig from '@/dataConfigs/modelValidators/userModelValidationConfig';

const {
  firstName,
  lastName,
  email,
  password
} = userModelValidationConfig;

const {
  FIRST_NAME,
  LAST_NAME,
  FULL_NAME,
  EMAIL,
  PASSWORD,
  ROLE,
  PROFILE_IMAGE_URL,
  PROFILE_IMAGE_PUBLIC_ID,
  BANNER_IMAGE_URL,
  BANNER_IMAGE_PUBLIC_ID,
  DEACTIVATED,
  LAST_TIME_SEEN
} = USER_FIELD_NAMES;

const userSchema = new Schema({
  [FIRST_NAME]: {
    type: String,
    required: [
      true,
      firstName.requiredErrorMsg
    ],
    minLength: [
      firstName.minLength.value,
      firstName.minLength.errorMsg
    ],
    maxLength: [
      firstName.maxLength.value,
      firstName.maxLength.errorMsg
    ]
  },
  [LAST_NAME]: {
    type: String,
    required: [
      true,
      lastName.requiredErrorMsg
    ],
    minLength: [
      lastName.minLength.value,
      lastName.minLength.errorMsg
    ],
    maxLength: [
      lastName.maxLength.value,
      lastName.maxLength.errorMsg
    ]
  },
  [FULL_NAME]: String,
  [EMAIL]: {
    type: String,
    required: [true, email.requiredErrorMsg],
    lowercase: true,
    unique: true,
    validate: [
      isEmail,
      email.invalidEmailErrorMsg
    ]
  },
  [PASSWORD]: {
    type: String,
    required: [true, password.requiredErrorMsg],
    select: false
  },
  [ROLE]: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Role can only be user or admin'
    },
    default: 'user'
  },
  [PROFILE_IMAGE_URL]: {
    type: String,
    default: null
  },
  // for cloudinary - to be able to use it for user deletions
  [PROFILE_IMAGE_PUBLIC_ID]: {
    type: String,
    select: false,
    default: null
  },
  [BANNER_IMAGE_URL]: {
    type: String,
    default: null
  },
  // for cloudinary
  [BANNER_IMAGE_PUBLIC_ID]: {
    type: String,
    select: false,
    default: null
  },
  [DEACTIVATED]: {
    type: Boolean,
    default: false
  },
  [LAST_TIME_SEEN]: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export type UserSchemaType = HydratedDocument<InferSchemaType<typeof userSchema>>;

const User = models[DATABASE_MODEL_NAMES.USER] ||
  model(DATABASE_MODEL_NAMES.USER, userSchema);

export default User;

