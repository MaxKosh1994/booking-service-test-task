import path from 'path';
import fs from 'fs';

//? Путь к директории логов
const logDir = process.env.LOG_DIR || path.resolve(process.cwd(), 'logs');
//? Имя файла логов
const logFile = process.env.LOG_FILE || 'app.log';
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

//? Создание потока для записи логов
export const accessLogStream = fs.createWriteStream(path.join(logDir, logFile), { flags: 'a' });
