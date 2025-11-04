import type { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { verifyAccess } from '../lib/jwt.js';

export interface AuthUser {
  userId: string;
  role: 'user' | 'admin';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

//? Middleware для проверки авторизации
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : req.cookies?.access_token;
  if (!token) return next(createHttpError(401, 'Unauthorized'));
  try {
    const payload = verifyAccess(token);
    req.auth = { userId: payload.sub, role: payload.role };
    next();
  } catch (_e) {
    next(createHttpError(401, 'Unauthorized'));
  }
}

//? Middleware для проверки роли администратора
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(createHttpError(401, 'Unauthorized'));
  if (req.auth.role !== 'admin') return next(createHttpError(403, 'Forbidden'));
  next();
}
