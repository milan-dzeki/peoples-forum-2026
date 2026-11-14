import type { UserSchemaType } from '@/models/users/userModel';
import type { ResponseAuthUser } from '@/types/auth';

const formatUserForResponse = (user: UserSchemaType) => {
  const responseUser: ResponseAuthUser = {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    profileImageUrl: user.profileImageUrl || null,
    createdAt: user.createdAt
  };

  return responseUser;
};

export default formatUserForResponse;