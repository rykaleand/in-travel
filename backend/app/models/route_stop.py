from app.constants import STOP_STATUS_PROPOSED
from app.extensions import db


class RouteStop(db.Model):
    __tablename__ = "route_stops"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    day_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), nullable=False, default=STOP_STATUS_PROPOSED)

    def to_dict(self):
        return {
            "id": self.id,
            "trip_id": self.trip_id,
            "day_number": self.day_number,
            "title": self.title,
            "status": self.status,
        }
