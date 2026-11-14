import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isEmail } from 'validator';
import User, { type UserSchemaType } from '@/models/users/userModel';
import AppError from '@/utils/appError';
import UsersService from '@/services/usersService';
import createTokenAndFormatUserForResponse from '@/utils/createTokenAndFormatUserForResponse';
import { COOKIE_NAME } from '@/dataConfigs/cookieName';
import { ResponseAuthUser } from '@/types/auth';
import formatUserForResponse from '@/utils/formatUserForResponse';

const invalidCredentials = 'Invalid email or password provided.';

class LoginService {
  constructor (
    private readonly usersService: UsersService
  ) {}

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
    const user = await this.usersService.getByEmail(email);
    const isPasswordValid = await bcrypt.compare(password, user.password);
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

    const { user, token } = createTokenAndFormatUserForResponse(retrievedUser);

    return { user, token };
  }

  async isLoggedIn (requestCookies: Record<string, unknown>): Promise<ResponseAuthUser | null> {
    if (!requestCookies) {
      return null;
    }

    const token = requestCookies[COOKIE_NAME];
    if (!token || typeof token !== 'string') {
      return null;
    }

    let decodedToken: string | jwt.JwtPayload;

    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
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