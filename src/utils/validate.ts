import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

//? Валидация запроса
export function validate(req: Request, res: Response, next: NextFunction) {
  //? Получаем результат валидации
  const result = validationResult(req);

  //? Если нет ошибок, пропускаем запрос
  if (result.isEmpty()) return next();

  //? Если есть ошибки, возвращаем ошибки в формате JSON
  const errors = result
    .array({ onlyFirstError: true })
    .map((e: any) => ({ field: e.path ?? e.param, message: String(e.msg) }));

  res.status(400).json({ data: null, error: errors, message: 'Validation error', statusCode: 400 });
}
