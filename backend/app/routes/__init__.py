# Регистрация всех разделов API (blueprint-ов) в приложении.
# Владелец: Backend 1.
from .trips import bp as trips_bp


def register_routes(app):
    app.register_blueprint(trips_bp)
    # TODO (Backend 1): подключить сюда blueprint-ы participants и остальных разделов
