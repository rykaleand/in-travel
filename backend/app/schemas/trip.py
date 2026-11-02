# DTO ответа: как поездка выглядит в JSON.
from dataclasses import asdict, dataclass
from typing import Optional

from ..services.aviasales import get_aviasales_info

@dataclass
class CreateTripRequest:
    name: Optional[str]

    @classmethod
    def from_json(cls, data):
        if not isinstance(data, dict):
            raise ValueError("Тело запроса должно быть JSON-объектом")
        return cls(name=data.get("name"))

@dataclass
class TripResponse:
    id: int
    name: str
    invite_code: str
    ticket_link: Optional[str]
    flight_number: Optional[str]
    flight_time: Optional[str]  # дата строкой, потому что в JSON нет типа datetime
    aviasales: Optional[dict]  # направление и дата из ссылки Aviasales или None, в базе не хранится

    @classmethod
    def from_domain(cls, trip):
        """Превращаем доменную модель Trip в DTO."""
        return cls(
            id=trip.id,
            name=trip.name,
            invite_code=trip.invite_code,
            ticket_link=trip.ticket_link,
            flight_number=trip.flight_number,
            flight_time=trip.flight_time.isoformat() if trip.flight_time else None,
            aviasales=get_aviasales_info(trip.ticket_link),
        )

    def to_dict(self):
        return asdict(self)
