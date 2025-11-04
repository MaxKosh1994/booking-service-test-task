import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import * as ctrl from './booking.controller.js';
import { requireAuth, requireAdmin } from '../../middlewares/auth.js';
import { zodValidate, schemas } from '../../utils/zodValidate.js';

const router = Router();

router.get('/', requireAuth, (req: Request, res: Response, next: NextFunction) =>
  ctrl.list(req, res).catch(next),
);
router.get('/:id', requireAuth, (req: Request, res: Response, next: NextFunction) =>
  ctrl.get(req, res).catch(next),
);
router.post('/', requireAuth, (req: Request, res: Response, next: NextFunction) =>
  ctrl.create(req, res).catch(next),
);
router.delete('/:id', requireAuth, (req: Request, res: Response, next: NextFunction) =>
  ctrl.remove(req, res).catch(next),
);

router.post(
  '/reserve',
  requireAuth,
  zodValidate({ body: schemas.bookings.reserveBody, headers: schemas.bookings.reserveHeaders }),
  (req: Request, res: Response, next: NextFunction) => ctrl.reserve(req, res).catch(next),
);

router.get(
  '/export',
  requireAuth,
  requireAdmin,
  (req: Request, res: Response, next: NextFunction) => ctrl.exportCSV(req, res).catch(next),
);

export default router;
