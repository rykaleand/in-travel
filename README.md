# in-travel (ВПуть)

Web service for group trip planning: shared route, expense splitting, tickets.

**ВПуть** (в репозитории `in-travel`) - веб-сервис для совместного планирования
путешествий в компании. Участники заходят по ссылке-приглашению без регистрации,
вместе собирают маршрут, ведут общий бюджет (сервис сам считает, кто кому должен)
и хранят информацию о билетах.

Срок проекта: с 12 октября по 30 ноября 2026 г. Полное техническое задание лежит
в [docs/technical-specification.docx](docs/technical-specification.docx).

## Стек

- Backend: Python, Flask, Flask-SQLAlchemy, SQLite
- Frontend: React (Vite), React Router
- Связь: фронтенд обращается к бэкенду через `fetch`, CORS включён через `flask-cors`

## Структура репозитория

```
in-travel/
├── backend/                  # серверная часть (Python, Flask)
│   ├── app/
│   │   ├── __init__.py       # создание приложения (create_app)
│   │   ├── config.py         # настройки (путь к базе и т.п.)
│   │   ├── extensions.py     # объект db (SQLAlchemy)
│   │   ├── constants.py      # списки допустимых значений (категории, статусы)
│   │   ├── models/           # таблицы базы данных, по одному файлу на сущность
│   │   ├── routes/           # эндпоинты API, по одному файлу на раздел
│   │   └── services/         # бизнес-логика без Flask (расчёты, разбор ссылок)
│   ├── tests/                # автотесты (pytest)
│   ├── requirements.txt
│   └── run.py                # точка входа: запуск сервера
├── frontend/                 # клиентская часть (React)
│   └── src/
│       ├── api/              # функции для запросов к бэкенду
│       ├── pages/            # страницы (создание поездки, экран поездки)
│       ├── components/       # части экранов: route, budget, tickets, checklist, participants
│       └── styles/           # общие стили
└── docs/                     # ТЗ, описание API, макеты
    └── design/
```

## Быстрый старт

Нужны Python 3.10+ и Node.js 18+.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run.py                    # сервер на http://localhost:5000
```

Файл базы `intravel.db` создастся сам при первом запуске.
Если порт 5000 занят (так бывает на macOS), запустите на другом:
`PORT=5001 python run.py`, а для фронтенда задайте `VITE_API_URL=http://localhost:5001`.

Тесты: `pytest` из папки `backend`.

### Frontend

```bash
cd frontend
npm install
npm run dev                      # сайт на http://localhost:5173
```

## Кто за что отвечает

| Роль | Где работает |
|---|---|
| Backend 1 | `backend/app/models/`, `routes/trips.py`, `routes/participants.py` |
| Backend 2 | `routes/expenses.py`, `services/settlement.py` |
| Backend 3 | `routes/stops.py`, `routes/tickets.py`, `routes/checklist.py`, `services/aviasales.py` |
| Frontend 1 | `pages/`, `components/participants/` |
| Frontend 2 | `components/route/` |
| Frontend 3 | `components/budget/`, `components/tickets/`, `components/checklist/` |
| Дизайнер | `docs/design/`, `frontend/src/styles/` (вместе с Frontend 1) |
| Тех. писатель и QA | `docs/`, `backend/tests/`, тест-кейсы |

Заглушки в коде помечены комментарием `TODO` и именем роли.

## Как добавить эндпоинт (на примере)

1. Посмотрите готовый образец: `backend/app/routes/participants.py`.
2. Опишите функцию с декоратором `@bp.get(...)` или `@bp.post(...)` в своём файле из `routes/`.
3. Работайте с базой через модели из `app/models/`.
4. Проверьте руками (браузер, curl или Postman) и допишите тест в `backend/tests/`.
5. Обновите статус эндпоинта в [docs/api.md](docs/api.md).

## Как работаем с git

- Ветка `main` всегда рабочая, напрямую в неё не пушим.
- Под каждую задачу своя ветка: `feature/<роль>-<коротко-что-делаем>`,
  например `feature/backend2-expenses-list`.
- Готовое оформляем через Pull Request; смотрит и принимает кто-то другой из команды.
- Коммиты короткие и понятные: что сделано, а не «правки».
