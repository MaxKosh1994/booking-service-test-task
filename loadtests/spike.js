import http from 'k6/http';
import { check, sleep } from 'k6';

//? Spike test: резкие скачки нагрузки
export const options = {
  stages: [
    { duration: '1m', target: 10 }, // База: 10 пользователей
    { duration: '30s', target: 500 }, // Резкий скачок до 500
    { duration: '1m', target: 500 }, // Плато 500 на 1 минуту
    { duration: '30s', target: 10 }, // Возврат к базе
    { duration: '1m', target: 10 }, // База снова
    { duration: '30s', target: 600 }, // Ещё больший скачок
    { duration: '1m', target: 600 }, // Плато 600
    { duration: '30s', target: 10 }, // Возврат
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // Во время пиков допустимо до 2s
    http_req_failed: ['rate<0.1'], // До 10% ошибок во время пиков
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health check status 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
