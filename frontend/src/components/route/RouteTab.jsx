import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { addStop, deleteStop, getStops, updateStop } from "../../api/client";
import AddStopForm from "./AddStopForm";
import EditStopModal from "./EditStopModal";
import StopList from "./StopList";
import { errorMessage, getStopLocation } from "./stopUtils";
import "./route.css";
const RouteMap = lazy(() => import("./RouteMap"));

function sortStops(stops) {
    return [...stops].sort((first, second) => first.day_number - second.day_number || first.id - second.id);
}

function MapLoading() {
    return <div className="route-map route-map--loading">Загружаем карту…</div>;
}


// Вкладка «Маршрут»: загружает точки, держит загрузку и ошибку
export default function RouteTab({ tripId }) {
    const [stops, setStops] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [actionError, setActionError] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [editingStop, setEditingStop] = useState(null);
    const [confirmingStopId, setConfirmingStopId] = useState(null);
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
        const created = await addStop(tripId, data);
        setStops((current) => sortStops([...current, created]));
        setIsAdding(false);
    }

    async function handleSave(stopId, data) {
        const updated = await updateStop(stopId, data);
        setStops((current) => sortStops(current.map((stop) => stop.id === stopId ? updated : stop)));
        setEditingStop(null);
    }

    async function handleDeleteFromModal(stopId) {
        await deleteStop(stopId);
        setStops((current) => current.filter((stop) => stop.id !== stopId));
        setEditingStop(null);
    }

    async function handleDeleteFromCard(stop) {
        setActionError("");
        try {
            await deleteStop(stop.id);
            setStops((current) => current.filter((item) => item.id !== stop.id));
        } catch (err) {
            setActionError(errorMessage(err));
        }
    }

    async function handleConfirmStop(stop) {
        setActionError("");
        setConfirmingStopId(stop.id);
        try {
            const updated = await updateStop(stop.id, { status: "confirmed" });
            setStops((current) => current.map((item) => item.id === stop.id ? updated : item));
        } catch (err) {
            setActionError(errorMessage(err));
        } finally {
            setConfirmingStopId(null);
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
                        <StopList
                            stops={stops}
                            onEdit={setEditingStop}
                            onDelete={handleDeleteFromCard}
                            onConfirm={handleConfirmStop}
                            confirmingStopId={confirmingStopId}
                        />
                    </div>
                    {hasMap && (
                        <aside className="route-tab__map" aria-label="Карта маршрута">
                            <Suspense fallback={<MapLoading />}>
                                <RouteMap stops={stops} />
                            </Suspense>
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
