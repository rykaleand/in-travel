// Один расход: категория, сумма и кто заплатил.
// Только показывает то, что ему передали, сам ничего не загружает.
import { categoryLabel, formatMoney } from "../../utils/budget-utils.js";

export default function ExpenseItem({ expense, payerName }) {
  return (
    <li className="expense-item">
      <div>
        <div className="expense-item__category">{categoryLabel(expense.category)}</div>
        <div className="expense-item__payer">Заплатил(а): {payerName}</div>
      </div>
      <div className="expense-item__amount">{formatMoney(expense.amount)}</div>
    </li>
  );
}
