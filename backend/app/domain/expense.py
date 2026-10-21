# Доменные модели расхода и доли участника: обычные Python-классы, без SQLAlchemy и Flask.
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ExpenseShare:
    participant_id: int
    share_amount: float


@dataclass
class Expense:
    trip_id: int
    category: str
    payer_id: int  # id участника, который заплатил
    amount: float
    shares: list[ExpenseShare] = field(default_factory=list)  # кто сколько должен в этом расходе
    id: Optional[int] = None  # None, пока расход не сохранён в базе
