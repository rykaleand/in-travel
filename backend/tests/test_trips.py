import pytest

def test_get_trip_by_code(client):
    trip = client.post("/trips", json={"name": "Грузия"}).get_json()
    response = client.get(f"/trips/{trip['invite_code']}")
    assert response.status_code == 200
    assert response.get_json()["id"] == trip["id"]

def test_unknown_invite_code_returns_404(client):
    assert client.get("/trips/nope").status_code == 404

@pytest.mark.skip(reason="API участников (добавление/список) ещё не реализован (см. задачу #47)")
def test_add_and_list_participants(client):
    trip = client.post("/trips", json={"name": "Тест"}).get_json()
    url = f"/trips/{trip['id']}/participants"

    response = client.post(url, json={"first_name": "Анна", "last_name": "Иванова"})
    assert response.status_code == 201

    participants = client.get(url).get_json()
    assert [p["first_name"] for p in participants] == ["Анна"]

@pytest.mark.skip(reason="API участников (добавление/список) ещё не реализован (см. задачу #47)")
def test_participant_requires_both_names(client):
    trip = client.post("/trips", json={"name": "Тест"}).get_json()
    response = client.post(
        f"/trips/{trip['id']}/participants", json={"first_name": "Анна"}
    )
    assert response.status_code == 400


def test_list_trips(client):
    assert client.get("/trips").get_json() == []

    from app.extensions import db
    from app.models import TripModel

    with client.application.app_context():
        db.session.add(TripModel(name="Грузия", invite_code="gruz2026"))
        db.session.commit()

    trips = client.get("/trips").get_json()
    assert [t["name"] for t in trips] == ["Грузия"]
    assert trips[0]["flight_time"] is None

def _trip_count(client):
    from app.extensions import db
    from app.models import TripModel
    with client.application.app_context():
        return db.session.query(TripModel).count()


def _assert_error_body(response):
    assert response.status_code == 400
    body = response.get_json()
    assert isinstance(body, dict)
    assert "error" in body
    assert isinstance(body["error"], str) and body["error"].strip()


def _post_expect_400_no_record(client, payload):
    before = _trip_count(client)
    response = client.post("/trips", json=payload)
    _assert_error_body(response)
    assert _trip_count(client) == before
    return response


def test_create_trip_returns_id_name_and_invite_code(client):
    before = _trip_count(client)
    response = client.post("/trips", json={"name": "Грузия"})
    assert response.status_code == 201
    trip = response.get_json()
    assert isinstance(trip["id"], int)
    assert trip["name"] == "Грузия"
    assert isinstance(trip["invite_code"], str)
    assert len(trip["invite_code"]) >= 8
    assert _trip_count(client) == before + 1


def test_create_trip_strips_whitespace(client):
    before = _trip_count(client)
    response = client.post("/trips", json={"name": "  Грузия  "})
    assert response.status_code == 201
    assert response.get_json()["name"] == "Грузия"
    assert _trip_count(client) == before + 1


def test_create_trip_missing_name_returns_400(client):
    _post_expect_400_no_record(client, {})


def test_create_trip_empty_name_returns_400(client):
    _post_expect_400_no_record(client, {"name": ""})


def test_create_trip_whitespace_only_name_returns_400(client):
    _post_expect_400_no_record(client, {"name": "     "})


def test_create_trip_rejects_non_string_name(client):
    _post_expect_400_no_record(client, {"name": 123})


def test_create_trip_rejects_non_object_json(client):
    _post_expect_400_no_record(client, ["Грузия"])


def test_create_trip_name_length_boundaries(client):
    before = _trip_count(client)
    ok = client.post("/trips", json={"name": "a" * 100})
    assert ok.status_code == 201
    assert ok.get_json()["name"] == "a" * 100
    assert _trip_count(client) == before + 1

    before = _trip_count(client)
    too_long = client.post("/trips", json={"name": "a" * 101})
    _assert_error_body(too_long)
    assert _trip_count(client) == before