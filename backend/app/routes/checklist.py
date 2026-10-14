# TODO (Backend 3): чек-лист.
from flask import Blueprint

from app.utils import not_implemented

bp = Blueprint("checklist", __name__)


@bp.get("/trips/<int:trip_id>/checklist")
def list_items(trip_id):
    # TODO: вернуть пункты чек-листа
    return not_implemented("Backend 3")


@bp.post("/trips/<int:trip_id>/checklist")
def add_item(trip_id):
    # TODO: добавить пункт (title не пустой)
    return not_implemented("Backend 3")


@bp.put("/checklist/<int:item_id>")
def toggle_item(item_id):
    # TODO: отметить пункт выполненным / невыполненным (is_checked)
    return not_implemented("Backend 3")
