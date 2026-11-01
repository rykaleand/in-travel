import pytest

from app.extensions import db
from app.models import ParticipantModel, TripModel


@pytest.fixture()
def trip(client):
    """Поездка 1: Иван (id 1), Мария (id 2), Пётр (id 3)."""
    with client.application.app_context():
        db.session.add(TripModel(name="Грузия", invite_code="gruz2026"))
        db.session.commit()
        db.session.add_all([
            ParticipantModel(trip_id=1, first_name="Иван", last_name="Петров"),
            ParticipantModel(trip_id=1, first_name="Мария", last_name="Ким"),
            ParticipantModel(trip_id=1, first_name="Пётр", last_name="Лис"),
        ])
        db.session.commit()
    return 1


def add_expense(client, amount, payer_id, participant_ids):
    response = client.post("/trips/1/expenses", json={
        "amount": amount, "category": "еда", "payer_id": payer_id, "participant_ids": participant_ids,
    })
    assert response.status_code == 201


def get_balances(client):
    """Возвращает ({id: баланс}, список переводов) и проверяет, что сумма балансов равна нулю."""
    response = client.get("/trips/1/balances")
    assert response.status_code == 200
    data = response.get_json()
    balances = {item["participant_id"]: item["balance"] for item in data["balances"]}
    assert round(sum(balances.values()), 2) == 0
    return balances, data["transfers"]


def test_no_expenses_all_zero(client, trip):
    balances, transfers = get_balances(client)
    assert balances == {1: 0.0, 2: 0.0, 3: 0.0}
    assert transfers == []


def test_two_payers(client, trip):
    add_expense(client, 900, payer_id=2, participant_ids=[1, 2, 3])  # Мария: ужин
    add_expense(client, 600, payer_id=3, participant_ids=[1, 2, 3])  # Пётр: такси
    balances, transfers = get_balances(client)
    assert balances == {1: -500.0, 2: 400.0, 3: 100.0}
    assert transfers == [
        {"from": "Иван Петров", "to": "Мария Ким", "amount": 400.0},
        {"from": "Иван Петров", "to": "Пётр Лис", "amount": 100.0},
    ]


def test_remainder_cents(client, trip):
    add_expense(client, 100, payer_id=1, participant_ids=[1, 2, 3])  # доли 33.34 + 33.33 + 33.33
    balances, transfers = get_balances(client)
    assert balances == {1: 66.66, 2: -33.33, 3: -33.33}
    assert sorted((t["from"], t["amount"]) for t in transfers) == [("Мария Ким", 33.33), ("Пётр Лис", 33.33)]
    assert all(t["to"] == "Иван Петров" for t in transfers)


def test_payer_excluded_from_split(client, trip):
    add_expense(client, 200, payer_id=1, participant_ids=[2, 3])
    balances, transfers = get_balances(client)
    assert balances == {1: 200.0, 2: -100.0, 3: -100.0}
    assert len(transfers) == 2


def test_everyone_paid_equally(client, trip):
    for payer_id in (1, 2, 3):
        add_expense(client, 300, payer_id=payer_id, participant_ids=[1, 2, 3])
    balances, transfers = get_balances(client)
    assert balances == {1: 0.0, 2: 0.0, 3: 0.0}
    assert transfers == []


def test_unknown_trip_returns_404(client, trip):
    response = client.get("/trips/99/balances")
    assert response.status_code == 404
    assert response.get_json() == {"error": "Поездка не найдена"}
