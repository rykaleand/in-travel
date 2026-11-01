# Сервис расходов: проверки входных данных и деление расхода на доли.
# Ошибки данных -> ValueError (ответ 400), неизвестная поездка -> LookupError (ответ 404).
# Владелец: Backend 2.
import math

from ..constants import EXPENSE_CATEGORIES
from ..domain.expense import Expense, ExpenseShare
from ..repositories import expense as expense_repository


def _is_id(value):
    """id участника — целое число. bool исключаем: в Python True == 1."""
    return isinstance(value, int) and not isinstance(value, bool)


def split_amount(amount, count):
    """Делит сумму на count равных долей так, чтобы сумма долей точно равнялась amount.

    Считаем в копейках (целые числа), остаток раздаём по одной копейке первым участникам.
    Пример: 100 на троих -> [33.34, 33.33, 33.33].
    """
    cents = round(amount * 100)
    base, rest = divmod(cents, count)
    return [(base + 1 if i < rest else base) / 100 for i in range(count)]


def get_trip_expenses(trip_id):
    if not expense_repository.trip_exists(trip_id):
        raise LookupError("Поездка не найдена")
    return expense_repository.get_by_trip(trip_id)


def create_expense(trip_id, request):
    """Проверяет запрос (ExpenseRequest), делит расход на доли и сохраняет его."""
    if not expense_repository.trip_exists(trip_id):
        raise LookupError("Поездка не найдена")

    # bool в Python тоже считается числом, поэтому исключаем его отдельно
    if not isinstance(request.amount, (int, float)) or isinstance(request.amount, bool):
        raise ValueError("Сумма должна быть числом")
    try:
        amount = float(request.amount)  # огромное целое не помещается во float -> OverflowError
    except OverflowError:
        raise ValueError("Сумма слишком большая")
    if math.isnan(amount):
        raise ValueError("Сумма должна быть числом")
    # бесконечность или переполнение при переводе в копейки (amount * 100 в split_amount)
    if not math.isfinite(amount) or not math.isfinite(amount * 100):
        raise ValueError("Сумма слишком большая")
    amount = round(amount, 2)
    if amount <= 0:
        raise ValueError("Сумма должна быть больше нуля")

    if request.category not in EXPENSE_CATEGORIES:
        raise ValueError("Категория должна быть одной из: " + ", ".join(EXPENSE_CATEGORIES))

    # Сначала проверяем типы и только потом идём в базу: иначе {} или [{}] уронят сервер (500)
    if not _is_id(request.payer_id):
        raise ValueError("payer_id должен быть целым числом")
    participant_ids = request.participant_ids
    if not isinstance(participant_ids, list) or not participant_ids:
        raise ValueError("Выберите хотя бы одного участника, между которыми делится расход")
    if not all(_is_id(participant_id) for participant_id in participant_ids):
        raise ValueError("participant_ids должен быть списком целых чисел")

    trip_participant_ids = expense_repository.get_participant_ids(trip_id)
    if request.payer_id not in trip_participant_ids:
        raise ValueError("Плательщик должен быть участником этой поездки")
    if len(set(participant_ids)) != len(participant_ids):
        raise ValueError("Участники в списке не должны повторяться")
    for participant_id in participant_ids:
        if participant_id not in trip_participant_ids:
            raise ValueError("Все участники должны быть из этой поездки")

    share_amounts = split_amount(amount, len(participant_ids))
    expense = Expense(
        trip_id=trip_id,
        category=request.category,
        payer_id=request.payer_id,
        amount=amount,
        shares=[
            ExpenseShare(participant_id=participant_id, share_amount=share_amount)
            for participant_id, share_amount in zip(participant_ids, share_amounts)
        ],
    )
    return expense_repository.create(expense)
