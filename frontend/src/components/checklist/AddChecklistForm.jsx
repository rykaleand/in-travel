// Форма нового пункта: поле и кнопка «Добавить».
// Проверяет, что строка не пустая и такого пункта ещё нет, и передаёт название в ChecklistTab через onAdd.
// Если сервер вернул ошибку, показывает её под полем.
import { useState } from "react";

// Приводим название к одному виду для сравнения: «  Паспорт » и «паспорт» считаем одинаковыми.
function normalize(text) {
  return text.trim().toLowerCase();
}

// existingTitles: названия пунктов, которые уже есть в списке.
export default function AddChecklistForm({ existingTitles, onAdd }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); // чтобы страница не перезагрузилась

    // Пробелы по краям не считаем: строка из одних пробелов тоже пустая.
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Введите название пункта");
      return;
    }
    if (existingTitles.some((t) => normalize(t) === normalize(trimmed))) {
      setError("Такой пункт уже есть");
      return;
    }

    setError("");
    setSending(true);
    try {
      await onAdd(trimmed);
      setTitle(""); // очищаем поле для следующего пункта
    } catch (e) {
      setError(e.message); // текст ошибки от сервера
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="checklist-form" onSubmit={handleSubmit} noValidate>
      <div className="checklist-form__row">
        <input
          className="checklist-form__input"
          type="text"
          placeholder="Например, взять зарядку"
          aria-label="Новый пункт"
          value={title}
          onChange={(e) => {
            if (error) setError(""); // пользователь уже исправляет
            setTitle(e.target.value);
          }}
        />
        <button type="submit" className="btn btn--primary" disabled={sending}>
          {sending ? "Добавляем..." : "Добавить"}
        </button>
      </div>
      {error && <p className="checklist-error" role="alert">{error}</p>}
    </form>
  );
}
