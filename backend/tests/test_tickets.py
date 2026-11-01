# Тесты билета: PUT /trips/<id>/ticket.
import pytest

from app.repositories import trip as trip_repository


@pytest.fixture()
def trip(client):
    return client.post("/trips", json={"name": "Грузия"}).get_json()


@pytest.fixture()
def trip_id(trip):
    return trip["id"]


def test_save_aviasales_ticket(client, trip_id):
    response = client.put(
        f"/trips/{trip_id}/ticket",
        json={
            "ticket_link": "  https://www.aviasales.com/search/MOW0209TBS1  ",
            "flight_number": " SU 1234 ",
            "flight_time": "2026-09-02T14:30",
        },
    )
    assert response.status_code == 200
    assert response.get_json() == {
        "trip_id": trip_id,
        "ticket_link": "https://www.aviasales.com/search/MOW0209TBS1",
        "flight_number": "SU 1234",
        "flight_time": "2026-09-02T14:30:00",
        "aviasales": {"origin": "MOW", "destination": "TBS", "day": 2, "month": 9},
    }


def test_ticket_is_returned_with_trip(client, trip):
    client.put(
        f"/trips/{trip['id']}/ticket",
        json={
            "ticket_link": "https://www.aviasales.com/search/MOW0209TBS1",
            "flight_number": "SU 1234",
            "flight_time": "2026-09-02T14:30:00",
        },
    )
    # Так фронт получает поездку после обновления страницы
    response = client.get(f"/trips/{trip['invite_code']}")
    assert response.status_code == 200
    saved = response.get_json()
    assert saved["ticket_link"] == "https://www.aviasales.com/search/MOW0209TBS1"
    assert saved["flight_number"] == "SU 1234"
    assert saved["flight_time"] == "2026-09-02T14:30:00"
    assert saved["aviasales"] == {"origin": "MOW", "destination": "TBS", "day": 2, "month": 9}


def test_trip_without_aviasales_link(client, trip):
    # Новая поездка без билета
    assert trip["aviasales"] is None

    client.put(f"/trips/{trip['id']}/ticket", json={"ticket_link": "https://www.s7.ru/booking/123"})
    assert client.get(f"/trips/{trip['invite_code']}").get_json()["aviasales"] is None


def test_other_site_link_is_saved_without_parsing(client, trip_id):
    response = client.put(
        f"/trips/{trip_id}/ticket", json={"ticket_link": "https://www.s7.ru/booking/123"}
    )
    assert response.status_code == 200
    ticket = response.get_json()
    assert ticket["ticket_link"] == "https://www.s7.ru/booking/123"
    assert ticket["aviasales"] is None


def test_empty_ticket_clears_fields(client, trip, trip_id):
    url = f"/trips/{trip_id}/ticket"
    client.put(
        url,
        json={"ticket_link": "https://www.aviasales.com/search/MOW0209TBS1", "flight_number": "S7 1"},
    )

    response = client.put(url, json={"ticket_link": "", "flight_number": "   "})
    assert response.status_code == 200
    assert response.get_json() == {
        "trip_id": trip_id,
        "ticket_link": None,
        "flight_number": None,
        "flight_time": None,
        "aviasales": None,
    }
    # После очистки разбора нет и в ответе поездки
    assert client.get(f"/trips/{trip['invite_code']}").get_json()["aviasales"] is None


@pytest.mark.parametrize(
    "body",
    [
        {"ticket_link": "www.aviasales.com/search/MOW0209TBS1"},  # нет http/https
        {"ticket_link": "ftp://example.com/ticket"},
        {"ticket_link": "https://"},  # нет адреса сайта
        {"ticket_link": 123},
        {"ticket_link": "https://www.aviasales.com/search/MOW3102TBS1"},  # 31 февраля
        {"ticket_link": "https://www.aviasales.com/search/abc"},
        {"flight_number": 1234},
        {"flight_time": "02.09.2026 14:30"},
        {"flight_time": "2026-09-02"},  # нет времени
        {"flight_time": "2026-13-02T14:30"},
        {"flight_time": "2026-09-02T14:30+03:00"},  # часовой пояс не принимаем
    ],
)
def test_invalid_ticket_data(client, trip_id, body):
    response = client.put(f"/trips/{trip_id}/ticket", json=body)
    assert response.status_code == 400
    assert "error" in response.get_json()


def test_incorrect_aviasales_link_message(client, trip_id):
    response = client.put(
        f"/trips/{trip_id}/ticket",
        json={"ticket_link": "https://www.aviasales.com/search/abc"},
    )
    assert response.status_code == 400
    assert "Aviasales" in response.get_json()["error"]


def test_invalid_ticket_is_not_saved(client, trip_id):
    url = f"/trips/{trip_id}/ticket"
    client.put(url, json={"flight_number": "SU 1234"})
    client.put(url, json={"flight_number": "SU 9999", "flight_time": "завтра"})

    with client.application.app_context():
        assert trip_repository.get_by_id(trip_id).flight_number == "SU 1234"


def test_ticket_not_json(client, trip_id):
    response = client.put(f"/trips/{trip_id}/ticket", data="не json")
    assert response.status_code == 400
    assert response.get_json() == {"error": "Тело запроса должно быть JSON-объектом"}


def test_ticket_unknown_trip_returns_404(client):
    response = client.put("/trips/999/ticket", json={"flight_number": "SU 1234"})
    assert response.status_code == 404
    assert response.get_json() == {"error": "Поездка не найдена"}
