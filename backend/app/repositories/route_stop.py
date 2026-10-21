# Репозиторий: читает и сохраняет точки маршрута, отдаёт доменные модели RouteStop.
from ..constants import STOP_STATUS_PROPOSED
from ..domain.route_stop import RouteStop
from ..extensions import db
from ..models.route_stop import RouteStopModel


def _to_domain(row):
    """Строка таблицы -> доменная модель."""
    return RouteStop(
        id=row.id,
        trip_id=row.trip_id,
        day_number=row.day_number,
        title=row.title,
        status=row.status,
    )


def get_by_trip(trip_id):
    """Все точки поездки: сначала по номеру дня, внутри дня по порядку добавления."""
    rows = (
        RouteStopModel.query.filter_by(trip_id=trip_id)
        .order_by(RouteStopModel.day_number, RouteStopModel.id)
        .all()
    )
    return [_to_domain(row) for row in rows]


def get_by_id(stop_id):
    """Одна точка или None, если такой нет."""
    row = db.session.get(RouteStopModel, stop_id)
    return _to_domain(row) if row else None


def create(trip_id, day_number, title, status=STOP_STATUS_PROPOSED):
    row = RouteStopModel(
        trip_id=trip_id, day_number=day_number, title=title, status=status
    )
    db.session.add(row)
    db.session.commit()
    return _to_domain(row)


def update(stop_id, day_number, title, status):
    """Меняет поля точки. Возвращает обновлённую точку или None, если её нет."""
    row = db.session.get(RouteStopModel, stop_id)
    if row is None:
        return None
    row.day_number = day_number
    row.title = title
    row.status = status
    db.session.commit()
    return _to_domain(row)


def delete(stop_id):
    """Удаляет точку. Возвращает True, если удалили, и False, если точки не было."""
    row = db.session.get(RouteStopModel, stop_id)
    if row is None:
        return False
    db.session.delete(row)
    db.session.commit()
    return True
