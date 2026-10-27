// Страница поездки: шапка с названием и кнопкой «Поделиться», ниже 5 вкладок.
// Вкладки пока пустые — их наполняют свои роли (см. таблицу в README.md).
// Владелец: Frontend 1.
import { useState } from "react";
import { useParams, Link } from "react-router-dom";

import "./trip-page.css";

// Порядок вкладок и кто за них отвечает.
const TABS = [
  { id: "participants", label: "Участники", owner: "Frontend 1" },
  { id: "route", label: "Маршрут", owner: "Frontend 2" },
  { id: "budget", label: "Бюджет", owner: "Frontend 3" },
  { id: "tickets", label: "Билеты", owner: "Frontend 3" },
  { id: "checklist", label: "Чек-лист", owner: "Frontend 3" },
];

export default function TripPage() {
  // Код приглашения берём из адреса: /trip/<invite_code>
  const { invite_code } = useParams();
  const [activeTab, setActiveTab] = useState("participants");
  const [shareHint, setShareHint] = useState("");

  // TODO (Frontend 1): когда Backend 1 сделает GET /trips/<invite_code>,
  // здесь нужно загрузить название поездки и показать состояния
  // «загрузка / ошибка / успех». Пока показываем код из адреса.
  const tripName = invite_code;

  const currentTab = TABS.find((tab) => tab.id === activeTab);

  async function handleShare() {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      setShareHint("Ссылка скопирована");
    } catch {
      setShareHint("Скопируйте ссылку из адресной строки");
    }
    // Подсказка исчезает сама через пару секунд.
    setTimeout(() => setShareHint(""), 2500);
  }

  return (
    <div className="trip">
      <header className="trip__header">
        <Link to="/" className="trip__back" aria-label="На главную">
          ←
        </Link>
        <h1 className="trip__title">{tripName}</h1>
        <button type="button" className="btn btn--secondary trip__share" onClick={handleShare}>
          Поделиться
        </button>
      </header>

      {shareHint && (
        <p className="trip__share-hint" role="status">
          {shareHint}
        </p>
      )}

      {/* Вкладки: на узком экране прокручиваются вбок */}
      <nav className="trip__tabs" role="tablist" aria-label="Разделы поездки">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={"trip__tab" + (activeTab === tab.id ? " is-active" : "")}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Содержимое выбранной вкладки */}
      <section className="trip__content" role="tabpanel">
        <div className="tab-stub">
          <p className="tab-stub__title">{currentTab.label}</p>
          <p className="tab-stub__text">
            Раздел в разработке. Отвечает: {currentTab.owner}.
          </p>
        </div>
      </section>
    </div>
  );
}
