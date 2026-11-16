import PasswordResetToken, { type PasswordResetTokenSchemaType } from '@/models/passwordResetTokenModel';

class PasswordResetTokenService {
  async get (userId: string): Promise<PasswordResetTokenSchemaType | null> {
    const passwordResetToken = await PasswordResetToken.findOne({ user: userId });
    return passwordResetToken;
  }

  async create(params: {
    user: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetTokenSchemaType> {
    const passwordResetToken = await PasswordResetToken.create(params);
    return passwordResetToken;
  }

  async findValidToken(tokenHash: string): Promise<PasswordResetTokenSchemaType | null> {
    const passwordResetToken = await PasswordResetToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() }
    });
    return passwordResetToken;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await PasswordResetToken.deleteMany({ userId });
  }

  async revoke(tokenHash: string): Promise<void> {
    await PasswordResetToken.deleteOne({ tokenHash });
  }
}

export default PasswordResetTokenService;