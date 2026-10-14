# Заполняет базу двумя поездками, чтобы GET /trips было что показать.
# Запуск: cd backend && python seed_example.py
from datetime import datetime

from app import create_app
from app.extensions import db
from app.models import TripModel

app = create_app()
with app.app_context():
    db.session.add(TripModel(name="Грузия", invite_code="gruz2026"))
    db.session.add(
        TripModel(
            name="Сочи",
            invite_code="sochi2026",
            flight_number="SU 1234",
            flight_time=datetime(2026, 12, 20, 9, 30),
        )
    )
    db.session.commit()
    print("Готово: добавлено 2 поездки")
