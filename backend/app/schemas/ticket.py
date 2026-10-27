# DTO билета: что присылает клиент (TicketRequest) и что мы отвечаем (TicketResponse).
# Сам билет хранится полями поездки: ticket_link, flight_number, flight_time.
from dataclasses import asdict, dataclass
from typing import Optional


@dataclass
class TicketRequest:
    ticket_link: Optional[str]
    flight_number: Optional[str]
    flight_time: Optional[str]  # строка вида "2026-11-05T14:30", в дату превращает сервис

    @classmethod
    def from_dict(cls, data):
        """Достаём поля из JSON запроса. Проверки значений делает сервис."""
        if not isinstance(data, dict):
            raise ValueError("Тело запроса должно быть JSON-объектом")
        return cls(
            ticket_link=data.get("ticket_link"),
            flight_number=data.get("flight_number"),
            flight_time=data.get("flight_time"),
        )


@dataclass
class TicketResponse:
    trip_id: int
    ticket_link: Optional[str]
    flight_number: Optional[str]
    flight_time: Optional[str]  # дата строкой, потому что в JSON нет типа datetime
    aviasales: Optional[dict]  # разбор ссылки Aviasales или None

    @classmethod
    def from_domain(cls, trip, aviasales):
        """Собираем ответ из доменной модели Trip и разбора ссылки."""
        return cls(
            trip_id=trip.id,
            ticket_link=trip.ticket_link,
            flight_number=trip.flight_number,
            flight_time=trip.flight_time.isoformat() if trip.flight_time else None,
            aviasales=aviasales,
        )

    def to_dict(self):
        return asdict(self)
