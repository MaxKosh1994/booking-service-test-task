import path from 'path';
import { config } from 'dotenv';

//? Путь к файлу .env в зависимости от окружения
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: path.resolve(process.cwd(), envPath) });

export {};
