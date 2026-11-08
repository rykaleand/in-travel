# Тесты точек маршрута: GET и POST /trips/<id>/stops, PUT и DELETE /stops/<id>.
import pytest

from app.extensions import db
from app.models import TripModel


@pytest.fixture()
def trip_id(client):
    """Кладём поездку прямо в базу (POST /trips ещё не готов) и отдаём её id."""
    with client.application.app_context():
        trip = TripModel(name="Грузия", invite_code="gruz2026")
        db.session.add(trip)
        db.session.commit()
        return trip.id


def test_list_stops_empty(client, trip_id):
    response = client.get(f"/trips/{trip_id}/stops")
    assert response.status_code == 200
    assert response.get_json() == []


def test_list_stops_sorted_by_day_then_id(client, trip_id):
    url = f"/trips/{trip_id}/stops"
    client.post(url, json={"day_number": 2, "title": "Мцхета"})
    client.post(url, json={"day_number": 1, "title": "Аэропорт"})
    client.post(url, json={"day_number": 1, "title": "Старый город"})

    stops = client.get(url).get_json()
    assert [s["title"] for s in stops] == ["Аэропорт", "Старый город", "Мцхета"]
    assert set(stops[0]) == {"id", "trip_id", "day_number", "title", "status", "latitude", "longitude"}


def test_create_stop_default_status(client, trip_id):
    response = client.post(
        f"/trips/{trip_id}/stops", json={"day_number": 1, "title": "  Тбилиси  "}
    )
    assert response.status_code == 201
    stop = response.get_json()
    assert stop["trip_id"] == trip_id
    assert stop["day_number"] == 1
    assert stop["title"] == "Тбилиси"  # пробелы по краям убраны
    assert stop["status"] == "proposed"


def test_create_stop_confirmed(client, trip_id):
    response = client.post(
        f"/trips/{trip_id}/stops",
        json={"day_number": 3, "title": "Казбеги", "status": "confirmed"},
    )
    assert response.status_code == 201
    assert response.get_json()["status"] == "confirmed"


@pytest.mark.parametrize(
    "body",
    [
        {"day_number": 1},  # нет названия
        {"day_number": 1, "title": ""},
        {"day_number": 1, "title": "   "},
        {"day_number": 1, "title": 5},
        {"title": "Тбилиси"},  # нет номера дня
        {"day_number": 0, "title": "Тбилиси"},
        {"day_number": -1, "title": "Тбилиси"},
        {"day_number": "2", "title": "Тбилиси"},
        {"day_number": 1.5, "title": "Тбилиси"},
        {"day_number": True, "title": "Тбилиси"},
        {"day_number": 1, "title": "Тбилиси", "status": "done"},
    ],
)
def test_create_stop_invalid_data(client, trip_id, body):
    response = client.post(f"/trips/{trip_id}/stops", json=body)
    assert response.status_code == 400
    assert "error" in response.get_json()


def test_create_stop_not_json(client, trip_id):
    response = client.post(f"/trips/{trip_id}/stops", data="не json")
    assert response.status_code == 400
    assert "error" in response.get_json()


def test_invalid_stop_is_not_saved(client, trip_id):
    client.post(f"/trips/{trip_id}/stops", json={"day_number": 0, "title": "Тбилиси"})
    assert client.get(f"/trips/{trip_id}/stops").get_json() == []


def test_unknown_trip_returns_404(client):
    response = client.get("/trips/999/stops")
    assert response.status_code == 404
    assert response.get_json() == {"error": "Поездка не найдена"}

    response = client.post("/trips/999/stops", json={"day_number": 1, "title": "Тбилиси"})
    assert response.status_code == 404
    assert response.get_json() == {"error": "Поездка не найдена"}


@pytest.fixture()
def stop(client, trip_id):
    """Одна предложенная точка в поездке."""
    return client.post(
        f"/trips/{trip_id}/stops", json={"day_number": 1, "title": "Старый город"}
    ).get_json()


def test_update_all_fields(client, trip_id, stop):
    response = client.put(
        f"/stops/{stop['id']}",
        json={"day_number": 3, "title": "  Мцхета  ", "status": "confirmed"},
    )
    assert response.status_code == 200
    expected = {
        "id": stop["id"],
        "trip_id": trip_id,
        "day_number": 3,
        "title": "Мцхета",
        "status": "confirmed",
        "latitude": None,
        "longitude": None,
    }
    assert response.get_json() == expected
    # Изменения сохранились: их видно в списке точек
    assert client.get(f"/trips/{trip_id}/stops").get_json() == [expected]


def test_update_only_title_keeps_other_fields(client, stop):
    response = client.put(f"/stops/{stop['id']}", json={"title": "Нарикала"})
    assert response.status_code == 200
    updated = response.get_json()
    assert updated["title"] == "Нарикала"
    assert updated["day_number"] == 1
    assert updated["status"] == "proposed"


def test_update_only_status(client, stop):
    url = f"/stops/{stop['id']}"

    # Подтверждаем точку
    confirmed = client.put(url, json={"status": "confirmed"}).get_json()
    assert confirmed == {**stop, "status": "confirmed"}

    # Возвращаем в предложенные
    proposed = client.put(url, json={"status": "proposed"}).get_json()
    assert proposed == stop


def test_update_null_means_not_passed(client, stop):
    # null считается непереданным полем: title и day_number остаются прежними
    response = client.put(
        f"/stops/{stop['id']}",
        json={"title": None, "day_number": None, "status": "confirmed"},
    )
    assert response.status_code == 200
    assert response.get_json() == {**stop, "status": "confirmed"}


@pytest.mark.parametrize(
    "body",
    [
        {},  # ничего не передали
        {"title": None, "day_number": None, "status": None},  # null = не передано
        {"title": ""},
        {"title": "   "},
        {"title": 123},
        {"day_number": 0},
        {"day_number": -1},
        {"day_number": "2"},
        {"day_number": 1.5},
        {"day_number": True},
        {"status": "done"},
        {"status": "CONFIRMED"},
        {"title": "Мцхета", "status": "done"},  # одно верное поле не спасает неверное
    ],
)
def test_update_stop_invalid_data(client, stop, body):
    response = client.put(f"/stops/{stop['id']}", json=body)
    assert response.status_code == 400
    assert "error" in response.get_json()


def test_update_stop_not_json(client, stop):
    response = client.put(f"/stops/{stop['id']}", data="не json")
    assert response.status_code == 400
    assert response.get_json() == {
        "error": "Передайте хотя бы одно поле: title, day_number, status или пару latitude и longitude"
    }


def test_invalid_update_is_not_saved(client, trip_id, stop):
    client.put(f"/stops/{stop['id']}", json={"title": "Мцхета", "day_number": 0})
    assert client.get(f"/trips/{trip_id}/stops").get_json() == [stop]


def test_update_unknown_stop_returns_404(client):
    response = client.put("/stops/999", json={"status": "confirmed"})
    assert response.status_code == 404
    assert response.get_json() == {"error": "Точка маршрута не найдена"}


def test_delete_stop(client, trip_id, stop):
    other = client.post(
        f"/trips/{trip_id}/stops", json={"day_number": 2, "title": "Мцхета"}
    ).get_json()

    response = client.delete(f"/stops/{stop['id']}")
    assert response.status_code == 200
    assert response.get_json() == {"success": True}
    # Удалённой точки нет, соседняя осталась
    assert client.get(f"/trips/{trip_id}/stops").get_json() == [other]


def test_delete_unknown_stop_returns_404(client):
    response = client.delete("/stops/999")
    assert response.status_code == 404
    assert response.get_json() == {"error": "Точка маршрута не найдена"}


def test_delete_stop_twice_returns_404(client, stop):
    url = f"/stops/{stop['id']}"
    assert client.delete(url).status_code == 200

    response = client.delete(url)
    assert response.status_code == 404
    assert response.get_json() == {"error": "Точка маршрута не найдена"}
