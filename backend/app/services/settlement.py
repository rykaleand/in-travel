def calculate_settlements(balances):
    """Минимальный набор переводов, который закрывает все долги.

    balances: словарь {имя_или_id_участника: баланс}.
    Положительный баланс: участнику должны, отрицательный: он должен сам.
    Возвращает список кортежей (кто_переводит, кому, сумма).

    Пример: {"A": 200, "B": -100, "C": -100} -> [("B", "A", 100), ("C", "A", 100)]
    """
    creditors = sorted(
        [(name, amt) for name, amt in balances.items() if amt > 0.005],
        key=lambda x: -x[1],
    )
    debtors = sorted(
        [(name, amt) for name, amt in balances.items() if amt < -0.005],
        key=lambda x: x[1],
    )

    transfers = []
    i, j = 0, 0
    while i < len(debtors) and j < len(creditors):
        debtor_name, debt = debtors[i]
        creditor_name, credit = creditors[j]
        transfer = min(-debt, credit)
        transfers.append((debtor_name, creditor_name, round(transfer, 2)))
        debtors[i] = (debtor_name, debt + transfer)
        creditors[j] = (creditor_name, credit - transfer)
        if abs(debtors[i][1]) < 0.01:
            i += 1
        if abs(creditors[j][1]) < 0.01:
            j += 1
    return transfers
