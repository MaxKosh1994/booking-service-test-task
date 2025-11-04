import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { body, param } from 'express-validator';
import * as ctrl from './event.controller.js';
import { requireAuth, requireAdmin } from '../../middlewares/auth.js';
import { validate } from '../../utils/validate.js';

const router = Router();

router.get('/', (req, res, next) => ctrl.list(req, res).catch(next));
router.get(
  '/:id',
  [param('id').isInt({ gt: 0 })],
  validate,
  (req: Request, res: Response, next: NextFunction) => ctrl.get(req, res).catch(next),
);
router.post(
  '/',
  requireAuth,
  requireAdmin,
  [body('name').isString().notEmpty(), body('totalSeats').isInt({ min: 0 })],
  validate,
  (req: Request, res: Response, next: NextFunction) => ctrl.create(req, res).catch(next),
);
router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  [param('id').isInt({ gt: 0 })],
  validate,
  (req: Request, res: Response, next: NextFunction) => ctrl.update(req, res).catch(next),
);
router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  [param('id').isInt({ gt: 0 })],
  validate,
  (req: Request, res: Response, next: NextFunction) => ctrl.remove(req, res).catch(next),
);

export default router;
