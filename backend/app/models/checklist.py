from app.extensions import db


class ChecklistItem(db.Model):
    __tablename__ = "checklist_items"

    id = db.Column(db.Integer, primary_key=True)
    trip_id = db.Column(db.Integer, db.ForeignKey("trips.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    is_checked = db.Column(db.Boolean, nullable=False, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "trip_id": self.trip_id,
            "title": self.title,
            "is_checked": self.is_checked,
        }
