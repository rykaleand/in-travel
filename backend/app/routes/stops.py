# Точки маршрута: GET/POST /trips/<id>/stops, PUT/DELETE /stops/<id>.
# Контроллер: принимает HTTP-запрос, зовёт сервис и превращает результат в JSON через DTO.
# Владелец: Backend 3.
from flask import Blueprint, jsonify, request

from ..schemas.route_stop import RouteStopRequest, RouteStopResponse
from ..services import route_stop as route_stop_service

bp = Blueprint("stops", __name__)


@bp.get("/trips/<int:trip_id>/stops")
def list_stops(trip_id):
    try:
        stops = route_stop_service.get_stops(trip_id)
    except LookupError as error:
        return jsonify({"error": str(error)}), 404
    return jsonify([RouteStopResponse.from_domain(stop).to_dict() for stop in stops])


@bp.post("/trips/<int:trip_id>/stops")
def create_stop(trip_id):
    # silent=True: если прислали не JSON, получим None, а не ошибку Flask
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = {}
    stop_request = RouteStopRequest.from_dict(data)

    try:
        stop = route_stop_service.create_stop(trip_id, stop_request)
    except LookupError as error:
        return jsonify({"error": str(error)}), 404
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    return jsonify(RouteStopResponse.from_domain(stop).to_dict()), 201
