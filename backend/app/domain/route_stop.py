# Доменная модель точки маршрута: обычный Python-класс, без SQLAlchemy и Flask.
from dataclasses import dataclass


@dataclass
class RouteStop:
    id: int
    trip_id: int
    day_number: int
    title: str
    status: str  # "proposed" или "confirmed", см. constants.py
