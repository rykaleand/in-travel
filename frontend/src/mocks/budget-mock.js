// ТОЛЬКО ДЛЯ ЛОКАЛЬНОГО ПРОСМОТРА вкладки бюджета без бэкенда.
// Подменяет fetch: на запросы участников и трат отвечает выдуманными данными
// в том же формате, что и сервер (задача #9). Остальные запросы уходят как обычно.
// Подключается в App.jsx вызовом installBudgetMock().

const participants = [
  { id: 1, trip_id: 1, first_name: "Анна", last_name: "Иванова" },
  { id: 2, trip_id: 1, first_name: "Борис", last_name: "Петров" },
  { id: 3, trip_id: 1, first_name: "Вера", last_name: "Смирнова" },
];

let expenses = [
  makeExpense(1, "еда", 1, 1500, [1, 2, 3]),
  makeExpense(2, "транспорт", 2, 600, [1, 2]),
];
let nextId = 3;

// Делим сумму поровну, лишние копейки раздаём по одной, как сервер:
// 100 на троих = 33.34 + 33.33 + 33.33.
function splitAmount(amount, ids) {
  const totalCents = Math.round(amount * 100);
  const base = Math.floor(totalCents / ids.length);
  let rest = totalCents - base * ids.length;
  return ids.map((id) => {
    const cents = base + (rest > 0 ? 1 : 0);
    rest -= 1;
    return { participant_id: id, share_amount: cents / 100 };
  });
}

function makeExpense(id, category, payerId, amount, ids) {
  return { id, trip_id: 1, category, payer_id: payerId, amount, shares: splitAmount(amount, ids) };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Небольшая задержка, чтобы было видно состояние загрузки.
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let installed = false;

export function installBudgetMock() {
  if (installed) return;
  installed = true;

  const realFetch = window.fetch.bind(window);

  window.fetch = async (url, options = {}) => {
    const path = new URL(url, window.location.origin).pathname;
    const method = (options.method || "GET").toUpperCase();

    if (path.endsWith("/participants") && method === "GET") {
      await wait(400);
      return jsonResponse(participants);
    }

    if (path.endsWith("/expenses") && method === "GET") {
      await wait(400);
      return jsonResponse(expenses);
    }

    if (path.endsWith("/expenses") && method === "POST") {
      await wait(400);
      const body = JSON.parse(options.body);
      if (!(body.amount > 0)) return jsonResponse({ error: "Сумма должна быть больше нуля" }, 400);
      if (!body.participant_ids?.length) return jsonResponse({ error: "Выберите участников" }, 400);
      const created = makeExpense(nextId++, body.category, body.payer_id, body.amount, body.participant_ids);
      expenses = [...expenses, created];
      return jsonResponse(created, 201);
    }

    return realFetch(url, options);
  };
}
