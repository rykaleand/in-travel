# Сервис чек-листа: проверки входных данных.
# Неверные данные -> ValueError (ответ 400), нет поездки или пункта -> LookupError (ответ 404).
# Владелец: Backend 2 (задача #48).
from ..repositories import checklist as checklist_repository
from ..repositories import trip as trip_repository

TITLE_MAX_LENGTH = 100  # столько символов вмещает столбец title


def _check_trip_exists(trip_id):
    if trip_repository.get_by_id(trip_id) is None:
        raise LookupError("Поездка не найдена")


def get_items(trip_id):
    """Пункты чек-листа поездки в порядке добавления."""
    _check_trip_exists(trip_id)
    return checklist_repository.get_by_trip(trip_id)


def create_item(trip_id, request):
    """Проверяет ChecklistItemRequest и сохраняет новый пункт без отметки."""
    _check_trip_exists(trip_id)

    # Название: строка, в которой есть что-то кроме пробелов
    if request.title is not None and not isinstance(request.title, str):
        raise ValueError("Название пункта должно быть строкой")
    title = (request.title or "").strip()
    if not title:
        raise ValueError("Название пункта не может быть пустым")
    if len(title) > TITLE_MAX_LENGTH:
        raise ValueError(f"Название пункта не должно быть длиннее {TITLE_MAX_LENGTH} символов")

    return checklist_repository.create(trip_id, title)


def set_item_checked(item_id, request):
    """Ставит или снимает отметку по ChecklistCheckRequest."""
    if checklist_repository.get_by_id(item_id) is None:
        raise LookupError("Пункт чек-листа не найден")

    # Только настоящий JSON boolean: строка "true", 1 или null не подходят
    if not isinstance(request.is_checked, bool):
        raise ValueError("is_checked должен быть true или false")

    return checklist_repository.set_checked(item_id, request.is_checked)
