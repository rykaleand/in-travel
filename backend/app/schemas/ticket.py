# DTO билета: что присылает клиент (TicketRequest) и что мы отвечаем (TicketResponse).
# Билеты хранятся в отдельной таблице tickets, у поездки их может быть несколько.
from dataclasses import asdict, dataclass
from typing import Optional

from ..services.aviasales import get_aviasales_info


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
    id: int
    trip_id: int
    ticket_link: Optional[str]
    flight_number: Optional[str]
    flight_time: Optional[str]  # дата строкой, потому что в JSON нет типа datetime
    aviasales: Optional[dict]  # разбор ссылки Aviasales или None, в базе не хранится

    @classmethod
    def from_domain(cls, ticket):
        """Собираем ответ из доменной модели Ticket и разбираем ссылку Aviasales."""
        return cls(
            id=ticket.id,
            trip_id=ticket.trip_id,
            ticket_link=ticket.ticket_link,
            flight_number=ticket.flight_number,
            flight_time=ticket.flight_time.isoformat() if ticket.flight_time else None,
            aviasales=get_aviasales_info(ticket.ticket_link),
        )

    def to_dict(self):
        return asdict(self)
