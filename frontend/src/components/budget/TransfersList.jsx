// Список переводов: «Иван Петров → Мария Ким   300,00 ₽».
// Если переводов нет, все в расчёте, и мы так и пишем.
// Только показывает то, что ему передали, сам ничего не загружает.
import { formatMoney } from "../../utils/budget-utils.js";

// transfers: [{ from, to, amount }] из GET /trips/<id>/balances (from и to это имена).
export default function TransfersList({ transfers }) {
  if (transfers.length === 0) {
    return (
      <div className="budget-empty">
        <p className="budget-empty__title">Все рассчитались! 🎉</p>
      </div>
    );
  }

  return (
    <ul className="transfer-list">
      {transfers.map((t, index) => (
        // У перевода нет id, поэтому ключом служит его номер в списке
        <li key={index} className="transfer-row">
          <span className="transfer-row__names">
            {t.from} <span className="transfer-row__arrow" aria-label="переводит">→</span> {t.to}
          </span>
          <span className="transfer-row__amount money">{formatMoney(t.amount)}</span>
        </li>
      ))}
    </ul>
  );
}
