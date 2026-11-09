// глупый
import { useState } from "react";

export default function TicketForm({ initialValues, isSaving, error, onSave, onCancel }) {
    const [link, setLink] = useState(initialValues.ticket_link);
    const [flightNumber, setFlightNumber] = useState(initialValues.flight_number);
    const [flightTime, setFlightTime] = useState(initialValues.flight_time);
    const [linkError, setLinkError] = useState("");

    function handleSubmit(event) {
        event.preventDefault(); // не даём браузеру перезагрузить страницу

        const trimmedLink = link.trim();
        if (trimmedLink && !/^https?:\/\//i.test(trimmedLink)) {
            setLinkError("Ссылка должна начинаться с http:// или https://");
            return;
        }
        setLinkError("");
        onSave({
            ticket_link: trimmedLink,
            flight_number: flightNumber.trim(),
            flight_time: flightTime,
        });
    }

    return (
        <form className="ticket-form" onSubmit={handleSubmit} noValidate>
            <div className="ticket-form__group">
                <label className="ticket-form__label" htmlFor="ticket-link">
                    Ссылка на билет
                </label>
                <input
                    id="ticket-link"
                    className="ticket-form__input"
                    type="text"
                    aria-invalid={Boolean(linkError)}
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://www.aviasales.com/search/MOW0209TBS1"
                />
                <p className="ticket-form__hint">
                    Для ссылки Aviasales направление и дата определятся автоматически
                </p>
                {linkError && <p className="ticket-form__error">{linkError}</p>}
            </div>

            <div className="ticket-form__group">
                <label className="ticket-form__label" htmlFor="ticket-flight">
                    Номер рейса
                </label>
                <input
                    id="ticket-flight"
                    className="ticket-form__input"
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="SU 1234"
                />
            </div>

            <div className="ticket-form__group">
                <label className="ticket-form__label" htmlFor="ticket-time">
                    Время вылета
                </label>
                <input
                    id="ticket-time"
                    className="ticket-form__input"
                    type="datetime-local"
                    value={flightTime}
                    onChange={(e) => setFlightTime(e.target.value)}
                />
            </div>

            {error && <p className="ticket-form__error">{error}</p>}

            <div className="ticket-form__actions">
                <button type="submit" className="btn btn--primary" disabled={isSaving}>
                    {isSaving ? "Сохраняем..." : "Сохранить"}
                </button>
                <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={onCancel}
                    disabled={isSaving}
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}