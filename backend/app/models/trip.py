import secrets

from app.extensions import db


def generate_invite_code():
    """Короткий случайный код для ссылки-приглашения (8 символов)."""
    return secrets.token_urlsafe(6)


class Trip(db.Model):
    __tablename__ = "trips"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    invite_code = db.Column(
        db.String(32), unique=True, nullable=False, default=generate_invite_code
    )
    # Информация о билете (одна на поездку), см. раздел 2.1 ТЗ
    ticket_link = db.Column(db.String(500))
    flight_number = db.Column(db.String(50))
    flight_time = db.Column(db.String(50))

    participants = db.relationship(
        "Participant", backref="trip", cascade="all, delete-orphan"
    )
    stops = db.relationship("RouteStop", backref="trip", cascade="all, delete-orphan")
    expenses = db.relationship("Expense", backref="trip", cascade="all, delete-orphan")
    checklist_items = db.relationship(
        "ChecklistItem", backref="trip", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "invite_code": self.invite_code,
            "ticket_link": self.ticket_link,
            "flight_number": self.flight_number,
            "flight_time": self.flight_time,
        }
