export const STATUS_LABELS = {
    proposed: "Предложено",
    confirmed: "Подтверждено",
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
}));

export function errorMessage(err) {
    return err && err.message === "Failed to fetch"
        ? "Не удалось связаться с сервером"
        : (err && err.message) || "Что-то пошло не так";
}

export function validateStopForm({ title, day }) {
    const errors = {};

    const trimmedTitle = String(title).trim();
    if (!trimmedTitle) errors.title = "Введите название точки";

    const dayText = String(day).trim();
    const dayNumber = Number(dayText);
    if (!/^\d+$/.test(dayText) || !Number.isSafeInteger(dayNumber) || dayNumber < 1) {
        errors.day = "Номер дня — целое число от 1";
    }

    return {
        ok: Object.keys(errors).length === 0,
        errors,
        values: { title: trimmedTitle, day_number: dayNumber },
    };
}
export function getStopLocation(stop) {
    const { latitude, longitude } = stop;
    if (latitude == null || longitude == null) return null;
    const lat = Number(latitude);
    const lng = Number(longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { latitude: lat, longitude: lng } : null;
}

// Карта повторяется по горизонтали, клик может дать долготу вне ±180 — приводим к диапазону.
export function toCoordinates(location) {
    const { latitude, longitude } = location;
    if (longitude >= -180 && longitude <= 180) return { latitude, longitude };
    const wrapped = ((((longitude + 180) % 360) + 360) % 360) - 180;
    return { latitude, longitude: wrapped };
}

export function coordinatesPatch(initial, current) {
    if (!initial && !current) return {};
    if (
        initial && current &&
        initial.latitude === current.latitude &&
        initial.longitude === current.longitude
    ) return {};
    if (current) return toCoordinates(current);
    return { latitude: null, longitude: null };
}