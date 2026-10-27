// Сервер может прислать сумму строкой ("12.50"). Приводим к числу.
export function toNumber(value) {
  const n = Number(value);
  if (Number.isNaN(n)) {
    console.error("Ожидалось число, пришло:", value);
  }
  return n;
}

// Полное имя участника: «Анна Иванова».
export function fullName(participant) {
  return `${participant.first_name} ${participant.last_name}`.trim();
}

// Инициалы участника для кружков-аватарок: «АИ».
export function getInitials(participant) {
  const first = participant.first_name?.[0] || "";
  const last = participant.last_name?.[0] || "";
  return (first + last).toUpperCase();
}
