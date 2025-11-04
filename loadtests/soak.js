import http from 'k6/http';
import { check, sleep } from 'k6';

//? Soak test (выдержка): длительная нагрузка для поиска утечек памяти
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Рампа до 50 пользователей
    { duration: '60m', target: 50 },  // Плато 50 пользователей на 1 час
    { duration: '2m', target: 0 },    // Рампа вниз
  ],
  thresholds: {
    http_req_duration: ['p(95)<600', 'p(99)<1200'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>30'], // Минимум 30 RPS
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

export default function () {
  //? Микс операций для имитации реального использования
  const operations = [
    () => http.get(`${BASE_URL}/health`),
    () => http.get(`${BASE_URL}/events`),
    () => http.get(`${BASE_URL}/events/1`),
    () => http.get(`${BASE_URL}/events/2`),
  ];

  const operation = operations[Math.floor(Math.random() * operations.length)];
  const res = operation();

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(Math.random() * 3 + 1); // 1-4 секунды
}

