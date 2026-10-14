// ПРИМЕР страницы: загружает данные с бэкенда и показывает их.
// Страница отвечает за данные и три состояния (загрузка, ошибка, пусто),
// а как выглядит список, решает компонент.
import { useEffect, useState } from "react";

import { getTrips } from "../api/client.js";
import TripList from "../components/example/TripList.jsx";

export default function ExamplePage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Загружаем список один раз, когда страница появилась на экране.
  useEffect(() => {
    getTrips()
      .then(setTrips)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;
  if (trips.length === 0) return <p>Поездок пока нет</p>;

  return (
    <main>
      <h1>Все поездки (пример)</h1>
      <TripList trips={trips} />
    </main>
  );
}
