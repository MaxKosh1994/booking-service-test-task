import type { Response } from 'express';
import env from '../lib/env.js';

//? Установка куки для авторизации
export function setAuthCookies(res: Response, accessToken: string, refreshToken?: string) {
  const common = {
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: env.cookies.secure,
    domain: env.cookies.domain,
  };
  res.cookie('access_token', accessToken, { ...common });
  if (refreshToken) res.cookie('refresh_token', refreshToken, { ...common });
}

export default setAuthCookies;
