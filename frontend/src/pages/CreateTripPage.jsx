// Создание поездки: только название, участники добавляются на странице поездки.
// Владелец: Frontend 1.
import { useState } from "react";
import { Link } from "react-router-dom";

export default function CreateTripPage() {
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");

  // TODO (Frontend 1): когда Backend 1 сделает POST /trips, здесь нужно
  // отправить название на сервер и перейти на /trip/<invite_code>.
  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNotice("Введите название поездки");
      return;
    }
    setNotice("Создание поездки пока недоступно: ждём POST /trips от Backend 1.");
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
            autoFocus
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (notice) setNotice("");
            }}
          />

          {notice && (
            <p className="form__notice" role="status">
              {notice}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block">
            Создать поездку
          </button>
        </form>
      </div>
    </main>
  );
}
