"""Добавляет координаты в существующую SQLite-базу, сохраняя старые точки."""
import argparse
from datetime import datetime, timezone
from pathlib import Path
import sqlite3


def migrate(database):
    database = Path(database).resolve()
    if not database.is_file():
        raise ValueError("Файл базы не найден")
    with sqlite3.connect(database) as connection:
        columns = {row[1] for row in connection.execute("PRAGMA table_info(route_stops)")}
        if not columns:
            raise ValueError("В базе нет таблицы route_stops")
        missing = [name for name in ("latitude", "longitude") if name not in columns]
        if not missing:
            return None
        # Резервная копия учитывает также данные в журнале WAL.
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
        backup = database.with_name(f"{database.stem}.before-coordinates-{stamp}.db")
        with sqlite3.connect(backup) as backup_connection:
            connection.backup(backup_connection)
        # Обе колонки добавляем одной транзакцией, без удаления таблицы или данных.
        connection.execute("BEGIN IMMEDIATE")
        for name in missing:
            connection.execute(f"ALTER TABLE route_stops ADD COLUMN {name} REAL")
        connection.commit()
        return backup


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("database", type=Path, help="Путь к существующему intravel.db")
    args = parser.parse_args()
    try:
        backup = migrate(args.database)
    except (ValueError, sqlite3.Error) as error:
        parser.exit(1, f"Ошибка обновления базы: {error}\n")
    print(f"База обновлена. Резервная копия: {backup}" if backup else "Координаты уже добавлены")
