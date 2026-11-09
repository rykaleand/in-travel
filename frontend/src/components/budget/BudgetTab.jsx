// Вкладка бюджета: итоги по категориям, балансы и переводы, список трат
// и кнопка «Новая трата» (форма в модальном окне).
// Загружает данные и держит состояния «загрузка / ошибка», остальные компоненты только показывают.
// Владелец: Frontend 3.
import { useEffect, useState } from "react";

import { getExpenses } from "../../api/budget-client.js";
import { getParticipants } from "../../api/participants-client.js";
import { ensureArray } from "../../utils/common-utils.js";
import Modal from "../common/Modal.jsx";
import AddExpenseForm from "./AddExpenseForm.jsx";
import BalancesBlock from "./BalancesBlock.jsx";
import CategoryTotals from "./CategoryTotals.jsx";
import ExpenseList from "./ExpenseList.jsx";
import "./budget.css";

// tripId передаёт страница поездки (TripPage, Frontend 1).
export default function BudgetTab({ tripId }) {
  const [expenses, setExpenses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Растёт при нажатии «Попробовать снова»: тогда данные загружаются заново.
  const [reloadKey, setReloadKey] = useState(0);
  // Растёт после каждой новой траты. Это key у блока балансов:
  // новый key, и блок загружает балансы заново.
  const [balancesVersion, setBalancesVersion] = useState(0);

  // Загружаем траты и участников одновременно.
  useEffect(() => {
    // Если tripId сменился или вкладку закрыли, ответ старого запроса игнорируем.
    let ignore = false;
    setLoading(true);
    setError("");
    Promise.all([getExpenses(tripId), getParticipants(tripId)])
      .then(([expensesData, participantsData]) => {
        if (ignore) return;
        setExpenses(ensureArray(expensesData));
        setParticipants(ensureArray(participantsData));
      })
      .catch((e) => {
        if (!ignore) setError(e.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [tripId, reloadKey]);

  // Вызывается формой после успешного добавления: закрываем окно, обновляем список и балансы.
  function handleExpenseAdded() {
    setIsFormOpen(false);
    getExpenses(tripId)
      .then((data) => setExpenses(ensureArray(data)))
      .catch((e) => setError(e.message));
    setBalancesVersion((v) => v + 1);
  }

  if (loading) {
    return (
      <div className="budget-tab">
        <div className="budget-state">
          <span className="spinner" aria-hidden="true" />
          Загружаем траты...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="budget-tab">
        <div className="budget-state budget-state--error state-error-icon" role="alert">
          <p>Не получилось загрузить бюджет: {error}</p>
          <button type="button" className="btn btn--secondary" onClick={() => setReloadKey((k) => k + 1)}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const noParticipants = participants.length === 0;

  return (
    <div className="budget-tab">
      <div className="budget-tab__header">
        <p className="budget-tab__intro">Записывайте общие траты, остальное посчитаем за вас.</p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setIsFormOpen(true)}
          disabled={noParticipants}
        >
          + Новая трата
        </button>
      </div>

      {noParticipants && (
        <p className="budget-hint">Сначала добавьте участников поездки, чтобы было между кем делить траты.</p>
      )}

      <CategoryTotals expenses={expenses} />

      <BalancesBlock tripId={tripId} key={balancesVersion} />

      <section className="budget-card">
        <h3 className="budget-card__title">Расходы</h3>
        <ExpenseList expenses={expenses} participants={participants} />
      </section>

      {isFormOpen && (
        <Modal title="Новая трата" onClose={() => setIsFormOpen(false)}>
          <AddExpenseForm
            tripId={tripId}
            participants={participants}
            onAdded={handleExpenseAdded}
            onCancel={() => setIsFormOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
