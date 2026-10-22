// Сервер может прислать сумму строкой ("12.50"). Приводим к числу.
export function toNumber(value) {
  const n = Number(value);
  if (Number.isNaN(n)) {
    console.error("Ожидалось число, пришло:", value);
  }
  return n;
}
