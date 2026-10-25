// Список балансов: имя участника и его баланс.
// Плюс (участник получит деньги) зелёным, минус (участник должен) красным, ноль серым.
// Только показывает то, что ему передали, сам ничего не загружает.
import { formatMoney } from "../../utils/budget-utils.js";

// По знаку баланса выбираем цвет (класс) и подпись.
// Подпись нужна, чтобы смысл был понятен и без цвета.
function balanceView(balance) {
  if (balance > 0) {
    return { className: "balance-row__amount--plus", sign: "+", hint: "получит" };
  }
  if (balance < 0) {
    return { className: "balance-row__amount--minus", sign: "−", hint: "должен(на)" };
  }
  return { className: "", sign: "", hint: "в расчёте" };
}

// balances: [{ participant_id, name, balance }] из GET /trips/<id>/balances.
export default function BalanceList({ balances }) {
  if (balances.length === 0) {
    return (
      <div className="budget-empty">
        <p className="budget-empty__text">В поездке пока нет участников.</p>
      </div>
    );
  }

  return (
    <ul className="balance-list">
      {balances.map((item) => {
        const view = balanceView(item.balance);
        return (
          <li key={item.participant_id} className="balance-row">
            <div className="balance-row__info">
              <div className="balance-row__name">{item.name}</div>
              <div className="balance-row__hint">{view.hint}</div>
            </div>
            {/* Знак рисуем сами, а сумму берём по модулю: так минус будет красивым «−» */}
            <span className={"balance-row__amount money " + view.className}>
              {view.sign}
              {formatMoney(Math.abs(item.balance))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
