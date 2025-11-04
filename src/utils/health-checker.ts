import type { Request, Response, NextFunction } from 'express';
import sequelize from '../../db/sequelize.js';
import { ensureRedisConnected, redis } from '../lib/redis.js';
import { getAmqp } from '../lib/amqp.js';
import net from 'node:net';

enum HealthStatus {
  UP = 'up',
  DOWN = 'down',
}

//? Проверка здоровья сервиса
export async function healthChecker(_req: Request, res: Response, next: NextFunction) {
  try {
    const checks: Record<string, HealthStatus> = {};
    try {
      await sequelize.authenticate();
      checks.postgres = HealthStatus.UP;
    } catch {
      checks.postgres = HealthStatus.DOWN;
    }
    try {
      await ensureRedisConnected();
      await redis.ping();
      checks.redis = HealthStatus.UP;
    } catch {
      checks.redis = HealthStatus.DOWN;
    }
    try {
      const url = new URL(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
      const host = url.hostname || 'localhost';
      const port = Number(url.port || 5672);
      await new Promise<void>((resolve, reject) => {
        const socket = net.createConnection({ host, port });
        const onError = (err: unknown) => {
          socket.destroy();
          reject(err);
        };
        socket.setTimeout(2000, () => onError(new Error('timeout')));
        socket.once('error', onError);
        socket.once('connect', () => {
          socket.end();
          resolve();
        });
      });
      checks.rabbitmq = HealthStatus.UP;
    } catch {
      checks.rabbitmq = HealthStatus.DOWN;
    }
    const ok =
      checks.postgres === HealthStatus.UP &&
      checks.redis === HealthStatus.UP &&
      checks.rabbitmq === HealthStatus.UP;
    res.json({ data: { ok, checks }, error: null, message: 'OK', statusCode: 200 });
  } catch (e) {
    next(e);
  }
}

export default healthChecker;
