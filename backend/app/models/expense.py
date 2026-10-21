# Таблица EXPENSES: id, trip_id, title, amount, category, payer_id, created_at.
# Таблица EXPENSE_SHARES: id, expense_id, participant_id, share_amount (доля участника в расходе).
# Связи: expenses.trip_id -> trips.id, expenses.payer_id -> participants.id,
# expense_shares.expense_id -> expenses.id, expense_shares.participant_id -> participants.id.
# Владелец: Backend 2.
from datetime import datetime

from ..extensions import db


class ExpenseModel(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    title = db.Column(db.String(100))  # по ТЗ название не обязательно
    amount = db.Column(db.Float, nullable=False)  # округляем до двух знаков перед сохранением
    category = db.Column(db.String(30), nullable=False)
    payer_id = db.Column(db.Integer, db.ForeignKey("participants.id"), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now)

    shares = db.relationship("ExpenseShareModel", back_populates="expense", cascade="all, delete-orphan")


class ExpenseShareModel(db.Model):
    __tablename__ = "expense_shares"

    id = db.Column(db.Integer, primary_key=True)
    expense_id = db.Column(db.Integer, db.ForeignKey("expenses.id"), nullable=False)
    participant_id = db.Column(db.Integer, db.ForeignKey("participants.id"), nullable=False)
    share_amount = db.Column(db.Float, nullable=False)

    expense = db.relationship("ExpenseModel", back_populates="shares")
