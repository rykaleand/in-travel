// Участники поездки (#21). Формат полей: id, trip_id, first_name, last_name (#47).
// Владелец: Frontend 1.
import { request } from "./client.js";

// GET /trips/<id>/participants: список участников поездки.
// Если участников нет, сервер возвращает пустой список.
export function getParticipants(tripId) {
  return request(`/trips/${tripId}/participants`);
}

// POST /trips/<id>/participants: добавить участника. Возвращает созданного участника.
// Ошибки сервера (пустое имя, слишком длинное, поездки нет) прокидываются наверх через request.
export function addParticipant(tripId, { first_name, last_name }) {
  return request(`/trips/${tripId}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_name, last_name }),
  });
}
