import type { OpenAPIV3_1 } from 'openapi-types';

export const spec: OpenAPIV3_1.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Booking Service API',
    version: '1.0.0',
    description: `
## Версионирование API

Текущая версия: **v1**

Все эндпоинты доступны по адресу \`/api/v1/*\`.

### Заголовки версионирования

- \`API-Version\`: Текущая версия API (например, \`v1\`)
- \`Deprecation\`: Дата, когда версия объявлена устаревшей (RFC 8594)
- \`Sunset\`: Дата прекращения поддержки версии (RFC 8594)
- \`X-API-Deprecation-Info\`: Человекочитаемое сообщение об устаревании
- \`Link\`: Ссылка на документацию следующей версии (rel="successor-version")

### Миграция между версиями

При появлении v2, v1 будет помечена как deprecated с указанием даты sunset.
Рекомендуется следить за заголовками \`Deprecation\` и \`Sunset\` в ответах API.
    `,
  },
  servers: [
    { url: '/api/v1', description: 'API v1 (текущая версия)' },
    { url: '/api/v2', description: 'API v2 (в разработке, вернёт 501)' },
  ],
  tags: [
    { name: 'system', description: 'Системные проверки' },
    { name: 'auth', description: 'Аутентификация и сессии' },
    { name: 'users', description: 'Управление пользователями (требуется admin)' },
    { name: 'events', description: 'Управление событиями' },
    { name: 'bookings', description: 'Бронирования' },
    { name: 'admin', description: 'Админ-доступ к логам' },
  ],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          data: { type: ['object', 'null'] },
          error: {
            oneOf: [
              { type: 'string' },
              {
                type: 'object',
                additionalProperties: true,
              },
            ],
          },
          message: { type: 'string' },
          statusCode: { type: 'integer' },
        },
        required: ['data', 'error', 'message', 'statusCode'],
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          pageSize: { type: 'integer', minimum: 1 },
          total: { type: 'integer', minimum: 0 },
        },
        required: ['page', 'pageSize', 'total'],
      },
      PaginatedEvents: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              items: { type: 'array', items: { $ref: '#/components/schemas/Event' } },
              meta: { $ref: '#/components/schemas/PaginationMeta' },
            },
            required: ['items', 'meta'],
          },
          error: { type: ['object', 'string', 'null'] },
          message: { type: 'string' },
          statusCode: { type: 'integer' },
        },
        required: ['data', 'error', 'message', 'statusCode'],
      },
      ApiResponse: {
        type: 'object',
        properties: {
          data: {},
          error: {},
          message: { type: 'string' },
          statusCode: { type: 'integer' },
        },
        required: ['data', 'error', 'message', 'statusCode'],
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      LoginRequest: {
        type: 'object',
        properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } },
        required: ['email', 'password'],
      },
      Event: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          totalSeats: { type: 'integer' },
        },
      },
      BookingReserveRequest: {
        type: 'object',
        properties: { event_id: { type: 'integer' } },
        required: ['event_id'],
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': { get: { tags: ['system'], responses: { '200': { description: 'ok' } } } },
    '/auth/register': {
      post: {
        tags: ['auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
              examples: {
                example: {
                  value: { email: 'user@test.com', password: 'pass123', name: 'User' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'created' },
          '409': {
            description: 'conflict',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              examples: { example: { value: { email: 'user@test.com', password: 'pass123' } } },
            },
          },
        },
        responses: {
          '200': {
            description: 'ok (куки будут установлены как httpOnly)',
            headers: {
              'Set-Cookie': {
                schema: { type: 'string' },
                description: 'access/refresh httpOnly cookies',
              },
            },
          },
          '401': {
            description: 'unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['auth'],
        responses: { '200': { description: 'ok' }, '401': { description: 'unauthorized' } },
      },
    },
    '/auth/logout': { post: { tags: ['auth'], responses: { '200': { description: 'ok' } } } },
    '/events': {
      get: {
        tags: ['events'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          '200': {
            description: 'list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PaginatedEvents' } },
            },
          },
        },
      },
      post: { tags: ['events'], responses: { '201': { description: 'created' } } },
    },
    '/events/{id}': {
      get: {
        tags: ['events'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'ok' }, '404': { description: 'not found' } },
      },
      put: {
        tags: ['events'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'ok' } },
      },
      delete: {
        tags: ['events'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '204': { description: 'deleted' } },
      },
    },
    '/bookings': {
      get: { tags: ['bookings'], responses: { '200': { description: 'list' } } },
      post: { tags: ['bookings'], responses: { '201': { description: 'created' } } },
    },
    '/bookings/{id}': {
      get: {
        tags: ['bookings'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'ok' } },
      },
      delete: {
        tags: ['bookings'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '204': { description: 'deleted' } },
      },
    },
    '/bookings/reserve': {
      post: {
        tags: ['bookings'],
        parameters: [{ name: 'Idempotency-Key', in: 'header', schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookingReserveRequest' },
              examples: {
                idempotentCreate: {
                  summary: 'Первый запрос (создание)',
                  value: { event_id: 1 },
                },
                idempotentRepeat: {
                  summary: 'Повтор с тем же Idempotency-Key (вернёт 200)',
                  value: { event_id: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'created' },
          '200': { description: 'duplicate-ok' },
          '409': {
            description: 'conflict',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/bookings/export': {
      get: {
        tags: ['bookings'],
        summary: 'Экспорт всех бронирований в CSV (только для администраторов)',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'CSV файл с бронированиями',
            content: {
              'text/csv': {
                schema: {
                  type: 'string',
                  example:
                    'booking_id,user_id,user_email,user_name,event_id,event_name,created_at\n1,1,user@example.com,John,1,Event Name,2024-01-01T00:00:00.000Z',
                },
              },
            },
          },
          '401': {
            description: 'Не авторизован',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Доступ запрещён (требуется роль admin)',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['users'],
        responses: {
          '200': { description: 'list' },
          '401': { description: 'unauthorized' },
          '403': { description: 'forbidden' },
        },
      },
      post: {
        tags: ['users'],
        responses: {
          '201': { description: 'created' },
          '400': { description: 'bad request' },
          '401': { description: 'unauthorized' },
          '403': { description: 'forbidden' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['users'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'ok' },
          '401': { description: 'unauthorized' },
          '403': { description: 'forbidden' },
          '404': { description: 'not found' },
        },
      },
      put: {
        tags: ['users'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '200': { description: 'updated' },
          '400': { description: 'bad request' },
          '401': { description: 'unauthorized' },
          '403': { description: 'forbidden' },
          '404': { description: 'not found' },
        },
      },
      delete: {
        tags: ['users'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          '204': { description: 'deleted' },
          '401': { description: 'unauthorized' },
          '403': { description: 'forbidden' },
          '404': { description: 'not found' },
        },
      },
    },
    '/admin/logs': {
      get: {
        tags: ['admin'],
        responses: {
          '200': { description: 'logs served' },
          '401': { description: 'unauthorized' },
          '403': { description: 'forbidden' },
        },
      },
    },
  },
};

export default spec;
