import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getTrip } from "../api/client.js";
import BudgetTab from "../components/budget/BudgetTab.jsx";
import ChecklistTab from "../components/checklist/ChecklistTab.jsx";
import ParticipantsList from "../components/participants/ParticipantsList.jsx";
import RouteTab from "../components/route/RouteTab.jsx";
import TicketsTab from "../components/tickets/TicketsTab.jsx";

const TABS = [
  { id: "route", title: "Маршрут" },
  { id: "budget", title: "Бюджет" },
  { id: "tickets", title: "Билеты" },
  { id: "checklist", title: "Чек-лист" },
];

// TODO (Frontend 1): оформить по макету, добавить окно с ссылкой-приглашением.
export default function TripPage() {
  const { inviteCode } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("route");

  useEffect(() => {
    getTrip(inviteCode).then(setTrip).catch((e) => setError(e.message));
  }, [inviteCode]);

  if (error) return <main className="page"><p className="error">{error}</p></main>;
  if (!trip) return <main className="page"><p>Загрузка...</p></main>;

  return (
    <main className="page">
      <h1>{trip.name}</h1>
      <ParticipantsList trip={trip} />

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={t.id === tab ? "tab tab-active" : "tab"}
            onClick={() => setTab(t.id)}
          >
            {t.title}
          </button>
        ))}
      </nav>

      {tab === "route" && <RouteTab trip={trip} />}
      {tab === "budget" && <BudgetTab trip={trip} />}
      {tab === "tickets" && <TicketsTab trip={trip} />}
      {tab === "checklist" && <ChecklistTab trip={trip} />}
    </main>
  );
}
