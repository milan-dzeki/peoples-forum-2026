import AppError from '@/utils/appError';
import TokenService from '@/services/auth/tokenService';
import SessionService from '@/services/auth/sessionService';
import UsersService from '@/services/usersService';
import formatUserForResponse from '@/utils/formatUserForResponse';
import { REFRESH_TOKEN } from '@/dataConfigs/tokens';
import User from '@/models/users/userModel';

class RefreshTokenService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly usersService: UsersService
  ) {}

  async execute(refreshToken: string) {
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new AppError(401, 'Invalid refresh token');
    }

    const oldTokenHash =
      this.tokenService.hashRefreshToken(refreshToken);

    // Find the user associated with this session.
    const session = await this.sessionService.findByTokenHash(
      oldTokenHash
    );

    if (!session || session.expiresAt <= new Date()) {
      throw new AppError(401, 'Session expired or invalid');
    }

    const user = await User.findById(
      session.user.toString()
    );

    if (!user) {
      await this.sessionService.revoke(oldTokenHash);
      throw new AppError(401, 'User no longer exists');
    }

    // Generate replacement tokens.
    const newAccessToken = this.tokenService.createAccessToken(
      user._id.toString()
    );

    const newRefreshToken =
      this.tokenService.generateRefreshToken();

    const newRefreshTokenHash =
      this.tokenService.hashRefreshToken(newRefreshToken);

    // Atomically replace the old refresh token.
    const updatedSession = await this.sessionService.rotate({
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