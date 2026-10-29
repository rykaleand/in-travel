// Все запросы к бэкенду (fetch). Адрес сервера: http://localhost:5000.
// Владелец: общий, каждый добавляет функции для своих экранов.
const API_URL = "http://localhost:5000";

// Общая функция: отправляет запрос, возвращает JSON или бросает ошибку с понятным текстом.
export async function request(path, options = {}) {
  const response = await fetch(API_URL + path, options);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Что-то пошло не так");
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