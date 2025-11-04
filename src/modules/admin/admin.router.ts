import type { Request, Response } from 'express';
import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { requireAuth, requireAdmin } from '../../middlewares/auth.js';
import { listArchives, getArchiveAbsolutePath } from '../../utils/logRotation.js';

const router = Router();

//? Получение логов
router.get('/logs', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const logDir = process.env.LOG_DIR || path.resolve(process.cwd(), 'logs');
  const logFile = process.env.LOG_FILE || 'app.log';
  const filePath = path.resolve(logDir, logFile);
  if (!fs.existsSync(filePath))
    return res.status(404).json({
      data: null,
      error: 'NOT_FOUND',
      message: 'Logs not found',
      statusCode: 404,
    });
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(filePath);
});

export default router;

//? Список архивов логов
router.get('/logs/archive', requireAuth, requireAdmin, (_req: Request, res: Response) => {
  const files = listArchives();
  res.json({ data: { files }, error: null, message: 'OK', statusCode: 200 });
});

//? Получение конкретного архивного файла
router.get('/logs/archive/:name', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const abs = getArchiveAbsolutePath(req.params.name);
  if (!abs)
    return res
      .status(404)
      .json({ data: null, error: 'NOT_FOUND', message: 'Not found', statusCode: 404 });
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(abs);
});
