// Все запросы к бэкенду (fetch). Адрес сервера: http://localhost:5000.
// Владелец: общий, каждый добавляет функции для своих экранов.
const API_URL = "http://localhost:5000";

// Общая функция: отправляет запрос, возвращает JSON или бросает ошибку с понятным текстом.
export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(API_URL + path, options);
  } catch {
    // fetch падает, когда сервер выключен или недоступен.
    throw new Error("Не удалось связаться с сервером. Проверьте, что backend запущен");
  }

  // Сервер может прислать не JSON (например, страницу ошибки 500).
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || `Ошибка сервера (${response.status})`);
  }
  if (data === null) {
    throw new Error("Сервер прислал непонятный ответ");
  }
  return data;
}
// Сохраняет билет поездки: PUT /trips/<id>/ticket.
export function updateTicket(tripId, data) {
    return request(`/trips/${tripId}/ticket`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ticket_link: data.ticket_link ?? null,
            flight_number: data.flight_number ?? null,
            flight_time: data.flight_time ?? null,
        }),
    });
}
// POST /trips: создать поездку по названию.
// data: { name } — название поездки.
export async function createTrip({ name }) {
    return request("/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });
}

// GET /trips/<invite_code>: поездка по коду приглашения (вход по ссылке).
export function getTripByCode(inviteCode) {
  return request(`/trips/${encodeURIComponent(inviteCode)}`);
}

// POST /trips/<trip_id>/participants: добавить участника в поездку.
// data: { first_name, last_name } — имя и фамилия.
export async function addParticipant(tripId, { first_name, last_name }) {
  return request(`/trips/${tripId}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_name, last_name }),
  });
}
