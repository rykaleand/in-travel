import { STATUS_LABELS } from "./stopUtils";

export default function StopCard({ stop, onEdit, onDelete, onConfirm, isConfirming }) {
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
                {stop.status === "proposed" && (
                    <button
                        type="button"
                        className="stop-card__icon-button stop-card__confirm"
                        onClick={() => onConfirm(stop)}
                        disabled={isConfirming}
                        aria-label={`Подтвердить место «${stop.title}»`}
                        title="Подтвердить место"
                        data-tooltip="Подтвердить место"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m5 12.5 4.2 4.2L19 7" />
                        </svg>
                    </button>
                )}
                <button
                    type="button"
                    className="stop-card__icon-button stop-card__edit"
                    onClick={() => onEdit(stop)}
                    aria-label={`Редактировать точку «${stop.title}»`}
                    title="Редактировать"
                    data-tooltip="Редактировать"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2 4 20Z" />
                        <path d="m14.5 7.1 2.8 2.8" />
                    </svg>
                </button>
                <button
                    type="button"
                    className="stop-card__icon-button stop-card__delete"
                    onClick={handleDelete}
                    aria-label={`Удалить точку «${stop.title}»`}
                    title="Удалить"
                    data-tooltip="Удалить"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 7h16" />
                        <path d="M9 7V4h6v3" />
                        <path d="m6 7 1 13h10l1-13" />
                        <path d="M10 11v5M14 11v5" />
                    </svg>
                </button>
            </div>
        </li>
    );
}
