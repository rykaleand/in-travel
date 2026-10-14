# Образ frontend: Node + Vite (режим разработки).
FROM node:22-slim

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .

EXPOSE 5173
# --host нужен, чтобы сайт был виден снаружи контейнера.
CMD ["npm", "run", "dev", "--", "--host"]
