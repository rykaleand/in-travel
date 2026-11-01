// Вкладка билетов: ссылка Aviasales, рейс, время.
// Владелец: Frontend 3.
// умный
import { useState } from "react";
import { updateTicket } from "../../api/client";
import TicketInfo from "./TicketInfo";
import TicketForm from "./TicketForm";
import "./tickets.css";


export default function TicketsTab({ trip }) {
    const [savedTicket, setSavedTicket] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // Поездка ещё не загрузилась (страница передаёт null)
    if (!trip) {
        return <p className="tickets-message">Загрузка...</p>;
    }

    const ticket = savedTicket ?? trip;

    function openForm() {
        setError("");
        setIsEditing(true);
    }

    function closeForm() {
        setError("");
        setIsEditing(false);
    }

    async function handleSave(values) {
        setIsSaving(true);
        setError("");
        try {
            const result = await updateTicket(trip.id, values);
            setSavedTicket(result);
            setIsEditing(false);
        } catch (err) {
            setError(
                err.message === "Failed to fetch"
                    ? "Не удалось связаться с сервером. Попробуйте ещё раз"
                    : err.message
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <section className="tickets-tab">
            <h2>Билеты</h2>
            {isEditing ? (
                <TicketForm
                    initialValues={{
                        ticket_link: ticket.ticket_link ?? "",
                        flight_number: ticket.flight_number ?? "",
                        flight_time: (ticket.flight_time ?? "").slice(0, 16),
                    }}
                    isSaving={isSaving}
                    error={error}
                    onSave={handleSave}
                    onCancel={closeForm}
                />
            ) : (
                <TicketInfo ticket={ticket} onEdit={openForm} />
            )}
        </section>
    );
}
