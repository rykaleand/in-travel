import { STATUS_LABELS } from "./stopUtils";

export default function StopCard({ stop, onEdit, onDelete }) {
    function handleDelete() {
        if (window.confirm(`Удалить точку «${stop.title}»?`)) onDelete(stop);
    }

    return (
        <li className="stop-card">
            <div className="stop-card__main">
                <p className="stop-card__title">{stop.title}</p>
                <span className={"stop-card__status stop-card__status--" + stop.status}>
                    {STATUS_LABELS[stop.status] ?? stop.status}
                </span>
            </div>
            <div className="stop-card__actions">
                <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => onEdit(stop)}
                    aria-label={`Редактировать точку «${stop.title}»`}
                >
                    Редактировать
                </button>
                <button
                    type="button"
                    className="btn btn--secondary route-danger"
                    onClick={handleDelete}
                    aria-label={`Удалить точку «${stop.title}»`}
                >
                    Удалить
                </button>
            </div>
        </li>
    );
}