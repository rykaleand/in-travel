// Участники поездки. Владелец: Frontend 1.
import { request } from "./client.js";

// GET /trips/<id>/participants: список участников поездки.
export function getParticipants(tripId) {
  return request(`/trips/${tripId}/participants`);
}
