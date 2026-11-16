import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ACCESS_TOKEN } from '@/dataConfigs/tokens';

class TokenService {
  generateRandomToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  hashToken(token: string): string {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }
  createAccessToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: ACCESS_TOKEN.expiresIn }
    );
  }

  verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET!);
  }
}

export default TokenService;