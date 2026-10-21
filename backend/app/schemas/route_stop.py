# DTO точки маршрута: что присылает клиент и как точка выглядит в JSON.
from dataclasses import asdict, dataclass
from typing import Optional


@dataclass
class RouteStopRequest:
    day_number: Optional[int]
    title: Optional[str]
    status: Optional[str]

    @classmethod
    def from_dict(cls, data):
        """Перекладываем JSON из запроса в DTO. Проверки делает сервис."""
        return cls(
            day_number=data.get("day_number"),
            title=data.get("title"),
            status=data.get("status"),
        )


@dataclass
class RouteStopResponse:
    id: int
    trip_id: int
    day_number: int
    title: str
    status: str

    @classmethod
    def from_domain(cls, stop):
        """Превращаем доменную модель RouteStop в DTO."""
        return cls(
            id=stop.id,
            trip_id=stop.trip_id,
            day_number=stop.day_number,
            title=stop.title,
            status=stop.status,
        )

    def to_dict(self):
        return asdict(self)
