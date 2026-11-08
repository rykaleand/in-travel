# Сервис: бизнес-логика точек маршрута, правила и проверки.
# Неверные данные -> ValueError (контроллер ответит 400),
# поездки или точки нет -> LookupError (контроллер ответит 404).
# Владелец: Backend 3.
import math

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


def _check_title(title):
    """Название: строка, в которой есть что-то кроме пробелов. Возвращает его без пробелов по краям."""
    if not isinstance(title, str) or not title.strip():
        raise ValueError("Укажите название точки")
    return title.strip()


def _check_day_number(day_number):
    # Номер дня: целое число от 1. True/False в Python тоже считаются числами, их отсекаем
    if isinstance(day_number, bool) or not isinstance(day_number, int) or day_number < 1:
        raise ValueError("Номер дня должен быть целым числом от 1")
    return day_number


def _check_status(status):
    if status not in STOP_STATUSES:
        raise ValueError("Статус точки может быть только proposed или confirmed")
    return status


def _check_coordinates(request):
    # Координаты задаются и очищаются только парой; ноль — допустимое значение.
    if request.latitude_provided != request.longitude_provided:
        raise ValueError("Передайте latitude и longitude вместе")
    latitude, longitude = request.latitude, request.longitude
    if latitude is None and longitude is None:
        return None, None
    for name, value, limit in (("latitude", latitude, 90), ("longitude", longitude, 180)):
        if (
            isinstance(value, bool)
            or not isinstance(value, (int, float))
            or not -limit <= value <= limit
            or not math.isfinite(value)
        ):
            raise ValueError(f"{name} должна быть числом от {-limit} до {limit}")
    return float(latitude), float(longitude)


def create_stop(trip_id, request):
    """Проверяет данные из RouteStopRequest и сохраняет новую точку."""
    _check_trip_exists(trip_id)

    title = _check_title(request.title)
    day_number = _check_day_number(request.day_number)
    # Статус необязательный: если не прислали, точка просто предложена
    status = _check_status(request.status if request.status is not None else STOP_STATUS_PROPOSED)

    latitude, longitude = _check_coordinates(request)
    return route_stop_repository.create(trip_id, day_number, title, status, latitude, longitude)


def update_stop(stop_id, request):
    """Меняет переданные поля точки, остальные оставляет как были.

    Для названия, дня и статуса None считается не переданным.
    Координаты пропущены — сохраняем; обе None — очищаем.
    Точки нет -> LookupError, неверные данные -> ValueError.
    """
    stop = route_stop_repository.get_by_id(stop_id)
    if stop is None:
        raise LookupError("Точка маршрута не найдена")

    if (request.title is None and request.day_number is None and request.status is None
            and not request.latitude_provided and not request.longitude_provided):
        raise ValueError("Передайте хотя бы одно поле: title, day_number, status или пару latitude и longitude")

    # Не прислали поле -> берём текущее значение точки
    title = _check_title(request.title) if request.title is not None else stop.title
    day_number = (
        _check_day_number(request.day_number)
        if request.day_number is not None
        else stop.day_number
    )
    status = _check_status(request.status) if request.status is not None else stop.status

    latitude, longitude = (
        _check_coordinates(request)
        if request.latitude_provided or request.longitude_provided
        else (stop.latitude, stop.longitude)
    )
    return route_stop_repository.update(stop_id, day_number, title, status, latitude, longitude)


def delete_stop(stop_id):
    """Удаляет точку. Точки нет (или её уже удалили) -> LookupError."""
    if not route_stop_repository.delete(stop_id):
        raise LookupError("Точка маршрута не найдена")
