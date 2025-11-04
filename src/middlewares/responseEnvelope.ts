import type { Request, Response, NextFunction } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Response {
      ok: (data?: unknown, message?: string) => void;
    }
  }
}

//? Обертка для ответа
export function responseEnvelope(req: Request, res: Response, next: NextFunction) {
  res.ok = (data?: unknown, message = 'OK') => {
    res.status(200).json({ data, error: null, message, statusCode: 200 });
  };

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    const status = res.statusCode || 200;
    if (
      body &&
      typeof body === 'object' &&
      'data' in body &&
      'error' in body &&
      'message' in body &&
      'statusCode' in body
    ) {
      return originalJson(body);
    }
    return originalJson({ data: body, error: null, message: 'OK', statusCode: status });
  };
  next();
}
