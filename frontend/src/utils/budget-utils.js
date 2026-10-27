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

// Фиксированный список категорий расходов (#30).
// value точно такие же, как EXPENSE_CATEGORIES в backend/app/constants.py.
export const EXPENSE_CATEGORIES = [
  { value: "еда", label: "Еда" },
  { value: "транспорт", label: "Транспорт" },
  { value: "жильё", label: "Жильё" },
  { value: "развлечения", label: "Развлечения" },
  { value: "другое", label: "Другое" },
];

// Название категории для показа. Незнакомую категорию показываем как есть.
export function categoryLabel(value) {
  const found = EXPENSE_CATEGORIES.find((c) => c.value === value);
  return found ? found.label : value;
}

// Сумма в виде «1 234,50 ₽».
export function formatMoney(amount) {
  return (
    Number(amount).toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " ₽"
  );
}
