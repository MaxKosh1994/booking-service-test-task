import type { Request, Response, NextFunction } from 'express';
import { z, ZodTypeAny } from 'zod';

type Schemas = Partial<{
  body: ZodTypeAny;
  query: ZodTypeAny;
  params: ZodTypeAny;
  headers: ZodTypeAny;
}>;

export function zodValidate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.headers) req.headers = schemas.headers.parse(req.headers);
      next();
    } catch (err: any) {
      if (err?.issues) {
        const errors = err.issues.map((i: any) => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return res
          .status(400)
          .json({ data: null, error: errors, message: 'Validation error', statusCode: 400 });
      }
      next(err);
    }
  };
}

export const schemas = {
  auth: {
    register: z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(1).optional(),
    }),
    login: z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
  },
  bookings: {
    reserveBody: z.object({ event_id: z.number().int().positive() }),
    reserveHeaders: z
      .object({
        'idempotency-key': z.string().min(1).optional(),
      })
      .catchall(z.any()),
  },
};

export { z };
