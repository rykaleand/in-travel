// Форма нового участника: имя, фамилия и кнопка «Добавить».
// Проверяет поля по тем же правилам, что и сервер (#47): не пустые, не длиннее 50 символов.
// Ещё не даёт добавить человека с тем же именем и фамилией второй раз.
// Если сервер вернул ошибку, показывает её под полями.
import { useState } from "react";

const MAX_NAME_LENGTH = 50; // как на бэкенде

// Приводим имя к одному виду для сравнения: «  Анна » и «анна» считаем одинаковыми.
function normalize(text) {
  return text.trim().toLowerCase();
}

// Текст ошибки для одного поля или "" если всё хорошо.
function validateName(value, label) {
  const trimmed = value.trim();
  if (!trimmed) return `Введите ${label}`;
  if (trimmed.length > MAX_NAME_LENGTH) return `Не длиннее ${MAX_NAME_LENGTH} символов`;
  return "";
}

// participants: уже добавленные участники, чтобы не добавить человека дважды.
export default function AddParticipantForm({ participants, onAdd }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // Ошибки отдельных полей и общая ошибка формы (дубликат или ответ сервера).
  const [errors, setErrors] = useState({ first: "", last: "" });
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); // чтобы страница не перезагрузилась

    const nextErrors = {
      first: validateName(firstName, "имя"),
      last: validateName(lastName, "фамилию"),
    };
    setErrors(nextErrors);
    if (nextErrors.first || nextErrors.last) {
      setFormError("");
      return;
    }

    const first_name = firstName.trim();
    const last_name = lastName.trim();
    const isDuplicate = participants.some(
      (p) => normalize(p.first_name) === normalize(first_name) && normalize(p.last_name) === normalize(last_name),
    );
    if (isDuplicate) {
      setFormError("Такой участник уже есть");
      return;
    }

    setFormError("");
    setSending(true);
    try {
      await onAdd({ first_name, last_name });
      // Очищаем поля для следующего участника.
      setFirstName("");
      setLastName("");
    } catch (e) {
      setFormError(e.message); // текст ошибки от сервера
    } finally {
      setSending(false);
    }
  }

  // Пользователь исправляет поле: убираем его ошибку и общую ошибку формы.
  function handleChange(field, setValue) {
    return (e) => {
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
      if (formError) setFormError("");
      setValue(e.target.value);
    };
  }

  return (
    <form className="participants-form" onSubmit={handleSubmit} noValidate>
      <div className="participants-form__row">
        <label className="participants-form__field">
          <span className="participants-form__label">Имя</span>
          <input
            className="participants-form__input"
            type="text"
            placeholder="Анна"
            autoComplete="given-name"
            aria-invalid={Boolean(errors.first)}
            value={firstName}
            onChange={handleChange("first", setFirstName)}
          />
          {errors.first && <span className="participants-form__field-error">{errors.first}</span>}
        </label>

        <label className="participants-form__field">
          <span className="participants-form__label">Фамилия</span>
          <input
            className="participants-form__input"
            type="text"
            placeholder="Иванова"
            autoComplete="family-name"
            aria-invalid={Boolean(errors.last)}
            value={lastName}
            onChange={handleChange("last", setLastName)}
          />
          {errors.last && <span className="participants-form__field-error">{errors.last}</span>}
        </label>

        <button type="submit" className="btn btn--primary participants-form__submit" disabled={sending}>
          {sending ? "Добавляем..." : "Добавить"}
        </button>
      </div>
      {formError && <p className="participants-error" role="alert">{formError}</p>}
    </form>
  );
}
