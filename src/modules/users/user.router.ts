import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { body, param } from 'express-validator';
import * as ctrl from './user.controller.js';
import { requireAuth, requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../utils/validate.js';

const router = Router();

//? RESTful API routes для сущности User

router
  .get('/', requireAuth, requireAdmin, (req, res, next) => ctrl.list(req, res).catch(next))
  .get(
    '/:id',
    requireAuth,
    [param('id').isInt({ gt: 0 })],
    validate,
    (req: Request, res: Response, next: NextFunction) => ctrl.get(req, res).catch(next),
  )
  .post(
    '/',
    requireAuth,
    requireAdmin,
    [
      body('email').isEmail(),
      body('password').isLength({ min: 6 }),
      body('name').optional().isString(),
      body('role').optional().isIn(['user', 'admin']),
    ],
    validate,
    (req: Request, res: Response, next: NextFunction) => ctrl.create(req, res).catch(next),
  )
  .put(
    '/:id',
    requireAuth,
    requireAdmin,
    [
      param('id').isInt({ gt: 0 }),
      body('name').optional().isString(),
      body('role').optional().isIn(['user', 'admin']),
    ],
    validate,
    (req: Request, res: Response, next: NextFunction) => ctrl.update(req, res).catch(next),
  )
  .delete(
    '/:id',
    requireAuth,
    requireAdmin,
    [param('id').isInt({ gt: 0 })],
    validate,
    (req: Request, res: Response, next: NextFunction) => ctrl.remove(req, res).catch(next),
  );

export default router;
