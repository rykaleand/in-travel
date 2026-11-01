import pytest
from app.extensions import db
from app.models import ParticipantModel, TripModel

@pytest.fixture()
def trip(client):
    """Поездка 1 с тремя участниками и поездка 2 с одним «чужим» участником."""
    with client.application.app_context():
        db.session.add_all([TripModel(name="Грузия", invite_code="gruz2026"), TripModel(name="Казань", invite_code="kzn2026")])
        db.session.commit()
        db.session.add_all([
            ParticipantModel(trip_id=1, first_name="Анна", last_name="Иванова"),   # id 1
            ParticipantModel(trip_id=1, first_name="Борис", last_name="Петров"),   # id 2
            ParticipantModel(trip_id=1, first_name="Вера", last_name="Сидорова"),  # id 3
            ParticipantModel(trip_id=2, first_name="Глеб", last_name="Чужой"),     # id 4
        ])
        db.session.commit()
    return "/trips/1/expenses"


def make_expense(**changes):
    """Правильный расход; в тестах меняем только нужное поле."""
    data = {"amount": 100, "category": "еда", "payer_id": 1, "participant_ids": [1, 2, 3]}
    data.update(changes)
    return data


def test_list_expenses_empty(client, trip):
    response = client.get(trip)
    assert response.status_code == 200
    assert response.get_json() == []


def test_add_expense_and_list(client, trip):
    response = client.post(trip, json=make_expense())
    assert response.status_code == 201
    expense = response.get_json()
    assert expense["trip_id"] == 1
    assert expense["payer_id"] == 1
    assert expense["category"] == "еда"
    assert isinstance(expense["amount"], float)
    assert all(isinstance(share["share_amount"], float) for share in expense["shares"])

    expenses = client.get(trip).get_json()
    assert expenses == [expense]


def test_remainder_cents_go_to_first_participants(client, trip):
    expense = client.post(trip, json=make_expense(amount=100)).get_json()
    shares = [share["share_amount"] for share in expense["shares"]]
    assert shares == [33.34, 33.33, 33.33]
    assert round(sum(shares), 2) == expense["amount"]


def test_payer_can_be_excluded_from_split(client, trip):
    expense = client.post(trip, json=make_expense(payer_id=1, participant_ids=[2, 3])).get_json()
    assert expense["shares"] == [
        {"participant_id": 2, "share_amount": 50.0},
        {"participant_id": 3, "share_amount": 50.0},
    ]


def test_amount_is_rounded_to_two_digits(client, trip):
    expense = client.post(trip, json=make_expense(amount=10.456, participant_ids=[1])).get_json()
    assert expense["amount"] == 10.46
    assert expense["shares"][0]["share_amount"] == 10.46


@pytest.mark.parametrize("changes", [
    {"payer_id": 4},              # плательщик из другой поездки
    {"participant_ids": [1, 4]},  # участник из другой поездки
    {"participant_ids": [99]},    # такого участника нет совсем
])
def test_participants_must_be_from_this_trip(client, trip, changes):
    response = client.post(trip, json=make_expense(**changes))
    assert response.status_code == 400
    assert "error" in response.get_json()


@pytest.mark.parametrize("changes", [
    {"amount": 0},
    {"amount": -5},
    {"amount": "100"},
    {"amount": None},
    {"category": "food"},
    {"participant_ids": []},
    {"participant_ids": [1, 1]},
    # неверные типы: должно быть 400, а не 500
    {"payer_id": {}},
    {"payer_id": True},
    {"payer_id": "1"},
    {"payer_id": None},
    {"participant_ids": [{}]},
    {"participant_ids": [True, 2]},
    {"participant_ids": ["1"]},
    {"participant_ids": "1,2"},
])
def test_invalid_data_returns_400(client, trip, changes):
    response = client.post(trip, json=make_expense(**changes))
    assert response.status_code == 400
    assert "error" in response.get_json()


@pytest.mark.parametrize("raw_amount", [
    "NaN", "Infinity", "-Infinity",
    "1e308",          # сама сумма конечна, но amount * 100 уже переполняется
    "1" + "0" * 400,  # огромное целое не помещается во float
])
def test_amount_must_be_finite(client, trip, raw_amount):
    # такие значения можно отправить только «сырым» текстом JSON
    body = '{"amount": %s, "category": "еда", "payer_id": 1, "participant_ids": [1]}' % raw_amount
    response = client.post(trip, data=body, content_type="application/json")
    assert response.status_code == 400


def test_body_must_be_json(client, trip):
    response = client.post(trip, data="не JSON")
    assert response.status_code == 400


def test_unknown_trip_returns_404(client, trip):
    assert client.get("/trips/99/expenses").status_code == 404
    response = client.post("/trips/99/expenses", json=make_expense())
    assert response.status_code == 404
    assert response.get_json() == {"error": "Поездка не найдена"}


@pytest.mark.parametrize("amount, count", [(100, 3), (10, 3), (0.05, 3), (1000, 7), (99.99, 2)])
def test_split_amount_sum_matches(amount, count):
    from app.services.expense import split_amount
    shares = split_amount(amount, count)
    assert len(shares) == count
    assert round(sum(shares), 2) == amount
    # доли отличаются не больше чем на копейку (round нужен: дробные числа в компьютере неточные)
    assert round(max(shares) - min(shares), 2) <= 0.01
