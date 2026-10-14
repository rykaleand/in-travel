from app.services.settlement import calculate_settlements


def test_one_payer_for_everyone():
    result = calculate_settlements({"A": 200, "B": -100, "C": -100})
    assert sorted(result) == [("B", "A", 100), ("C", "A", 100)]


def test_everyone_is_even():
    assert calculate_settlements({"A": 0, "B": 0}) == []


def test_two_creditors_minimum_transfers():
    result = calculate_settlements({"A": 150, "B": 50, "C": -200})
    assert sorted(result) == [("C", "A", 150), ("C", "B", 50)]


def test_total_transferred_equals_total_debt():
    balances = {"A": 120.5, "B": -40.25, "C": -80.25}
    result = calculate_settlements(balances)
    assert round(sum(t[2] for t in result), 2) == 120.5
