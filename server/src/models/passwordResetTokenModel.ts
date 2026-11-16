import {
  Schema,
  models,
  model,
  type HydratedDocument,
  type InferSchemaType,
  Model
} from 'mongoose';
import DATABASE_MODEL_NAMES from '@/constants/databaseModels';

const { USER, PASSWORD_RESET_TOKEN } = DATABASE_MODEL_NAMES;

const passwordResetTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: USER,
    required: true
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

passwordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export type PasswordResetTokenType = InferSchemaType<typeof passwordResetTokenSchema>;
export type PasswordResetTokenSchemaType = HydratedDocument<PasswordResetTokenType>;

const PasswordResetToken = (models[PASSWORD_RESET_TOKEN] as Model<PasswordResetTokenType>)
  || model(PASSWORD_RESET_TOKEN, passwordResetTokenSchema);

export default PasswordResetToken;