# TODO (Backend 3): точки маршрута. Делайте по образцу routes/participants.py.
# Допустимые статусы: app/constants.py -> STOP_STATUSES.
from flask import Blueprint

from app.utils import not_implemented

bp = Blueprint("stops", __name__)


@bp.get("/trips/<int:trip_id>/stops")
def list_stops(trip_id):
    # TODO: вернуть точки маршрута поездки (сортировка по day_number)
    return not_implemented("Backend 3")


@bp.post("/trips/<int:trip_id>/stops")
def add_stop(trip_id):
    # TODO: проверить название и номер дня, создать точку со статусом "proposed"
    return not_implemented("Backend 3")


@bp.put("/stops/<int:stop_id>")
def update_stop(stop_id):
    # TODO: изменить название / день / статус ("proposed" или "confirmed")
    return not_implemented("Backend 3")


@bp.delete("/stops/<int:stop_id>")
def delete_stop(stop_id):
    # TODO: удалить точку
    return not_implemented("Backend 3")
