function showToast(message, type = "info") {
  const el = document.getElementById("toast");
  if (!el) return;

  el.className = `toast show ${type}`;
  el.innerHTML = message;

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.className = "toast";
  }, 3200); // stays a bit longer now
}

const API_BASE = "http://127.0.0.1:3000";
const ITEMS_URL = `${API_BASE}/api/items`;
const MEALS_URL = `${API_BASE}/api/meals`;

const TOKEN = localStorage.getItem("token");
if (!TOKEN) {
  window.location.href = "login.html";
}

function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${TOKEN}`,
    ...extra,
  };
}

async function readError(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const body = await res.json().catch(() => ({}));
    return body.message || body.error || JSON.stringify(body);
  }
  const text = await res.text().catch(() => "");
  return text || `Error ${res.status}`;
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: authHeaders(options.headers || {}),
  });

  if (!res.ok) {
    let errText = "";
    try {
      errText = await res.clone().text();
    } catch { }
    console.log("API ERROR:", res.status, url, errText);
  }

  return res;
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

/* =========================
   ITEMS + SEARCH
========================= */

const list = document.getElementById("missing-list");
const input = document.getElementById("missing-input");
const button = document.getElementById("missing-item");
const itemSearch = document.getElementById("item-search"); // <-- add this input in app.html

let itemsCache = [];

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
      setTimeout(loadItems, 250);
    });

    li.appendChild(textSpan);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

function applyItemFilter() {
  const q = (itemSearch?.value || "").trim().toLowerCase();

  const filtered = q
    ? itemsCache.filter((i) => i.text.toLowerCase().includes(q))
    : itemsCache;

  if (filtered.length === 0) {
    list.innerHTML = `
      <li class="emptyState">
        🔍 No items found<br/>
        <small>Try another keyword.</small>
      </li>
    `;
    return;
  }

  renderItems(filtered);
}

async function loadItems() {
  const res = await apiFetch(ITEMS_URL);

  if (!res.ok) {
    const msg = await readError(res);
    list.innerHTML = `<li>${msg}</li>`;
    return;
  }

  itemsCache = await res.json();
  applyItemFilter();
}

itemSearch?.addEventListener("input", applyItemFilter);

// Enter key = add item
input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    button?.click();
  }
});

button?.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  const res = await apiFetch(ITEMS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    showToast(await readError(res), "error");
    return;
  }

  input.value = "";
  showToast("✔ Item added successfully", "success");
  loadItems();
});

loadItems();

/* =========================
   MEALS
========================= */

const mealInput = document.getElementById("meal-input");
const mealButton = document.getElementById("meal-button");
const mealList = document.getElementById("meal-list");
const mealDay = document.getElementById("meal-day");

// Enter key = add meal
mealInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    mealButton?.click();
  }
});

async function loadMeals() {
  const res = await apiFetch(MEALS_URL);

  if (!res.ok) {
    const msg = await readError(res);
    mealList.innerHTML = `<li>${msg}</li>`;
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
      setTimeout(loadMeals, 250);
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
    showToast(await readError(res), "error");
    return;
  }

  showToast("✔ Meal added successfully", "success");
  mealInput.value = "";
  mealDay.value = "";
  loadMeals();
});

loadMeals();