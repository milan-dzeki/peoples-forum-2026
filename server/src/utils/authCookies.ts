import type { Response } from 'express';
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN
} from '@/dataConfigs/tokens';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
};

export const setAuthCookies = (
  response: Response,
  params: {
    accessToken: string;
    refreshToken: string;
  }
): void => {
  response.cookie(ACCESS_TOKEN.name, params.accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN.duration
  });

  response.cookie(REFRESH_TOKEN.name, params.refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN.duration
  });
};

export const clearAuthCookies = (response: Response): void => {
  response.clearCookie(ACCESS_TOKEN.name, cookieOptions);
  response.clearCookie(REFRESH_TOKEN.name, cookieOptions);
};