# DTO расхода: что присылает клиент (ExpenseRequest) и как расход выглядит в ответе (ExpenseResponse).
from dataclasses import asdict, dataclass, field
from typing import Optional


@dataclass
class ExpenseRequest:
    amount: Optional[float]
    category: Optional[str]
    payer_id: Optional[int]  # id участника, который заплатил
    participant_ids: list[int] = field(default_factory=list)  # между кем делим расход
    title: Optional[str] = None  # по ТЗ название не обязательно

    @classmethod
    def from_dict(cls, data):
        """Достаём поля из JSON запроса. Проверки значений делает сервис."""
        return cls(
            amount=data.get("amount"),
            category=data.get("category"),
            payer_id=data.get("payer_id"),
            participant_ids=data.get("participant_ids") or [],
            title=data.get("title"),
        )


@dataclass
class ExpenseResponse:
    id: int
    trip_id: int
    title: Optional[str]
    amount: float
    category: str
    payer_id: int
    created_at: Optional[str]  # дата строкой, потому что в JSON нет типа datetime
    shares: list[dict]  # [{"participant_id": 1, "share_amount": 33.34}, ...]

    @classmethod
    def from_domain(cls, expense):
        """Превращаем доменную модель Expense в DTO."""
        return cls(
            id=expense.id,
            trip_id=expense.trip_id,
            title=expense.title,
            amount=expense.amount,
            category=expense.category,
            payer_id=expense.payer_id,
            created_at=expense.created_at.isoformat() if expense.created_at else None,
            shares=[
                {"participant_id": share.participant_id, "share_amount": share.share_amount}
                for share in expense.shares
            ],
        )

    def to_dict(self):
        return asdict(self)
