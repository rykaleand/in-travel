# Таблица PARTICIPANTS: id, trip_id, first_name, last_name.
# Пример связи: participants.trip_id ссылается на trips.id.
# Владелец: Backend 1.
from ..extensions import db


class ParticipantModel(db.Model):
    __tablename__ = "participants"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    
    trip = db.relationship("TripModel", back_populates="participants")
