// Форма новой траты (открывается в модальном окне по кнопке «Новая трата»).
// Поля: сумма, кто заплатил, категория, кто участвует в разделении.
// Проверяет поля, отправляет трату на сервер и сообщает BudgetTab, что всё готово.
import { useState } from "react";

import { addExpense } from "../../api/budget-client.js";
import { EXPENSE_CATEGORIES } from "../../utils/budget-utils.js";
import { fullName, getInitials } from "../../utils/common-utils.js";

export default function AddExpenseForm({ tripId, participants, onAdded }) {
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState(null);
  const [category, setCategory] = useState("");
  // По умолчанию делим между всеми, лишних можно снять.
  const [sharedIds, setSharedIds] = useState(participants.map((p) => p.id));
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const payer = participants.find((p) => p.id === payerId);

  // Любое изменение в форме убирает старую ошибку: пользователь уже исправляет.
  function clearError() {
    if (error) setError("");
  }

  // Ставим или снимаем участника из разделения.
  function toggleShared(id) {
    clearError();
    if (sharedIds.includes(id)) {
      setSharedIds(sharedIds.filter((x) => x !== id));
    } else {
      setSharedIds([...sharedIds, id]);
    }
  }

  // Проверяем поля. Возвращаем текст ошибки или пустую строку, если всё хорошо.
  function validate(number) {
    if (!(number > 0)) return "Введите сумму больше нуля";
    if (!payerId) return "Выберите, кто заплатил";
    if (!category) return "Выберите категорию";
    if (sharedIds.length === 0) return "Выберите хотя бы одного участника";
    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault(); // чтобы страница не перезагрузилась

    // Разрешаем писать сумму и через запятую: «12,50».
    const number = Number(amount.replace(",", "."));
    const problem = validate(number);
    if (problem) {
      setError(problem);
      return;
    }

    setError("");
    setSending(true);
    try {
      await addExpense(tripId, {
        amount: Math.round(number * 100) / 100, // до двух знаков
        category,
        payer_id: payerId,
        participant_ids: sharedIds,
      });
      onAdded(); // BudgetTab закроет окно и обновит список
    } catch (e) {
      setError(e.message); // текст ошибки от сервера
      setSending(false);
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      <div className="expense-form__group">
        <label className="expense-form__label" htmlFor="expense-amount">Сумма</label>
        <input
          id="expense-amount"
          className="expense-form__input"
          type="text"
          inputMode="decimal"
          placeholder="0"
          autoFocus
          value={amount}
          onChange={(e) => {
            clearError();
            setAmount(e.target.value);
          }}
        />
      </div>

      <fieldset className="expense-form__group">
        <legend className="expense-form__label">Кто заплатил</legend>
        <div className="chip-row">
          {participants.map((p) => (
            <button
              key={p.id}
              type="button"
              className={"avatar-chip" + (payerId === p.id ? " is-selected" : "")}
              aria-pressed={payerId === p.id}
              aria-label={fullName(p)}
              title={fullName(p)}
              onClick={() => {
                clearError();
                setPayerId(p.id);
              }}
            >
              {getInitials(p)}
            </button>
          ))}
        </div>
        {/* По инициалам не всегда понятно, кто это, поэтому подписываем имя */}
        <p className="expense-form__hint">{payer ? fullName(payer) : "Выберите участника"}</p>
      </fieldset>

      <fieldset className="expense-form__group">
        <legend className="expense-form__label">Категория</legend>
        <div className="chip-row">
          {EXPENSE_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              className={"chip" + (category === c.value ? " is-selected" : "")}
              aria-pressed={category === c.value}
              onClick={() => {
                clearError();
                setCategory(c.value);
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="expense-form__group">
        <legend className="expense-form__label">Кто участвует</legend>
        <div className="chip-row">
          {participants.map((p) => (
            <button
              key={p.id}
              type="button"
              className={"avatar-chip" + (sharedIds.includes(p.id) ? " is-selected" : "")}
              aria-pressed={sharedIds.includes(p.id)}
              aria-label={fullName(p)}
              title={fullName(p)}
              onClick={() => toggleShared(p.id)}
            >
              {getInitials(p)}
            </button>
          ))}
        </div>
        <p className="expense-form__hint">
          {sharedIds.length === participants.length
            ? "Делим поровну на всех"
            : `Делим поровну на ${sharedIds.length} из ${participants.length}`}
        </p>
      </fieldset>

      {error && <p className="expense-form__error" role="alert">{error}</p>}

      <button type="submit" className="btn btn--primary btn--block" disabled={sending}>
        {sending ? "Сохраняем..." : "Добавить трату"}
      </button>
    </form>
  );
}
