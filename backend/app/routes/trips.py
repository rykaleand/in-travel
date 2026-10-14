from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models import Trip
from app.utils import error

bp = Blueprint("trips", __name__)


@bp.post("/trips")
def create_trip():
    """Создать поездку. Тело запроса: {"name": "Грузия, февраль"}."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return error("Введите название поездки")

    trip = Trip(name=name)
    db.session.add(trip)
    db.session.commit()
    return jsonify(trip.to_dict()), 201


@bp.get("/trips/<invite_code>")
def get_trip(invite_code):
    """Получить поездку по коду приглашения."""
    trip = Trip.query.filter_by(invite_code=invite_code).first()
    if trip is None:
        return error("Поездка не найдена", 404)
    return jsonify(trip.to_dict())
