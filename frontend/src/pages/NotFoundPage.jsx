// Заглушка для адреса, которого нет в маршрутах: опечатка в ссылке, /trip без кода и т.п.
// Без этой страницы такой адрес показывал бы пустой белый экран.
// Владелец: Frontend 1.
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page">
      <div className="page__card">
        <h1 className="page__title">Страница не найдена</h1>
        <p className="page__text">
          Такого адреса нет. Чтобы войти в готовую поездку, откройте ссылку вида
          /trip/код-приглашения или начните новую поездку.
        </p>

        <Link to="/trip/new" className="btn btn--primary btn--block">
          Создать поездку
        </Link>
        <Link to="/" className="btn btn--secondary btn--block">
          На главную
        </Link>
      </div>
    </main>
  );
}
