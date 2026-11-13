# Таблица TICKETS: id, trip_id, ticket_link, flight_number, flight_time.
# У одной поездки может быть несколько билетов (задача #79).
# Это то, как данные лежат в базе: ни логики, ни проверок здесь нет.
# Владелец: Backend 3.
from ..extensions import db


class TicketModel(db.Model):
    __tablename__ = "tickets"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    ticket_link = db.Column(db.String(500))
    flight_number = db.Column(db.String(20))
    flight_time = db.Column(db.DateTime)
