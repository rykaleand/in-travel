// ТОЛЬКО ДЛЯ ЛОКАЛЬНОГО ПРОСМОТРА вкладки чек-листа без бэкенда.
// Подменяет fetch: на запросы чек-листа отвечает выдуманными данными
// в том же формате, что и сервер (задача #48). Остальные запросы уходят как обычно.
// Подключается в App.jsx вызовом installChecklistMock().

let items = [
  { id: 1, trip_id: 1, title: "Взять паспорта", is_checked: true },
  { id: 2, trip_id: 1, title: "Купить страховку", is_checked: false },
  { id: 3, trip_id: 1, title: "Зарядка и переходник для розетки", is_checked: false },
];
let nextId = 4;

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

export function installChecklistMock() {
  if (installed) return;
  installed = true;

  const realFetch = window.fetch.bind(window);

  window.fetch = async (url, options = {}) => {
    const path = new URL(url, window.location.origin).pathname;
    const method = (options.method || "GET").toUpperCase();

    // GET /trips/<id>/checklist
    if (path.endsWith("/checklist") && method === "GET") {
      await wait(400);
      return jsonResponse(items);
    }

    // POST /trips/<id>/checklist: title непустой, is_checked по умолчанию false
    if (path.endsWith("/checklist") && method === "POST") {
      await wait(400);
      const body = JSON.parse(options.body);
      const title = (body.title || "").trim();
      if (!title) return jsonResponse({ error: "Название пункта не может быть пустым" }, 400);
      const created = { id: nextId++, trip_id: 1, title, is_checked: false };
      items = [...items, created];
      return jsonResponse(created, 201);
    }

    // PUT /checklist/<id>: is_checked только true или false
    const match = path.match(/\/checklist\/(\d+)$/);
    if (match && method === "PUT") {
      await wait(300);
      const body = JSON.parse(options.body);
      if (typeof body.is_checked !== "boolean") {
        return jsonResponse({ error: "is_checked должен быть true или false" }, 400);
      }
      const item = items.find((x) => x.id === Number(match[1]));
      if (!item) return jsonResponse({ error: "Пункт не найден" }, 404);
      const updated = { ...item, is_checked: body.is_checked };
      items = items.map((x) => (x.id === updated.id ? updated : x));
      return jsonResponse(updated);
    }

    return realFetch(url, options);
  };
}
