// Одна трата: аватарка плательщика, категория, кто заплатил, на скольких поделили и сумма.
// Только показывает то, что ему передали, сам ничего не загружает.
import { categoryLabel, formatMoney } from "../../utils/budget-utils.js";
import { fullName, getInitials } from "../../utils/common-utils.js";

export default function ExpenseItem({ expense, payer }) {
  const payerName = payer ? fullName(payer) : "Неизвестный участник";
  const sharesCount = expense.shares ? expense.shares.length : 0;

  return (
    <li className="expense-item">
      <span className="avatar" aria-hidden="true">{payer ? getInitials(payer) : "?"}</span>
      <div className="expense-item__info">
        <div className="expense-item__category">{categoryLabel(expense.category)}</div>
        <div className="expense-item__meta">
          Заплатил(а): {payerName}
          {sharesCount > 0 && ` · на ${sharesCount} чел.`}
        </div>
      </div>
      <div className="expense-item__amount">{formatMoney(expense.amount)}</div>
    </li>
  );
}
