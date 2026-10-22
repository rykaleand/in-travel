# Репозиторий: читает поездки из базы и отдаёт доменные модели Trip.
from ..domain.trip import Trip
from ..extensions import db
from ..models.trip import TripModel


def _to_domain(row):
    """Строка таблицы -> доменная модель."""
    return Trip(
        id=row.id,
        name=row.name,
        invite_code=row.invite_code,
        ticket_link=row.ticket_link,
        flight_number=row.flight_number,
        flight_time=row.flight_time,
    )


def get_all():
    rows = TripModel.query.order_by(TripModel.id).all()
    return [_to_domain(row) for row in rows]

def invite_code_exists(code):
    return TripModel.query.filter_by(invite_code=code).first() is not None

def create(trip):
    row = TripModel(
        name=trip.name,
        invite_code=trip.invite_code,
        ticket_link=trip.ticket_link,
        flight_number=trip.flight_number,
        flight_time=trip.flight_time,
    )
    db.session.add(row)
    db.session.commit()
    return _to_domain(row)
