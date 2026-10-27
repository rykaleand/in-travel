# Сервис: бизнес-логика точек маршрута, правила и проверки.
# Неверные данные -> ValueError (контроллер ответит 400),
# поездки нет -> LookupError (контроллер ответит 404).
# Владелец: Backend 3.
from ..constants import STOP_STATUS_PROPOSED, STOP_STATUSES
from ..repositories import route_stop as route_stop_repository
from ..repositories import trip as trip_repository


def _check_trip_exists(trip_id):
    if trip_repository.get_by_id(trip_id) is None:
        raise LookupError("Поездка не найдена")


def get_stops(trip_id):
    """Точки поездки по дням: сначала по day_number, внутри дня по id."""
    _check_trip_exists(trip_id)
    return route_stop_repository.get_by_trip(trip_id)


def create_stop(trip_id, request):
    """Проверяет данные из RouteStopRequest и сохраняет новую точку."""
    _check_trip_exists(trip_id)

    # Название: строка, в которой есть что-то кроме пробелов
    if not isinstance(request.title, str) or not request.title.strip():
        raise ValueError("Укажите название точки")
    title = request.title.strip()

    # Номер дня: целое число от 1. True/False в Python тоже считаются числами, их отсекаем
    day_number = request.day_number
    if isinstance(day_number, bool) or not isinstance(day_number, int) or day_number < 1:
        raise ValueError("Номер дня должен быть целым числом от 1")

    # Статус необязательный: если не прислали, точка просто предложена
    status = request.status if request.status is not None else STOP_STATUS_PROPOSED
    if status not in STOP_STATUSES:
        raise ValueError("Статус точки может быть только proposed или confirmed")

    return route_stop_repository.create(trip_id, day_number, title, status)
