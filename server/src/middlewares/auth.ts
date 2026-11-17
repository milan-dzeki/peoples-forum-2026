import type { RequestWithUserId } from '@/types/request';
import type { Response, NextFunction, Request } from 'express';
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
    request: Request,
    _: Response,
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
        next(new AppError(400, 'Invalid user data.'));
        return;
      }

      const user = await usersService.getById(userId);

      if (!user) {
        next(new AppError(404, 'Account not found.'));
        return;
      }

      if (user.deactivated) {
        next(new AppError(403, 'Your account has been deactivated.'));
        return;
      }

      (request as RequestWithUserId).userId = user._id.toString();
      next();
    } catch {
      next(new AppError(500, 'Session expired. Log in again to continue.'));
    }
  };
}

export default AuthMiddlewares;