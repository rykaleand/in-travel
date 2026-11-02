from ..domain.participant import Participant
from ..extensions import db
from ..models.participant import ParticipantModel


def _to_domain(row):
    return Participant(
        id=row.id,
        trip_id=row.trip_id,
        first_name=row.first_name,
        last_name=row.last_name,
    )


def get_by_trip(trip_id):
    rows = (
        ParticipantModel.query.filter_by(trip_id=trip_id)
        .order_by(ParticipantModel.id)
        .all()
    )
    return [_to_domain(row) for row in rows]


def create(participant):
    row = ParticipantModel(
        trip_id=participant.trip_id,
        first_name=participant.first_name,
        last_name=participant.last_name,
    )
    db.session.add(row)
    db.session.commit()
    return _to_domain(row)