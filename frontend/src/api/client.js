// Все запросы к бэкенду собраны здесь. Добавляйте свои функции по образцу ниже.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(BASE_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Что-то пошло не так");
  }
  return data;
}

export function createTrip(name) {
  return request("/trips", { method: "POST", body: JSON.stringify({ name }) });
}

export function getTrip(inviteCode) {
  return request(`/trips/${inviteCode}`);
}

export function getParticipants(tripId) {
  return request(`/trips/${tripId}/participants`);
}

export function addParticipant(tripId, firstName, lastName) {
  return request(`/trips/${tripId}/participants`, {
    method: "POST",
    body: JSON.stringify({ first_name: firstName, last_name: lastName }),
  });
}

// TODO: функции для маршрута, расходов, билетов и чек-листа
// добавляют те, кто делает соответствующий экран.
