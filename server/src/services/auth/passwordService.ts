import bcrypt from 'bcryptjs';
import AppError from '@/utils/appError';

class PasswordService {
  async hashPassword (password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      if (!hashedPassword) {
        throw new AppError(500, 'Failed to setup password. Try again.');
      }

      return hashedPassword;
    } catch {
      throw new AppError(500, 'Failed to setup password. Try again.');
    }
  }

  async comparePasswords (password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}

export default PasswordService;