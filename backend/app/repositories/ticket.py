# Репозиторий: читает и сохраняет билеты, отдаёт доменные модели Ticket.
from ..domain.ticket import Ticket
from ..extensions import db
from ..models.ticket import TicketModel


def _to_domain(row):
    """Строка таблицы -> доменная модель."""
    return Ticket(
        id=row.id,
        trip_id=row.trip_id,
        ticket_link=row.ticket_link,
        flight_number=row.flight_number,
        flight_time=row.flight_time,
    )


def get_by_trip(trip_id):
    """Все билеты поездки в порядке добавления."""
    rows = TicketModel.query.filter_by(trip_id=trip_id).order_by(TicketModel.id).all()
    return [_to_domain(row) for row in rows]


def get_by_id(ticket_id):
    """Один билет или None, если такого нет."""
    row = db.session.get(TicketModel, ticket_id)
    return _to_domain(row) if row else None


def create(trip_id, ticket_link, flight_number, flight_time):
    row = TicketModel(
        trip_id=trip_id,
        ticket_link=ticket_link,
        flight_number=flight_number,
        flight_time=flight_time,
    )
    db.session.add(row)
    db.session.commit()
    return _to_domain(row)


def update(ticket_id, ticket_link, flight_number, flight_time):
    """Меняет поля билета. Возвращает обновлённый билет или None, если его нет."""
    row = db.session.get(TicketModel, ticket_id)
    if row is None:
        return None
    row.ticket_link = ticket_link
    row.flight_number = flight_number
    row.flight_time = flight_time
    db.session.commit()
    return _to_domain(row)


def delete(ticket_id):
    """Удаляет билет. Возвращает True, если удалили, и False, если билета не было."""
    row = db.session.get(TicketModel, ticket_id)
    if row is None:
        return False
    db.session.delete(row)
    db.session.commit()
    return True
