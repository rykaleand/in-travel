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

// ПРИМЕР: GET /trips, список всех поездок.
export function getTrips() {
  return request("/trips");
}
