# Тесты билетов: GET/POST /trips/<id>/tickets, PUT/DELETE /tickets/<id>.
import pytest

AVIASALES_LINK = "https://www.aviasales.com/search/MOW0209TBS1"
AVIASALES_INFO = {"origin": "MOW", "destination": "TBS", "day": 2, "month": 9}


@pytest.fixture()
def trip_id(client):
    return client.post("/trips", json={"name": "Грузия"}).get_json()["id"]


def _add_ticket(client, trip_id, body):
    return client.post(f"/trips/{trip_id}/tickets", json=body)


def test_list_tickets_empty(client, trip_id):
    response = client.get(f"/trips/{trip_id}/tickets")
    assert response.status_code == 200
    assert response.get_json() == []


def test_create_aviasales_ticket(client, trip_id):
    response = _add_ticket(
        client,
        trip_id,
        {
            "ticket_link": f"  {AVIASALES_LINK}  ",
            "flight_number": " SU 1234 ",
            "flight_time": "2026-09-02T14:30",
        },
    )
    assert response.status_code == 201
    ticket = response.get_json()
    assert isinstance(ticket["id"], int)
    assert ticket == {
        "id": ticket["id"],
        "trip_id": trip_id,
        "ticket_link": AVIASALES_LINK,  # пробелы по краям убраны
        "flight_number": "SU 1234",
        "flight_time": "2026-09-02T14:30:00",
        "aviasales": AVIASALES_INFO,
    }


def test_several_tickets_in_one_trip(client, trip_id):
    # Главное в задаче #79: второй билет не перезаписывает первый
    first = _add_ticket(client, trip_id, {"ticket_link": AVIASALES_LINK}).get_json()
    second = _add_ticket(client, trip_id, {"flight_number": "S7 99"}).get_json()

    tickets = client.get(f"/trips/{trip_id}/tickets").get_json()
    assert [t["id"] for t in tickets] == [first["id"], second["id"]]  # порядок добавления
    assert tickets[0]["aviasales"] == AVIASALES_INFO  # разбор ссылки в каждом билете
    assert tickets[1]["aviasales"] is None


def test_tickets_belong_to_their_trip(client, trip_id):
    other_trip_id = client.post("/trips", json={"name": "Сочи"}).get_json()["id"]
    _add_ticket(client, trip_id, {"flight_number": "SU 1"})

    assert client.get(f"/trips/{other_trip_id}/tickets").get_json() == []


def test_other_site_link_is_saved_without_parsing(client, trip_id):
    response = _add_ticket(client, trip_id, {"ticket_link": "https://www.s7.ru/booking/123"})
    assert response.status_code == 201
    ticket = response.get_json()
    assert ticket["ticket_link"] == "https://www.s7.ru/booking/123"
    assert ticket["aviasales"] is None


@pytest.mark.parametrize(
    "body",
    [
        {},  # ни одного поля
        {"ticket_link": "", "flight_number": "   ", "flight_time": None},
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
def test_create_ticket_invalid_data(client, trip_id, body):
    response = _add_ticket(client, trip_id, body)
    assert response.status_code == 400
    assert "error" in response.get_json()
    # Неверный билет не сохраняется
    assert client.get(f"/trips/{trip_id}/tickets").get_json() == []


def test_incorrect_aviasales_link_message(client, trip_id):
    response = _add_ticket(client, trip_id, {"ticket_link": "https://www.aviasales.com/search/abc"})
    assert response.status_code == 400
    assert "Aviasales" in response.get_json()["error"]


def test_create_ticket_not_json(client, trip_id):
    response = client.post(f"/trips/{trip_id}/tickets", data="не json")
    assert response.status_code == 400
    assert response.get_json() == {"error": "Тело запроса должно быть JSON-объектом"}


def test_unknown_trip_returns_404(client):
    response = client.get("/trips/999/tickets")
    assert response.status_code == 404
    assert response.get_json() == {"error": "Поездка не найдена"}

    response = client.post("/trips/999/tickets", json={"flight_number": "SU 1234"})
    assert response.status_code == 404
    assert response.get_json() == {"error": "Поездка не найдена"}


def test_update_ticket(client, trip_id):
    first = _add_ticket(client, trip_id, {"flight_number": "SU 1"}).get_json()
    second = _add_ticket(client, trip_id, {"flight_number": "SU 2"}).get_json()

    response = client.put(
        f"/tickets/{second['id']}",
        json={"ticket_link": AVIASALES_LINK, "flight_time": "2026-09-02T14:30"},
    )
    assert response.status_code == 200
    # PUT заменяет билет целиком: номер рейса не прислали, он стал пустым
    assert response.get_json() == {
        "id": second["id"],
        "trip_id": trip_id,
        "ticket_link": AVIASALES_LINK,
        "flight_number": None,
        "flight_time": "2026-09-02T14:30:00",
        "aviasales": AVIASALES_INFO,
    }

    # Первый билет не изменился
    tickets = client.get(f"/trips/{trip_id}/tickets").get_json()
    assert tickets[0] == first


def test_update_ticket_invalid_data_is_not_saved(client, trip_id):
    ticket = _add_ticket(client, trip_id, {"flight_number": "SU 1234"}).get_json()

    response = client.put(
        f"/tickets/{ticket['id']}", json={"flight_number": "SU 9999", "flight_time": "завтра"}
    )
    assert response.status_code == 400
    assert "error" in response.get_json()
    assert client.get(f"/trips/{trip_id}/tickets").get_json() == [ticket]


def test_update_ticket_empty_body(client, trip_id):
    ticket = _add_ticket(client, trip_id, {"flight_number": "SU 1234"}).get_json()
    response = client.put(f"/tickets/{ticket['id']}", json={})
    assert response.status_code == 400
    assert "error" in response.get_json()


def test_update_unknown_ticket_returns_404(client):
    response = client.put("/tickets/999", json={"flight_number": "SU 1234"})
    assert response.status_code == 404
    assert response.get_json() == {"error": "Билет не найден"}


def test_delete_ticket(client, trip_id):
    first = _add_ticket(client, trip_id, {"flight_number": "SU 1"}).get_json()
    second = _add_ticket(client, trip_id, {"flight_number": "SU 2"}).get_json()

    response = client.delete(f"/tickets/{first['id']}")
    assert response.status_code == 200
    assert response.get_json() == {"success": True}

    # Остался только второй билет
    assert client.get(f"/trips/{trip_id}/tickets").get_json() == [second]

    # Повторное удаление: билета уже нет
    response = client.delete(f"/tickets/{first['id']}")
    assert response.status_code == 404
    assert response.get_json() == {"error": "Билет не найден"}


def test_trip_response_has_no_ticket_fields(client):
    # Билеты больше не хранятся в поездке
    trip = client.post("/trips", json={"name": "Казань"}).get_json()
    assert set(trip) == {"id", "name", "invite_code"}
