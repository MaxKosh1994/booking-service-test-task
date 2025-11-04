import http from 'k6/http';
import { check, sleep } from 'k6';

//? Smoke test: минимальная нагрузка для проверки работоспособности
export const options = {
  vus: 2, // 2 виртуальных пользователя
  duration: '30s', // 30 секунд
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'], // Ошибок < 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

export default function () {
  //? Health check
  let res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health check status 200': (r) => r.status === 200,
    'health check has data': (r) => JSON.parse(r.body).data !== null,
  });

  sleep(1);

  //? Получение списка событий
  res = http.get(`${BASE_URL}/events`);
  check(res, {
    'events list status 200': (r) => r.status === 200,
    'events list is array': (r) => Array.isArray(JSON.parse(r.body).data),
  });

  sleep(1);
}
