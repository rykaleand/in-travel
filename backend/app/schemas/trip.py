# DTO ответа: как поездка выглядит в JSON.
from dataclasses import asdict, dataclass
from typing import Optional

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

    @classmethod
    def from_domain(cls, trip):
        """Превращаем доменную модель Trip в DTO."""
        return cls(
            id=trip.id,
            name=trip.name,
            invite_code=trip.invite_code,
        )

    def to_dict(self):
        return asdict(self)
