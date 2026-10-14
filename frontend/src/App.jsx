import { Route, Routes } from "react-router-dom";

import CreateTripPage from "./pages/CreateTripPage.jsx";
import TripPage from "./pages/TripPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CreateTripPage />} />
      <Route path="/trip/:inviteCode" element={<TripPage />} />
    </Routes>
  );
}
