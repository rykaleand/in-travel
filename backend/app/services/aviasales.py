# Разбор ссылки Aviasales: направление и дата.
# Описание в приложении Б технического задания.
# Обычный Python: без Flask и без запросов в интернет, только разбор текста ссылки.
# Владелец: Backend 3.
import re
from datetime import date
from urllib.parse import urlparse

# Сайты Aviasales: сам домен и его поддомены (www.aviasales.com и т. п.)
AVIASALES_DOMAINS = ["aviasales.com", "aviasales.ru"]

# Код поиска из приложения Б: MOW0209TBS1 -> MOW, 02, 09, TBS, 1
SEARCH_CODE = re.compile(r"^([A-Z]{3})(\d{2})(\d{2})([A-Z]{3})(\d+)$")
MAX_PASSENGERS = 9

FORMAT_ERROR = (
    "Не удалось разобрать ссылку Aviasales: "
    "ожидается вид aviasales.com/search/MOW0209TBS1"
)


def is_aviasales_link(link):
    host = urlparse(link).hostname or ""
    return any(host == domain or host.endswith("." + domain) for domain in AVIASALES_DOMAINS)


def parse_aviasales_link(link):
    """Достаёт из ссылки Aviasales аэропорты и дату вылета.

    Ссылка другого сайта -> None (её сохраняют без разбора).
    Некорректная ссылка Aviasales -> ValueError с понятным текстом.
    Корректная -> {"origin": "MOW", "destination": "TBS", "day": 2, "month": 9}.
    """
    if not is_aviasales_link(link):
        return None

    # Путь "/search/MOW0209TBS1" -> ["search", "MOW0209TBS1"]
    parts = [part for part in urlparse(link).path.split("/") if part]
    if len(parts) != 2 or parts[0] != "search":
        raise ValueError(FORMAT_ERROR)

    match = SEARCH_CODE.match(parts[1])
    if match is None:
        raise ValueError(FORMAT_ERROR)
    origin, day, month, destination, passengers = match.groups()
    day, month = int(day), int(month)

    # Год в ссылке не указан. Берём високосный 2000, чтобы 29.02 тоже считалось верной датой
    try:
        date(2000, month, day)
    except ValueError:
        raise ValueError("В ссылке Aviasales неверная дата")

    if int(passengers) < 1:
        raise ValueError("В ссылке Aviasales должно быть не меньше одного пассажира")
    # Aviasales разрешает до 9 пассажиров. Большое число значит, что это другой вид ссылки,
    # например туда и обратно (MOW0209TBS15091): её регулярное выражение из ТЗ разобрало бы неверно
    if int(passengers) > MAX_PASSENGERS:
        raise ValueError(FORMAT_ERROR)

    return {"origin": origin, "destination": destination, "day": day, "month": month}
