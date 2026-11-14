import User from '@/models/users/userModel';
import { USER_FIELD_NAMES } from '@/constants/users';

class UsersService {
  async isEmailTaken (email: string): Promise<boolean> {
    const exists = await User.exists({ [USER_FIELD_NAMES.EMAIL]: email });
    return !!exists;
  }
}

export default UsersService;