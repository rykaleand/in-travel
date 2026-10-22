// Модальное окно: затемнённый фон и карточка с заголовком и крестиком.
// Закрывается по крестику, по клику на фон и по клавише Esc.
// Общий компонент: можно использовать и в других вкладках.
import { useEffect, useRef } from "react";

import "./modal.css";

export default function Modal({ title, onClose, children }) {
  // Храним последнюю версию onClose, чтобы не переподписываться на Esc при каждом рендере.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", handleKey);

    // Пока окно открыто, страница под ним не прокручивается.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Закрываем, только если нажали именно на фон, а не на саму карточку.
  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">{title}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
