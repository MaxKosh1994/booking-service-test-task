import './loadEnv.js';
import { createServer } from 'http';
import app from './app.js';
import sequelize from '../db/sequelize.js';
import '../db/models/index.js';
import { scheduleLogRotation } from './utils/logRotation.js';

const PORT = Number(process.env.PORT || 3000);

async function start() {
  await sequelize.authenticate(); //? Проверка подключения к базе данных
  await sequelize.sync(); //? Синхронизация моделей с базой данных
  const server = createServer(app); //? Создание сервера

  //? Запуск сервера на порту
  server.listen(PORT, () => console.log(`Приложение запущено на порту ${PORT}`));

  //? Планировщик ротации логов (ежедневно 03:05, сжимает и архивирует)
  scheduleLogRotation();
}

//? Обработка ошибок при запуске сервера
start().catch((err) => console.error('Ошибка при запуске сервера', err));

export {};
