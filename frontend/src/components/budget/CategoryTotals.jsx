// Итоги по категориям: складываем amount уже загруженных трат.
// Отдельный эндпоинт для этого не нужен.
import { EXPENSE_CATEGORIES, formatMoney } from "../../utils/budget-utils.js";

export default function CategoryTotals({ expenses }) {
  if (expenses.length === 0) return null;

  // Считаем сумму для каждой категории: { "еда": 1500, "транспорт": 300, ... }
  const totals = {};
  for (const expense of expenses) {
    totals[expense.category] = (totals[expense.category] || 0) + Number(expense.amount);
  }

  // Общая сумма всех трат.
  const grandTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <section className="budget-card">
      <h3 className="budget-card__title">Итоги по категориям</h3>
      <ul className="totals-list">
        {/* Показываем только категории, в которых есть траты, в порядке из списка */}
        {EXPENSE_CATEGORIES.filter((c) => totals[c.value]).map((c) => (
          <li key={c.value} className="totals-list__row">
            <span>{c.label}</span>
            <span className="money">{formatMoney(totals[c.value])}</span>
          </li>
        ))}
        <li className="totals-list__row totals-list__row--total">
          <span>Всего</span>
          <span className="money">{formatMoney(grandTotal)}</span>
        </li>
      </ul>
    </section>
  );
}
