import bcrypt from 'bcryptjs';
import AppError from '@/utils/appError';

class PasswordService {
  hashPassword = async (password: string): Promise<string> => {
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
}

export default PasswordService;