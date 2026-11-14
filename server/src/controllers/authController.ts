import { Response } from 'express';
import type { RequestWithBodyType, RequestWithFiles } from '@/types/request';
import SignupService from '@/services/auth/signupService';
import { COOKIE_NAME } from '@/dataConfigs/cookieName';
import { ApiFilesType } from '@/types/common';
import catchAsync from '@/utils/catchAsync';
import LoginService from '@/services/auth/loginService';

class AuthController {
  constructor (
    private readonly signupService: SignupService,
    private readonly loginService: LoginService
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
  });

  login = catchAsync(async (
    request: RequestWithBodyType,
    response: Response
  ) => {
    const body = request.body;
    const { user, token } = await this.loginService.login(body);

    response.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    });

    return response.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: { user }
    });
  });

  isLoggedIn = async (
    request: RequestWithBodyType,
    response: Response
  ) => {
    const user = await this.loginService.isLoggedIn(request.cookies);
    return response.status(user ? 200 : 201).json({ user });
  }
}

export default AuthController;