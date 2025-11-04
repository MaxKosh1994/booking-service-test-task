import type { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';

//? Централизованный обработчик ошибок для возврата обертки
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const isHttpError = createHttpError.isHttpError(err);
  const status = isHttpError ? err.statusCode : 500;
  const message = isHttpError ? err.message : 'Internal Server Error';
  const error = isHttpError ? err : { name: err?.name, stack: err?.stack };
  res.status(status).json({ data: null, error, message, statusCode: status });
}
