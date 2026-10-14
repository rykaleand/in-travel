from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db


def create_app(test_config=None):
    """Создаёт и настраивает Flask-приложение."""
    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)

    app.json.ensure_ascii = False  # русский текст в ответах не превращается в \uXXXX
    CORS(app)  # разрешаем запросы с React (localhost:5173)
    db.init_app(app)

    from . import models  # noqa: F401  (нужно, чтобы SQLAlchemy увидел таблицы)
    from .routes import register_routes

    register_routes(app)

    with app.app_context():
        db.create_all()  # создаёт таблицы, если их ещё нет

    return app
