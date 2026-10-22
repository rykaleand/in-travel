// Форма добавления расхода: сумма, категория, кто заплатил, между кем разделить.
// Проверяет поля, отправляет расход на сервер и сообщает BudgetTab, что всё готово.
import { useState } from "react";

import { addExpense } from "../../api/budget-client.js";
import { EXPENSE_CATEGORIES } from "../../utils/budget-utils.js";

export default function AddExpenseForm({ tripId, participants, onAdded }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [payerId, setPayerId] = useState("");
  // По умолчанию делим между всеми, но галочки можно снять.
  const [sharedIds, setSharedIds] = useState(participants.map((p) => p.id));
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Ставим или снимаем галочку у участника.
  function toggleParticipant(id) {
    if (sharedIds.includes(id)) {
      setSharedIds(sharedIds.filter((x) => x !== id));
    } else {
      setSharedIds([...sharedIds, id]);
    }
  }

  // Проверяем поля. Возвращаем текст ошибки или пустую строку, если всё хорошо.
  function validate(number) {
    if (!(number > 0)) return "Введите сумму больше нуля";
    if (!category) return "Выберите категорию";
    if (!payerId) return "Выберите, кто заплатил";
    if (sharedIds.length === 0) return "Выберите хотя бы одного участника для разделения";
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
        payer_id: Number(payerId),
        participant_ids: sharedIds,
      });
      // Очищаем форму, участников для разделения снова ставим всех.
      setAmount("");
      setCategory("");
      setPayerId("");
      setSharedIds(participants.map((p) => p.id));
      onAdded();
    } catch (e) {
      setError(e.message); // текст ошибки от сервера
    } finally {
      setSending(false);
    }
  }

  // Без участников расход добавить нельзя: некому платить.
  if (participants.length === 0) {
    return <p className="budget-empty">Сначала добавьте участников поездки.</p>;
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h3>Новый расход</h3>

      <label className="expense-form__field">
        Сумма
        <input
          type="text"
          inputMode="decimal"
          placeholder="Например, 1500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <label className="expense-form__field">
        Категория
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Выберите категорию</option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>

      <label className="expense-form__field">
        Кто заплатил
        <select value={payerId} onChange={(e) => setPayerId(e.target.value)}>
          <option value="">Выберите участника</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
          ))}
        </select>
      </label>

      <fieldset className="expense-form__field">
        <legend>Между кем разделить</legend>
        {participants.map((p) => (
          <label key={p.id} className="expense-form__checkbox">
            <input
              type="checkbox"
              checked={sharedIds.includes(p.id)}
              onChange={() => toggleParticipant(p.id)}
            />
            {p.first_name} {p.last_name}
          </label>
        ))}
      </fieldset>

      {error && <p className="expense-form__error">{error}</p>}

      <button type="submit" disabled={sending}>
        {sending ? "Сохраняем..." : "Добавить расход"}
      </button>
    </form>
  );
}
