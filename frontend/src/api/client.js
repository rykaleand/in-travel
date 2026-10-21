// Все запросы к бэкенду (fetch). Адрес сервера: http://localhost:5000.
// Владелец: общий, каждый добавляет функции для своих экранов.
const API_URL = "http://localhost:5000";

// Общая функция: отправляет запрос, возвращает JSON или бросает ошибку с понятным текстом.
async function request(path, options = {}) {
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
//  Бюджет (#29)

// Сервер может прислать сумму строкой ("12.50"). Приводим к числу.
function toNumber(value) {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

// Проходит по ответу (объект, массив или вложенные структуры) и делает числами
// все поля с суммами: amount и balance. Так не важно, в каком виде
// сервер вернёт балансы и переводы.
function convertAmounts(value) {
  if (Array.isArray(value)) {
    return value.map(convertAmounts);
  }
  if (value !== null && typeof value === "object") {
    const result = {};
    for (const key in value) {
      result[key] =
        key === "amount" || key === "balance"
          ? toNumber(value[key])
          : convertAmounts(value[key]);
    }
    return result;
  }
  return value;
}

// GET /trips/<id>/expenses: список расходов поездки.
export async function getExpenses(tripId) {
  const data = await request(`/trips/${tripId}/expenses`);
  return convertAmounts(data);
}

// POST /trips/<id>/expenses: добавить расход.
// data: поля расхода (кто заплатил, сумма, категория, доли), см. ТЗ и ответ бэкенда.
export async function addExpense(tripId, data) {
  const created = await request(`/trips/${tripId}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, amount: toNumber(data.amount) }),
  });
  return convertAmounts(created);
}

// GET /trips/<id>/balances: балансы участников и переводы.
export async function getBalances(tripId) {
  const data = await request(`/trips/${tripId}/balances`);
  return convertAmounts(data);
}