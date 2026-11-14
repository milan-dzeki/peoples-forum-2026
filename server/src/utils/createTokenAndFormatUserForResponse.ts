import jwt from 'jsonwebtoken';
import type { UserSchemaType } from '@/models/users/userModel';
import type { ResponseAuthUser } from '@/types/auth';
import AppError from './appError';
import formatUserForResponse from './formatUserForResponse';

const createTokenAndFormatUserForResponse = (
  user: UserSchemaType
): {
  user: ResponseAuthUser;
  token: string;
} => {
  const token = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET!,
    { expiresIn: '10h' }
  );

  if (!token) {
    throw new AppError(500, 'Authentification failed. Failed to create token');
  }

  return { user: formatUserForResponse(user), token };
};

export default createTokenAndFormatUserForResponse;