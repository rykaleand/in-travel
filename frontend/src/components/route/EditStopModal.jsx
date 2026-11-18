import { useEffect, useState } from "react";
import LocationPicker from "./LocationPicker";
import {
    STATUS_OPTIONS,
    coordinatesPatch,
    errorMessage,
    getStopLocation,
    validateStopForm,
} from "./stopUtils";

// Модальное окно редактирования точки
export default function EditStopModal({ stop, onSave, onDelete, onClose }) {
    const [title, setTitle] = useState(stop.title);
    const [day, setDay] = useState(String(stop.day_number));
    const [status, setStatus] = useState(stop.status);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [isBusy, setIsBusy] = useState(false);
    const [initialLocation] = useState(() => getStopLocation(stop));
    const [location, setLocation] = useState(initialLocation);

    useEffect(() => {
        function handleKey(event) {
            if (event.key === "Escape" && !isBusy) onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isBusy, onClose]);

    async function run(action) {
        setIsBusy(true);
        setSubmitError("");
        try {
            await action();
        } catch (err) {
            setSubmitError(errorMessage(err));
            setIsBusy(false);
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        const result = validateStopForm({ title, day });
        setErrors(result.errors);
        if (!result.ok) return;
        const coordinates = coordinatesPatch(initialLocation, location);
        run(() => onSave(stop.id, { ...result.values, status, ...coordinates }));
    }

    function handleDelete() {
        if (!window.confirm(`Удалить точку «${stop.title}»?`)) return;
        run(() => onDelete(stop.id));
    }

    return (
        <div
            className="stop-modal__backdrop"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isBusy) onClose();
            }}
        >
            <form
                className="stop-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-stop-heading"
                onSubmit={handleSubmit}
                noValidate
            >
                <h2 id="edit-stop-heading" className="stop-modal__title">
                    Редактирование точки
                </h2>

                <div className="stop-form__field">
                    <label htmlFor="edit-stop-title">Название точки</label>
                    <input
                        id="edit-stop-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        aria-invalid={Boolean(errors.title)}
                        autoFocus
                    />
                    {errors.title && <p className="stop-form__error">{errors.title}</p>}
                </div>

                <div className="stop-form__field stop-form__field--day">
                    <label htmlFor="edit-stop-day">День поездки</label>
                    <input
                        id="edit-stop-day"
                        type="text"
                        inputMode="numeric"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        aria-invalid={Boolean(errors.day)}
                    />
                    {errors.day && <p className="stop-form__error">{errors.day}</p>}
                </div>

                <div className="stop-form__field">
                    <label htmlFor="edit-stop-status">Статус</label>
                    <select id="edit-stop-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="stop-form__field">
                    <span className="stop-form__label">Место на карте</span>
                    <LocationPicker value={location} onChange={setLocation} />
                </div>

                {submitError && (
                    <p className="stop-form__error" role="alert">
                        {submitError}
                    </p>
                )}

                <div className="stop-form__actions">
                    <button type="submit" className="btn btn--primary" disabled={isBusy}>
                        {isBusy ? "Подождите..." : "Сохранить"}
                    </button>
                    <button
                        type="button"
                        className="btn btn--secondary route-danger"
                        onClick={handleDelete}
                        disabled={isBusy}
                    >
                        Удалить
                    </button>
                    <button type="button" className="btn btn--secondary" onClick={onClose} disabled={isBusy}>
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}