from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.json.ensure_ascii = False

    CORS(app)
    db.init_app(app)

    # TODO (Backend 1): подключить models и routes, когда они появятся

    with app.app_context():
        db.create_all()

    return app
