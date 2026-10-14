# TODO (Backend 2): расходы и баланс.
# Расчёт переводов уже лежит в services/settlement.py, его нужно подключить.
from flask import Blueprint

from app.utils import not_implemented

bp = Blueprint("expenses", __name__)


@bp.get("/trips/<int:trip_id>/expenses")
def list_expenses(trip_id):
    # TODO: вернуть список расходов поездки
    return not_implemented("Backend 2")


@bp.post("/trips/<int:trip_id>/expenses")
def add_expense(trip_id):
    # TODO: проверить сумму (> 0) и категорию (app/constants.py -> EXPENSE_CATEGORIES),
    # создать Expense и ExpenseShare для каждого участника.
    # Сумма долей должна быть равна сумме расхода.
    return not_implemented("Backend 2")


@bp.get("/trips/<int:trip_id>/balances")
def get_balances(trip_id):
    # TODO: посчитать баланс каждого участника (оплатил минус его доли)
    # и передать в services.settlement.calculate_settlements
    return not_implemented("Backend 2")
