# Доменные модели расхода и доли участника: обычные Python-классы, без SQLAlchemy и Flask.
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class ExpenseShare:
    participant_id: int
    amount: float
    id: Optional[int] = None  # None, пока доля не сохранена в базе


@dataclass
class Expense:
    trip_id: int
    title: str
    amount: float
    category: str
    paid_by: int  # id участника, который заплатил
    shares: list[ExpenseShare] = field(default_factory=list)  # кто сколько должен в этом расходе
    id: Optional[int] = None  # None, пока расход не сохранён в базе
    created_at: Optional[datetime] = None  # дату ставит база при сохранении
