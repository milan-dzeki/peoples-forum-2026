import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ACCESS_TOKEN } from '@/dataConfigs/tokens';

class TokenService {
  createAccessToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: ACCESS_TOKEN.expiresIn }
    );
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  hashRefreshToken(token: string): string {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }

  verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET!);
  }
}

export default TokenService;