import type { UserSchemaType } from '@/models/users/userModel';
import type { SessionSchemaType } from '@/models/sessionModel';
import type { ResponseAuthUser } from '@/types/auth';
import formatUserForResponse from '@/utils/formatUserForResponse';
import { REFRESH_TOKEN } from '@/dataConfigs/tokens';
import AppError from '@/utils/appError';
import TokenService from '@/services/auth/tokenService';
import SessionService from '@/services/auth/sessionService';
import UsersService from '@/services/usersService';

interface Dependencies {
  tokenService: TokenService,
  sessionService: SessionService,
  usersService: UsersService
}

class RefreshTokenService {
  constructor(private readonly dependencies: Dependencies) {}

  private async getSession (refreshToken: string): Promise<{
    oldTokenHash: string;
    session: SessionSchemaType
  }> {
    const { tokenService, sessionService } = this.dependencies;

    const oldTokenHash = tokenService.hashToken(refreshToken);

    const session = await sessionService.findByTokenHash(
      oldTokenHash
    );

    if (!session || session.expiresAt <= new Date()) {
      throw new AppError(401, 'Session expired or invalid');
    }

    return { oldTokenHash, session };
  }

  private async getUserFromSession (sessionUserId: string, oldTokenHash: string): Promise<UserSchemaType> {
    const { usersService, sessionService } = this.dependencies;

    const user = await usersService.getById(sessionUserId);

    if (!user) {
      await sessionService.revoke(oldTokenHash);
      throw new AppError(404, 'User account not found.');
    }

    return user;
  }

  private async refresh (userId: string, oldTokenHash: string): Promise<{ newAccessToken: string; newRefreshToken: string }> {
    const { tokenService, sessionService } = this.dependencies;

    const newAccessToken = tokenService.createAccessToken(userId);

    const newRefreshToken = tokenService.generateRandomToken();

    const newRefreshTokenHash = tokenService.hashToken(newRefreshToken);

    const updatedSession = await sessionService.rotate({
      oldTokenHash,
      newTokenHash: newRefreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN.duration)
    });

    if (!updatedSession) {
      throw new AppError(401, 'Refresh token is no longer valid.');
    }

    return { newAccessToken, newRefreshToken };
  }

  async execute(refreshToken: unknown): Promise<{
    user: ResponseAuthUser;
    accessToken: string;
    refreshToken: string;
  }> {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new AppError(401, 'Invalid refresh token');
    }

    const { oldTokenHash, session } = await this.getSession(refreshToken);
    const user = await this.getUserFromSession(session.user.toString(), oldTokenHash);
    const { newAccessToken, newRefreshToken } = await this.refresh(user._id.toString(), oldTokenHash);

    return {
      user: formatUserForResponse(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}

export default RefreshTokenService;