export const ACCESS_TOKEN = {
  name: '_pplFrmCKK_access',
  expiresIn: '15m',
  duration: 15 * 60 * 1000
} as const;

export const REFRESH_TOKEN = {
  name: '_pplFrmCKK_refresh',
  expiresIn: '7d',
  duration: 7 * 24 * 60 * 60 * 1000
} as const;