import type { Response } from 'express';
import type { RequestWithUserId } from '@/types/request';
import UsersService from '@/services/user/usersService';
import catchAsync from '@/utils/catchAsync';

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
}

export default UsersController;