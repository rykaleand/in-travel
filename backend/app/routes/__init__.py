from . import checklist, expenses, participants, stops, tickets, trips


def register_routes(app):
    """Подключает все разделы API к приложению."""
    for module in (trips, participants, stops, expenses, tickets, checklist):
        app.register_blueprint(module.bp)
