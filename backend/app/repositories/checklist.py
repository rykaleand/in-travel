# Репозиторий: читает и сохраняет пункты чек-листа, отдаёт доменные модели ChecklistItem.
from ..domain.checklist import ChecklistItem
from ..extensions import db
from ..models.checklist import ChecklistItemModel


def _to_domain(row):
    """Строка таблицы -> доменная модель."""
    return ChecklistItem(
        id=row.id,
        trip_id=row.trip_id,
        title=row.title,
        is_checked=row.is_checked,
    )


def get_by_trip(trip_id):
    """Все пункты одной поездки в порядке добавления."""
    rows = ChecklistItemModel.query.filter_by(trip_id=trip_id).order_by(ChecklistItemModel.id).all()
    return [_to_domain(row) for row in rows]


def get_by_id(item_id):
    """Один пункт или None, если такого нет."""
    row = db.session.get(ChecklistItemModel, item_id)
    return _to_domain(row) if row else None


def create(trip_id, title):
    """Новый пункт всегда без отметки."""
    row = ChecklistItemModel(trip_id=trip_id, title=title, is_checked=False)
    db.session.add(row)
    db.session.commit()
    return _to_domain(row)


def set_checked(item_id, is_checked):
    """Ставит или снимает отметку. Возвращает обновлённый пункт или None, если его нет."""
    row = db.session.get(ChecklistItemModel, item_id)
    if row is None:
        return None
    row.is_checked = is_checked
    db.session.commit()
    return _to_domain(row)
