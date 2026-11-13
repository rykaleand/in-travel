# Доменная модель поездки: обычный Python-класс, без SQLAlchemy и Flask.
from dataclasses import dataclass


@dataclass
class Trip:
    id: int | None
    name: str
    invite_code: str
