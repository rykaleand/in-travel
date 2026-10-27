# Регистрация всех разделов API (blueprint-ов) в приложении.
# Владелец: Backend 1.
from .stops import bp as stops_bp
from .tickets import bp as tickets_bp
from .trips import bp as trips_bp


def register_routes(app):
    app.register_blueprint(trips_bp)
    app.register_blueprint(stops_bp)
    app.register_blueprint(tickets_bp)
    # TODO (Backend 1): подключить сюда blueprint-ы participants и остальных разделов
