import jwt, { type Secret } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import env from './env.js';

enum USER_ROLES {
  USER = 'user',
  ADMIN = 'admin',
}

enum TOKEN_TYPES {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

type AccessPayloadType = {
  sub: string;
  role: USER_ROLES;
  type: TOKEN_TYPES.ACCESS;
  jti: string;
};
type RefreshPayloadType = {
  sub: string;
  type: TOKEN_TYPES.REFRESH;
  jti: string;
};

//? Генерация access токена
export function signAccessToken(userId: string, role: USER_ROLES) {
  const jti = randomUUID();
  const payload: AccessPayloadType = { sub: userId, role, type: TOKEN_TYPES.ACCESS, jti };
  const token = jwt.sign(payload, env.jwt.accessSecret as Secret, {
    expiresIn: env.jwt.accessTtl as any,
  });
  return { token, jti };
}

//? Генерация refresh токена
export function signRefreshToken(userId: string) {
  const jti = randomUUID();
  const payload: RefreshPayloadType = { sub: userId, type: TOKEN_TYPES.REFRESH, jti };
  const token = jwt.sign(payload, env.jwt.refreshSecret as Secret, {
    expiresIn: env.jwt.refreshTtl as any,
  });
  return { token, jti };
}

//? Проверка access токена
export function verifyAccess(token: string): AccessPayloadType {
  return jwt.verify(token, env.jwt.accessSecret as Secret) as AccessPayloadType;
}

//? Проверка refresh токена
export function verifyRefresh(token: string): RefreshPayloadType {
  return jwt.verify(token, env.jwt.refreshSecret as Secret) as RefreshPayloadType;
}
