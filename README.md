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
│   │   ├── models/           # таблицы базы данных
│   │   ├── routes/           # эндпоинты API
│   │   └── services/         # бизнес-логика (расчёты, разбор ссылок)
│   ├── tests/
│   ├── requirements.txt
│   └── run.py                # запуск сервера
├── frontend/                 # клиентская часть (React)
│   └── src/
│       ├── api/              # запросы к бэкенду
│       ├── pages/            # страницы
│       ├── components/       # route, budget, tickets, checklist, participants
│       └── styles/
└── docs/                     # ТЗ, список эндпоинтов, макеты
```

В файлах-заглушках в комментарии написано, что там будет и кто за это отвечает.

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

Если порт 5000 занят (бывает на macOS): `PORT=5001 python run.py`.

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
