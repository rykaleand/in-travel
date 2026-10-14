# API

Статус: `готово` / `заглушка` (возвращает 501).

| Метод | Путь | Что делает | Кто | Статус |
|---|---|---|---|---|
| POST | /trips | создать поездку | Backend 1 | готово |
| GET | /trips/<invite_code> | получить поездку по коду | Backend 1 | готово |
| POST | /trips/<id>/participants | добавить участника | Backend 1 | готово |
| GET | /trips/<id>/participants | список участников | Backend 1 | готово |
| GET | /trips/<id>/stops | список точек маршрута | Backend 3 | заглушка |
| POST | /trips/<id>/stops | добавить точку | Backend 3 | заглушка |
| PUT | /stops/<id> | изменить точку / статус | Backend 3 | заглушка |
| DELETE | /stops/<id> | удалить точку | Backend 3 | заглушка |
| GET | /trips/<id>/expenses | список расходов | Backend 2 | заглушка |
| POST | /trips/<id>/expenses | добавить расход | Backend 2 | заглушка |
| GET | /trips/<id>/balances | баланс и переводы | Backend 2 | заглушка |
| PUT | /trips/<id>/ticket | ссылка на билет, рейс, время | Backend 3 | заглушка |
| GET | /trips/<id>/checklist | чек-лист | Backend 3 | заглушка |
| POST | /trips/<id>/checklist | добавить пункт | Backend 3 | заглушка |
| PUT | /checklist/<id> | отметить выполненным | Backend 3 | заглушка |
