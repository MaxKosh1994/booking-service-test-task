import type { Express } from 'express';
import morgan from 'morgan';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { responseEnvelope } from '../middlewares/responseEnvelope.js';
import { accessLogStream } from '../utils/logger.js';

export function configureServer(app: Express): void {
  //? Настройка trust proxy
  app.set('trust proxy', 1);

  //? Настройка CORS
  app.use(cors({ origin: true, credentials: true }));

  //? Настройка JSON
  app.use(express.json());

  //? Настройка URL-encoded
  app.use(express.urlencoded({ extended: true }));

  //? Настройка cookie-parser
  app.use(cookieParser());

  //? Запись логов в файл
  app.use(morgan('combined', { stream: accessLogStream }));

  //? Трансляция логов в консоль
  app.use(morgan('dev'));

  //? Обертка для ответа
  app.use(responseEnvelope);
}
