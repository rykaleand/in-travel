# Доменные модели расхода и доли участника: обычные Python-классы, без SQLAlchemy и Flask.
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class ExpenseShare:
    participant_id: int
    share_amount: float
    id: Optional[int] = None  # None, пока доля не сохранена в базе


@dataclass
class Expense:
    trip_id: int
    amount: float
    category: str
    payer_id: int  # id участника, который заплатил
    title: Optional[str] = None  # по ТЗ название не обязательно
    shares: list[ExpenseShare] = field(default_factory=list)  # кто сколько должен в этом расходе
    id: Optional[int] = None  # None, пока расход не сохранён в базе
    created_at: Optional[datetime] = None  # дату ставит база при сохранении
