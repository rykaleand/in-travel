# Контроллер: принимает HTTP-запрос и отдаёт ответ. Сам ничего не считает и в базу не ходит:
# зовёт сервис и превращает результат в JSON через DTO.
# GET /trips (учебный пример, по ТЗ не нужен), POST /trips, GET /trips/<invite_code>.
# Владелец: Backend 1.
from flask import Blueprint, jsonify

from ..schemas.trip import TripResponse
from ..services import trip as trip_service

bp = Blueprint("trips", __name__)


@bp.get("/trips")
def list_trips():
    trips = trip_service.get_all_trips()
    return jsonify([TripResponse.from_domain(trip).to_dict() for trip in trips])
