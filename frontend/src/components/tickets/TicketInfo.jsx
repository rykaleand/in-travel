//глупый
const MONTHS = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

// "2026-11-05T14:30:00" -> "5 ноября 2026, 14:30"
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
            <div className="ticket-info">
                <p className="tickets-message">Билет не добавлен</p>
                <button type="button" onClick={onEdit}>Добавить</button>
            </div>
        );
    }

    return (
        <div className="ticket-info">
            {aviasales && (
                <p className="ticket-route">
                    {aviasales.origin} → {aviasales.destination},{" "}
                    {aviasales.day} {MONTHS[aviasales.month - 1]}
                </p>
            )}
            {ticket_link && (
                <p>
                    Ссылка:{" "}
                    <a href={ticket_link} target="_blank" rel="noopener noreferrer">
                        {ticket_link}
                    </a>
                </p>
            )}
            {flight_number && <p>Рейс: {flight_number}</p>}
            {flight_time && <p>Вылет: {formatFlightTime(flight_time)}</p>}
            <button type="button" onClick={onEdit}>Изменить</button>
        </div>
    );
}