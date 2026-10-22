// Список расходов. Имя плательщика находим по payer_id среди участников.
import ExpenseItem from "./ExpenseItem.jsx";

export default function ExpenseList({ expenses, participants }) {
  // Если расходов нет, говорим об этом, а не показываем пустой список.
  if (expenses.length === 0) {
    return <p className="budget-empty">Расходов пока нет. Добавьте первый.</p>;
  }

  // Находим участника по id и собираем «Имя Фамилия».
  function nameById(id) {
    const person = participants.find((p) => p.id === id);
    return person ? `${person.first_name} ${person.last_name}` : "Неизвестный участник";
  }

  return (
    <ul className="expense-list">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          payerName={nameById(expense.payer_id)}
        />
      ))}
    </ul>
  );
}
