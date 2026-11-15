import AppError from '@/utils/appError';
import TokenService from '@/services/auth/tokenService';
import SessionService from '@/services/auth/sessionService';
import UsersService from '@/services/usersService';
import formatUserForResponse from '@/utils/formatUserForResponse';
import { REFRESH_TOKEN } from '@/dataConfigs/tokens';
import User from '@/models/users/userModel';

interface Dependencies {
  tokenService: TokenService,
  sessionService: SessionService,
  usersService: UsersService
}

class RefreshTokenService {
  constructor(private readonly dependencies: Dependencies) {}

  async execute(refreshToken: string) {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new AppError(401, 'Invalid refresh token');
    }

    const oldTokenHash =
      this.dependencies.tokenService.hashRefreshToken(refreshToken);

    // Find the user associated with this session.
    const session = await this.dependencies.sessionService.findByTokenHash(
      oldTokenHash
    );

    if (!session || session.expiresAt <= new Date()) {
      throw new AppError(401, 'Session expired or invalid');
    }

    const user = await User.findById(
      session.user.toString()
    );

    if (!user) {
      await this.dependencies.sessionService.revoke(oldTokenHash);
      throw new AppError(401, 'User no longer exists');
    }

    // Generate replacement tokens.
    const newAccessToken = this.dependencies.tokenService.createAccessToken(
      user._id.toString()
    );

    const newRefreshToken =
      this.dependencies.tokenService.generateRefreshToken();

    const newRefreshTokenHash =
      this.dependencies.tokenService.hashRefreshToken(newRefreshToken);

    // Atomically replace the old refresh token.
    const updatedSession = await this.dependencies.sessionService.rotate({
      oldTokenHash,
      newTokenHash: newRefreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN.duration)
    });

    if (!updatedSession) {
      throw new AppError(401, 'Refresh token is no longer valid');
    }

    return {
      user: formatUserForResponse(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}

export default RefreshTokenService;