# Таблица TRIPS: id, name, invite_code.
# Билеты лежат в отдельной таблице tickets (models/ticket.py).
# Это то, как данные лежат в базе: ни логики, ни проверок здесь нет.
# Владелец: Backend 1.
from ..extensions import db


class TripModel(db.Model):
    __tablename__ = "trips"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    invite_code = db.Column(db.String(16), unique=True, nullable=False)
    
    participants = db.relationship("ParticipantModel", back_populates="trip", cascade="all, delete-orphan")
