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