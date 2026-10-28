// Чек-лист поездки (#38). Формат полей: id, trip_id, title, is_checked (#48).
import { request } from "./client.js";

// GET /trips/<id>/checklist: список пунктов чек-листа.
export function getChecklist(tripId) {
  return request(`/trips/${tripId}/checklist`);
}

// POST /trips/<id>/checklist: добавить пункт. Возвращает созданный пункт.
export function addChecklistItem(tripId, { title }) {
  return request(`/trips/${tripId}/checklist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

// PUT /checklist/<id>: отметить пункт выполненным или снять отметку.
// is_checked уходит на сервер как true/false, а не строкой "true".
export function toggleChecklistItem(itemId, { is_checked }) {
  return request(`/checklist/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_checked: Boolean(is_checked) }),
  });
}
