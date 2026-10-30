# Таблица CHECKLIST_ITEMS: id, trip_id, title, is_checked.
# Это то, как данные лежат в базе: ни логики, ни проверок здесь нет.
# Владелец: Backend 2 (задача #48).
from ..extensions import db


class ChecklistItemModel(db.Model):
    __tablename__ = "checklist_items"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    is_checked = db.Column(db.Boolean, nullable=False, default=False)
