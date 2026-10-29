// Создание поездки: только название, участники добавляются на странице поездки.
// Владелец: Frontend 1.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createTrip } from "../api/client.js";

export default function CreateTripPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  // Отправка на сервер: на время неё блокируем кнопку, чтобы не создать две поездки.
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault(); // чтобы страница не перезагрузилась

    // Название проверяем по краям: одних пробелов недостаточно.
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Введите название поездки");
      return;
    }

    setSending(true);
    setError("");
    try {
      // Сервер отвечает созданной поездкой: переходим на её страницу по коду приглашения.
      const trip = await createTrip({ name: trimmed });
      navigate(`/trip/${trip.invite_code}`);
    } catch (e) {
      // Название остаётся в поле — можно поправить и отправить снова.
      setError(e.message); // текст ошибки от сервера
      setSending(false);
    }
  }

  return (
    <main className="page">
      <div className="page__card">
        <Link to="/" className="page__back">
          ← На главную
        </Link>
        <h1 className="page__title">Новая поездка</h1>
        <p className="page__text">
          Придумайте название. Участников добавите на странице поездки.
        </p>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className="field__label" htmlFor="trip-name">
            Название поездки
          </label>
          <input
            id="trip-name"
            className="field__input"
            type="text"
            placeholder="например Грузия 2026"
            maxLength={100}
            autoFocus
            disabled={sending}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
          />

          {error && (
            <p className="form__error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={sending}
          >
            {sending ? "Создаём..." : "Создать поездку"}
          </button>
        </form>
      </div>
    </main>
  );
}
