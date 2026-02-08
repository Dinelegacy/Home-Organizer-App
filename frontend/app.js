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
  // try JSON first, fallback to text
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

  // helpful debug
  if (!res.ok) {
    let errText = "";
    try {
      errText = await res.clone().text();
    } catch { }
    console.log("API ERROR:", res.status, url, errText);
  }

  return res;
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

// ---- ITEMS ----
const list = document.getElementById("missing-list");
const input = document.getElementById("missing-input");
const button = document.getElementById("missing-item");

async function loadItems() {
  const res = await apiFetch(ITEMS_URL);

  if (!res.ok) {
    const msg = await readError(res);
    list.innerHTML = `<li>${msg}</li>`;
    return;
  }

  const data = await res.json();
  list.innerHTML = "";

  data.forEach((item) => {
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
      if (!delRes.ok) alert(await readError(delRes));
      setTimeout(loadItems, 250);
    });

    li.appendChild(textSpan);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

button.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  const res = await apiFetch(ITEMS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    alert(await readError(res)); // 
    return;
  }

  input.value = "";
  loadItems();
});

loadItems();

// ---- MEALS ----
const mealInput = document.getElementById("meal-input");
const mealButton = document.getElementById("meal-button");
const mealList = document.getElementById("meal-list");
const mealDay = document.getElementById("meal-day");

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
      if (!delRes.ok) alert(await readError(delRes));
      setTimeout(loadMeals, 250);
    });

    li.appendChild(textSpan);
    li.appendChild(removeBtn);
    mealList.appendChild(li);
  });
}

mealButton.addEventListener("click", async () => {
  const day = mealDay.value;
  const text = mealInput.value.trim();
  if (!day || !text) return;

  const res = await apiFetch(MEALS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ day, text }),
  });

  if (!res.ok) {
    alert(await readError(res));
    return;
  }

  mealInput.value = "";
  mealDay.value = "";
  loadMeals();
});

loadMeals();