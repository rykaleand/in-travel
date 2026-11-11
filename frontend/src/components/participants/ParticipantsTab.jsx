// Вкладка «Участники» (#22): список участников поездки и форма добавления.
// Умный компонент: загружает список, держит состояния (загрузка, ошибка, данные)
// и добавляет участника. Показывают данные глупые ParticipantList и AddParticipantForm.
// Владелец: Frontend 1.
import { useEffect, useState } from "react";

import { addParticipant, getParticipants } from "../../api/participants-client.js";
import AddParticipantForm from "./AddParticipantForm.jsx";
import ParticipantList from "./ParticipantList.jsx";
import { ensureArray } from "../../utils/common-utils.js";
import "./participants.css";

// tripId передаёт страница поездки (TripPage).
export default function ParticipantsTab({ tripId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Растёт при нажатии «Попробовать снова»: тогда список загружается заново.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Если tripId сменился или вкладку закрыли, ответ старого запроса игнорируем.
    let ignore = false;
    setLoading(true);
    setError("");
    getParticipants(tripId)
      .then((data) => {
        if (!ignore) setParticipants(ensureArray(data));
      })
      .catch((e) => {
        if (!ignore) setError(e.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [tripId, reloadKey]);

  // Вызывает форма. Ошибку не ловим здесь: форма сама покажет её под полями.
  // Сервер возвращает созданного участника, добавляем его в конец списка.
  async function handleAdd({ first_name, last_name }) {
    const created = await addParticipant(tripId, { first_name, last_name });
    setParticipants((prev) => [...prev, created]);
  }

  if (loading) {
    return (
      <div className="participants-tab">
        <div className="participants-state">
          <span className="spinner" aria-hidden="true" />
          Загружаем участников...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="participants-tab">
        <div className="participants-state participants-state--error state-error-icon" role="alert">
          <p>Не получилось загрузить участников: {error}</p>
          <button type="button" className="btn btn--secondary" onClick={() => setReloadKey((k) => k + 1)}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="participants-tab">
      {/* Шапка как у чек-листа: заголовок слева, справа сколько людей */}
      <div className="participants-tab__header">
        <h2 className="participants-tab__title">Участники</h2>
        {participants.length > 0 && (
          <span className="participants-tab__counter">{participants.length}</span>
        )}
      </div>
      <p className="participants-tab__intro">Все, кто едет. Они появятся в бюджете при делении расходов.</p>

      <section className="participants-card">
        <AddParticipantForm participants={participants} onAdd={handleAdd} />
        <ParticipantList participants={participants} />
      </section>
    </div>
  );
}
