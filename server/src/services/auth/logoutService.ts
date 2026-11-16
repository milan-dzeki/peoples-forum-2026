import SessionService from '@/services/auth/sessionService';
import TokenService from '@/services/auth/tokenService';

interface Dependencies {
  tokenService: TokenService;
  sessionService: SessionService;
}

class LogoutService {
  constructor (private readonly dependencies: Dependencies) {}

  async execute (refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    const refreshTokenHash = this.dependencies.tokenService.hashToken(refreshToken);
    await this.dependencies.sessionService.revoke(refreshTokenHash);
  }
}

export default LogoutService;