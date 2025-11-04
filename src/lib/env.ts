export const env = {
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL,
    refreshTtl: process.env.JWT_REFRESH_TTL,
  },
  cookies: {
    domain: process.env.COOKIE_DOMAIN,
    secure: String(process.env.COOKIE_SECURE) === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
  },
  idempotencyTtlSeconds: Number(process.env.IDEMPOTENCY_TTL_SECONDS),
};

export default env;
