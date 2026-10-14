def test_create_trip_and_get_by_code(client):
    response = client.post("/trips", json={"name": "Грузия"})
    assert response.status_code == 201
    trip = response.get_json()
    assert trip["name"] == "Грузия"
    assert len(trip["invite_code"]) >= 8

    response = client.get(f"/trips/{trip['invite_code']}")
    assert response.status_code == 200
    assert response.get_json()["id"] == trip["id"]


def test_create_trip_requires_name(client):
    response = client.post("/trips", json={"name": "   "})
    assert response.status_code == 400


def test_unknown_invite_code_returns_404(client):
    assert client.get("/trips/nope").status_code == 404


def test_add_and_list_participants(client):
    trip = client.post("/trips", json={"name": "Тест"}).get_json()
    url = f"/trips/{trip['id']}/participants"

    response = client.post(url, json={"first_name": "Анна", "last_name": "Иванова"})
    assert response.status_code == 201

    participants = client.get(url).get_json()
    assert [p["first_name"] for p in participants] == ["Анна"]


def test_participant_requires_both_names(client):
    trip = client.post("/trips", json={"name": "Тест"}).get_json()
    response = client.post(
        f"/trips/{trip['id']}/participants", json={"first_name": "Анна"}
    )
    assert response.status_code == 400
