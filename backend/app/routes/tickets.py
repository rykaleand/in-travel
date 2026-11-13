# Билеты: GET/POST /trips/<id>/tickets, PUT/DELETE /tickets/<id>.
# У поездки может быть несколько билетов (ссылка, номер рейса, время).
# Контроллер: принимает HTTP-запрос, зовёт сервис и превращает результат в JSON через DTO.
# Владелец: Backend 3.
from flask import Blueprint, jsonify, request

from ..schemas.ticket import TicketRequest, TicketResponse
from ..services import ticket as ticket_service

bp = Blueprint("tickets", __name__)


@bp.get("/trips/<int:trip_id>/tickets")
def list_tickets(trip_id):
    try:
        tickets = ticket_service.get_tickets(trip_id)
    except LookupError as error:
        return jsonify({"error": str(error)}), 404
    return jsonify([TicketResponse.from_domain(ticket).to_dict() for ticket in tickets])


@bp.post("/trips/<int:trip_id>/tickets")
def create_ticket(trip_id):
    try:
        # silent=True: если прислали не JSON, получим None, а не ошибку Flask
        ticket_request = TicketRequest.from_dict(request.get_json(silent=True))
        ticket = ticket_service.create_ticket(trip_id, ticket_request)
    except LookupError as error:
        return jsonify({"error": str(error)}), 404
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    return jsonify(TicketResponse.from_domain(ticket).to_dict()), 201


@bp.put("/tickets/<int:ticket_id>")
def update_ticket(ticket_id):
    try:
        ticket_request = TicketRequest.from_dict(request.get_json(silent=True))
        ticket = ticket_service.update_ticket(ticket_id, ticket_request)
    except LookupError as error:
        return jsonify({"error": str(error)}), 404
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    return jsonify(TicketResponse.from_domain(ticket).to_dict())


@bp.delete("/tickets/<int:ticket_id>")
def delete_ticket(ticket_id):
    try:
        ticket_service.delete_ticket(ticket_id)
    except LookupError as error:
        return jsonify({"error": str(error)}), 404
    return jsonify({"success": True})
