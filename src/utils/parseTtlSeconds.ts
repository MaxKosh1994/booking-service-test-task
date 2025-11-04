//? Парсинг TTL в секунды
export function parseTtlSeconds(ttl: string): number {
  //? Парсим TTL в секунды
  const m = ttl.match(/^(\d+)([smhd])$/);
  if (!m) return Number(ttl) || 3600;
  const n = Number(m[1]);
  const unit = m[2];
  switch (unit) {
    case 's':
      return n;
    case 'm':
      return n * 60;
    case 'h':
      return n * 3600;
    case 'd':
      return n * 86400;
    default:
      return n;
  }
}
