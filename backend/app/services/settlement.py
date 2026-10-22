# Расчёт долгов: функция calculate_settlements(balances) -> список переводов.
# Алгоритм описан в приложении А технического задания.
# Владелец: Backend 2.
from ..repositories import expense as expense_repository


def calculate_settlements(balances):
    """Минимальный набор переводов, чтобы все балансы стали нулевыми.

    balances: {участник: баланс}, плюс — ему должны, минус — он должен.
    Возвращает список (кто_платит, кому, сумма).
    Жадно: каждый раз самый большой должник платит самому большому кредитору
    меньшую из двух сумм. Считаем в копейках, чтобы не было ошибок округления.
    """
    creditors = [[person, round(balance * 100)] for person, balance in balances.items() if round(balance * 100) > 0]
    debtors = [[person, -round(balance * 100)] for person, balance in balances.items() if round(balance * 100) < 0]

    transfers = []
    while creditors and debtors:
        creditors.sort(key=lambda item: item[1], reverse=True)
        debtors.sort(key=lambda item: item[1], reverse=True)
        creditor, debtor = creditors[0], debtors[0]

        cents = min(creditor[1], debtor[1])
        transfers.append((debtor[0], creditor[0], cents / 100))
        creditor[1] -= cents
        debtor[1] -= cents

        # кто рассчитался полностью, выбывает
        if creditor[1] == 0:
            creditors.pop(0)
        if debtor[1] == 0:
            debtors.pop(0)
    return transfers


def get_trip_balances(trip_id):
    """Балансы участников поездки и переводы. Неизвестная поездка -> LookupError (ответ 404)."""
    if not expense_repository.trip_exists(trip_id):
        raise LookupError("Поездка не найдена")

    names = expense_repository.get_participant_names(trip_id)
    balances = {participant_id: 0.0 for participant_id in names}
    for expense in expense_repository.get_by_trip(trip_id):
        balances[expense.payer_id] += expense.amount  # заплатил — ему должны
        for share in expense.shares:
            balances[share.participant_id] -= share.share_amount  # его доля — он должен

    # + 0.0 превращает -0.0 (бывает после округления) в обычный 0.0
    balances = {participant_id: round(balance, 2) + 0.0 for participant_id, balance in balances.items()}
    transfers = calculate_settlements(balances)

    return {
        "balances": [
            {"participant_id": participant_id, "name": names[participant_id], "balance": balance}
            for participant_id, balance in balances.items()
        ],
        "transfers": [
            {"from": names[payer], "to": names[receiver], "amount": amount}
            for payer, receiver, amount in transfers
        ],
    }
