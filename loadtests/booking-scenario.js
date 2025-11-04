import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

//? Реалистичный сценарий: регистрация → логин → бронирование
export const options = {
  stages: [
    { duration: '1m', target: 20 }, // Рампа до 20 пользователей
    { duration: '3m', target: 50 }, // Рампа до 50
    { duration: '5m', target: 50 }, // Плато 50 на 5 минут
    { duration: '2m', target: 0 }, // Рампа вниз
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.02'], // < 2% ошибок
    booking_attempts: ['count>100'], // Минимум 100 попыток бронирования
    booking_successes: ['rate>0.8'], // > 80% успешных бронирований
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

//? Счётчики для кастомных метрик
import { Counter, Trend } from 'k6/metrics';
const bookingAttempts = new Counter('booking_attempts');
const bookingSuccesses = new Counter('booking_successes');
const bookingDuration = new Trend('booking_duration');

export default function () {
  const email = `user-${randomString(8)}@loadtest.com`;
  const password = 'testpass123';

  group('Регистрация и аутентификация', function () {
    //? Регистрация нового пользователя
    let res = http.post(
      `${BASE_URL}/auth/register`,
      JSON.stringify({ email, password, name: 'Load Test User' }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    check(res, {
      'registration status 201': (r) => r.status === 201,
    });

    sleep(0.5);

    //? Логин
    res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({ email, password }), {
      headers: { 'Content-Type': 'application/json' },
    });

    const loginSuccess = check(res, {
      'login status 200': (r) => r.status === 200,
      'login sets cookies': (r) => r.headers['Set-Cookie'] !== undefined,
    });

    if (!loginSuccess) {
      return; // Прерываем итерацию, если логин не удался
    }

    //? Извлекаем cookie для последующих запросов
    const cookies = res.headers['Set-Cookie'];
    const jar = http.cookieJar();
    jar.set(`${BASE_URL}`, 'access_token', cookies);

    sleep(1);

    group('Просмотр событий', function () {
      //? Получение списка событий
      const eventsRes = http.get(`${BASE_URL}/events`, {
        headers: { Cookie: cookies },
      });

      check(eventsRes, {
        'events list status 200': (r) => r.status === 200,
      });

      sleep(0.5);
    });

    group('Бронирование места', function () {
      //? Попытка бронирования
      const eventId = Math.floor(Math.random() * 2) + 1; // event_id: 1 или 2
      const idempotencyKey = `load-${randomString(16)}`;

      bookingAttempts.add(1);
      const startTime = Date.now();

      const bookingRes = http.post(
        `${BASE_URL}/bookings/reserve`,
        JSON.stringify({ event_id: eventId }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
            Cookie: cookies,
          },
        },
      );

      const duration = Date.now() - startTime;
      bookingDuration.add(duration);

      const bookingSuccess = check(bookingRes, {
        'booking status 201 or 200': (r) => r.status === 201 || r.status === 200,
        'booking returns id': (r) => {
          const body = JSON.parse(r.body);
          return body.data && body.data.id;
        },
      });

      if (bookingSuccess) {
        bookingSuccesses.add(1);
      }

      sleep(1);

      //? Проверка идемпотентности: повторный запрос с тем же ключом
      const repeatRes = http.post(
        `${BASE_URL}/bookings/reserve`,
        JSON.stringify({ event_id: eventId }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
            Cookie: cookies,
          },
        },
      );

      check(repeatRes, {
        'repeat booking status 200': (r) => r.status === 200,
        'idempotency works': (r) => {
          const original = JSON.parse(bookingRes.body);
          const repeat = JSON.parse(r.body);
          return original.data.id === repeat.data.id;
        },
      });

      sleep(0.5);
    });
  });

  sleep(2);
}
