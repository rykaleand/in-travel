import { toNumber } from "./common-utils.js";

// Проходит по ответу (объект, массив или вложенные структуры) и делает числами
// все поля с суммами: amount, share_amount и balance. Так не важно, в каком виде
// сервер вернёт балансы и переводы.
export function convertAmounts(value) {
  if (Array.isArray(value)) {
    return value.map(convertAmounts);
  }
  if (value !== null && typeof value === "object") {
    const result = {};
    for (const key in value) {
      result[key] =
        key === "amount" || key === "share_amount" || key === "balance"
          ? toNumber(value[key])
          : convertAmounts(value[key]);
    }
    return result;
  }
  return value;
}
