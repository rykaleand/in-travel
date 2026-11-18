import { useCallback, useEffect, useRef, useState } from "react";
import { addStop, deleteStop, getStops, updateStop } from "../../api/client";
import AddStopForm from "./AddStopForm";
import EditStopModal from "./EditStopModal";
import StopList from "./StopList";
import { errorMessage, getStopLocation } from "./stopUtils";
import "./route.css";
import RouteMap from "./RouteMap";


// Вкладка «Маршрут»: загружает точки, держит загрузку и ошибку
export default function RouteTab({ tripId }) {
    const [stops, setStops] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [actionError, setActionError] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [editingStop, setEditingStop] = useState(null);
    const requestId = useRef(0);

    const load = useCallback(
        async ({ silent = false } = {}) => {
            const id = ++requestId.current;
            if (!silent) setStops(null);
            setLoadError("");
            try {
                const data = await getStops(tripId);
                if (id === requestId.current) setStops(data);
            } catch (err) {
                if (id === requestId.current) setLoadError(errorMessage(err));
            }
        },
        [tripId]
    );

    useEffect(() => {
        load();
        return () => {
            requestId.current++;
        };
    }, [load]);

    async function handleAdd(data) {
        await addStop(tripId, data);
        setIsAdding(false);
        await load({ silent: true });
    }

    async function handleSave(stopId, data) {
        await updateStop(stopId, data);
        setEditingStop(null);
        await load({ silent: true });
    }

    async function handleDeleteFromModal(stopId) {
        await deleteStop(stopId);
        setEditingStop(null);
        await load({ silent: true });
    }

    async function handleDeleteFromCard(stop) {
        setActionError("");
        try {
            await deleteStop(stop.id);
            await load({ silent: true });
        } catch (err) {
            setActionError(errorMessage(err));
        }
    }

    if (loadError) {
        return (
            <div className="trip-state trip-state--error">
                <p>{loadError}</p>
                <button type="button" className="btn btn--primary" onClick={() => load()}>
                    Попробовать снова
                </button>
            </div>
        );
    }

    if (stops === null) {
        return (
            <div className="trip-state">
                <div className="trip-state__spinner" />
                <p>Загрузка...</p>
            </div>
        );
    }
    const hasMap = stops.some((stop) => getStopLocation(stop));

    return (
        <section className="route-tab">
            <div className="route-tab__head">
                <h2 className="route-tab__title">Маршрут</h2>
                {stops.length > 0 && !isAdding && (
                    <button type="button" className="btn btn--primary" onClick={() => setIsAdding(true)}>
                        Добавить точку
                    </button>
                )}
            </div>

            {actionError && (
                <p className="route-tab__error" role="alert">
                    {actionError}
                </p>
            )}

            {isAdding && <AddStopForm onSubmit={handleAdd} onCancel={() => setIsAdding(false)} />}

            {stops.length === 0 ? (
                !isAdding && (
                    <div className="route-tab__empty">
                        <p>Пока нет точек маршрута</p>
                        <button type="button" className="btn btn--primary" onClick={() => setIsAdding(true)}>
                            Добавить первую точку
                        </button>
                    </div>
                )
            ) : (
                <div className={"route-tab__body" + (hasMap ? " route-tab__body--with-map" : "")}>
                    <div className="route-tab__list">
                        <StopList stops={stops} onEdit={setEditingStop} onDelete={handleDeleteFromCard} />
                    </div>
                    {hasMap && (
                        <aside className="route-tab__map" aria-label="Карта маршрута">
                            <RouteMap stops={stops} />
                        </aside>
                    )}
                </div>
            )}

            {editingStop && (
                <EditStopModal
                    key={editingStop.id}
                    stop={editingStop}
                    onSave={handleSave}
                    onDelete={handleDeleteFromModal}
                    onClose={() => setEditingStop(null)}
                />
            )}
        </section>
    );
}
