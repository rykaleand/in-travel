import sqlite3
import subprocess
import sys
from pathlib import Path

import pytest


@pytest.fixture()
def trip_id(client):
    return client.post("/trips", json={"name": "Карта"}).get_json()["id"]


@pytest.mark.parametrize("latitude,longitude", [(0, 0), (-90, -180), (90, 180), (55.7539, 37.6208)])
def test_create_coordinates(client, trip_id, latitude, longitude):
    response = client.post(f"/trips/{trip_id}/stops", json={
        "title": "Точка", "day_number": 1, "latitude": latitude, "longitude": longitude,
    })
    assert response.status_code == 201
    stop = response.get_json()
    assert (stop["latitude"], stop["longitude"]) == (latitude, longitude)
    assert client.get(f"/trips/{trip_id}/stops").get_json() == [stop]


@pytest.mark.parametrize("coordinates", [
    {"latitude": 1}, {"longitude": 1}, {"latitude": None},
    {"latitude": None, "longitude": 1}, {"latitude": 1, "longitude": None},
    {"latitude": 90.01, "longitude": 0}, {"latitude": -90.01, "longitude": 0},
    {"latitude": 0, "longitude": 180.01}, {"latitude": 0, "longitude": -180.01},
    {"latitude": True, "longitude": 0}, {"latitude": 0, "longitude": False},
    {"latitude": "55", "longitude": 37}, {"latitude": [], "longitude": 0},
    {"latitude": {}, "longitude": 0},
    {"latitude": float("nan"), "longitude": 0},
    {"latitude": 0, "longitude": float("inf")},
])
def test_invalid_coordinates_do_not_change_stop(client, trip_id, coordinates):
    base = {"title": "Точка", "day_number": 1}
    assert client.post(f"/trips/{trip_id}/stops", json={**base, **coordinates}).status_code == 400
    stop = client.post(f"/trips/{trip_id}/stops", json=base).get_json()
    response = client.put(f"/stops/{stop['id']}", json={"title": "Не сохранять", **coordinates})
    assert response.status_code == 400
    assert client.get(f"/trips/{trip_id}/stops").get_json() == [stop]


def test_update_preserve_and_clear_coordinates(client, trip_id):
    stop = client.post(f"/trips/{trip_id}/stops", json={"title": "Точка", "day_number": 1}).get_json()
    assert stop["latitude"] is None and stop["longitude"] is None
    url = f"/stops/{stop['id']}"
    response = client.put(url, json={"latitude": 55.75, "longitude": 37.62})
    assert response.status_code == 200
    updated = response.get_json()
    assert updated == {**stop, "latitude": 55.75, "longitude": 37.62}
    response = client.put(url, json={"status": "confirmed"})
    assert response.get_json() == {**updated, "status": "confirmed"}
    response = client.put(url, json={"latitude": None, "longitude": None})
    assert response.status_code == 200
    assert response.get_json() == {**stop, "status": "confirmed"}
    assert client.get(f"/trips/{trip_id}/stops").get_json() == [response.get_json()]


def test_explicit_null_coordinates_on_creation(client, trip_id):
    response = client.post(f"/trips/{trip_id}/stops", json={
        "title": "Точка", "day_number": 1, "latitude": None, "longitude": None,
    })
    assert response.status_code == 201
    assert response.get_json()["latitude"] is None
    assert response.get_json()["longitude"] is None


def test_migration_preserves_legacy_rows_and_is_repeatable(tmp_path):
    database = tmp_path / "old.db"
    with sqlite3.connect(database) as connection:
        connection.execute("CREATE TABLE route_stops (id INTEGER PRIMARY KEY, title TEXT)")
        connection.execute("INSERT INTO route_stops VALUES (1, 'Старая точка')")
    script = Path(__file__).resolve().parents[1] / "scripts/add_stop_coordinates.py"
    for _ in range(2):
        subprocess.run([sys.executable, str(script), str(database)], check=True, capture_output=True)
    with sqlite3.connect(database) as connection:
        assert connection.execute("SELECT * FROM route_stops").fetchall() == [(1, "Старая точка", None, None)]
    backups = list(tmp_path.glob("*.before-coordinates-*.db"))
    assert len(backups) == 1
    with sqlite3.connect(backups[0]) as connection:
        assert connection.execute("SELECT * FROM route_stops").fetchall() == [(1, "Старая точка")]
