import { createClient } from 'redis';
import env from './env.js';

export const redis = createClient({
  socket: { host: env.redis.host, port: env.redis.port },
  password: env.redis.password,
});

redis.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Redis Client Error', err);
});

export async function ensureRedisConnected() {
  if (!redis.isOpen) await redis.connect();
}

export default redis;
