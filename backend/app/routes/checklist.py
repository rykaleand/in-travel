# Чек-лист: GET/POST /trips/<id>/checklist, PUT /checklist/<id>.
# Контроллер: принимает запрос, зовёт сервис и превращает результат в JSON через DTO.
# Владелец: Backend 2 (задача #48).
from flask import Blueprint, jsonify, request

from ..schemas.checklist import ChecklistCheckRequest, ChecklistItemRequest, ChecklistItemResponse
from ..services import checklist as checklist_service
from ..utils import error

bp = Blueprint("checklist", __name__)


@bp.get("/trips/<int:trip_id>/checklist")
def list_checklist(trip_id):
    try:
        items = checklist_service.get_items(trip_id)
    except LookupError as e:
        return error(str(e), 404)
    return jsonify([ChecklistItemResponse.from_domain(item).to_dict() for item in items])


@bp.post("/trips/<int:trip_id>/checklist")
def add_checklist_item(trip_id):
    # silent=True: если прислали не JSON, получим None, а не ошибку Flask
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = {}

    try:
        item = checklist_service.create_item(trip_id, ChecklistItemRequest.from_dict(data))
    except LookupError as e:
        return error(str(e), 404)
    except ValueError as e:
        return error(str(e), 400)
    return jsonify(ChecklistItemResponse.from_domain(item).to_dict()), 201


@bp.put("/checklist/<int:item_id>")
def check_checklist_item(item_id):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        data = {}

    try:
        item = checklist_service.set_item_checked(item_id, ChecklistCheckRequest.from_dict(data))
    except LookupError as e:
        return error(str(e), 404)
    except ValueError as e:
        return error(str(e), 400)
    return jsonify(ChecklistItemResponse.from_domain(item).to_dict())
