import {
  Schema,
  models,
  model,
  type HydratedDocument,
  type InferSchemaType,
  Model
} from 'mongoose';
import DATABASE_MODEL_NAMES from '@/constants/databaseModels';

const { USER, SESSION } = DATABASE_MODEL_NAMES;

const sessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: USER,
    required: true
  },
  refreshTokenHash: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

sessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export type SessionType = InferSchemaType<typeof sessionSchema>;
export type SessionSchemaType = HydratedDocument<SessionType>;

const Session = (models[SESSION] as Model<SessionType>) || model(SESSION, sessionSchema);

export default Session;