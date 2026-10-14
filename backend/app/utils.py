from flask import jsonify


def error(message, status=400):
    """Единый формат ответа с ошибкой."""
    return jsonify({"error": message}), status


def not_implemented(owner):
    """Ответ для эндпоинтов-заглушек, которые ещё предстоит написать."""
    return jsonify({"error": "Пока не реализовано", "owner": owner}), 501
