# Доменная модель пункта чек-листа: обычный Python-класс, без SQLAlchemy и Flask.
from dataclasses import dataclass


@dataclass
class ChecklistItem:
    id: int
    trip_id: int
    title: str
    is_checked: bool
