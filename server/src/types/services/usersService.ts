export interface CreateUserData {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  password: string;
  profileImageUrl: string | null;
  profileImagePublicId: string | null;
}