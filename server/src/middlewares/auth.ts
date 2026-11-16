import type { RequestWithUserId } from '@/types/request';
import type { Response, NextFunction } from 'express';
import AppError from '@/utils/appError';
import { ACCESS_TOKEN } from '@/dataConfigs/tokens';
import TokenService from '@/services/auth/tokenService';
import UsersService from '@/services/usersService';

const notLoggedInErrorMsg = new AppError(401, 'You are not logged in or your session has expired.');

interface Dependencies {
  tokenService: TokenService;
  usersService: UsersService;
}

class AuthMiddlewares {
  constructor (private readonly dependencies: Dependencies) {}
  
  isAuth = async (
    request: RequestWithUserId,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const accessToken = request.cookies?.[ACCESS_TOKEN.name];
      if (!accessToken) {
        next(notLoggedInErrorMsg);
        return;
      }

      const { tokenService, usersService } = this.dependencies

      const decodedToken = tokenService.verifyAccessToken(accessToken);
      if (!decodedToken || typeof decodedToken !== 'object' || !('userId' in decodedToken)) {
        next(notLoggedInErrorMsg);
        return;
      }

      const { userId } = decodedToken;
      if (typeof userId !== 'string') {
        next(notLoggedInErrorMsg);
        return;
      }

      const user = await usersService.getById(userId);

      if (!user) {
        next(notLoggedInErrorMsg);
        return;
      }

      request.userId = user._id.toString();
      next();
    } catch {
      next(new AppError(500, 'Session expired. Log in again to continue.'));
    }
  };
}

export default AuthMiddlewares;