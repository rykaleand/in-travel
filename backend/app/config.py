import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEFAULT_DATABASE_PATH = os.path.join(BASE_DIR, "intravel.db")


class Config:
    # Локально база остаётся в backend/intravel.db. На хостинге путь задаётся
    # через DATABASE_PATH; в Amvera это постоянное хранилище /data.
    DATABASE_PATH = os.environ.get("DATABASE_PATH", DEFAULT_DATABASE_PATH)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "sqlite:///" + DATABASE_PATH
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
