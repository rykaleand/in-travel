# Сервис: бизнес-логика билетов, правила и проверки.
# Неверные данные -> ValueError (контроллер ответит 400),
# поездки или билета нет -> LookupError (контроллер ответит 404).
# Владелец: Backend 3.
from datetime import datetime
from urllib.parse import urlparse

from ..repositories import ticket as ticket_repository
from ..repositories import trip as trip_repository
from . import aviasales

# Форматы точного времени: так его отправляет поле <input type="datetime-local">
FLIGHT_TIME_FORMATS = ["%Y-%m-%dT%H:%M", "%Y-%m-%dT%H:%M:%S"]


def _check_trip_exists(trip_id):
    if trip_repository.get_by_id(trip_id) is None:
        raise LookupError("Поездка не найдена")


def _clean_text(value, error_text):
    """Необязательная строка: пробелы по краям убираем, пустую превращаем в None."""
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError(error_text)
    return value.strip() or None


def _check_link(link):
    parsed = urlparse(link)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("Ссылка на билет должна начинаться с http:// или https://")


def _parse_flight_time(text):
    for time_format in FLIGHT_TIME_FORMATS:
        try:
            return datetime.strptime(text, time_format)
        except ValueError:
            pass  # не подошёл этот формат, пробуем следующий
    raise ValueError(
        "Время рейса нужно указать в формате ГГГГ-ММ-ДДTЧЧ:ММ, например 2026-11-05T14:30"
    )


def _check_fields(request):
    """Проверяет поля из TicketRequest. Возвращает (ссылка, номер рейса, время)."""
    ticket_link = _clean_text(request.ticket_link, "Ссылка на билет должна быть строкой")
    if ticket_link is not None:
        _check_link(ticket_link)
        # Неверная ссылка Aviasales даст ValueError, и билет не сохранится.
        # Сам разбор для ответа делает TicketResponse
        aviasales.parse_aviasales_link(ticket_link)

    flight_number = _clean_text(request.flight_number, "Номер рейса должен быть строкой")

    flight_time_text = _clean_text(request.flight_time, "Время рейса должно быть строкой")
    flight_time = _parse_flight_time(flight_time_text) if flight_time_text else None

    # Совсем пустой билет не нужен: чтобы убрать билет, есть DELETE
    if ticket_link is None and flight_number is None and flight_time is None:
        raise ValueError("Заполните хотя бы одно поле: ссылку, номер рейса или время рейса")

    return ticket_link, flight_number, flight_time


def get_tickets(trip_id):
    """Билеты поездки в порядке добавления."""
    _check_trip_exists(trip_id)
    return ticket_repository.get_by_trip(trip_id)


def create_ticket(trip_id, request):
    """Проверяет данные из TicketRequest и добавляет новый билет в поездку."""
    _check_trip_exists(trip_id)
    ticket_link, flight_number, flight_time = _check_fields(request)
    return ticket_repository.create(trip_id, ticket_link, flight_number, flight_time)


def update_ticket(ticket_id, request):
    """Меняет билет целиком: поле, которое не прислали, станет пустым."""
    if ticket_repository.get_by_id(ticket_id) is None:
        raise LookupError("Билет не найден")
    ticket_link, flight_number, flight_time = _check_fields(request)
    return ticket_repository.update(ticket_id, ticket_link, flight_number, flight_time)


def delete_ticket(ticket_id):
    """Удаляет билет. Билета нет (или его уже удалили) -> LookupError."""
    if not ticket_repository.delete(ticket_id):
        raise LookupError("Билет не найден")
