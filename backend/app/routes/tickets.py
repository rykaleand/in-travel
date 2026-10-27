# Билет: PUT /trips/<id>/ticket (ссылка, номер рейса, время).
# Контроллер: принимает HTTP-запрос, зовёт сервис и превращает результат в JSON через DTO.
# Владелец: Backend 3.
from flask import Blueprint, jsonify, request

from ..schemas.ticket import TicketRequest, TicketResponse
from ..services import ticket as ticket_service

bp = Blueprint("tickets", __name__)


@bp.put("/trips/<int:trip_id>/ticket")
def save_ticket(trip_id):
    try:
        # silent=True: если прислали не JSON, получим None, а не ошибку Flask
        ticket_request = TicketRequest.from_dict(request.get_json(silent=True))
        trip, aviasales_info = ticket_service.save_ticket(trip_id, ticket_request)
    except LookupError as error:
        return jsonify({"error": str(error)}), 404
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    return jsonify(TicketResponse.from_domain(trip, aviasales_info).to_dict())
