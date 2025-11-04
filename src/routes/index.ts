import type { Express } from 'express';
import express from 'express';
import authRouter from '../modules/auth/auth.router.js';
import userRouter from '../modules/users/user.router.js';
import eventRouter from '../modules/events/event.router.js';
import bookingRouter from '../modules/bookings/booking.router.js';
import adminRouter from '../modules/admin/admin.router.js';
import docsRouter from '../modules/docs/docs.router.js';
import healthChecker from '../utils/health-checker.js';
import { API_ROUTES } from '../enums/apiRoutes.js';
import { apiVersionHeaders, API_VERSIONS, CURRENT_VERSION } from '../middlewares/apiVersion.js';

export function registerRoutes(app: Express) {
  //? V1 Router (текущая версия)
  const v1Router = express.Router();
  v1Router.use(apiVersionHeaders(API_VERSIONS.V1));

  //? Регистрация маршрута health (общий для всех версий)
  v1Router.get(API_ROUTES.HEALTH, healthChecker);

  //? Регистрация маршрутов модулей v1
  v1Router.use(API_ROUTES.AUTH, authRouter);
  v1Router.use(API_ROUTES.USERS, userRouter);
  v1Router.use(API_ROUTES.EVENTS, eventRouter);
  v1Router.use(API_ROUTES.BOOKINGS, bookingRouter);
  v1Router.use(API_ROUTES.ADMIN, adminRouter);
  v1Router.use(API_ROUTES.DOCS, docsRouter);

  //? Регистрация версий API
  app.use(`${API_ROUTES.BASE}/${API_VERSIONS.V1}`, v1Router);

  //? Редирект с /api на текущую версию
  app.get(API_ROUTES.BASE, (req, res) => {
    res.redirect(`${API_ROUTES.BASE}/${CURRENT_VERSION}${API_ROUTES.DOCS}`);
  });

  //? Заглушка для будущей v2 (вернёт 501 Not Implemented)
  app.use(`${API_ROUTES.BASE}/${API_VERSIONS.V2}`, (req, res) => {
    res.status(501).json({
      data: null,
      error: 'NOT_IMPLEMENTED',
      message: 'API v2 ещё не реализован. Используйте v1.',
      statusCode: 501,
    });
  });
}
