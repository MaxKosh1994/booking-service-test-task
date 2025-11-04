import type { Request, Response, NextFunction } from 'express';

//? Конфигурация версий API
export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2', //? Для будущего использования
} as const;

export const CURRENT_VERSION = API_VERSIONS.V1;

//? Deprecated версии и их сроки устаревания
const DEPRECATED_VERSIONS: Record<
  string,
  {
    sunsetDate?: string; //? ISO дата удаления
    deprecationDate: string; //? ISO дата объявления устаревшим
    message: string;
  }
> = {
  //? Пример для будущего:
  // [API_VERSIONS.V1]: {
  //   deprecationDate: '2025-01-01T00:00:00Z',
  //   sunsetDate: '2025-06-01T00:00:00Z',
  //   message: 'API v1 устарел. Используйте v2. Поддержка v1 прекратится 2025-06-01.',
  // },
};

//? Middleware для установки заголовков версионирования
export function apiVersionHeaders(version: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    //? Устанавливаем текущую версию API
    res.setHeader('API-Version', version);

    //? Если версия устарела, добавляем deprecation-заголовки
    const deprecationInfo = DEPRECATED_VERSIONS[version];
    if (deprecationInfo) {
      res.setHeader('Deprecation', deprecationInfo.deprecationDate);
      res.setHeader('X-API-Deprecation-Info', deprecationInfo.message);

      if (deprecationInfo.sunsetDate) {
        res.setHeader('Sunset', deprecationInfo.sunsetDate);
      }

      //? Link на документацию новой версии (RFC 8288)
      const nextVersion = version === API_VERSIONS.V1 ? API_VERSIONS.V2 : null;
      if (nextVersion) {
        res.setHeader('Link', `</api/${nextVersion}/docs>; rel="successor-version"`);
      }
    }

    next();
  };
}

//? Middleware для проверки поддерживаемой версии
export function validateApiVersion(req: Request, res: Response, next: NextFunction) {
  const requestedVersion = req.baseUrl.split('/')[2]; //? /api/v1/... → v1

  const supportedVersions = Object.values(API_VERSIONS);
  if (!supportedVersions.includes(requestedVersion as any)) {
    return res.status(400).json({
      data: null,
      error: 'UNSUPPORTED_API_VERSION',
      message: `Версия API "${requestedVersion}" не поддерживается. Доступные версии: ${supportedVersions.join(', ')}`,
      statusCode: 400,
    });
  }

  next();
}
