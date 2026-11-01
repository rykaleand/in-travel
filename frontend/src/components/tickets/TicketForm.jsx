// глупый
import { useState } from "react";

export default function TicketForm({ initialValues, isSaving, error, onSave, onCancel }) {
    const [link, setLink] = useState(initialValues.ticket_link);
    const [flightNumber, setFlightNumber] = useState(initialValues.flight_number);
    const [flightTime, setFlightTime] = useState(initialValues.flight_time);
    const [linkError, setLinkError] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
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
            <label htmlFor="ticket-link">Ссылка на билет</label>
            <input
                id="ticket-link"
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://www.aviasales.com/search/MOW0209TBS1"
            />
            {linkError && <p className="form-error">{linkError}</p>}

            <label htmlFor="ticket-flight">Номер рейса</label>
            <input
                id="ticket-flight"
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="SU 1234"
            />

            <label htmlFor="ticket-time">Время вылета</label>
            <input
                id="ticket-time"
                type="datetime-local"
                value={flightTime}
                onChange={(e) => setFlightTime(e.target.value)}
            />

            {error && <p className="form-error">{error}</p>}

            <div className="ticket-form-buttons">
                <button type="submit" disabled={isSaving}>
                    {isSaving ? "Сохраняем..." : "Сохранить"}
                </button>
                <button type="button" onClick={onCancel} disabled={isSaving}>
                    Отмена
                </button>
            </div>
        </form>
    );
}