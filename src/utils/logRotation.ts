import fs from 'fs';
import path from 'path';
import { createGzip } from 'zlib';

//? Получение путей к директориям логов
function getEnvPaths() {
  const logDir = process.env.LOG_DIR || path.resolve(process.cwd(), 'logs');
  const logFile = process.env.LOG_FILE || 'app.log';
  const archiveDir = process.env.LOG_ARCHIVE_DIR || path.resolve(logDir, 'archive');
  const filePath = path.resolve(logDir, logFile);
  return { logDir, logFile, archiveDir, filePath };
}

//? Создание директорий для логов
function ensureDirs() {
  const { logDir, archiveDir } = getEnvPaths();
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
}

//? Сжатие файла
function gzipFile(srcPath: string, destPathGz: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(srcPath);
    const output = fs.createWriteStream(destPathGz);
    const gzip = createGzip();
    input.on('error', reject);
    output.on('error', reject);
    output.on('finish', () => resolve());
    input.pipe(gzip).pipe(output);
  });
}

//? Ротация логов
async function rotateOnce() {
  ensureDirs();
  const { filePath, archiveDir } = getEnvPaths();
  if (!fs.existsSync(filePath)) return;
  const stat = fs.statSync(filePath);
  if (stat.size === 0) return;

  const date = new Date().toISOString().slice(0, 10);
  const archiveBase = `app-${date}.log`;
  const archivePath = path.resolve(archiveDir, archiveBase);
  const archiveGz = `${archivePath}.gz`;

  fs.copyFileSync(filePath, archivePath);
  await gzipFile(archivePath, archiveGz);
  fs.unlinkSync(archivePath);

  try {
    fs.truncateSync(filePath, 0);
  } catch {
    return;
  }
}

//? Вычисление времени до следующего часа и минуты
function msUntil(hour: number, minute: number) {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

//? Планировщик ротации логов
export function scheduleLogRotation() {
  const firstDelay = msUntil(3, 5);
  setTimeout(function run() {
    rotateOnce().catch(() => {});
    setTimeout(run, 24 * 60 * 60 * 1000);
  }, firstDelay);
}

//? Список архивов логов
export function listArchives(): string[] {
  const { archiveDir } = getEnvPaths();
  if (!fs.existsSync(archiveDir)) return [];
  return fs
    .readdirSync(archiveDir)
    .filter((f) => f.endsWith('.gz'))
    .sort();
}

//? Получение абсолютного пути к архиву логов
export function getArchiveAbsolutePath(filename: string): string | null {
  const { archiveDir } = getEnvPaths();
  const abs = path.resolve(archiveDir, filename);
  if (!abs.startsWith(path.resolve(archiveDir))) return null;
  return fs.existsSync(abs) ? abs : null;
}
