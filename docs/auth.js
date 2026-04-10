import { API_BASE } from "./config.js";

const WAKE_DELAY_MS = 2500;
const WAKE_MESSAGE = "Server is waking up. First request can take up to 60 seconds.";

function setFormMsg(message = "", type = "") {
    const el = document.getElementById("formMsg");
    if (!el) return;

    el.textContent = "";
    el.classList.remove("show", "success", "error", "info");

    if (!message) return;

    el.textContent = message;
    el.classList.add("show");
    if (type) el.classList.add(type);
}

async function readJsonMessage(res) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        const body = await res.json().catch(() => ({}));
        return body.message || body.error || "Request failed";
    }
    return `Request failed (${res.status})`;
}

async function fetchWithWakeNotice(url, options = {}, onWake) {
    let wakeTimer = null;
    if (typeof onWake === "function") {
        wakeTimer = setTimeout(() => onWake(), WAKE_DELAY_MS);
    }

    try {
        return await fetch(url, options);
    } finally {
        clearTimeout(wakeTimer);
    }
}

function setSubmitState(form, isSubmitting, pendingLabel) {
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (!submitBtn) return () => {};

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? pendingLabel : originalLabel;

    return () => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    function handlePasswordToggle(btn, event) {
        event.preventDefault();

        const wrapper = btn.closest(".passwordWrapper");
        const input = wrapper?.querySelector("input");
        if (!input) return;

        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        btn.textContent = isPassword ? "Hide" : "Show";
        btn.setAttribute("aria-pressed", String(isPassword));
        btn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
    }

    document.querySelectorAll(".togglePassword").forEach((btn) => {
        btn.addEventListener("click", (event) => handlePasswordToggle(btn, event));
    });

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            setFormMsg("");
            const resetSubmit = setSubmitState(loginForm, true, "Signing in...");

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const res = await fetchWithWakeNotice(
                    `${API_BASE}/api/users/login`,
                    {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                    },
                    () => setFormMsg(WAKE_MESSAGE, "info")
                );

                if (!res.ok) {
                    setFormMsg(await readJsonMessage(res), "error");
                    resetSubmit();
                    return;
                }

                const data = await res.json();
                localStorage.setItem("token", data.token);
                window.location.href = "app.html";
            } catch (err) {
                setFormMsg("Cannot connect right now. Please wait a moment and try again.", "error");
                resetSubmit();
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            setFormMsg("");
            const resetSubmit = setSubmitState(registerForm, true, "Creating account...");

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            if (password !== confirmPassword) {
                setFormMsg("Passwords do not match", "error");
                resetSubmit();
                return;
            }

            try {
                const res = await fetchWithWakeNotice(
                    `${API_BASE}/api/users/register`,
                    {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                    },
                    () => setFormMsg(WAKE_MESSAGE, "info")
                );

                if (!res.ok) {
                    setFormMsg(await readJsonMessage(res), "error");
                    resetSubmit();
                    return;
                }

                setFormMsg("Account created. Please login", "success");
                resetSubmit();
                setTimeout(() => (window.location.href = "login.html"), 1500);
            } catch (err) {
                setFormMsg("Cannot connect right now. Please wait a moment and try again.", "error");
                resetSubmit();
            }
        });
    }
});
