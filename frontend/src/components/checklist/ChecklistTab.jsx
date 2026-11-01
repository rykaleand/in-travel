// Вкладка чек-листа (#39): список общих дел и вещей в поездку.
// Умный компонент: загружает пункты, добавляет новые и переключает отметку.
// Показывают данные глупые компоненты AddChecklistForm и ChecklistList.
// Владелец: Frontend 3.
import { useEffect, useState } from "react";

import { addChecklistItem, getChecklist, toggleChecklistItem } from "../../api/checklist-client.js";
import AddChecklistForm from "./AddChecklistForm.jsx";
import ChecklistList from "./ChecklistList.jsx";
import "./checklist.css";

// tripId передаёт страница поездки (TripPage, Frontend 1).
export default function ChecklistTab({ tripId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Ошибка при отметке пункта: список остаётся на экране, сверху показываем сообщение.
  const [toggleError, setToggleError] = useState("");
  // id пунктов, отметка которых сейчас отправляется на сервер.
  const [savingIds, setSavingIds] = useState([]);
  // Растёт при нажатии «Попробовать снова»: тогда список загружается заново.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    getChecklist(tripId)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tripId, reloadKey]);

  // Вызывает форма. Ошибку не ловим здесь: форма сама покажет её под полем.
  async function handleAdd(title) {
    const created = await addChecklistItem(tripId, { title });
    setItems((prev) => [...prev, created]);
  }

  // Ставим или снимаем галочку. Сервер возвращает обновлённый пункт, его и кладём в список.
  async function handleToggle(item) {
    setToggleError("");
    setSavingIds((prev) => [...prev, item.id]);
    try {
      const updated = await toggleChecklistItem(item.id, { is_checked: !item.is_checked });
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e) {
      setToggleError(`Не получилось сохранить отметку: ${e.message}`);
    } finally {
      setSavingIds((prev) => prev.filter((id) => id !== item.id));
    }
  }

  if (loading) {
    return (
      <div className="checklist-tab">
        <div className="checklist-state">
          <span className="spinner" aria-hidden="true" />
          Загружаем чек-лист...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checklist-tab">
        <div className="checklist-state checklist-state--error" role="alert">
          <p>Не получилось загрузить чек-лист: {error}</p>
          <button type="button" className="btn btn--secondary" onClick={() => setReloadKey((k) => k + 1)}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  const doneCount = items.filter((item) => item.is_checked).length;

  return (
    <div className="checklist-tab">
      {/* Шапка как на макетах (#40): заголовок раздела слева, справа счётчик */}
      <div className="checklist-tab__header">
        <h2 className="checklist-tab__title">Чек-лист</h2>
        {items.length > 0 && (
          <span className="checklist-tab__counter">
            Готово {doneCount} из {items.length}
          </span>
        )}
      </div>
      <p className="checklist-tab__intro">Общий список дел и вещей, чтобы ничего не забыть.</p>

      <section className="checklist-card">
        <AddChecklistForm existingTitles={items.map((item) => item.title)} onAdd={handleAdd} />

        {toggleError && (
          <p className="checklist-error" role="alert">{toggleError}</p>
        )}

        <ChecklistList items={items} savingIds={savingIds} onToggle={handleToggle} />
      </section>
    </div>
  );
}
