// Вкладка бюджета: расходы, итоги по категориям, форма добавления (баланс и переводы будут в #31).
// Загружает данные и держит состояния «загрузка / ошибка», остальные компоненты только показывают.
// Владелец: Frontend 3.
import { useEffect, useState } from "react";

import { getExpenses } from "../../api/budget-client.js";
import { getParticipants } from "../../api/participants-client.js";
import AddExpenseForm from "./AddExpenseForm.jsx";
import CategoryTotals from "./CategoryTotals.jsx";
import ExpenseList from "./ExpenseList.jsx";
import "./budget.css";

// tripId передаёт страница поездки (TripPage, Frontend 1).
export default function BudgetTab({ tripId }) {
  const [expenses, setExpenses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Растёт после каждого нового расхода. Блок баланса будет следить за ним
  // и перезагружать балансы: <BalanceBlock tripId={tripId} key={balancesVersion} />.
  const [balancesVersion, setBalancesVersion] = useState(0);

  // Загружаем расходы и участников одновременно, когда вкладка открылась.
  useEffect(() => {
    Promise.all([getExpenses(tripId), getParticipants(tripId)])
      .then(([expensesData, participantsData]) => {
        setExpenses(expensesData);
        setParticipants(participantsData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tripId]);

  // Вызывается формой после успешного добавления: обновляем список и балансы.
  function handleExpenseAdded() {
    getExpenses(tripId)
      .then(setExpenses)
      .catch((e) => setError(e.message));
    setBalancesVersion((v) => v + 1);
  }

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="budget-error">Ошибка: {error}</p>;

  return (
    <div className="budget-tab">
      <AddExpenseForm
        tripId={tripId}
        participants={participants}
        onAdded={handleExpenseAdded}
      />
      <CategoryTotals expenses={expenses} />
      <section>
        <h3>Расходы</h3>
        <ExpenseList expenses={expenses} participants={participants} />
      </section>
    </div>
  );
}
