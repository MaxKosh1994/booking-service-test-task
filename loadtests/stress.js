import http from 'k6/http';
import { check, sleep } from 'k6';

//? Stress test: поиск пределов системы
export const options = {
  stages: [
    { duration: '3m', target: 200 }, // Рампа до 200 пользователей
    { duration: '5m', target: 200 }, // Плато 200 на 5 минут
    { duration: '2m', target: 300 }, // Рампа до 300
    { duration: '2m', target: 300 }, // Плато 300 на 2 минуты
    { duration: '2m', target: 0 }, // Рампа вниз
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'], // Более мягкие пороги для стресс-теста
    http_req_failed: ['rate<0.05'], // До 5% ошибок допустимо
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

export default function () {
  const responses = http.batch([
    ['GET', `${BASE_URL}/health`],
    ['GET', `${BASE_URL}/events`],
    ['GET', `${BASE_URL}/events/1`],
  ]);

  check(responses[0], { 'health check ok': (r) => r.status === 200 });
  check(responses[1], { 'events list ok': (r) => r.status === 200 });

  sleep(Math.random() * 2); // Случайная задержка 0-2 секунды
}
