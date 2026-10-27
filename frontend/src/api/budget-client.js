//  Бюджет (#29)
import { request } from "./client.js";
import { toNumber } from "../utils/common-utils.js";
import { convertAmounts } from "../utils/budget-utils.js";

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
