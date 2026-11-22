// Вкладка билетов: получает список, создаёт, редактирует и удаляет билеты поездки.
import { useCallback, useEffect, useState } from "react";
import { createTicket, deleteTicket, getTickets, updateTicket } from "../../api/client";
import TicketInfo from "./TicketInfo";
import TicketForm from "./TicketForm";
import "./tickets.css";

const EMPTY_TICKET = {
    ticket_link: "",
    flight_number: "",
    flight_time: "",
};

export default function TicketsTab({ tripId }) {
    const [tickets, setTickets] = useState(null);
    const [editingTicket, setEditingTicket] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [loadError, setLoadError] = useState("");

    const loadTickets = useCallback(async () => {
        setLoadError("");
        try {
            setTickets(await getTickets(tripId));
        } catch (err) {
            setLoadError(err.message);
        }
    }, [tripId]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    function openCreateForm() {
        setError("");
        setEditingTicket(EMPTY_TICKET);
    }

    function closeForm() {
        setError("");
        setEditingTicket(null);
    }

    async function handleSave(values) {
        setIsSaving(true);
        setError("");
        try {
            if (editingTicket.id) {
                await updateTicket(editingTicket.id, values);
            } else {
                await createTicket(tripId, values);
            }
            closeForm();
            await loadTickets();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(ticket) {
        if (!window.confirm("Удалить этот билет?")) return;
        setError("");
        try {
            await deleteTicket(ticket.id);
            await loadTickets();
        } catch (err) {
            setError(err.message);
        }
    }

    if (loadError) {
        return (
            <section className="tickets-tab">
                <div className="tickets-state tickets-state--error" role="alert">
                    <p>{loadError}</p>
                    <button type="button" className="btn btn--primary" onClick={loadTickets}>
                        Попробовать снова
                    </button>
                </div>
            </section>
        );
    }

    if (tickets === null) {
        return (
            <section className="tickets-tab">
                <div className="tickets-state">
                    <div className="spinner" />
                    <p>Загрузка...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="tickets-tab">
            <div className="tickets-tab__header">
                <h2 className="tickets-tab__title">Билеты</h2>
                {!editingTicket && tickets.length > 0 && (
                    <button type="button" className="btn btn--primary" onClick={openCreateForm}>
                        Добавить билет
                    </button>
                )}
            </div>

            <div className="tickets-card">
                {error && !editingTicket && <p className="ticket-form__error" role="alert">{error}</p>}
                {editingTicket ? (
                    <TicketForm
                        initialValues={{
                            ticket_link: editingTicket.ticket_link ?? "",
                            flight_number: editingTicket.flight_number ?? "",
                            flight_time: (editingTicket.flight_time ?? "").slice(0, 16),
                        }}
                        isSaving={isSaving}
                        error={error}
                        onSave={handleSave}
                        onCancel={closeForm}
                    />
                ) : tickets.length === 0 ? (
                    <div className="tickets-empty">
                        <p className="tickets-empty__title">Билеты не добавлены</p>
                        <p className="tickets-empty__text">Добавьте ссылку на билет, номер рейса и время вылета</p>
                        <button type="button" className="btn btn--primary" onClick={openCreateForm}>
                            Добавить билет
                        </button>
                    </div>
                ) : (
                    <div className="tickets-list">
                        {tickets.map((ticket) => (
                            <TicketInfo
                                key={ticket.id}
                                ticket={ticket}
                                onEdit={() => {
                                    setError("");
                                    setEditingTicket(ticket);
                                }}
                                onDelete={() => handleDelete(ticket)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
