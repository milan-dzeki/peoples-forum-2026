import { Request, Response } from 'express';
import type { RequestWithBodyType, RequestWithFiles } from '@/types/request';
import { REFRESH_TOKEN } from '@/dataConfigs/tokens';
import { ApiFilesType } from '@/types/common';
import catchAsync from '@/utils/catchAsync';
import { clearAuthCookies, setAuthCookies } from '@/utils/authCookies';
import SignupService from '@/services/auth/signupService';
import LoginService from '@/services/auth/loginService';
import RefreshTokenService from '@/services/auth/refreshTokenSrevice';
import LogoutService from '@/services/auth/logoutService';
import ForgotPasswordService from '@/services/auth/forgotPasswordService';
import ResetPasswordService from '@/services/auth/resetPasswordService';
import AppError from '@/utils/appError';

interface Dependencies {
  signupService: SignupService;
  loginService: LoginService;
  logoutService: LogoutService;
  refreshTokenService: RefreshTokenService;
  forgotPasswordService: ForgotPasswordService;
  resetPasswordService: ResetPasswordService;
}

class AuthController {
  constructor (private readonly dependencies: Dependencies) {}
  signup = catchAsync(async (
    request: RequestWithFiles,
    response: Response
  ) => {
    const fields = request.fields as unknown as Record<string, string>;
    const files = request.files as unknown as ApiFilesType;

    const { signupService } = this.dependencies;
    const { user, accessToken, refreshToken } = await signupService.execute({ fields, files });

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

    const { loginService } = this.dependencies;
    const { user, accessToken, refreshToken } = await loginService.login(body);

    setAuthCookies(response, { accessToken, refreshToken });

    return response.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: { user }
    });
  });

  logout = catchAsync(async (
    request: Request,
    response: Response
  ) => {
    const refreshToken = request.cookies?.[REFRESH_TOKEN.name];
    const { logoutService } = this.dependencies;
    await logoutService.execute(refreshToken);

    clearAuthCookies(response);

    return response.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  });

  isLoggedIn = async (
    request: RequestWithBodyType,
    response: Response
  ) => {
    const { loginService } = this.dependencies;

    const user = await loginService.isLoggedIn(request.cookies);
    return response.status(user ? 200 : 201).json({ user });
  }

  refresh = catchAsync(async (
    request: Request,
    response: Response
  ) => {
    const refreshToken = request.cookies?.[REFRESH_TOKEN.name];
    const { refreshTokenService } = this.dependencies;

    try {
      const {
        user,
        accessToken,
        refreshToken: newRefreshToken
      } = await refreshTokenService.execute(refreshToken);

      setAuthCookies(response, {
        accessToken,
        refreshToken: newRefreshToken
      });

      return response.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 401) {
        clearAuthCookies(response);
      }

      throw error;
    }
  });

  forgotPassword = catchAsync(async (
    request: RequestWithBodyType,
    response: Response
  ) => {
    const { forgotPasswordService } = this.dependencies;
    await forgotPasswordService.execute(
      request.body.email
    );

    return response.status(200).json({
      status: 'success',
      message: 'If an account exists with that email, you will receive a password reset link.'
    });
  });

  resetPassword = catchAsync (async (
    request: RequestWithBodyType,
    response: Response
  ) => {
    const { resetPasswordService } = this.dependencies;

    await resetPasswordService.execute({
      newPassword: request.body?.newPassword,
      newPasswordConfirm: request.body?.newPasswordConfirm,
      token: request.body?.token
    });

    return response.status(200).json({
      status: 'success',
      message: 'Password reset successfully. You can log in now.'
    });
  });
}

export default AuthController;