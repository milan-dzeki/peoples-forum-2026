export interface ResponseAuthUserType {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string | null | undefined;
  email: string;
  role: 'user' | 'admin';
  profileImageUrl: string | null;
  createdAt: NativeDate;
}