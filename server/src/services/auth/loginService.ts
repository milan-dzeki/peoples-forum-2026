import jwt from 'jsonwebtoken';
import { isEmail } from 'validator';
import User, { type UserSchemaType } from '@/models/users/userModel';
import AppError from '@/utils/appError';
import UsersService from '@/services/usersService';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/dataConfigs/tokens';
import { ResponseAuthUser } from '@/types/auth';
import formatUserForResponse from '@/utils/formatUserForResponse';
import TokenService from './tokenService';
import SessionService from './sessionService';
import PasswordService from './passwordService';

const invalidCredentials = 'Invalid email or password provided.';

interface Dependencies {
  usersService: UsersService;
  tokenService: TokenService;
  sessionService: SessionService;
  passwordService: PasswordService;
}

class LoginService {
  constructor (private readonly dependencies: Dependencies) {}

  private validateBody (body: unknown): { email: string; password: string } {
    if (!body || typeof body !== 'object' || !('email' in body) || !('password' in body)) {
      throw new AppError(422, invalidCredentials);
    }

    const { email, password } = body;

    if (typeof email !== 'string' || !isEmail(email) || typeof password !== 'string') {
      throw new AppError(422, invalidCredentials);
    }

    return { email, password };
  }

  private async getAndValidateUser (email: string, password: string): Promise<UserSchemaType> {
    const { passwordService } = this.dependencies;

    const user = await this.dependencies.usersService.getByEmail(email);
    const isPasswordValid = await passwordService.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(400, invalidCredentials);
    }

    // Reactivate user in cases it is deactivated
    user.deactivated = false;
    await user.save();
    
    return user;
  }

  async login (body: unknown) {
    const { email, password } = this.validateBody(body);
    const retrievedUser = await this.getAndValidateUser(email, password);

    const accessToken = this.dependencies.tokenService.createAccessToken(
      retrievedUser._id.toString()
    );

    const refreshToken = this.dependencies.tokenService.generateRandomToken();

    const refreshTokenHash = this.dependencies.tokenService.hashToken(refreshToken);

    await this.dependencies.sessionService.create({
      user: retrievedUser._id.toString(),
      refreshTokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN.duration)
    });

    return {
      user: formatUserForResponse(retrievedUser),
      accessToken,
      refreshToken
    };
  }

  async isLoggedIn (requestCookies: Record<string, unknown>): Promise<ResponseAuthUser | null> {
    if (!requestCookies) {
      return null;
    }

    const token = requestCookies[ACCESS_TOKEN.name];
    if (!token || typeof token !== 'string') {
      return null;
    }

    let decodedToken: string | jwt.JwtPayload;

    try {
      decodedToken = this.dependencies.tokenService.verifyAccessToken(token);
    } catch {
      return null;
    }
    
    if (!decodedToken || typeof decodedToken !== 'object' || !('userId' in decodedToken) || typeof decodedToken.userId !== 'string') {
      return null;
    }

    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return null;
    }

    return formatUserForResponse(user);
  }
}

export default LoginService;