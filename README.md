# in-travel (ВПуть)

Web service for group trip planning: shared route, expense splitting, tickets.

**ВПуть** (в репозитории `in-travel`) - веб-сервис для совместного планирования
путешествий в компании: маршрут, общий бюджет с автоматическим расчётом долгов и
информация о билетах. Участники заходят по ссылке-приглашению, без регистрации.

Срок проекта: с 12 октября по 30 ноября 2026 г.
Техническое задание: [docs/technical-specification.docx](docs/technical-specification.docx).

## Стек

- Backend: Python, Flask, Flask-SQLAlchemy, SQLite
- Frontend: React (Vite)
- Связь: `fetch` с фронтенда, CORS включён через `flask-cors`

## Структура

```
in-travel/
├── backend/                  # серверная часть (Python, Flask)
│   ├── app/
│   │   ├── __init__.py       # создание приложения
│   │   ├── config.py         # настройки
│   │   ├── extensions.py     # объект db
│   │   ├── constants.py      # статусы, категории
│   │   ├── routes/           # контроллеры: эндпоинты API
│   │   ├── schemas/          # DTO: что приходит в API и что уходит из него (JSON)
│   │   ├── services/         # бизнес-логика, правила и проверки
│   │   ├── repositories/     # работа с базой данных
│   │   ├── domain/           # доменные модели: обычные Python-классы
│   │   └── models/           # таблицы базы данных (SQLAlchemy)
│   ├── tests/
│   ├── requirements.txt
│   └── run.py                # запуск сервера
├── frontend/                 # клиентская часть (React)
│   └── src/
│       ├── api/              # запросы к бэкенду (fetch)
│       ├── pages/            # страницы: грузят данные, держат состояния
│       ├── components/       # части страниц: показывают то, что им передали
│       └── styles/
├── docker/                   # запуск проекта в Docker (Dockerfile-ы и docker-compose.yml)
└── docs/                     # ТЗ, список эндпоинтов, макеты
```

В файлах-заглушках в комментарии написано, что там будет и кто за это отвечает.

## Слои backend

Запрос идёт сверху вниз, ответ возвращается снизу вверх. Каждый слой знает только о слое ниже.

```
Клиент (React)
   │  JSON
   ▼
routes/        контроллер: принял HTTP-запрос, вернул HTTP-ответ
   │  DTO ↔ доменная модель
   ▼
services/      бизнес-логика: правила, проверки, расчёты
   │  доменные модели
   ▼
repositories/  запросы к базе: найти, сохранить, удалить
   │  строки таблиц
   ▼
models/        таблицы БД (SQLAlchemy)
```

| Папка | Что там лежит | Чего там быть не должно |
|---|---|---|
| `routes/` | Функции-эндпоинты. Читают запрос, зовут сервис, формируют ответ и код (200, 201, 400, 404) | Расчётов, проверок бизнес-правил, запросов к базе |
| `schemas/` | **DTO**: `...Request` (что прислал клиент) и `...Response` (что мы отвечаем), методы превращения из JSON и в JSON | Логики, обращений к базе |
| `services/` | Бизнес-логика: проверки, расчёт долгов. Бросает `ValueError` с понятным текстом, если что-то не так | Flask (`request`, `jsonify`) и SQLAlchemy |
| `repositories/` | Все запросы к базе. Принимают и возвращают **доменные модели** | Бизнес-правил, Flask |
| `domain/` | **Доменные модели**: обычные классы (`dataclass`) с данными и простой логикой | Flask, SQLAlchemy, JSON |
| `models/` | Описание таблиц базы | Любой логики |

Зачем столько слоёв? Чтобы каждый кусок был маленьким и понятным, и чтобы можно было менять один слой, не трогая остальные (например, поменять формат JSON, не трогая базу). Для каждой сущности (поездка, участник, расход...) делаем по файлу в каждой папке с одним и тем же именем.

### Живой пример: `GET /trips`

Чтобы увидеть всё это в работе, в проекте есть учебная ручка `GET /trips`: она возвращает все поездки из базы. По ТЗ такая ручка не нужна, это просто образец, потом её можно удалить или заменить настоящей. Пройдите по файлам по порядку:

| Шаг | Файл | Что показывает |
|---|---|---|
| 1 | `backend/app/models/trip.py`, `participant.py` | две таблицы в базе и связь между ними |
| 2 | `backend/app/domain/trip.py` | доменная модель `Trip` |
| 3 | `backend/app/schemas/trip.py` | DTO ответа `TripResponse` |
| 4 | `backend/app/repositories/trip.py` | запрос к базе, превращение строки таблицы в `Trip` |
| 5 | `backend/app/services/trip.py` | сервис (здесь будут правила и проверки) |
| 6 | `backend/app/routes/trips.py` | сам эндпоинт |
| 7 | `backend/tests/test_trips.py` (`test_list_trips`) | тест эндпоинта |
| 8 | `frontend/src/api/client.js` | функция `getTrips` |
| 9 | `frontend/src/pages/ExamplePage.jsx` | загрузка данных и состояния «загрузка / пусто / ошибка» |
| 10 | `frontend/src/components/example/TripList.jsx` | компонент списка |

Путь запроса: `GET /trips` → `list_trips` (routes) → `get_all_trips` (service) → `get_all` (repository) читает строки `TripModel` и превращает их в `Trip` (domain) → `TripResponse` (DTO) → JSON → `getTrips()` на frontend → страница → компонент.

Как посмотреть: запустите backend, положите в базу пару поездок и запустите frontend (команды ниже).

```bash
cd backend && python seed_example.py   # добавит 2 поездки (запускать один раз)
```

Потом откройте http://localhost:5173. Тест: `cd backend && pytest tests/test_trips.py -k list_trips`.

**Как добавлять свою сущность:** скопируйте файлы примера в каждую папку, переименуйте и поправьте под себя. Если нужная папка или файл ещё не создан, создайте его.

## Тестовые (учебные) ручки

В проекте есть ручки и файлы, которых нет в ТЗ. Они нужны только как образец, настоящую функциональность на них не строим.

| Что | Где |
|---|---|
| `GET /trips`: список всех поездок | `routes/trips.py` (функция `list_trips`) |
| Страница-пример на frontend | `pages/ExamplePage.jsx`, `components/example/`, функция `getTrips` в `api/client.js` |
| Тест `test_list_trips` | `tests/test_trips.py` |
| Скрипт с тестовыми данными | `backend/seed_example.py` |

Что с ними делать:
- Смотрите на них как на образец и делайте свои ручки так же.
- Файлы `models/trip.py`, `models/participant.py`, `domain/trip.py`, `schemas/trip.py`, `repositories/trip.py`, `services/trip.py` и `routes/trips.py` не выбрасываем: Backend 1 дописывает в них настоящие эндпоинты поездок и участников.
- Когда пример станет не нужен, удалите `GET /trips` (если он остался лишним), страницу-пример (и поменяйте `App.jsx`), `components/example/`, `seed_example.py` и строку про `GET /trips` в `docs/api.md`.

## Запуск

Нужны Python 3.10+ и Node.js 18+.

```bash
# backend
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run.py                    # http://localhost:5000

# frontend (в другом терминале)
cd frontend
npm install
npm run dev                      # http://localhost:5173
```
##  Запуск тестов
cd backend
pip install -r requirements-dev.txt
python -m pytest tests -q

Если порт 5000 занят (бывает на macOS): `PORT=5001 python run.py`.

### Запуск через Docker (необязательно)

Если не хочется ставить Python и Node, весь проект поднимается одной командой. Нужен установленный Docker (на macOS его нужно сначала запустить, например Docker Desktop).

```bash
docker compose -f docker/docker-compose.yml up --build
```

Backend будет на http://localhost:5000, frontend на http://localhost:5173. Остановить: `Ctrl+C`. Код подхватывается из ваших папок `backend/` и `frontend/`, так что правки видны сразу, а файл базы `intravel.db` лежит в `backend/` и не пропадает при перезапуске. Чтобы добавить тестовые поездки: `docker compose -f docker/docker-compose.yml exec backend python seed_example.py`.

## Кто за что отвечает

| Роль | Где работает |
|---|---|
| Backend 1 | `models/trip.py`, `models/participant.py`, `routes/trips.py`, `routes/participants.py` |
| Backend 2 | `models/expense.py`, `routes/expenses.py`, `services/settlement.py` |
| Backend 3 | `models/route_stop.py`, `models/checklist.py`, `routes/stops.py`, `routes/tickets.py`, `routes/checklist.py`, `services/aviasales.py` |
| Frontend 1 | `pages/`, `components/participants/` |
| Frontend 2 | `components/route/` |
| Frontend 3 | `components/budget/`, `components/tickets/`, `components/checklist/` |
| Дизайнер | `docs/design/`, `frontend/src/styles/` |
| Тех. писатель и QA | `docs/`, `backend/tests/` |

## Как работаем с git

- Ветка `main` всегда рабочая, напрямую в неё не пушим.
- Под каждую задачу своя ветка: `feature/<роль>-<что-делаем>`, например `feature/backend2-expenses-list`.
- Готовое оформляем через Pull Request, его принимает кто-то другой из команды.
- Коммиты короткие и понятные: что сделано.
