// Список пунктов чек-листа. Только показывает то, что передал ChecklistTab.
import ChecklistItem from "./ChecklistItem.jsx";

export default function ChecklistList({ items, savingIds, onToggle }) {
  // Если пунктов нет, подсказываем, что делать, а не показываем пустой список.
  if (items.length === 0) {
    return (
      <div className="checklist-empty">
        <p className="checklist-empty__title">Список пока пуст</p>
        <p className="checklist-empty__text">Добавьте первый пункт, например «Взять паспорт».</p>
      </div>
    );
  }

  return (
    <ul className="checklist-list">
      {items.map((item) => (
        <ChecklistItem
          key={item.id}
          item={item}
          saving={savingIds.includes(item.id)}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
}
