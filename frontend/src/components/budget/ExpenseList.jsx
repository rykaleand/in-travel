// Список трат. Плательщика находим по payer_id среди участников.
import ExpenseItem from "./ExpenseItem.jsx";

export default function ExpenseList({ expenses, participants }) {
  // Если трат нет, подсказываем, что делать, а не показываем пустой список.
  if (expenses.length === 0) {
    return (
      <div className="budget-empty">
        <p className="budget-empty__title">Пока нет ни одной траты</p>
        <p className="budget-empty__text">Нажмите «Новая трата», чтобы добавить первую.</p>
      </div>
    );
  }

  return (
    <ul className="expense-list">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          payer={participants.find((p) => p.id === expense.payer_id)}
        />
      ))}
    </ul>
  );
}
