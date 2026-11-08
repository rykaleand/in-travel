import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTripByCode } from "../api/client";
import Layout from "../components/layout/Layout";
import TicketsTab from "../components/tickets/TicketsTab";
import BudgetTab from "../components/budget/BudgetTab";
import ChecklistTab from "../components/checklist/ChecklistTab";
import "./trip-page.css";



const TABS = [
    { id: "route", label: "Маршрут", icon: "route", owner: "Frontend 2" },
    { id: "budget", label: "Бюджет", icon: "wallet", owner: "Frontend 3" },
    { id: "tickets", label: "Билеты", icon: "plane", owner: "Frontend 3" },
    { id: "checklist", label: "Чек-лист", icon: "checklist", owner: "Frontend 3" },
    { id: "participants", label: "Участники", icon: "users", owner: "Frontend 1" },
];

export default function TripPage() {
    const { invite_code } = useParams();
    const [activeTab, setActiveTab] = useState(TABS[0].id);
    const [trip, setTrip] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setTrip(null);
        setLoadError("");
        getTripByCode(invite_code)
            .then((data) => {
                if (cancelled) return;
                // Во вкладки уходит числовой id, без него показать разделы не можем.
                if (!Number.isInteger(data?.id)) {
                    throw new Error("Сервер прислал данные в неожиданном формате");
                }
                setTrip(data);
            })
            .catch((err) => {
                // Понятный текст ошибки (в том числе «сервер недоступен») готовит request() в api/client.js.
                if (!cancelled) setLoadError(err.message);
            });
        return () => {
            cancelled = true;
        };
    }, [invite_code, reloadKey]);

    function handleTicketSaved(ticket) {
        setTrip((prev) => {
            // Ответ предыдущей поездки не должен менять текущую или ещё загружающуюся.
            if (!prev || prev.id !== ticket.trip_id) return prev;

            return {
                ...prev,
                ticket_link: ticket.ticket_link,
                flight_number: ticket.flight_number,
                flight_time: ticket.flight_time,
                aviasales: ticket.aviasales,
            };
        });
    }

    function renderContent() {
        if (loadError) {
            return (
                <div className="trip-state trip-state--error state-error-icon" role="alert">
                    <p className="trip-state__title">Не удалось загрузить поездку</p>
                    <p>{loadError}</p>
                    <button type="button" className="btn btn--secondary" onClick={() => setReloadKey((k) => k + 1)}>
                        Попробовать снова
                    </button>
                </div>
            );
        }
        if (!trip) {
            return (
                <div className="trip-state">
                    <div className="trip-state__spinner" />
                    <p>Загрузка...</p>
                </div>
            );
        }
        switch (activeTab) {
            case "tickets":
                return <TicketsTab trip={trip} onTicketSaved={handleTicketSaved} />;
            // key={trip.id}: в другой поездке вкладка создаётся заново и не покажет данные предыдущей.
            case "budget":
                return <BudgetTab key={trip.id} tripId={trip.id} />;
            case "checklist":
                return <ChecklistTab key={trip.id} tripId={trip.id} />;
            default: {
                const tab = TABS.find((item) => item.id === activeTab);
                return (
                    <div className="tab-stub">
                        <p className="tab-stub__title">{tab.label}</p>
                        <p className="tab-stub__text">Раздел в разработке. Отвечает: {tab.owner}.</p>
                    </div>
                );
            }
        }
    }

    return (
        <Layout
            title={trip ? trip.name : "Поездка"}
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderContent()}
        </Layout>
    );
}
