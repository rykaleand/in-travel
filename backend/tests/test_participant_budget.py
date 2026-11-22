# Пересчёт бюджета при добавлении участника (#85):
# новый участник автоматически скидывается на все траты поездки.
import pytest

from app.extensions import db
from app.models import ParticipantModel, TripModel


@pytest.fixture()
def trip(client):
    """Поездка 1: Аня (id 1) и Боря (id 2). Поездка 2: Глеб (id 3)."""
    with client.application.app_context():
        db.session.add_all([TripModel(name="Грузия", invite_code="gruz2026"), TripModel(name="Казань", invite_code="kzn2026")])
        db.session.commit()
        db.session.add_all([
            ParticipantModel(trip_id=1, first_name="Аня", last_name="Иванова"),
            ParticipantModel(trip_id=1, first_name="Боря", last_name="Петров"),
            ParticipantModel(trip_id=2, first_name="Глеб", last_name="Сидоров"),
        ])
        db.session.commit()
    return 1


def add_expense(client, amount, payer_id, participant_ids, trip_id=1):
    response = client.post(f"/trips/{trip_id}/expenses", json={
        "amount": amount, "category": "еда", "payer_id": payer_id, "participant_ids": participant_ids,
    })
    assert response.status_code == 201
    return response.get_json()


def add_participant(client, first_name="Вика", trip_id=1):
    response = client.post(f"/trips/{trip_id}/participants", json={"first_name": first_name, "last_name": "Новая"})
    assert response.status_code == 201
    return response.get_json()["id"]


def shares_of(expense):
    return {share["participant_id"]: share["share_amount"] for share in expense["shares"]}


def test_new_participant_shares_existing_expense(client, trip):
    add_expense(client, 100, payer_id=1, participant_ids=[1, 2])  # по 50
    vika = add_participant(client)

    expense = client.get("/trips/1/expenses").get_json()[0]
    assert shares_of(expense) == {1: 33.34, 2: 33.33, vika: 33.33}
    assert round(sum(shares_of(expense).values()), 2) == expense["amount"]


def test_balances_include_new_participant(client, trip):
    add_expense(client, 100, payer_id=1, participant_ids=[1, 2])
    vika = add_participant(client)

    data = client.get("/trips/1/balances").get_json()
    balances = {item["participant_id"]: item["balance"] for item in data["balances"]}
    assert balances == {1: 66.66, 2: -33.33, vika: -33.33}


def test_every_expense_of_trip_is_recalculated(client, trip):
    add_expense(client, 90, payer_id=1, participant_ids=[1, 2])
    add_expense(client, 200, payer_id=2, participant_ids=[1])  # плательщик не в делении
    vika = add_participant(client)

    first, second = client.get("/trips/1/expenses").get_json()
    assert shares_of(first) == {1: 30.0, 2: 30.0, vika: 30.0}
    assert shares_of(second) == {1: 100.0, vika: 100.0}


def test_trip_without_expenses(client, trip):
    add_participant(client)
    assert client.get("/trips/1/expenses").get_json() == []
    assert len(client.get("/trips/1/balances").get_json()["balances"]) == 3


def test_other_trip_expenses_are_not_changed(client, trip):
    add_expense(client, 50, payer_id=3, participant_ids=[3], trip_id=2)
    add_participant(client, trip_id=1)

    expense = client.get("/trips/2/expenses").get_json()[0]
    assert shares_of(expense) == {3: 50.0}


def test_failed_participant_does_not_change_expenses(client, trip):
    add_expense(client, 100, payer_id=1, participant_ids=[1, 2])
    response = client.post("/trips/1/participants", json={"first_name": "", "last_name": "Пустая"})
    assert response.status_code == 400

    expense = client.get("/trips/1/expenses").get_json()[0]
    assert shares_of(expense) == {1: 50.0, 2: 50.0}
