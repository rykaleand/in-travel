# Репозиторий: читает и сохраняет расходы вместе с долями, отдаёт доменные модели Expense.
# Суммы сюда приходят уже проверенными и округлёнными: это делает сервис.
from ..domain.expense import Expense, ExpenseShare
from ..extensions import db
from ..models.expense import ExpenseModel, ExpenseShareModel
from ..models.participant import ParticipantModel
from ..models.trip import TripModel


def _to_domain(row):
    """Строка таблицы (вместе с её долями) -> доменная модель."""
    return Expense(
        id=row.id,
        trip_id=row.trip_id,
        category=row.category,
        payer_id=row.payer_id,
        amount=row.amount,
        shares=[
            ExpenseShare(participant_id=share.participant_id, share_amount=share.share_amount)
            for share in row.shares
        ],
    )


def get_by_trip(trip_id):
    """Все расходы одной поездки с их долями, по порядку добавления."""
    rows = ExpenseModel.query.filter_by(trip_id=trip_id).order_by(ExpenseModel.id).all()
    return [_to_domain(row) for row in rows]


def create(expense):
    """Сохраняет расход и его доли вместе, одним commit."""
    row = ExpenseModel(
        trip_id=expense.trip_id,
        category=expense.category,
        payer_id=expense.payer_id,
        amount=expense.amount,
    )
    for share in expense.shares:
        row.shares.append(
            ExpenseShareModel(participant_id=share.participant_id, share_amount=share.share_amount)
        )
    db.session.add(row)
    db.session.commit()
    return _to_domain(row)


# Два вспомогательных запроса для проверок в сервисе расходов.
# Когда Backend 1 сделает репозитории поездок и участников, их можно перенести туда.
def trip_exists(trip_id):
    return db.session.get(TripModel, trip_id) is not None


def get_participant_ids(trip_id):
    """Номера (id) всех участников поездки."""
    rows = ParticipantModel.query.filter_by(trip_id=trip_id).all()
    return {row.id for row in rows}
