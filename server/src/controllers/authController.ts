import { Request, Response } from 'express';
import type { RequestWithBodyType, RequestWithFiles } from '@/types/request';
import SignupService from '@/services/auth/signupService';
import { REFRESH_TOKEN } from '@/dataConfigs/tokens';
import { ApiFilesType } from '@/types/common';
import catchAsync from '@/utils/catchAsync';
import LoginService from '@/services/auth/loginService';
import RefreshTokenService from '@/services/auth/refreshTokenSrevice';
import { setAuthCookies } from '@/utils/authCookies';

class AuthController {
  constructor (
    private readonly signupService: SignupService,
    private readonly loginService: LoginService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}
  signup = catchAsync(async (
    request: RequestWithFiles,
    response: Response
  ) => {
    const fields = request.fields as unknown as Record<string, string>;
    const files = request.files as unknown as ApiFilesType;
    const { user, accessToken, refreshToken } = await this.signupService.execute({ fields, files });

    setAuthCookies(response, { accessToken, refreshToken });

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
    const { user, accessToken, refreshToken } = await this.loginService.login(body);

    setAuthCookies(response, { accessToken, refreshToken });

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

  refresh = catchAsync(async (
    request: Request,
    response: Response
  ) => {
    const refreshToken = request.cookies?.[REFRESH_TOKEN.name];

    const {
      user,
      accessToken,
      refreshToken: newRefreshToken
    } = await this.refreshTokenService.execute(refreshToken);

    setAuthCookies(response, {
      accessToken,
      refreshToken: newRefreshToken
    });

    return response.status(200).json({
      status: 'success',
      data: { user }
    });
  });
}

export default AuthController;