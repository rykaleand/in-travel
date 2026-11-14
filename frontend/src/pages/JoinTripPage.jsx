// Присоединение к поездке: форма имени и фамилии.
// Показывает название поездки из загруженных данных.
// Владелец: Frontend 1.
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import { getTripByCode, addParticipant } from "../api/client.js";

export default function JoinTripPage() {
  const { invite_code } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");

  // Загружаем название поездки при открытии страницы.
  useEffect(() => {
    let cancelled = false;
    getTripByCode(invite_code)
      .then((data) => {
        if (!cancelled) setTrip(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [invite_code]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedFirst = first_name.trim();
    const trimmedLast = last_name.trim();

    if (!trimmedFirst) {
      setError("Введите имя");
      return;
    }
    if (!trimmedLast) {
      setError("Введите фамилию");
      return;
    }

    setSending(true);
    setError("");
    try {
      await addParticipant(trip.id, { first_name: trimmedFirst, last_name: trimmedLast });
      navigate(`/trip/${invite_code}`);
    } catch (e) {
      setError(e.message);
      setSending(false);
    }
  }

  // Состояние ошибки загрузки поездки (код неверный, сервер недоступен).
  if (error && !trip) {
    return (
      <main className="page">
        <div className="page__card">
          <Link to="/" className="page__back">
            ← На главную
          </Link>
          <h1 className="page__title">Не удалось загрузить поездку</h1>
          <p className="page__text">{error}</p>
          <Link to="/" className="btn btn--primary btn--block">
            На главную
          </Link>
        </div>
      </main>
    );
  }

  // Состояние загрузки.
  if (!trip) {
    return (
      <main className="page">
        <div className="page__card">
          <p>Загрузка...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page__card">
        <Link to="/" className="page__back">
          ← На главную
        </Link>
        <h1 className="page__title">Присоединиться к поездке</h1>
        <p className="page__text">
          <strong>{trip.name}</strong>
        </p>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <label className="field__label" htmlFor="first-name">
            Имя
          </label>
          <input
            id="first-name"
            className="field__input"
            type="text"
            placeholder="например Иван"
            autoFocus
            disabled={sending}
            aria-invalid={Boolean(error)}
            value={first_name}
            onChange={(event) => {
              setFirstName(event.target.value);
              if (error) setError("");
            }}
          />

          <label className="field__label" htmlFor="last-name">
            Фамилия
          </label>
          <input
            id="last-name"
            className="field__input"
            type="text"
            placeholder="например Петров"
            disabled={sending}
            aria-invalid={Boolean(error)}
            value={last_name}
            onChange={(event) => {
              setLastName(event.target.value);
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
            {sending ? "Присоединяемся..." : "Присоединиться"}
          </button>
        </form>
      </div>
    </main>
  );
}
