# ОБРАЗЕЦ для остальных разделов: смотрите, как устроен этот файл.
from flask import Blueprint, jsonify, request

from app.extensions import db
from app.models import Participant, Trip
from app.utils import error

bp = Blueprint("participants", __name__)


@bp.post("/trips/<int:trip_id>/participants")
def add_participant(trip_id):
    """Добавить участника. Тело: {"first_name": "Анна", "last_name": "Иванова"}."""
    trip = db.session.get(Trip, trip_id)
    if trip is None:
        return error("Поездка не найдена", 404)

    data = request.get_json(silent=True) or {}
    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    if not first_name or not last_name:
        return error("Укажите имя и фамилию")

    participant = Participant(trip_id=trip.id, first_name=first_name, last_name=last_name)
    db.session.add(participant)
    db.session.commit()
    return jsonify(participant.to_dict()), 201


@bp.get("/trips/<int:trip_id>/participants")
def list_participants(trip_id):
    """Список участников поездки."""
    trip = db.session.get(Trip, trip_id)
    if trip is None:
        return error("Поездка не найдена", 404)
    return jsonify([p.to_dict() for p in trip.participants])
