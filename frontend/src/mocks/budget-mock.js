// ТОЛЬКО ДЛЯ ЛОКАЛЬНОГО ПРОСМОТРА вкладки бюджета без бэкенда.
// Подменяет fetch: на запросы участников, трат и балансов отвечает выдуманными данными
// в том же формате, что и сервер (задачи #9 и #10). Остальные запросы уходят как обычно.
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

// Балансы и переводы считаем так же, как сервер (#10), только в копейках:
// баланс = сколько заплатил минус его доли; переводы жадно, от самого большого должника
// к самому большому кредитору.
function calculateBalances() {
  const cents = {};
  for (const p of participants) cents[p.id] = 0;
  for (const e of expenses) {
    cents[e.payer_id] += Math.round(e.amount * 100);
    for (const s of e.shares) cents[s.participant_id] -= Math.round(s.share_amount * 100);
  }

  const nameOf = (id) => {
    const p = participants.find((x) => x.id === id);
    return `${p.first_name} ${p.last_name}`;
  };
  const balances = participants.map((p) => ({
    participant_id: p.id,
    name: nameOf(p.id),
    balance: cents[p.id] / 100,
  }));

  const creditors = participants.filter((p) => cents[p.id] > 0).map((p) => ({ id: p.id, left: cents[p.id] }));
  const debtors = participants.filter((p) => cents[p.id] < 0).map((p) => ({ id: p.id, left: -cents[p.id] }));
  const transfers = [];
  while (creditors.length && debtors.length) {
    creditors.sort((a, b) => b.left - a.left);
    debtors.sort((a, b) => b.left - a.left);
    const sum = Math.min(creditors[0].left, debtors[0].left);
    transfers.push({ from: nameOf(debtors[0].id), to: nameOf(creditors[0].id), amount: sum / 100 });
    creditors[0].left -= sum;
    debtors[0].left -= sum;
    if (creditors[0].left === 0) creditors.shift();
    if (debtors[0].left === 0) debtors.shift();
  }
  return { balances, transfers };
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

    if (path.endsWith("/balances") && method === "GET") {
      await wait(400);
      return jsonResponse(calculateBalances());
    }

    return realFetch(url, options);
  };
}
