# DTO точки маршрута: что присылает клиент и как точка выглядит в JSON.
from dataclasses import asdict, dataclass
from typing import Optional


@dataclass
class RouteStopRequest:
    day_number: Optional[int]
    title: Optional[str]
    status: Optional[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    latitude_provided: bool = False
    longitude_provided: bool = False

    @classmethod
    def from_dict(cls, data):
        """Перекладываем JSON из запроса в DTO. Проверки делает сервис."""
        return cls(
            day_number=data.get("day_number"),
            title=data.get("title"),
            status=data.get("status"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            latitude_provided="latitude" in data,
            longitude_provided="longitude" in data,
        )


@dataclass
class RouteStopResponse:
    id: int
    trip_id: int
    day_number: int
    title: str
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    @classmethod
    def from_domain(cls, stop):
        """Превращаем доменную модель RouteStop в DTO."""
        return cls(
            id=stop.id,
            trip_id=stop.trip_id,
            day_number=stop.day_number,
            title=stop.title,
            status=stop.status,
            latitude=stop.latitude,
            longitude=stop.longitude,
        )

    def to_dict(self):
        return asdict(self)
