# TODO (Backend 3): ссылка на билет, номер рейса, время.
# Разбор ссылки Aviasales: services/aviasales.py
from flask import Blueprint

from app.utils import not_implemented

bp = Blueprint("tickets", __name__)


@bp.put("/trips/<int:trip_id>/ticket")
def update_ticket(trip_id):
    # TODO: сохранить ticket_link, flight_number, flight_time в поездке.
    # Если ссылка с aviasales, вернуть ещё направление и дату из parse_aviasales_link.
    return not_implemented("Backend 3")
