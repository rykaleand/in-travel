# TODO (Backend 3): разбор ссылки Aviasales.
#
# Ссылка вида https://www.aviasales.com/search/MOW0209TBS1 кодирует в пути:
# аэропорт вылета (MOW), день и месяц (02, 09), аэропорт прилёта (TBS),
# число пассажиров (1). Подсказка по регулярному выражению есть в ТЗ, приложение Б.
# Номера рейса и времени в ссылке нет, их вносят вручную.


def parse_aviasales_link(url):
    """Вернуть {"origin": ..., "destination": ..., "day": ..., "month": ...}
    или None, если ссылка не похожа на ссылку Aviasales."""
    raise NotImplementedError("Backend 3: реализовать разбор ссылки")
