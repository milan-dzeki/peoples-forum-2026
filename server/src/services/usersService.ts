import User, { type UserSchemaType } from '@/models/users/userModel';
import { USER_FIELD_NAMES } from '@/constants/users';
import type { ClientSession } from 'mongoose';
import type { CreateUserData } from '@/types/services/usersService';
import AppError from '@/utils/appError';
import UserFieldsValidatorService from '@/services/validators/userFieldsValidatorService';
import ErrorsService from '@/services/errorsService';

const { EMAIL, PASSWORD } = USER_FIELD_NAMES;

interface Dependencies {
  userFieldsValidatorService: UserFieldsValidatorService;
  errorsService: ErrorsService;
}

class UsersService {
  constructor (private readonly dependencies: Dependencies) {}

  async isEmailTaken (email: string): Promise<boolean> {
    const exists = await User.exists({ [EMAIL]: email });
    return !!exists;
  }

  async create (data: CreateUserData, session: ClientSession): Promise<UserSchemaType> {
    const [user] = await User.create([data], { session });
    if (!user) {
      throw new AppError(500, 'User creation failed.');
    }
    return user;
  }

  async getById (id: string): Promise<UserSchemaType | null> {
    return await User.findById(id);
  }

  async getByIdAndThrowIfNotFound (id: string): Promise<UserSchemaType> {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError(404, 'Account not found');
    }

    return user;
  }

  async getByEmail (providedEmail: string): Promise<UserSchemaType> {
    const user = await User.findOne({ [EMAIL]: providedEmail.toLowerCase() }).select(`+${PASSWORD}`);

    if (!user) {
      throw new AppError(404, 'Invalid credentials.');
    }
    return user;
  }

  async updateNames ({
    userId,
    firstName,
    lastName
  }: {
    userId: string;
    firstName: unknown;
    lastName: unknown;
  }): Promise<{ firstName: string; lastName: string; fullName: string }> {
    const { userFieldsValidatorService, errorsService } = this.dependencies;

    const errors = {
      firstName: userFieldsValidatorService.firstName(firstName),
      lastName: userFieldsValidatorService.lastName(lastName)
    };
  
    errorsService.throwFieldsErrorIfDataInvalid(errors);

    const user = await this.getByIdAndThrowIfNotFound(userId);
    user.firstName = firstName as string;
    user.lastName = lastName as string;
    user.fullName = `${firstName} ${lastName}`;
    await user.save();

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName
    };
  }
}

export default UsersService;