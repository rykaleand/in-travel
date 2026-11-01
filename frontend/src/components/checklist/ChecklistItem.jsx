// Один пункт чек-листа: чекбокс (is_checked) и название (title).
// Выполненный пункт зачёркнут. Нажатие на чекбокс или текст переключает отметку.
export default function ChecklistItem({ item, saving, onToggle }) {
  return (
    <li className={"checklist-item" + (item.is_checked ? " is-checked" : "")}>
      {/* label связывает текст с чекбоксом: можно нажать и на название */}
      <label className="checklist-item__label">
        <input
          type="checkbox"
          className="checklist-item__checkbox"
          checked={item.is_checked}
          disabled={saving} // пока ждём ответ сервера, второй раз не нажать
          onChange={() => onToggle(item)}
        />
        <span className="checklist-item__title">{item.title}</span>
      </label>
    </li>
  );
}
