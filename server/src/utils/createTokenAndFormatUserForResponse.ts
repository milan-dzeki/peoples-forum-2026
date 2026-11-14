import jwt from 'jsonwebtoken';
import type { UserSchemaType } from '@/models/users/userModel';
import type { ResponseAuthUserType } from '@/types/auth';
import AppError from './appError';

const createTokenAndFormatUserForResponse = (
  user: UserSchemaType
): {
  user: ResponseAuthUserType;
  token: string;
} => {
  const responseUser: ResponseAuthUserType = {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    profileImageUrl: user.profileImageUrl || null,
    createdAt: user.createdAt
  };

  const token = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET!,
    { expiresIn: '10h' }
  );

  if (!token) {
    throw new AppError(500, 'Authentification failed. Failed to create token');
  }

  return { user: responseUser, token };
};

export default createTokenAndFormatUserForResponse;