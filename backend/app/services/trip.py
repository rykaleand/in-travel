# Сервис: бизнес-логика поездок. Здесь будут правила и проверки.
# Пока получение списка простое, и сервис просто просит данные у репозитория.
from ..repositories import trip as trip_repository


def get_all_trips():
    return trip_repository.get_all()
