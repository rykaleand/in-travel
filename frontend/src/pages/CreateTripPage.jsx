import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createTrip } from "../api/client.js";

// TODO (Frontend 1): оформить по макету, добавить добавление участников при создании.
export default function CreateTripPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const trip = await createTrip(name);
      navigate(`/trip/${trip.invite_code}`);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="page">
      <h1>ВПуть</h1>
      <p>Создайте поездку и отправьте друзьям ссылку.</p>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название поездки"
        />
        <button type="submit">Создать</button>
      </form>
      {error && <p className="error">{error}</p>}
    </main>
  );
}
