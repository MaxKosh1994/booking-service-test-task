# Booking Service

Стек: Node.js (Express, TypeScript), PostgreSQL, Sequelize, Redis, RabbitMQ, JWT, bcrypt, morgan, Swagger, nodemon.

## Структура

- `src/app.ts` — конфигурация Express, логирование, middlewares
- `src/index.ts` — старт сервера, `sequelize.sync()`
- `src/db` — подключение и модели (`User`, `Event`, `Booking`), связи ManyToMany
- `src/modules/*` — роуты/контроллеры/сервисы по доменам
- `src/lib/*` — env, jwt, redis, idempotency, amqp

## Версионирование API

Текущая версия: **v1**

- Все эндпоинты доступны по адресу `/api/v1/*`
- Редирект с `/api` на `/api/v1/docs`
- Заголовки версионирования:
  - `API-Version`: текущая версия (v1)
  - `Deprecation`: дата объявления устаревшим (RFC 8594)
  - `Sunset`: дата прекращения поддержки (RFC 8594)
  - `Link`: ссылка на документацию следующей версии

## Запуск (Docker Compose)

1. Создайте `.env` на основе `.env.example`
2. `docker compose up --build`
3. API: `http://localhost:3000/api/v1`, Документация: `http://localhost:3000/api/v1/docs`

## Переменные окружения (минимум для запуска)

Добавьте в `.env` (значения по умолчанию есть внутри docker-compose):

- `PORT=3000`
- `JWT_ACCESS_SECRET=dev_access_secret`
- `JWT_REFRESH_SECRET=dev_refresh_secret`
- `JWT_ACCESS_TTL=15m`
- `JWT_REFRESH_TTL=30d`
- `IDEMPOTENCY_TTL_SECONDS=300`
- `POSTGRES_DB=booking_db`
- `POSTGRES_USER=booking`
- `POSTGRES_PASSWORD=booking_pass`
- `REDIS_HOST=redis` `REDIS_PORT=6379`
- `RABBITMQ_URL=amqp://booking:booking_pass@rabbitmq:5672`

## Запуск локально

1. `npm ci`
2. Поднимите Postgres/Redis/RabbitMQ (см. docker-compose.yml) или укажите свои DSN в `.env`
3. `npm run dev`

## Основные эндпоинты

Все пути начинаются с `/api/v1`:

- Auth: `POST /api/v1/auth/register|login|refresh|logout` (JWT в httpOnly cookies)
- Events: `GET /api/v1/events`, `GET /api/v1/events/:id`, `POST/PUT/DELETE /api/v1/events` (админ)
- Bookings: `GET /api/v1/bookings`, `GET /api/v1/bookings/:id`, `POST /api/v1/bookings`, `DELETE /api/v1/bookings/:id`
- Reserve: `POST /api/v1/bookings/reserve` с идемпотентностью (заголовок `Idempotency-Key` опциональный)
- Export: `GET /api/v1/bookings/export` — экспорт всех бронирований в CSV (только для администраторов)
- Admin: `GET /api/v1/admin/logs` (доступ только администратору)

Все ответы: `{ data, error, message, statusCode }`.

## Идемпотентность резервирования

Ключ `Idempotency-Key` в заголовке (или автоматически `userId:eventId`). Результаты кэшируются в Redis на `IDEMPOTENCY_TTL_SECONDS`.

## События

`booking.created` публикуется в RabbitMQ (exchange `booking`, topic).

## Полный флоу проверки (для проверяющего)

Ниже — минимальный сценарий проверки без знания кода.

1. Поднятие окружения

- Убедитесь, что установлен Docker Desktop.
- Скопируйте `.env.example` в `.env` (см. раздел Переменные окружения).
- Выполните: `docker compose down -v && docker compose up --build`.

2. Быстрый health-check зависимостей

- Команда: `curl -s http://localhost:3000/api/v1/health | jq`
- Ожидаемо: `{ data: { ok: true, checks: { postgres: "up", redis: "up", rabbitmq: "up" }}, ... }`.
- Проверьте заголовок ответа: `API-Version: v1`

3. Ознакомление со Swagger

- Откройте `http://localhost:3000/api/v1/docs` (или просто `http://localhost:3000/api` — будет редирект).
- Доступные группы: Auth, Users, Events, Bookings, Admin.
- В описании API указана информация о версионировании и deprecation-заголовках.

4. Аутентификация (куки)

- Запрос: `POST /api/v1/auth/register` с телом `{ "email": "user@test.com", "password": "pass123", "name": "User" }`.
- Затем `POST /api/v1/auth/login` с тем же email/password.
- В ответ придут httpOnly куки (access/refresh). Все последующие запросы выполняйте в той же сессии (в Swagger включите "cookie" или используйте curl с передачей cookie).

5. Работа с Events (CRUD)

- `GET /api/v1/events` — список событий (должен вернуть пустой список на чистой БД или seeded данные, если запускались сиды).
- Админ-операции (создание/обновление/удаление) доступны только с ролью admin.
  - Для быстрого теста можно использовать сиды или поменять роль пользователя в БД.

6. Резервирование места (идемпотентность)

- `POST /api/v1/bookings/reserve` с телом `{ "event_id": 1 }` (userId берётся из access-токена).
- Повторите тот же запрос с тем же заголовком `Idempotency-Key: <любой-uuid>` — второй ответ должен быть идентичен первому.
- Попытка повторного бронирования на тот же `event_id` без идемпотентности вернёт 409.

7. Экспорт бронирований в CSV

- `GET /api/v1/bookings/export` — доступен только администратору, возвращает CSV-файл со всеми бронированиями.

8. Логи для администратора

- `GET /api/v1/admin/logs` — доступен только администратору, отдаёт статические лог-файлы.

9. Автотесты (Jest + Supertest)

- Локально (без Docker):
  - `npm ci`
  - Заполните `.env` (см. выше). Для тестов реальных внешних соединений не требуется: AMQP/Redis/ENV замоканы через `__mocks__`.
  - `npm test` — прогон unit-тестов.

10. Генерация документации кода (TypeDoc)

- `npm run docs:generate` — создаёт HTML-документацию в папке `docs/`
- Откройте `docs/index.html` в браузере для просмотра документации всех модулей, функций, типов

11. Нагрузочное тестирование (k6)

Установите k6: `brew install k6` (macOS) или см. https://k6.io/docs/get-started/installation/

Доступные сценарии:
- `npm run loadtest:smoke` — минимальная нагрузка (2 VU, 30s)
- `npm run loadtest:load` — средняя нагрузка (до 100 VU, 9 минут)
- `npm run loadtest:stress` — поиск пределов (до 300 VU, 14 минут)
- `npm run loadtest:spike` — резкие скачки (до 600 VU)
- `npm run loadtest:soak` — длительная нагрузка (50 VU, 1 час)
- `npm run loadtest:booking` — реалистичный сценарий бронирования (регистрация → логин → бронирование)

Подробнее см. `loadtests/README.md`

12. Линт и форматирование

- `npm run lint` — проверка ESLint (flat config, v9).
- `npm run lint:fix` и `npm run format` — автоисправления и форматирование Prettier.

13. Миграции и сиды (Sequelize CLI)

- В контейнере API (если требуется ручной запуск):
  - `docker compose exec api npx sequelize-cli db:migrate`
  - `docker compose exec api npx sequelize-cli db:seed:all`

14. CI/CD (GitHub Actions)

- Workflow `ci.yml` на каждый push/PR в `main`:
  - Поднимает Postgres/Redis/RabbitMQ как сервисы.
  - Устанавливает зависимости, запускает линтер, сборку, миграции/сиды и тесты.
  - Убедитесь, что статус CI зелёный — это эквивалент прохождения локального сценария.

15. Типовые проверки статусов и формата ответа

- Любой эндпоинт должен отвечать в форме `{ data, error, message, statusCode }`.
- Ошибки валидации (400), неавторизован (401), нет прав (403), конфликт (409), не найдено (404) — проверяются тестами и отражены в Swagger.
- Все ответы содержат заголовок `API-Version: v1`.

## Дополнительные возможности

- **Экспорт в CSV**: GET `/api/v1/bookings/export` — скачивание всех бронирований в CSV формате (admin)
- **TypeDoc**: Автоматическая генерация документации кода из JSDoc комментариев
- **Версионирование**: Готовая инфраструктура для миграции на v2 с deprecation-заголовками
- **Нагрузочное тестирование**: Набор k6 сценариев для проверки производительности
