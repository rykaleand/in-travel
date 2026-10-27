# Сервис: бизнес-логика билета, правила и проверки.
# Неверные данные -> ValueError (контроллер ответит 400),
# поездки нет -> LookupError (контроллер ответит 404).
# Владелец: Backend 3.
from datetime import datetime
from urllib.parse import urlparse

from ..repositories import trip as trip_repository
from . import aviasales

# Форматы точного времени: так его отправляет поле <input type="datetime-local">
FLIGHT_TIME_FORMATS = ["%Y-%m-%dT%H:%M", "%Y-%m-%dT%H:%M:%S"]


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


def save_ticket(trip_id, request):
    """Проверяет данные из TicketRequest и сохраняет билет поездки.

    Возвращает пару: поездку и разбор ссылки Aviasales (или None).
    PUT заменяет билет целиком: поле, которое не прислали, станет пустым.
    """
    if trip_repository.get_by_id(trip_id) is None:
        raise LookupError("Поездка не найдена")

    ticket_link = _clean_text(request.ticket_link, "Ссылка на билет должна быть строкой")
    aviasales_info = None
    if ticket_link is not None:
        _check_link(ticket_link)
        # Для ссылки Aviasales достаём направление и дату, другие сайты не разбираем
        aviasales_info = aviasales.parse_aviasales_link(ticket_link)

    flight_number = _clean_text(request.flight_number, "Номер рейса должен быть строкой")

    flight_time_text = _clean_text(request.flight_time, "Время рейса должно быть строкой")
    flight_time = _parse_flight_time(flight_time_text) if flight_time_text else None

    trip = trip_repository.update_ticket(trip_id, ticket_link, flight_number, flight_time)
    return trip, aviasales_info
