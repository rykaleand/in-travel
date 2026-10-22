# Расходы и баланс: GET/POST /trips/<id>/expenses, GET /trips/<id>/balances.
# Контроллер: принимает запрос, зовёт сервис и превращает результат в JSON через DTO.
# Владелец: Backend 2.
from flask import Blueprint, jsonify, request

from ..schemas.expense import ExpenseRequest, ExpenseResponse
from ..services import expense as expense_service
from ..utils import error

bp = Blueprint("expenses", __name__)


@bp.get("/trips/<int:trip_id>/expenses")
def list_expenses(trip_id):
    try:
        expenses = expense_service.get_trip_expenses(trip_id)
    except LookupError as e:
        return error(str(e), 404)
    return jsonify([ExpenseResponse.from_domain(expense).to_dict() for expense in expenses])


@bp.post("/trips/<int:trip_id>/expenses")
def add_expense(trip_id):
    data = request.get_json(silent=True)  # silent=True: если тело не JSON, получим None, а не падение
    if not isinstance(data, dict):
        return error("Тело запроса должно быть JSON-объектом")

    try:
        expense = expense_service.create_expense(trip_id, ExpenseRequest.from_dict(data))
    except LookupError as e:
        return error(str(e), 404)
    except ValueError as e:
        return error(str(e), 400)
    return jsonify(ExpenseResponse.from_domain(expense).to_dict()), 201
