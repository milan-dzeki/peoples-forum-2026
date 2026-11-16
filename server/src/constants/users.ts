export const USER_FIELD_NAMES = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  FULL_NAME: 'fullName',
  EMAIL: 'email',
  PASSWORD: 'password',
  ROLE: 'role',
  PROFILE_IMAGE_URL: 'profileImageUrl',
  PROFILE_IMAGE_PUBLIC_ID: 'profileImagePublicId',
  DEACTIVATED: 'deactivated',
  LAST_TIME_SEEN: 'lastTimeSeen'
} as const;

const PASSWORD_CONFIRM = 'passwordConfirm';

export const SIGNUP_ALLOWED_FIELD_NAMES = [
  USER_FIELD_NAMES.FIRST_NAME,
  USER_FIELD_NAMES.LAST_NAME,
  USER_FIELD_NAMES.EMAIL,
  USER_FIELD_NAMES.PASSWORD,
  PASSWORD_CONFIRM
];