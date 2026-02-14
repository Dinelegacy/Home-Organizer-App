function showToast(message, type = "info") {
  const el = document.getElementById("toast");
  if (!el) return;

  el.className = `toast show ${type}`;
  el.textContent = message;

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.className = "toast";
    el.textContent = "";
  }, 2000);
}

const API_BASE = "http://127.0.0.1:3000";
const ITEMS_URL = `${API_BASE}/api/items`;
const MEALS_URL = `${API_BASE}/api/meals`;

const TOKEN = localStorage.getItem("token");
if (!TOKEN) window.location.href = "login.html";

function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${TOKEN}`, ...extra };
}

async function readError(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const body = await res.json().catch(() => ({}));
    return body.message || body.error || "Request failed";
  }
  const text = await res.text().catch(() => "");
  return text || `Error ${res.status}`;
}

async function apiFetch(url, options = {}) {
  return fetch(url, { ...options, headers: authHeaders(options.headers || {}) });
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

/* ---------- ITEMS ---------- */
const list = document.getElementById("missing-list");
const input = document.getElementById("missing-input");
const button = document.getElementById("missing-item");
const itemsMsg = document.getElementById("itemsMsg");
const itemSearch = document.getElementById("item-search");

let ALL_ITEMS = [];

function setItemsMsg(text = "", type = "") {
  if (!itemsMsg) return;
  itemsMsg.textContent = text;
  itemsMsg.className = `inlineMsg ${type}`.trim();
  if (text) setTimeout(() => setItemsMsg("", ""), 2000);
}

// render list based on a provided array
function renderItems(items) {
  list.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");

    const textSpan = document.createElement("span");
    textSpan.textContent = item.text;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.classList.add("iconBtn");
    removeBtn.setAttribute("aria-label", "Delete");
    removeBtn.addEventListener("click", async () => {
      li.classList.add("removing");
      const delRes = await apiFetch(`${ITEMS_URL}/${item._id}`, { method: "DELETE" });
      if (!delRes.ok) showToast(await readError(delRes), "error");
      setTimeout(loadItems, 200);
    });

    li.appendChild(textSpan);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

// ✅ Search: show "not found" ONLY when typing & no match (NOT when list empty)
if (itemSearch) {
  itemSearch.addEventListener("input", () => {
    const q = itemSearch.value.trim().toLowerCase();

    // empty search: reset + no message
    if (!q) {
      setItemsMsg("", "");
      renderItems(ALL_ITEMS);
      return;
    }

    // if there are 0 items total: no message
    if (ALL_ITEMS.length === 0) {
      setItemsMsg("", "");
      renderItems([]);
      return;
    }

    const filtered = ALL_ITEMS.filter((it) =>
      (it.text || "").toLowerCase().includes(q)
    );

    renderItems(filtered);

    if (filtered.length === 0) setItemsMsg(`No items found`, "info");
    else setItemsMsg("", "");
  });
}

async function loadItems() {
  const res = await apiFetch(ITEMS_URL);
  if (!res.ok) {
    list.innerHTML = `<li>${await readError(res)}</li>`;
    return;
  }

  ALL_ITEMS = await res.json();

  // keep search applied after reload
  const q = (itemSearch?.value || "").trim().toLowerCase();
  if (q) {
    const filtered = ALL_ITEMS.filter((it) =>
      (it.text || "").toLowerCase().includes(q)
    );
    renderItems(filtered);
    if (filtered.length === 0 && ALL_ITEMS.length > 0) setItemsMsg(`"${q}" not found`, "error");
    else setItemsMsg("", "");
  } else {
    renderItems(ALL_ITEMS);
    setItemsMsg("", "");
  }
}

button?.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  const res = await apiFetch(ITEMS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    setItemsMsg(await readError(res), "error");
    return;
  }

  setItemsMsg(`${text} added`, "success");
  input.value = "";
  loadItems();
});

input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    button.click();
  }
});

loadItems();

/* ---------- MEALS ---------- */
const mealInput = document.getElementById("meal-input");
const mealButton = document.getElementById("meal-button");
const mealList = document.getElementById("meal-list");
const mealDay = document.getElementById("meal-day");
const mealsMsg = document.getElementById("mealsMsg");

function setMealsMsg(text = "", type = "") {
  if (!mealsMsg) return;
  mealsMsg.textContent = text;
  mealsMsg.className = `inlineMsg ${type}`.trim();
  if (text) setTimeout(() => setMealsMsg("", ""), 1400);
}

async function loadMeals() {
  const res = await apiFetch(MEALS_URL);
  if (!res.ok) {
    mealList.innerHTML = `<li>${await readError(res)}</li>`;
    return;
  }

  const data = await res.json();
  mealList.innerHTML = "";

  data.forEach((meal) => {
    const li = document.createElement("li");

    const textSpan = document.createElement("span");
    textSpan.textContent = `${meal.day}: ${meal.text}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.classList.add("iconBtn");
    removeBtn.setAttribute("aria-label", "Delete");
    removeBtn.addEventListener("click", async () => {
      li.classList.add("removing");
      const delRes = await apiFetch(`${MEALS_URL}/${meal._id}`, { method: "DELETE" });
      if (!delRes.ok) showToast(await readError(delRes), "error");
      setTimeout(loadMeals, 200);
    });

    li.appendChild(textSpan);
    li.appendChild(removeBtn);
    mealList.appendChild(li);
  });
}

mealButton?.addEventListener("click", async () => {
  const day = mealDay.value;
  const text = mealInput.value.trim();
  if (!day || !text) return;

  const res = await apiFetch(MEALS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ day, text }),
  });

  if (!res.ok) {
    setMealsMsg(await readError(res), "error");
    return;
  }

  // ✅ your requested message
  setMealsMsg(`${day} meal saved`, "success");

  mealInput.value = "";
  mealDay.value = "";
  loadMeals();
});

mealInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    mealButton.click();
  }
});

loadMeals();