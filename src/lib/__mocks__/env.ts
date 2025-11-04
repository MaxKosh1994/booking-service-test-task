const env = {
  jwt: {
    accessSecret: 'test-access-secret',
    refreshSecret: 'test-refresh-secret',
    accessTtl: '15m',
    refreshTtl: '7d',
  },
  redis: {
    host: 'localhost',
    port: 6379,
  },
  idempotencyTtlSeconds: 60,
};

export default env;

