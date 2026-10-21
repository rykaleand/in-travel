# Таблица EXPENSES: id, trip_id, category, payer_id, amount.
# Таблица EXPENSE_SHARES: expense_id, participant_id, share_amount (доля участника в расходе).
# Связи: expenses.trip_id -> trips.id, expenses.payer_id -> participants.id,
# expense_shares.expense_id -> expenses.id, expense_shares.participant_id -> participants.id.
# Владелец: Backend 2.
from ..extensions import db


class ExpenseModel(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    category = db.Column(db.String(30), nullable=False)
    payer_id = db.Column(db.Integer, db.ForeignKey("participants.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)

    shares = db.relationship("ExpenseShareModel", back_populates="expense", cascade="all, delete-orphan")


class ExpenseShareModel(db.Model):
    __tablename__ = "expense_shares"

    # Отдельного id нет: строку определяет пара (расход, участник),
    # у одного расхода не бывает двух долей одного участника.
    expense_id = db.Column(db.Integer, db.ForeignKey("expenses.id"), primary_key=True)
    participant_id = db.Column(db.Integer, db.ForeignKey("participants.id"), primary_key=True)
    share_amount = db.Column(db.Float, nullable=False)

    expense = db.relationship("ExpenseModel", back_populates="shares")
