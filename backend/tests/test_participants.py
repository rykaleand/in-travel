def test_list_participants_empty(client):
    trip = client.post("/trips", json={"name": "Пустая"}).get_json()
    response = client.get(f"/trips/{trip['id']}/participants")
    assert response.status_code == 200
    assert response.get_json() == []


def test_add_participant_returns_all_fields(client):
    trip = client.post("/trips", json={"name": "Тест"}).get_json()
    response = client.post(
        f"/trips/{trip['id']}/participants",
        json={"first_name": "  Анна-Мария ", "last_name": "фон Берг"},
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["id"]
    assert data["trip_id"] == trip["id"]
    assert data["first_name"] == "Анна-Мария"
    assert data["last_name"] == "фон Берг"


def test_participant_empty_names_return_400(client):
    trip = client.post("/trips", json={"name": "Тест"}).get_json()
    url = f"/trips/{trip['id']}/participants"

    response = client.post(url, json={"first_name": "   ", "last_name": "Иванова"})
    assert response.status_code == 400
    assert "error" in response.get_json()

    response = client.post(url, json={"first_name": "Анна", "last_name": ""})
    assert response.status_code == 400
    assert "error" in response.get_json()


def test_participant_wrong_type_returns_400(client):
    trip = client.post("/trips", json={"name": "Тест"}).get_json()
    url = f"/trips/{trip['id']}/participants"

    response = client.post(url, json={"first_name": 123, "last_name": "Иванова"})
    assert response.status_code == 400
    assert "error" in response.get_json()

    response = client.post(url, json=["Анна", "Иванова"])
    assert response.status_code == 400


def test_participants_unknown_trip_returns_404(client):
    assert client.get("/trips/999/participants").status_code == 404

    response = client.post(
        "/trips/999/participants", json={"first_name": "Анна", "last_name": "Иванова"}
    )
    assert response.status_code == 404
    assert "error" in response.get_json()


def test_participants_belong_to_their_trip(client):
    trip_a = client.post("/trips", json={"name": "А"}).get_json()
    trip_b = client.post("/trips", json={"name": "Б"}).get_json()

    client.post(
        f"/trips/{trip_a['id']}/participants",
        json={"first_name": "Анна", "last_name": "Иванова"},
    )
    client.post(
        f"/trips/{trip_b['id']}/participants",
        json={"first_name": "Олег", "last_name": "Петров"},
    )

    list_a = client.get(f"/trips/{trip_a['id']}/participants").get_json()
    list_b = client.get(f"/trips/{trip_b['id']}/participants").get_json()
    assert [p["first_name"] for p in list_a] == ["Анна"]
    assert [p["first_name"] for p in list_b] == ["Олег"]