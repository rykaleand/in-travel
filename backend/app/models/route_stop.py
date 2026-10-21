# Таблица ROUTE_STOPS: id, trip_id, day_number, title, status.
# Это то, как данные лежат в базе: ни логики, ни проверок здесь нет.
# Владелец: Backend 3.
from ..constants import STOP_STATUS_PROPOSED
from ..extensions import db


class RouteStopModel(db.Model):
    __tablename__ = "route_stops"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    day_number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False, default=STOP_STATUS_PROPOSED)
