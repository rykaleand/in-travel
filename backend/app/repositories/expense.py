# Репозиторий: читает и сохраняет расходы вместе с долями, отдаёт доменные модели Expense.
from ..domain.expense import Expense, ExpenseShare
from ..extensions import db
from ..models.expense import ExpenseModel, ExpenseShareModel


def _to_domain(row):
    """Строка таблицы (вместе с её долями) -> доменная модель."""
    return Expense(
        id=row.id,
        trip_id=row.trip_id,
        title=row.title,
        amount=row.amount,
        category=row.category,
        paid_by=row.paid_by,
        created_at=row.created_at,
        shares=[
            ExpenseShare(id=share.id, participant_id=share.participant_id, amount=share.amount)
            for share in row.shares
        ],
    )


def get_by_trip(trip_id):
    """Все расходы одной поездки, по порядку добавления."""
    rows = ExpenseModel.query.filter_by(trip_id=trip_id).order_by(ExpenseModel.id).all()
    return [_to_domain(row) for row in rows]


def create(expense):
    """Сохраняет расход и его доли. Деньги округляем до двух знаков."""
    row = ExpenseModel(
        trip_id=expense.trip_id,
        title=expense.title,
        amount=round(expense.amount, 2),
        category=expense.category,
        paid_by=expense.paid_by,
    )
    for share in expense.shares:
        row.shares.append(
            ExpenseShareModel(participant_id=share.participant_id, amount=round(share.amount, 2))
        )
    db.session.add(row)
    db.session.commit()
    return _to_domain(row)
