# DTO расхода: что присылает клиент (ExpenseRequest) и как расход выглядит в ответе (ExpenseResponse).
from dataclasses import asdict, dataclass, field
from typing import Optional


@dataclass
class ExpenseRequest:
    title: Optional[str]
    amount: Optional[float]
    category: Optional[str]
    paid_by: Optional[int]  # id участника, который заплатил
    participant_ids: list[int] = field(default_factory=list)  # между кем делим расход

    @classmethod
    def from_dict(cls, data):
        """Достаём поля из JSON запроса. Проверки значений делает сервис."""
        return cls(
            title=data.get("title"),
            amount=data.get("amount"),
            category=data.get("category"),
            paid_by=data.get("paid_by"),
            participant_ids=data.get("participant_ids") or [],
        )


@dataclass
class ExpenseResponse:
    id: int
    trip_id: int
    title: str
    amount: float
    category: str
    paid_by: int
    created_at: Optional[str]  # дата строкой, потому что в JSON нет типа datetime
    shares: list[dict]  # [{"participant_id": 1, "amount": 1000.0}, ...]

    @classmethod
    def from_domain(cls, expense):
        """Превращаем доменную модель Expense в DTO."""
        return cls(
            id=expense.id,
            trip_id=expense.trip_id,
            title=expense.title,
            amount=expense.amount,
            category=expense.category,
            paid_by=expense.paid_by,
            created_at=expense.created_at.isoformat() if expense.created_at else None,
            shares=[
                {"participant_id": share.participant_id, "amount": share.amount}
                for share in expense.shares
            ],
        )

    def to_dict(self):
        return asdict(self)
