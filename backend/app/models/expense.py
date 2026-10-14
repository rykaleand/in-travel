from app.extensions import db


class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    payer_id = db.Column(db.Integer, db.ForeignKey("participants.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)

    shares = db.relationship(
        "ExpenseShare", backref="expense", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "trip_id": self.trip_id,
            "category": self.category,
            "payer_id": self.payer_id,
            "amount": self.amount,
            "shares": [s.to_dict() for s in self.shares],
        }


class ExpenseShare(db.Model):
    """Доля участника в расходе: сколько он должен за эту трату."""

    __tablename__ = "expense_shares"

    expense_id = db.Column(db.Integer, db.ForeignKey("expenses.id"), primary_key=True)
    participant_id = db.Column(
        db.Integer, db.ForeignKey("participants.id"), primary_key=True
    )
    share_amount = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "participant_id": self.participant_id,
            "share_amount": self.share_amount,
        }
