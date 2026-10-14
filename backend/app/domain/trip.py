# Доменная модель поездки: обычный Python-класс, без SQLAlchemy и Flask.
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Trip:
    id: int
    name: str
    invite_code: str
    ticket_link: Optional[str]
    flight_number: Optional[str]
    flight_time: Optional[datetime]
