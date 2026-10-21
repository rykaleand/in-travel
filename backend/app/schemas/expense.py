# DTO расхода: что присылает клиент (ExpenseRequest) и как расход выглядит в ответе (ExpenseResponse).
# Поля согласованы с #9.
from dataclasses import asdict, dataclass, field
from typing import Optional


@dataclass
class ExpenseRequest:
    amount: Optional[float]
    category: Optional[str]
    payer_id: Optional[int]  # id участника, который заплатил
    participant_ids: list[int] = field(default_factory=list)  # между кем делим расход

    @classmethod
    def from_dict(cls, data):
        """Достаём поля из JSON запроса. Проверки значений делает сервис."""
        return cls(
            amount=data.get("amount"),
            category=data.get("category"),
            payer_id=data.get("payer_id"),
            participant_ids=data.get("participant_ids") or [],
        )


@dataclass
class ExpenseResponse:
    id: int
    trip_id: int
    category: str
    payer_id: int
    amount: float
    shares: list[dict]  # [{"participant_id": 1, "share_amount": 33.34}, ...]

    @classmethod
    def from_domain(cls, expense):
        """Превращаем доменную модель Expense в DTO."""
        return cls(
            id=expense.id,
            trip_id=expense.trip_id,
            category=expense.category,
            payer_id=expense.payer_id,
            amount=expense.amount,
            shares=[
                {"participant_id": share.participant_id, "share_amount": share.share_amount}
                for share in expense.shares
            ],
        )

    def to_dict(self):
        return asdict(self)
