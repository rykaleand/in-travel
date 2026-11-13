# Доменная модель билета: обычный Python-класс, без SQLAlchemy и Flask.
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Ticket:
    id: int
    trip_id: int
    ticket_link: Optional[str]
    flight_number: Optional[str]
    flight_time: Optional[datetime]
