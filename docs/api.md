# API

Список эндпоинтов из технического задания. Столбец «Статус» заполняет тот, кто делает эндпоинт.

| Метод | Путь | Что делает | Кто | Статус |
|---|---|---|---|---|
| POST | /trips | создать поездку | Backend 1 | |
| GET | /trips/<invite_code> | получить поездку по коду | Backend 1 | |
| POST | /trips/<id>/participants | добавить участника | Backend 1 | |
| GET | /trips/<id>/participants | список участников | Backend 1 | |
| GET | /trips/<id>/stops | список точек маршрута | Backend 3 | |
| POST | /trips/<id>/stops | добавить точку | Backend 3 | |
| PUT | /stops/<id> | изменить точку / статус | Backend 3 | |
| DELETE | /stops/<id> | удалить точку | Backend 3 | |
| GET | /trips/<id>/expenses | список расходов | Backend 2 | |
| POST | /trips/<id>/expenses | добавить расход | Backend 2 | |
| GET | /trips/<id>/balances | баланс и переводы | Backend 2 | |
| PUT | /trips/<id>/ticket | ссылка на билет, рейс, время | Backend 3 | |
| GET | /trips/<id>/checklist | чек-лист | Backend 3 | |
| POST | /trips/<id>/checklist | добавить пункт | Backend 3 | |
| PUT | /checklist/<id> | отметить выполненным | Backend 3 | |
| GET | /trips | список всех поездок (учебный пример, по ТЗ не нужен) | пример | |
