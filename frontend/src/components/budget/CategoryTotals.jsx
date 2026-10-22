// Итоги по категориям: складываем amount уже загруженных расходов.
// Отдельный эндпоинт для этого не нужен.
import { EXPENSE_CATEGORIES, formatMoney } from "../../utils/budget-utils.js";

export default function CategoryTotals({ expenses }) {
  if (expenses.length === 0) return null;

  // Считаем сумму для каждой категории: { "еда": 1500, "транспорт": 300, ... }
  const totals = {};
  for (const expense of expenses) {
    totals[expense.category] = (totals[expense.category] || 0) + Number(expense.amount);
  }

  // Общая сумма всех расходов.
  const grandTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <section className="category-totals">
      <h3>Итоги по категориям</h3>
      <ul>
        {/* Показываем только категории, в которых есть расходы, в порядке из списка */}
        {EXPENSE_CATEGORIES.filter((c) => totals[c.value]).map((c) => (
          <li key={c.value}>
            <span>{c.label}</span>
            <span>{formatMoney(totals[c.value])}</span>
          </li>
        ))}
        <li className="category-totals__total">
          <span>Всего</span>
          <span>{formatMoney(grandTotal)}</span>
        </li>
      </ul>
    </section>
  );
}
