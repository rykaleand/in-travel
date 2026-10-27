// Блок «Балансы и переводы» (#31): кто сколько должен и кто кому сколько переводит.
// Умный компонент: сам загружает балансы и держит состояния «загрузка / ошибка».
// Показывают данные глупые компоненты BalanceList и TransfersList.
// Владелец: Frontend 3.
import { useEffect, useState } from "react";

import { getBalances } from "../../api/budget-client.js";
import BalanceList from "./BalanceList.jsx";
import TransfersList from "./TransfersList.jsx";

// tripId передаёт BudgetTab. После новой траты BudgetTab меняет key у блока,
// React создаёт блок заново, и балансы загружаются ещё раз.
export default function BalancesBlock({ tripId }) {
  const [data, setData] = useState(null); // { balances: [...], transfers: [...] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Растёт при нажатии «Попробовать снова»: тогда балансы загружаются заново.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    getBalances(tripId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tripId, reloadKey]);

  // Заголовок одинаковый во всех состояниях, меняется только содержимое карточки.
  let content;
  if (loading) {
    content = (
      <div className="budget-state budget-state--compact">
        <span className="spinner" aria-hidden="true" />
        Считаем балансы...
      </div>
    );
  } else if (error) {
    content = (
      <div className="budget-state budget-state--compact budget-state--error" role="alert">
        <p>Не получилось загрузить балансы: {error}</p>
        <button type="button" className="btn btn--secondary" onClick={() => setReloadKey((k) => k + 1)}>
          Попробовать снова
        </button>
      </div>
    );
  } else {
    content = (
      <>
        <BalanceList balances={data.balances} />
        <h4 className="budget-card__subtitle">Кто кому переводит</h4>
        <TransfersList transfers={data.transfers} />
      </>
    );
  }

  return (
    <section className="budget-card">
      <h3 className="budget-card__title">Балансы</h3>
      {content}
    </section>
  );
}
