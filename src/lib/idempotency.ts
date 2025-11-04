import { ensureRedisConnected, redis } from './redis.js';
import env from './env.js';

type IdempotentResultType<T> = {
  reused: boolean;
  value: T | null;
};

//? Идемпотентность
export async function withIdempotency<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<IdempotentResultType<T>> {
  await ensureRedisConnected();
  const lockKey = `idem:lock:${key}`;
  const dataKey = `idem:data:${key}`;

  const cached = await redis.get(dataKey);
  if (cached) return { reused: true, value: JSON.parse(cached) as T };

  const acquired = await redis.set(lockKey, '1', { NX: true, EX: env.idempotencyTtlSeconds });
  if (!acquired) {
    //? Кто-то другой обрабатывает; опрашиваем несколько раз для результата
    for (let i = 0; i < 10; i++) {
      await sleep(100);
      const c = await redis.get(dataKey);
      if (c) return { reused: true, value: JSON.parse(c) as T };
    }
    //? По-прежнему ничего, разрешаем выполнение, но рискуем дубликатом
  }

  const result = await fn();
  await redis.set(dataKey, JSON.stringify(result), { EX: env.idempotencyTtlSeconds });
  return { reused: false, value: result };
}

//? Засыпание
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
