import http from 'k6/http';
import { check, sleep } from 'k6';

//? Load test: средняя нагрузка
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Рампа до 100 пользователей за 2 минуты
    { duration: '5m', target: 100 }, // Плато 100 пользователей на 5 минут
    { duration: '2m', target: 0 }, // Рампа вниз за 2 минуты
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>50'], // Минимум 50 RPS
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

export default function () {
  //? Health check
  http.get(`${BASE_URL}/health`);
  sleep(0.5);

  //? Список событий
  const eventsRes = http.get(`${BASE_URL}/events`);
  check(eventsRes, {
    'events status 200': (r) => r.status === 200,
  });
  sleep(1);

  //? Получение конкретного события
  http.get(`${BASE_URL}/events/1`);
  sleep(0.5);
}
