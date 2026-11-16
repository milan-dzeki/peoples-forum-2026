import type { ClientSession } from 'mongoose';
import Session, { type SessionSchemaType } from '@/models/sessionModel';
import AppError from '@/utils/appError';

class SessionService {
  async create (params: {
    user: string;
    refreshTokenHash: string;
    expiresAt: Date;
  }, mongoSession?: ClientSession): Promise<SessionSchemaType> {
    const [session] = await Session.create([params], ...(mongoSession ? [{ session: mongoSession }] : []));

    if (!session) {
      throw new AppError(500, 'Session creation failed.');
    }
    return session;
  }

  async rotate (params: {
    oldTokenHash: string;
    newTokenHash: string;
    expiresAt: Date;
  }): Promise<SessionSchemaType | null> {
    const updatedSession = await Session.findOneAndUpdate(
      {
        refreshTokenHash: params.oldTokenHash,
        expiresAt: { $gt: new Date() }
      },
      {
        refreshTokenHash: params.newTokenHash,
        expiresAt: params.expiresAt
      },
      { new: true }
    );

    return updatedSession;
  }

  async revoke (refreshTokenHash: string): Promise<void> {
    await Session.deleteOne({ refreshTokenHash });
  }

  async revokeForAllDevices (refreshTokenHash: string, mongoSession?: ClientSession): Promise<void> {
    await Session.deleteMany({ refreshTokenHash }, { ...(mongoSession && { session: mongoSession }) });
  }

  async findByTokenHash (tokenHash: string): Promise<SessionSchemaType | null> {
    return Session.findOne({ refreshTokenHash: tokenHash });
  }
}

export default SessionService;