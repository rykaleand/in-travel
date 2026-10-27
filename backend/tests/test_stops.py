# Тесты точек маршрута: GET и POST /trips/<id>/stops.
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
    assert set(stops[0]) == {"id", "trip_id", "day_number", "title", "status"}


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
