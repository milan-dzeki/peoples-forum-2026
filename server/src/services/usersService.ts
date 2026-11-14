import User from '@/models/users/userModel';
import { USER_FIELD_NAMES } from '@/constants/users';
import type { CreateUserData } from '@/types/services/usersService';

class UsersService {
  async isEmailTaken (email: string): Promise<boolean> {
    const exists = await User.exists({ [USER_FIELD_NAMES.EMAIL]: email });
    return !!exists;
  }

  async create (data: CreateUserData) {
    const user = await User.create(data);
    return user;
  }
}

export default UsersService;