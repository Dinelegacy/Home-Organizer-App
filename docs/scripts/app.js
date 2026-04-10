import { API_BASE } from "./config.js";

const WAKE_DELAY_MS = 2500;
const WAKE_COOLDOWN_MS = 12000;
const SWIPE_DELETE_THRESHOLD = 92;
let lastWakeNoticeAt = 0;

function showLoader() {
  document.getElementById("loader")?.classList.remove("hidden");
}

function hideLoader() {
  document.getElementById("loader")?.classList.add("hidden");
}

function showToast(message, type = "info") {
  const el = document.getElementById("toast");
  if (!el) return;

  el.className = `toast show ${type}`;
  el.textContent = message;

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.className = "toast";
    el.textContent = "";
  }, type === "info" ? 5000 : 2200);
}
const ITEMS_URL = `${API_BASE}/api/items`;
const MEALS_URL = `${API_BASE}/api/meals`;

const TOKEN = localStorage.getItem("token");
if (!TOKEN) window.location.href = "login.html?v=4";

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
  showLoader();
  const wakeTimer = setTimeout(() => {
    const now = Date.now();
    if (now - lastWakeNoticeAt >= WAKE_COOLDOWN_MS) {
      showToast("Getting things ready. Please wait...", "info");
      lastWakeNoticeAt = now;
    }
  }, WAKE_DELAY_MS);

  try {
    const res = await fetch(url, {
      ...options,
      headers: authHeaders(options.headers || {}),
    });
    return res;
  } finally {
    clearTimeout(wakeTimer);
    hideLoader();
  }
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html?v=4";
});

const list = document.getElementById("missing-list");
const input = document.getElementById("missing-input");
const button = document.getElementById("missing-item");
const itemsMsg = document.getElementById("itemsMsg");
const itemSearch = document.getElementById("item-search");
const itemsCount = document.getElementById("items-count");

let ALL_ITEMS = [];
let isAddingItem = false;
let isAddingMeal = false;

function setItemsMsg(text = "", type = "") {
  if (!itemsMsg) return;
  itemsMsg.textContent = text;
  itemsMsg.className = `inlineMsg ${type}`.trim();
  if (text) setTimeout(() => setItemsMsg("", ""), 2000);
}

function addSwipeToDelete(li, onDelete) {
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let dragging = false;
  let lockVertical = false;

  li.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    deltaX = 0;
    dragging = true;
    lockVertical = false;
    li.style.transition = "none";
  }, { passive: true });

  li.addEventListener("touchmove", (e) => {
    if (!dragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const moveX = touch.clientX - startX;
    const moveY = touch.clientY - startY;

    if (!lockVertical && Math.abs(moveY) > Math.abs(moveX)) {
      dragging = false;
      li.style.transition = "";
      li.style.transform = "";
      return;
    }

    lockVertical = true;
    deltaX = Math.min(0, moveX);
    li.style.transform = `translateX(${deltaX}px)`;
  }, { passive: true });

  li.addEventListener("touchend", async () => {
    if (!lockVertical) {
      li.style.transition = "";
      li.style.transform = "";
      return;
    }
    li.style.transition = "transform 180ms ease";

    if (Math.abs(deltaX) >= SWIPE_DELETE_THRESHOLD) {
      li.style.transform = "translateX(-100%)";
      await onDelete();
      return;
    }

    li.style.transform = "";
  });

  li.addEventListener("touchcancel", () => {
    dragging = false;
    li.style.transition = "transform 180ms ease";
    li.style.transform = "";
  });
}

function setActionButtonState(btn, isLoading, loadingLabel = "Working...") {
  if (!btn) return () => {};
  const originalText = btn.textContent;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? loadingLabel : originalText;

  return () => {
    btn.disabled = false;
    btn.textContent = originalText;
  };
}

function renderItems(items) {
  list.innerHTML = "";
  if (itemsCount) {
    if (items.length > 0) {
      itemsCount.textContent = String(items.length);
      itemsCount.style.display = "inline-flex";
    } else {
      itemsCount.style.display = "none";
    }
  }

  if (items.length === 0) {
    const li = document.createElement("li");
    li.className = "emptyState";
    li.textContent = "No missing items yet.";
    list.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.classList.add("swipeable");

    const textSpan = document.createElement("span");
    textSpan.textContent = item.text;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.classList.add("iconBtn");
    removeBtn.setAttribute("aria-label", "Delete");

    const handleDelete = async () => {
      if (li.dataset.deleting === "true") return;
      li.dataset.deleting = "true";
      li.classList.add("removing");
      removeBtn.disabled = true;

      let delRes;
      try {
        delRes = await apiFetch(`${ITEMS_URL}/${item._id}`, { method: "DELETE" });
      } catch (err) {
        li.dataset.deleting = "false";
        removeBtn.disabled = false;
        li.classList.remove("removing");
        li.style.transform = "";
        showToast("Unable to delete right now. Please try again.", "error");
        return;
      }

      if (!delRes.ok) {
        li.dataset.deleting = "false";
        removeBtn.disabled = false;
        li.classList.remove("removing");
        li.style.transform = "";
        showToast(await readError(delRes), "error");
        return;
      }

      setItemsMsg(`${item.text} deleted`, "error");
      setTimeout(loadItems, 200);
    };

    removeBtn.addEventListener("click", handleDelete);
    addSwipeToDelete(li, handleDelete);

    li.appendChild(textSpan);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

if (itemSearch) {
  itemSearch.addEventListener("input", () => {
    const q = itemSearch.value.trim().toLowerCase();

    if (!q) {
      setItemsMsg("", "");
      renderItems(ALL_ITEMS);
      return;
    }

    if (ALL_ITEMS.length === 0) {
      setItemsMsg("", "");
      renderItems([]);
      return;
    }

    const filtered = ALL_ITEMS.filter((it) =>
      (it.text || "").toLowerCase().includes(q)
    );

    renderItems(filtered);

    if (filtered.length === 0) setItemsMsg("No items found", "info");
    else setItemsMsg("", "");
  });
}

async function loadItems() {
  let res;
  try {
    res = await apiFetch(ITEMS_URL);
  } catch (err) {
    list.innerHTML = `<li class="emptyState">Unable to load items. Please retry.</li>`;
    if (itemsCount) itemsCount.style.display = "none";
    return;
  }

  if (!res.ok) {
    list.innerHTML = `<li class="emptyState">${await readError(res)}</li>`;
    if (itemsCount) itemsCount.style.display = "none";
    return;
  }

  ALL_ITEMS = await res.json();

  const q = (itemSearch?.value || "").trim().toLowerCase();
  if (q) {
    const filtered = ALL_ITEMS.filter((it) =>
      (it.text || "").toLowerCase().includes(q)
    );
    renderItems(filtered);
    if (filtered.length === 0 && ALL_ITEMS.length > 0) setItemsMsg("No items found", "info");
    else setItemsMsg("", "");
  } else {
    renderItems(ALL_ITEMS);
    setItemsMsg("", "");
  }
}

button?.addEventListener("click", async () => {
  if (isAddingItem) return;
  const text = input.value.trim();
  if (!text) return;
  isAddingItem = true;
  const resetButton = setActionButtonState(button, true, "Adding...");

  let res;
  try {
    res = await apiFetch(ITEMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    setItemsMsg("Unable to add item right now. Please try again.", "error");
    isAddingItem = false;
    resetButton();
    return;
  }

  if (!res.ok) {
    setItemsMsg(await readError(res), "error");
    isAddingItem = false;
    resetButton();
    return;
  }

  setItemsMsg(`${text} added`, "success");
  input.value = "";
  await loadItems();
  isAddingItem = false;
  resetButton();
});

input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    button.click();
  }
});

loadItems();

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
  let res;
  try {
    res = await apiFetch(MEALS_URL);
  } catch (err) {
    mealList.innerHTML = `<li class="emptyState">Unable to load meals. Please retry.</li>`;
    return;
  }

  if (!res.ok) {
    mealList.innerHTML = `<li class="emptyState">${await readError(res)}</li>`;
    return;
  }

  const data = await res.json();
  mealList.innerHTML = "";

  if (data.length === 0) {
    const li = document.createElement("li");
    li.className = "emptyState";
    li.textContent = "No meals planned yet.";
    mealList.appendChild(li);
    return;
  }

  data.forEach((meal) => {
    const li = document.createElement("li");
    li.classList.add("swipeable");

    const textSpan = document.createElement("span");
    textSpan.textContent = `${meal.day}: ${meal.text}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "×";
    removeBtn.classList.add("iconBtn");
    removeBtn.setAttribute("aria-label", "Delete");

    const handleDelete = async () => {
      if (li.dataset.deleting === "true") return;
      li.dataset.deleting = "true";
      li.classList.add("removing");
      removeBtn.disabled = true;

      let delRes;
      try {
        delRes = await apiFetch(`${MEALS_URL}/${meal._id}`, { method: "DELETE" });
      } catch (err) {
        li.dataset.deleting = "false";
        removeBtn.disabled = false;
        li.classList.remove("removing");
        li.style.transform = "";
        showToast("Unable to delete right now. Please try again.", "error");
        return;
      }

      if (!delRes.ok) {
        li.dataset.deleting = "false";
        removeBtn.disabled = false;
        li.classList.remove("removing");
        li.style.transform = "";
        showToast(await readError(delRes), "error");
        return;
      }

      setMealsMsg(`${meal.day} meal deleted`, "error");
      setTimeout(loadMeals, 200);
    };

    removeBtn.addEventListener("click", handleDelete);
    addSwipeToDelete(li, handleDelete);

    li.appendChild(textSpan);
    li.appendChild(removeBtn);
    mealList.appendChild(li);
  });
}

mealButton?.addEventListener("click", async () => {
  if (isAddingMeal) return;
  const day = mealDay.value;
  const text = mealInput.value.trim();
  if (!day || !text) return;
  isAddingMeal = true;
  const resetButton = setActionButtonState(mealButton, true, "Adding...");

  let res;
  try {
    res = await apiFetch(MEALS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, text }),
    });
  } catch (err) {
    setMealsMsg("Unable to save meal right now. Please try again.", "error");
    isAddingMeal = false;
    resetButton();
    return;
  }

  if (!res.ok) {
    setMealsMsg(await readError(res), "error");
    isAddingMeal = false;
    resetButton();
    return;
  }

  setMealsMsg(`${day} meal saved`, "success");

  mealInput.value = "";
  mealDay.value = "";
  await loadMeals();
  isAddingMeal = false;
  resetButton();
});

mealInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    mealButton.click();
  }
});

loadMeals();
