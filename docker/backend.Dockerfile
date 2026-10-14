# Образ backend: Python + Flask.
FROM python:3.12-slim

WORKDIR /app

# Сначала ставим зависимости: пока requirements.txt не менялся, этот шаг берётся из кэша.
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 5000
CMD ["python", "run.py"]
