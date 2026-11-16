import User, { type UserSchemaType } from '@/models/users/userModel';
import { USER_FIELD_NAMES } from '@/constants/users';
import type { CreateUserData } from '@/types/services/usersService';
import AppError from '@/utils/appError';

const { EMAIL, PASSWORD } = USER_FIELD_NAMES;

class UsersService {
  async isEmailTaken (email: string): Promise<boolean> {
    const exists = await User.exists({ [EMAIL]: email });
    return !!exists;
  }

  async create (data: CreateUserData): Promise<UserSchemaType> {
    const user = await User.create(data);
    return user;
  }

  async getById (id: string): Promise<UserSchemaType | null> {
    return await User.findById(id);
  }

  async getByEmail (providedEmail: string): Promise<UserSchemaType> {
    const user = await User.findOne({ [EMAIL]: providedEmail.toLowerCase() }).select(`+${PASSWORD}`);

    if (!user) {
      throw new AppError(404, 'Invalid credentials.');
    }
    return user;
  }
}

export default UsersService;