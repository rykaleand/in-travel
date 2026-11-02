// Вкладка билетов: ссылка Aviasales, рейс, время.
// Владелец: Frontend 3.
// умный
import { useState } from "react";
import { updateTicket } from "../../api/client";
import TicketInfo from "./TicketInfo";
import TicketForm from "./TicketForm";
import "./tickets.css";

export default function TicketsTab({ trip, onTicketSaved }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    if (!trip) {
        return (
            <section className="tickets-tab">
                <div className="tickets-state">
                    <div className="spinner" />
                    <p>Загрузка...</p>
                </div>
            </section>
        );
    }

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
            onTicketSaved(result);
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
            <div className="tickets-tab__header">
                <h2 className="tickets-tab__title">Билеты</h2>
            </div>

            <div className="tickets-card">
                {isEditing ? (
                    <TicketForm
                        initialValues={{
                            ticket_link: trip.ticket_link ?? "",
                            flight_number: trip.flight_number ?? "",
                            flight_time: (trip.flight_time ?? "").slice(0, 16),
                        }}
                        isSaving={isSaving}
                        error={error}
                        onSave={handleSave}
                        onCancel={closeForm}
                    />
                ) : (
                    <TicketInfo ticket={trip} onEdit={openForm} />
                )}
            </div>
        </section>
    );
}