import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { signAccessToken, signRefreshToken, verifyRefresh } from '../../lib/jwt.js';
import { ensureRedisConnected, redis } from '../../lib/redis.js';
import env from '../../lib/env.js';
import User from '../../../db/models/User.js';
import { parseTtlSeconds } from '../../utils/parseTtlSeconds.js';

enum USER_ROLES {
  USER = 'user',
  ADMIN = 'admin',
}

const REFRESH_KEY = (jti: string) => `refresh:${jti}`;
const USER_SESSIONS = (userId: string) => `sessions:${userId}`;

//? Регистрация нового пользователя
export async function register(email: string, password: string, name?: string) {
  //? Проверяем, существует ли пользователь с таким email
  const existing = await User.findOne({ where: { email } });

  //! Если пользователь уже существует, возвращаем ошибку
  if (existing) throw createHttpError(409, 'User already exists');

  //? Хешируем пароль
  const passwordHash = await bcrypt.hash(password, 10);

  //? Создаем пользователя
  const user = await User.create({ email, passwordHash, name: name || null });

  //? Возвращаем пользователя
  return user;
}

//? Вход в систему
export async function login(email: string, password: string) {
  //? Проверяем, существует ли пользователь с таким email
  const user = await User.findOne({ where: { email } });

  //! Если пользователь не найден, возвращаем ошибку
  if (!user) throw createHttpError(401, 'Invalid credentials');

  //? Проверяем, совпадает ли пароль
  const ok = await bcrypt.compare(password, user.passwordHash);

  //! Если пароль не совпадает, возвращаем ошибку
  if (!ok) throw createHttpError(401, 'Invalid credentials');

  //? Генерируем access токен
  const { token: accessToken } = signAccessToken(String(user.id), user.role as USER_ROLES);

  //? Генерируем refresh токен
  const { token: refreshToken, jti } = signRefreshToken(String(user.id));

  //? Сохраняем refresh токен в Redis
  await ensureRedisConnected();

  //? Сохраняем refresh jti -> userId; также устанавливаем membership для user sessions для поддержки мульти-устройств и отзыва на сессию
  await redis.set(REFRESH_KEY(jti), String(user.id), {
    EX: parseTtlSeconds(env.jwt.refreshTtl as string),
  });
  await redis.sAdd(USER_SESSIONS(String(user.id)), jti);
  await redis.expire(USER_SESSIONS(String(user.id)), parseTtlSeconds(env.jwt.refreshTtl as string));

  return { accessToken, refreshToken, user };
}

//? Обновление токена
export async function refreshSession(refreshToken: string) {
  //? Проверяем, существует ли refresh токен
  await ensureRedisConnected();

  //? Проверяем, совпадает ли refresh токен
  const payload = verifyRefresh(refreshToken);

  //? Проверяем, совпадает ли userId
  const userId = await redis.get(REFRESH_KEY(payload.jti));
  if (!userId || userId !== payload.sub) throw createHttpError(401, 'Invalid refresh token');

  //? Проверяем, существует ли пользователь
  const user = await User.findByPk(Number(userId));

  //! Если пользователь не найден, возвращаем ошибку
  if (!user) throw createHttpError(401, 'Invalid refresh token');

  //? Генерируем access токен
  const { token: accessToken } = signAccessToken(String(user.id), user.role as USER_ROLES);

  //? Возвращаем access токен
  return { accessToken };
}

//? Выход из системы
export async function logout(refreshToken: string) {
  //? Проверяем, существует ли refresh токен
  await ensureRedisConnected();
  try {
    //? Проверяем, совпадает ли refresh токен
    const { jti, sub } = verifyRefresh(refreshToken);

    //? Удаляем refresh токен из Redis
    await redis.del(REFRESH_KEY(jti));

    //? Удаляем membership для user sessions
    await redis.sRem(USER_SESSIONS(sub), jti);

    //? Возвращаем true
    return true;
  } catch {
    //? Если произошла ошибка, возвращаем true
    return true;
  }
}

//? Отзыв всех сессий
export async function revokeAllSessions(userId: string) {
  //? Проверяем, существует ли пользователь
  await ensureRedisConnected();

  //? Получаем membership для user sessions
  const key = USER_SESSIONS(userId);

  //? Получаем membership для user sessions
  const members = await redis.sMembers(key);

  //? Если есть membership, удаляем refresh токены (через транзакцию, чтобы удовлетворить типам)
  if (members.length) {
    const tx = redis.multi();
    for (const j of members) {
      tx.del(REFRESH_KEY(j));
    }
    await tx.exec();
  }
  await redis.del(key);
}
