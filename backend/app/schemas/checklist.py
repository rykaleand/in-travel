# DTO чек-листа: что присылает клиент и как пункт выглядит в JSON.
from dataclasses import asdict, dataclass
from typing import Optional


@dataclass
class ChecklistItemRequest:
    """POST /trips/<id>/checklist: новый пункт."""
    title: Optional[str]

    @classmethod
    def from_dict(cls, data):
        """Перекладываем JSON из запроса в DTO. Проверки делает сервис."""
        return cls(title=data.get("title"))


@dataclass
class ChecklistCheckRequest:
    """PUT /checklist/<id>: поставить или снять отметку."""
    is_checked: Optional[bool]

    @classmethod
    def from_dict(cls, data):
        return cls(is_checked=data.get("is_checked"))


@dataclass
class ChecklistItemResponse:
    id: int
    trip_id: int
    title: str
    is_checked: bool

    @classmethod
    def from_domain(cls, item):
        """Превращаем доменную модель ChecklistItem в DTO."""
        return cls(
            id=item.id,
            trip_id=item.trip_id,
            title=item.title,
            is_checked=item.is_checked,
        )

    def to_dict(self):
        return asdict(self)
