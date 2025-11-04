import type { Request, Response } from 'express';
import createHttpError from 'http-errors';
import * as service from './auth.service.js';
import setAuthCookies from '../../utils/setAuthCookies.js';
import { signAccessToken, signRefreshToken } from '../../lib/jwt.js';

enum USER_ROLES {
  USER = 'user',
  ADMIN = 'admin',
}

//? Регистрация нового пользователя
export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body || {};

  //! Если email или password не переданы, возвращаем ошибку
  if (!email || !password) throw createHttpError(400, 'email and password required');

  //? Регистрируем нового пользователя
  const user = await service.register(email, password, name);

  //? Генерируем токены для пользователя
  const { token: accessToken } = signAccessToken(String(user.id), user.role as USER_ROLES);
  const { token: refreshToken } = signRefreshToken(String(user.id));

  //? Устанавливаем куки для авторизации
  setAuthCookies(res, accessToken, refreshToken);

  //? Возвращаем успешный ответ
  res.status(201).json({
    data: { id: user.id, email: user.email },
    error: null,
    message: 'User created',
    statusCode: 201,
  });
}

//? Вход в систему
export async function login(req: Request, res: Response) {
  //? Получаем email и password из запроса
  const { email, password } = req.body || {};

  //! Если email или password не переданы, возвращаем ошибку
  if (!email || !password) throw createHttpError(400, 'email and password required');

  //? Входим в систему
  const { accessToken, refreshToken, user } = await service.login(email, password);

  //? Устанавливаем куки для авторизации
  setAuthCookies(res, accessToken, refreshToken);

  //? Возвращаем успешный ответ
  res.json({
    data: { user: { id: user.id, email: user.email, role: user.role } },
    error: null,
    message: 'Logged in',
    statusCode: 200,
  });
}

//? Обновление токена
export async function refresh(req: Request, res: Response) {
  //? Получаем refresh токен из запроса
  const token = req.cookies?.refresh_token || req.body?.refresh_token;

  //! Если refresh токен не передан, возвращаем ошибку
  if (!token) throw createHttpError(401, 'No refresh token');

  //? Обновляем токен
  const { accessToken } = await service.refreshSession(token);

  //? Устанавливаем куки для авторизации
  setAuthCookies(res, accessToken);

  //? Возвращаем успешный ответ
  res.json({ data: { ok: true }, error: null, message: 'Refreshed', statusCode: 200 });
}

//? Выход из системы
export async function logout(req: Request, res: Response) {
  //? Получаем refresh токен из запроса
  const token = req.cookies?.refresh_token || req.body?.refresh_token;

  //! Если refresh токен не передан, возвращаем ошибку
  if (!token) throw createHttpError(400, 'No refresh token');

  //? Выходим из системы
  await service.logout(token);
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ data: { ok: true }, error: null, message: 'Logged out', statusCode: 200 });
}
