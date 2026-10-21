# Допустимые значения: статусы точки маршрута (proposed / confirmed),
# фиксированный список категорий расходов.
# Владелец: Backend 2 (категории), Backend 3 (статусы).

# Статусы точки маршрута: сначала точку предлагают, потом подтверждают.
STOP_STATUS_PROPOSED = "proposed"
STOP_STATUS_CONFIRMED = "confirmed"
STOP_STATUSES = [STOP_STATUS_PROPOSED, STOP_STATUS_CONFIRMED]

# Категории расходов: еда, транспорт, жильё, развлечения, другое.
EXPENSE_CATEGORIES = ["food", "transport", "housing", "entertainment", "other"]
