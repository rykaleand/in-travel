//глупый
const MONTHS = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function formatFlightTime(value) {
    const [datePart, timePart = ""] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    return `${day} ${MONTHS[month - 1]} ${year}, ${timePart.slice(0, 5)}`;
}

export default function TicketInfo({ ticket, onEdit }) {
    const { ticket_link, flight_number, flight_time, aviasales } = ticket;
    const isEmpty = !ticket_link && !flight_number && !flight_time;

    if (isEmpty) {
        return (
            <div className="tickets-empty">
                <p className="tickets-empty__title">Билет не добавлен</p>
                <p className="tickets-empty__text">
                    Добавьте ссылку на билет, номер рейса и время вылета
                </p>
                <button type="button" className="btn btn--primary" onClick={onEdit}>
                    Добавить
                </button>
            </div>
        );
    }

    return (
        <div className="ticket-info">
            {aviasales && (
                <p className="ticket-info__route">
                    {aviasales.origin} → {aviasales.destination}
                    <span className="ticket-info__date">
            {aviasales.day} {MONTHS[aviasales.month - 1]}
          </span>
                </p>
            )}

            <dl className="ticket-info__list">
                {ticket_link && (
                    <div className="ticket-info__row">
                        <dt className="ticket-info__label">Ссылка</dt>
                        <dd className="ticket-info__value">
                            <a href={ticket_link} target="_blank" rel="noopener noreferrer">
                                {ticket_link}
                            </a>
                        </dd>
                    </div>
                )}
                {flight_number && (
                    <div className="ticket-info__row">
                        <dt className="ticket-info__label">Рейс</dt>
                        <dd className="ticket-info__value">{flight_number}</dd>
                    </div>
                )}
                {flight_time && (
                    <div className="ticket-info__row">
                        <dt className="ticket-info__label">Вылет</dt>
                        <dd className="ticket-info__value">{formatFlightTime(flight_time)}</dd>
                    </div>
                )}
            </dl>

            <button type="button" className="btn btn--secondary" onClick={onEdit}>
                Изменить
            </button>
        </div>
    );
}