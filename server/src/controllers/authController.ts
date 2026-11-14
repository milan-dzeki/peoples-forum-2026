import { Response } from 'express';
import { type RequestWithFiles } from '@/types/request';
import SignupService from '@/services/auth/signupService';
import { COOKIE_NAME } from '@/dataConfigs/cookieName';
import { ApiFilesType } from '@/types/common';
import catchAsync from '@/utils/catchAsync';

class AuthController {
  constructor (
    private readonly signupService: SignupService
  ) {}
  signup = catchAsync(async (
    request: RequestWithFiles,
    response: Response
  ) => {
    const fields = request.fields as unknown as Record<string, string>;
    const files = request.files as unknown as ApiFilesType;
    const { user, token } = await this.signupService.execute({ fields, files });

    response.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    });

    return response.status(201).json({
      status: 'success',
      message: 'You have successfully signed up to Peoples Forum',
      data: { user }
    });
  })
}

export default AuthController;