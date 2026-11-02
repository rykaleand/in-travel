from dataclasses import asdict, dataclass
from typing import Optional


@dataclass
class CreateParticipantRequest:
    first_name: Optional[str]
    last_name: Optional[str]

    @classmethod
    def from_json(cls, data):
        if not isinstance(data, dict):
            raise ValueError("Тело запроса должно быть JSON-объектом")
        return cls(
            first_name=data.get("first_name"),
            last_name=data.get("last_name"),
        )


@dataclass
class ParticipantResponse:
    id: int
    trip_id: int
    first_name: str
    last_name: str

    @classmethod
    def from_domain(cls, participant):
        return cls(
            id=participant.id,
            trip_id=participant.trip_id,
            first_name=participant.first_name,
            last_name=participant.last_name,
        )

    def to_dict(self):
        return asdict(self)