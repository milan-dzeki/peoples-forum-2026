import type { Response } from 'express';
import type { RequestWithUserId, RequestWithUserIdAndFiles } from '@/types/request';
import UsersService from '@/services/usersService';
import catchAsync from '@/utils/catchAsync';
import { clearAuthCookies } from '@/utils/authCookies';

class UsersController {
  constructor (private readonly userService: UsersService) {}

  updateNames = catchAsync (async (
    request: RequestWithUserId,
    response: Response
  ) => {
    const userId = request.userId;
    const firstName = request.body?.firstName;
    const lastName = request.body?.lastName;

    const updatedFields = await this.userService.updateNames({
      userId,
      firstName,
      lastName
    });

    return response.status(200).json({
      status: 'success',
      message: 'Names updated successfully.',
      data: updatedFields
    });
  });

  updateProfileImage = catchAsync (async (
    request: RequestWithUserIdAndFiles,
    response: Response
  ) => {
    const userId = request.userId;
    const profileImageFile = request.files?.profileImage;

    const newProfileImageUrl = await this.userService.updateProfileImage(userId, profileImageFile);

    return response.status(200).json({
      status: 'success',
      message: 'Profile image updated successfully.',
      data: {
        newProfileImageUrl
      }
    });
  });

  removeProfileImage = catchAsync (async (
    request: RequestWithUserId,
    response: Response
  ) => {
    const userId = request.userId;
    await this.userService.removeProfileImage(userId);

    return response.status(200).json({
      status: 'success',
      message: 'Profile image removed successfully.'
    });
  });

  changePassword = catchAsync (async (
    request: RequestWithUserId,
    response: Response
  ) => {
    const userId = request.userId;
    await this.userService.changePassword({
      userId,
      currentPassword: request.body?.currentPassword,
      newPassword: request.body?.newPassword,
      newPasswordConfirm: request.body?.newPasswordConfirm
    });

    clearAuthCookies(response);

    return response.status(200).json({
      status: 'success',
      message: 'Password updated. You will be logged out from all devices. Use new password to log in again.'
    });
  });
}

export default UsersController;