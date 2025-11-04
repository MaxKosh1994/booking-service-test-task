import { Router, Request, Response, NextFunction } from 'express';
import * as ctrl from './auth.controller.js';
import { zodValidate, schemas } from '../../utils/zodValidate.js';

enum API_ROUTES {
  BASE = '/auth',
  REGISTER = '/register',
  LOGIN = '/login',
  REFRESH = '/refresh',
  LOGOUT = '/logout',
}

const router = Router();

router.post(
  API_ROUTES.REGISTER,
  zodValidate({ body: schemas.auth.register }),
  (req: Request, res: Response, next: NextFunction) => ctrl.register(req, res).catch(next),
);

router.post(
  API_ROUTES.LOGIN,
  zodValidate({ body: schemas.auth.login }),
  (req: Request, res: Response, next: NextFunction) => ctrl.login(req, res).catch(next),
);

router.post(API_ROUTES.REFRESH, (req: Request, res: Response, next: NextFunction) =>
  ctrl.refresh(req, res).catch(next),
);

router.post(API_ROUTES.LOGOUT, (req: Request, res: Response, next: NextFunction) =>
  ctrl.logout(req, res).catch(next),
);

export default router;
