// Корневой компонент: здесь описано, какой экран показывать на каждом адресе.
// Владелец: Frontend 1.
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import CreateTripPage from "./pages/CreateTripPage.jsx";
import TripPage from "./pages/TripPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import JoinTripPage from "./pages/JoinTripPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* стартовая: две кнопки «Создать» и «Войти по ссылке» */}
        <Route path="/" element={<LandingPage />} />
        {/* создание поездки: только название */}
        <Route path="/trip/new" element={<CreateTripPage />} />
        {/* присоединение к поездке: ввод имени и фамилии */}
        <Route path="/join/:invite_code" element={<JoinTripPage />} />
        {/* страница поездки: код приглашения берём из адреса */}
        <Route path="/trip/:invite_code" element={<TripPage />} />
        {/* всё остальное: показываем «Страница не найдена», а не пустой экран */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
