import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import { registerRoutes } from './routes/index.js';
import { configureServer } from './config/serverConfig.js';
import { authRateLimiter, reserveRateLimiter } from './utils/rateLimiters.js';
import { API_ROUTES } from './enums/apiRoutes.js';
import { API_VERSIONS } from './middlewares/apiVersion.js';

//? Создание Express приложения
const app = express();

//? Настройка сервера
configureServer(app);

//? Применение rate limits на конкретных маршрутах (v1)
app.use(`${API_ROUTES.BASE}/${API_VERSIONS.V1}${API_ROUTES.AUTH}`, authRateLimiter);
app.use(
  `${API_ROUTES.BASE}/${API_VERSIONS.V1}${API_ROUTES.BOOKINGS}${API_ROUTES.RESERVE}`,
  reserveRateLimiter,
);

//? Регистрация маршрутов
registerRoutes(app);

//? Обработка ошибок
app.use(errorHandler);

export default app;
