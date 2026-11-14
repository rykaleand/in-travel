// Стартовая страница: название сервиса и две кнопки — «Создать поездку» и «Войти по ссылке».
// Владелец: Frontend 1.
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import "../styles/landing.css";

export default function LandingPage() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  // Войти можно по коду из ссылки-приглашения, например «gruz2026».
  async function handleJoin(event) {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Введите код из ссылки-приглашения");
      return;
    }
    // Если вставили целую ссылку, берём из неё последнюю часть.
    const fromLink = trimmed.split("/").filter(Boolean).pop();
    setError("");
    setChecking(true);

    // Проверяем, что поездка существует, и переходим на форму входа.
    try {
      const { getTripByCode } = await import("../api/client.js");
      await getTripByCode(fromLink);
      navigate(`/join/${encodeURIComponent(fromLink)}`);
    } catch (e) {
      setError(e.message);
      setChecking(false);
    }
  }

  return (
    <main className="landing">
      <div className="landing__card">
        <h1 className="landing__title">ВПуть</h1>
        <p className="landing__text">
          Планируйте поездку вместе: маршрут, общий бюджет, билеты и чек-лист.
          Участники заходят по ссылке, без регистрации.
        </p>

        <Link to="/trip/new" className="btn btn--primary btn--block">
          Создать поездку
        </Link>

        {isJoinOpen ? (
          <form className="landing__join" onSubmit={handleJoin}>
            <label className="field__label" htmlFor="invite-code">
              Код из ссылки-приглашения
            </label>
            <input
              id="invite-code"
              className="field__input"
              type="text"
              placeholder="например gruz2026"
              autoFocus
              aria-invalid={Boolean(error)}
              disabled={checking}
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
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
              disabled={checking}
            >
              {checking ? "Проверяем..." : "Войти"}
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="btn btn--secondary btn--block"
            onClick={() => {
              setError("");
              setIsJoinOpen(true);
            }}
          >
            Войти по ссылке
          </button>
        )}
      </div>
    </main>
  );
}