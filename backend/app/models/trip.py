# Таблица TRIPS: id, name, invite_code, ticket_link, flight_number, flight_time.
# Это то, как данные лежат в базе: ни логики, ни проверок здесь нет.
# Владелец: Backend 1.
from ..extensions import db


class TripModel(db.Model):
    __tablename__ = "trips"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    invite_code = db.Column(db.String(16), unique=True, nullable=False)
    ticket_link = db.Column(db.String(500))
    flight_number = db.Column(db.String(20))
    flight_time = db.Column(db.DateTime)
    
    participants = db.relationship("ParticipantModel", back_populates="trip", cascade="all, delete-orphan")
