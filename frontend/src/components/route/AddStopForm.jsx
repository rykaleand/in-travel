import { lazy, Suspense, useState } from "react";
import { errorMessage, toCoordinates, validateStopForm } from "./stopUtils";

const LocationPicker = lazy(() => import("./LocationPicker"));

// Форма добавления точки
//   onSubmit(data) — async, при ошибке бросает исключение;
//   onCancel() — закрыть форму
export default function AddStopForm({ onSubmit, onCancel, defaultDay = 1 }) {
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState(null);
    const [day, setDay] = useState(String(defaultDay));
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const result = validateStopForm({ title, day });
        setErrors(result.errors);
        if (!result.ok) return;

        setIsSaving(true);
        setSubmitError("");
        try {
            const data = { ...result.values, status: "proposed" };
            if (location) Object.assign(data, toCoordinates(location));
            await onSubmit(data);
        } catch (err) {
            setSubmitError(errorMessage(err));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form className="stop-form" onSubmit={handleSubmit} noValidate>
            <div className="stop-form__field">
                <label htmlFor="add-stop-title">Название точки</label>
                <input
                    id="add-stop-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    aria-invalid={Boolean(errors.title)}
                    autoFocus
                />
                {errors.title && <p className="stop-form__error">{errors.title}</p>}
            </div>

            <div className="stop-form__field stop-form__field--day">
                <label htmlFor="add-stop-day">День поездки</label>
                <input
                    id="add-stop-day"
                    type="text"
                    inputMode="numeric"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    aria-invalid={Boolean(errors.day)}
                />
                {errors.day && <p className="stop-form__error">{errors.day}</p>}
            </div>

            <div className="stop-form__field">
                <span className="stop-form__label">Место на карте (необязательно)</span>
                <Suspense fallback={<div className="location-picker location-picker--loading">Загружаем карту…</div>}>
                    <LocationPicker
                        value={location}
                        onChange={setLocation}
                        onPlaceSelect={setTitle}
                    />
                </Suspense>
            </div>

            {submitError && (
                <p className="stop-form__error" role="alert">
                    {submitError}
                </p>
            )}

            <div className="stop-form__actions">
                <button type="submit" className="btn btn--primary" disabled={isSaving}>
                    {isSaving ? "Сохраняем..." : "Сохранить"}
                </button>
                <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={isSaving}>
                    Отмена
                </button>
            </div>
        </form>
    );
}
