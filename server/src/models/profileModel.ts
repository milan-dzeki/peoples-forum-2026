import {
  Schema,
  models,
  model,
  type InferSchemaType,
  type HydratedDocument
} from 'mongoose';
import DATABASE_MODEL_NAMES from '@/constants/databaseModels';
import { PROFILE_FIELD_NAMES } from '@/constants/profile';

const { USER, PROFILE } = DATABASE_MODEL_NAMES;

const {
  USER_REF,
  DESCRIPTION,
  BANNER_IMAGE_URL,
  BANNER_IMAGE_PUBLIC_ID,
  COUNTRY,
  STATE,
  CITY,
  OCCUPATION,
  HOBBIES
} = PROFILE_FIELD_NAMES;

const profileSchema = new Schema({
  [USER_REF]: {
    type: Schema.Types.ObjectId,
    ref: USER,
    required: true
  },
  [DESCRIPTION]: {
    type: String,
    default: null
  },
  [BANNER_IMAGE_URL]: {
    type: String,
    default: null
  },
  // for cloudinary - to be able to use it for user deletions
  [BANNER_IMAGE_PUBLIC_ID]: {
    type: String,
    default: null
  },
  [COUNTRY]: {
    type: String,
    default: null
  },
  [STATE]: {
    type: String,
    default: null
  },
  [CITY]: {
    type: String,
    default: null
  },
  [OCCUPATION]: {
    type: String,
    default: null
  },
  [HOBBIES]: {
    type: [String],
    default: []
  }
}, { timestamps: true });

type ProfileType = InferSchemaType<typeof profileSchema>;
export type ProfileSchemaType = HydratedDocument<ProfileType>;

const Profile = models[PROFILE] || model(PROFILE, profileSchema);

export default Profile;