import { withIdempotency } from '../src/lib/idempotency.js';

jest.mock('../src/lib/redis.ts');
jest.mock('../src/lib/env.ts');

//? Тесты для идемпотентности
describe('Идемпотентность', () => {
  it('кэширует результат для одинакового ключа', async () => {
    let called = 0;
    const res1 = await withIdempotency('test-key', async () => {
      called++;
      return { ok: true };
    });
    const res2 = await withIdempotency('test-key', async () => {
      called++;
      return { ok: true };
    });
    expect(res1.reused).toBe(false);
    expect(res2.reused).toBe(true);
    expect(called).toBe(1);
  });
});
