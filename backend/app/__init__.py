from pathlib import Path

from flask import Flask, send_from_directory
from flask_cors import CORS
from werkzeug.exceptions import NotFound

from .config import Config
from .extensions import db


FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"


def _register_frontend(app):
    """Раздаёт production-сборку React с того же домена, что и API."""
    if not (FRONTEND_DIST / "index.html").is_file():
        return

    @app.get("/")
    def frontend_index():
        return send_from_directory(FRONTEND_DIST, "index.html")

    @app.get("/<path:path>")
    def frontend_page(path):
        try:
            return send_from_directory(FRONTEND_DIST, path)
        except NotFound:
            # React Router обрабатывает /trip/... и /join/... в браузере.
            return send_from_directory(FRONTEND_DIST, "index.html")


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if test_config:  # в тестах подменяем настройки (например, базу в памяти)
        app.config.update(test_config)
    app.json.ensure_ascii = False

    CORS(app)
    db.init_app(app)

    from . import models  # noqa: F401  (нужно, чтобы SQLAlchemy увидел таблицы)
    from .routes import register_routes

    register_routes(app)
    _register_frontend(app)

    with app.app_context():
        db.create_all()

    return app
