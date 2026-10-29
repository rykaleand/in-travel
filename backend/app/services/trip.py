# Сервис: бизнес-логика поездок. Здесь будут правила и проверки.
# Пока получение списка простое, и сервис просто просит данные у репозитория.
import secrets

from ..domain.trip import Trip
from ..repositories import trip as trip_repository

MAX_NAME_LENGTH = 100


def get_all_trips():
    return trip_repository.get_all()

def _generate_unique_invite_code():
    while True:
        code = secrets.token_urlsafe(8)
        if not trip_repository.invite_code_exists(code):
            return code
        
def create_trip(name):
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Название поездки не может быть пустым")

    name = name.strip()
    if len(name) > MAX_NAME_LENGTH:
        raise ValueError(
            f"Название поездки не должно быть длиннее {MAX_NAME_LENGTH} символов"
        )

    trip = Trip(
        id=None,
        name=name,
        invite_code=_generate_unique_invite_code(),
        ticket_link=None,
        flight_number=None,
        flight_time=None,
    )
    return trip_repository.create(trip)

def get_trip_by_invite_code(code):
    return trip_repository.get_by_invite_code(code)
