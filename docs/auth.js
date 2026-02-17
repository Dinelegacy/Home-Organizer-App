const API_BASE = "https://home-organizer-app-production.up.railway.app";

function setFormMsg(message = "", type = "") {
    const el = document.getElementById("formMsg");
    if (!el) return;

    // reset
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

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    // password eye toggle
    document.querySelectorAll(".togglePassword").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = btn.parentElement.querySelector("input");
            if (!input) return;
            input.type = input.type === "password" ? "text" : "password";
        });
    });

    // LOGIN
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            setFormMsg("");

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const res = await fetch(`${API_BASE}/api/users/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) {
                    setFormMsg(await readJsonMessage(res), "error");
                    return;
                }

                const data = await res.json();
                localStorage.setItem("token", data.token);
                window.location.href = "app.html";
            } catch (err) {
                setFormMsg("Server is not running (cannot connect)", "error");
            }
        });
    }

    // REGISTER
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            setFormMsg("");

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirmPassword").value.trim();

            if (password !== confirmPassword) {
                setFormMsg("Passwords do not match", "error");
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/users/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) {
                    setFormMsg(await readJsonMessage(res), "error");
                    return;
                }

                setFormMsg("Account created. Please login", "success");
                setTimeout(() => (window.location.href = "login.html"), 1500);
            } catch (err) {
                setFormMsg("Server is not running (cannot connect)", "error");
            }
        });
    }
});
