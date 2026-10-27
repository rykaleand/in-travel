# Тесты разбора ссылки Aviasales (приложение Б ТЗ). Flask здесь не нужен: проверяем функцию напрямую.
import pytest

from app.services.aviasales import parse_aviasales_link


@pytest.mark.parametrize(
    "link",
    [
        "https://www.aviasales.com/search/MOW0209TBS1",
        "https://aviasales.com/search/MOW0209TBS1",
        "http://www.aviasales.ru/search/MOW0209TBS1",
        "https://www.aviasales.com/search/MOW0209TBS1/",  # слэш в конце
        "https://www.aviasales.com/search/MOW0209TBS1?marker=123",  # параметры после ?
    ],
)
def test_parse_correct_link(link):
    assert parse_aviasales_link(link) == {
        "origin": "MOW",
        "destination": "TBS",
        "day": 2,
        "month": 9,
    }


def test_parse_link_with_several_passengers():
    result = parse_aviasales_link("https://www.aviasales.com/search/LED2902AER3")
    assert result == {"origin": "LED", "destination": "AER", "day": 29, "month": 2}


def test_other_site_is_not_parsed():
    assert parse_aviasales_link("https://www.s7.ru/ru/booking/12345") is None


@pytest.mark.parametrize(
    "link",
    [
        "https://www.aviasales.com/",  # нет кода поиска
        "https://www.aviasales.com/search/",
        "https://www.aviasales.com/offers/MOW0209TBS1",  # не /search/
        "https://www.aviasales.com/search/mow0209tbs1",  # строчные буквы
        "https://www.aviasales.com/search/MOW029TBS1",  # в дате не хватает цифры
        "https://www.aviasales.com/search/MOW0209TBS",  # нет числа пассажиров
        "https://www.aviasales.com/search/MOW0209TBS15091",  # туда и обратно: в ТЗ такого вида нет
        "https://www.aviasales.com/search/MOW3102TBS1",  # 31 февраля
        "https://www.aviasales.com/search/MOW0213TBS1",  # 13-й месяц
        "https://www.aviasales.com/search/MOW0209TBS0",  # 0 пассажиров
        "https://www.aviasales.com/search/MOW0209TBS10",  # больше 9 пассажиров
    ],
)
def test_parse_incorrect_link(link):
    with pytest.raises(ValueError):
        parse_aviasales_link(link)
