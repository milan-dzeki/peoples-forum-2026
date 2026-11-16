import type { ClientSession } from 'mongoose';
import PasswordResetToken, { type PasswordResetTokenSchemaType } from '@/models/passwordResetTokenModel';
import AppError from '@/utils/appError';

class PasswordResetTokenService {
  async get (userId: string): Promise<PasswordResetTokenSchemaType | null> {
    const passwordResetToken = await PasswordResetToken.findOne({ user: userId });
    return passwordResetToken;
  }

  async create (params: {
    user: string;
    tokenHash: string;
    expiresAt: Date;
  }, session?: ClientSession): Promise<PasswordResetTokenSchemaType> {
    const [passwordResetToken] = await PasswordResetToken.create([params], ...(session ? [{ session }] : []));
    if (!passwordResetToken) {
      throw new AppError(500, 'Failed to create reset password token.');
    }
    return passwordResetToken;
  }

  async findValidToken (tokenHash: string): Promise<PasswordResetTokenSchemaType | null> {
    const passwordResetToken = await PasswordResetToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() }
    });
    return passwordResetToken;
  }

  async revokeAllForUser (userId: string, session?: ClientSession): Promise<void> {
    await PasswordResetToken.deleteMany({ user: userId }, { ...(session && { session }) });
  }

  async revoke (tokenHash: string, session?: ClientSession): Promise<void> {
    await PasswordResetToken.deleteOne({ tokenHash }, { ...(session && { session }) });
  }
}

export default PasswordResetTokenService;