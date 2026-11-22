from ..domain.participant import Participant
from ..repositories import participant as participant_repository
from ..repositories import trip as trip_repository
from . import expense as expense_service

MAX_NAME_LENGTH = 50


def _check_trip_exists(trip_id):
    if trip_repository.get_by_id(trip_id) is None:
        raise LookupError("Поездка не найдена")


def _clean_name(value, label):
    if value is None:
        raise ValueError(f"{label} не может быть пустым")
    if not isinstance(value, str):
        raise ValueError(f"{label} должно быть строкой")

    value = value.strip()
    if not value:
        raise ValueError(f"{label} не может быть пустым")
    if len(value) > MAX_NAME_LENGTH:
        raise ValueError(f"{label} не должно быть длиннее {MAX_NAME_LENGTH} символов")
    return value


def get_participants(trip_id):
    _check_trip_exists(trip_id)
    return participant_repository.get_by_trip(trip_id)


def add_participant(trip_id, first_name, last_name):
    _check_trip_exists(trip_id) 

    participant = Participant(
        id=None, 
        trip_id=trip_id,
        first_name=_clean_name(first_name, "Имя"),
        last_name=_clean_name(last_name, "Фамилия"),
    )
    participant = participant_repository.create(participant)
    # Новый участник скидывается на все уже добавленные траты поездки (#85)
    expense_service.add_participant_to_all_expenses(trip_id, participant.id)
    return participant