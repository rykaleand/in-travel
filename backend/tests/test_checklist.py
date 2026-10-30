import pytest

from app.extensions import db
from app.models import TripModel


@pytest.fixture()
def trip(client):
    """Поездка 1 (наша) и поездка 2 (чужая)."""
    with client.application.app_context():
        db.session.add_all([TripModel(name="Грузия", invite_code="gruz2026"), TripModel(name="Казань", invite_code="kzn2026")])
        db.session.commit()
    return "/trips/1/checklist"


def add_item(client, title="Взять паспорт", trip_id=1):
    response = client.post(f"/trips/{trip_id}/checklist", json={"title": title})
    assert response.status_code == 201
    return response.get_json()


def test_empty_checklist(client, trip):
    response = client.get(trip)
    assert response.status_code == 200
    assert response.get_json() == []


def test_add_item_and_list(client, trip):
    item = add_item(client, "  Взять паспорт  ")
    assert item == {"id": 1, "trip_id": 1, "title": "Взять паспорт", "is_checked": False}
    assert client.get(trip).get_json() == [item]


def test_list_contains_only_items_of_this_trip(client, trip):
    add_item(client, "Наш пункт", trip_id=1)
    add_item(client, "Чужой пункт", trip_id=2)
    titles = [item["title"] for item in client.get(trip).get_json()]
    assert titles == ["Наш пункт"]


def test_check_and_uncheck_item_are_saved(client, trip):
    item = add_item(client)

    response = client.put(f"/checklist/{item['id']}", json={"is_checked": True})
    assert response.status_code == 200
    assert response.get_json()["is_checked"] is True
    assert client.get(trip).get_json()[0]["is_checked"] is True  # отметка сохранилась в базе

    response = client.put(f"/checklist/{item['id']}", json={"is_checked": False})
    assert response.status_code == 200
    assert response.get_json()["is_checked"] is False
    assert client.get(trip).get_json()[0]["is_checked"] is False


@pytest.mark.parametrize("body", [
    {"title": ""},
    {"title": "   "},
    {},
    {"title": None},
    {"title": 123},
    {"title": ["Паспорт"]},
    {"title": "а" * 101},
])
def test_invalid_title_returns_400(client, trip, body):
    response = client.post(trip, json=body)
    assert response.status_code == 400
    assert "error" in response.get_json()
    assert client.get(trip).get_json() == []  # ничего не сохранилось


def test_post_body_must_be_json(client, trip):
    response = client.post(trip, data="не JSON")
    assert response.status_code == 400


@pytest.mark.parametrize("body", [
    {"is_checked": "true"},
    {"is_checked": 1},
    {"is_checked": 0},
    {"is_checked": None},
    {},
    {"is_done": True},  # поле называется is_checked, а не is_done
])
def test_invalid_is_checked_returns_400(client, trip, body):
    item = add_item(client)
    response = client.put(f"/checklist/{item['id']}", json=body)
    assert response.status_code == 400
    assert "error" in response.get_json()
    assert client.get(trip).get_json()[0]["is_checked"] is False  # отметка не изменилась


def test_put_body_must_be_json(client, trip):
    item = add_item(client)
    assert client.put(f"/checklist/{item['id']}", data="true").status_code == 400


def test_unknown_trip_returns_404(client, trip):
    response = client.get("/trips/99/checklist")
    assert response.status_code == 404
    assert response.get_json() == {"error": "Поездка не найдена"}
    assert client.post("/trips/99/checklist", json={"title": "Паспорт"}).status_code == 404


def test_unknown_item_returns_404(client, trip):
    response = client.put("/checklist/99", json={"is_checked": True})
    assert response.status_code == 404
    assert response.get_json() == {"error": "Пункт чек-листа не найден"}
