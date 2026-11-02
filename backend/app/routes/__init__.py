# Регистрация всех разделов API (blueprint-ов) в приложении.
# Владелец: Backend 1.
from .checklist import bp as checklist_bp
from .expenses import bp as expenses_bp
from .participants import bp as participants_bp
from .stops import bp as stops_bp
from .tickets import bp as tickets_bp
from .trips import bp as trips_bp


def register_routes(app):
    app.register_blueprint(trips_bp)
    app.register_blueprint(stops_bp)
    app.register_blueprint(expenses_bp)
    app.register_blueprint(participants_bp)
    app.register_blueprint(checklist_bp)
    app.register_blueprint(tickets_bp)
