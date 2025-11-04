# Нагрузочное тестирование

Сценарии нагрузочного тестирования для Booking Service с использованием [k6](https://k6.io/).

## Установка k6

### macOS

```bash
brew install k6
```

### Linux

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Windows

```powershell
choco install k6
```

Или скачайте с https://k6.io/docs/get-started/installation/

## Запуск сценариев

### Предварительные условия

1. Запустите приложение: `docker compose up --build`
2. Накатите сиды: `docker compose exec api npx sequelize-cli db:seed:all`

### Smoke test (минимальная нагрузка)

```bash
k6 run loadtests/smoke.js
```

### Load test (средняя нагрузка)

```bash
k6 run loadtests/load.js
```

### Stress test (поиск пределов)

```bash
k6 run loadtests/stress.js
```

### Spike test (резкие скачки нагрузки)

```bash
k6 run loadtests/spike.js
```

### Booking scenario (реалистичный сценарий бронирования)

```bash
k6 run loadtests/booking-scenario.js
```

## Профили нагрузки

### Smoke Test

- 1-2 виртуальных пользователя
- 30 секунд
- Цель: проверить работоспособность

### Load Test

- Рампа от 0 до 100 пользователей за 2 минуты
- Плато 100 пользователей на 5 минут
- Рампа вниз за 2 минуты
- Цель: проверить поведение под типичной нагрузкой

### Stress Test

- Рампа от 0 до 200 пользователей за 3 минуты
- Плато 200 пользователей на 5 минут
- Рампа до 300 пользователей за 2 минуты
- Плато 300 на 2 минуты
- Рампа вниз за 2 минуты
- Цель: найти точку отказа

### Spike Test

- 10 пользователей база
- Резкие скачки до 500 пользователей на 1 минуту
- Возврат к базе
- Цель: проверить восстановление после пиков

## Метрики

k6 собирает следующие метрики:

- **http_req_duration**: время ответа (p95, p99)
- **http_req_failed**: процент ошибок
- **http_reqs**: количество запросов в секунду (RPS)
- **vus**: активные виртуальные пользователи
- **iteration_duration**: длительность итерации

## Пороговые значения (thresholds)

Для всех сценариев установлены SLA:

- 95% запросов должны выполняться за < 500ms
- 99% запросов должны выполняться за < 1000ms
- Ошибок < 1%
