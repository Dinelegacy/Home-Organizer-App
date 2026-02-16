const API_BASE = "https://home-organizer-app-production.up.railway.app";

function showToast(message, type = "info") {
    const el = document.getElementById("toast");
    if (!el) return;

    el.className = `toast show ${type}`;
    el.innerHTML = message;

    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
        el.className = "toast";
    }, 1600); // shorter, modern feel
}

/* ---------- Inline red message ---------- */
function setFormMsg(message = "") {
    const el = document.getElementById("formMsg");
    if (!el) return;

    if (!message) {
        el.textContent = "";
        el.classList.remove("show");
        return;
    }

    el.textContent = message;
    el.classList.add("show");
}

async function readJsonMessage(res) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
        const body = await res.json().catch(() => ({}));
        return body.message || body.error || "Request failed";
    }
    return "Request failed";
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    document.querySelectorAll(".togglePassword").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = btn.parentElement.querySelector("input");
            if (!input) return;

            input.type = input.type === "password" ? "text" : "password";
        });
    });

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            setFormMsg(""); // 

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                const res = await fetch(`${API_BASE}/api/users/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) {
                    setFormMsg(await readJsonMessage(res)); // red inline message
                    return;
                }

                const data = await res.json();
                localStorage.setItem("token", data.token);
                window.location.href = "app.html";
            } catch (err) {
                showToast("Server is not running (cannot connect).", "error");
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            setFormMsg(""); // clear old error

            // declare password BEFORE using it
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document
                .getElementById("confirmPassword")
                .value.trim();

            if (password !== confirmPassword) {
                setFormMsg("Passwords do not match"); // inline red message (not toast)
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/users/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                if (!res.ok) {
                    setFormMsg(await readJsonMessage(res)); // red inline message
                    return;
                }

                setFormMsg("Account created ✅ Please login!!.");
                showToast("Account created successfully ✅ Please login.", "success");
                setTimeout(() => (window.location.href = "login.html"), 2000);
            } catch (err) {
                showToast("Server is not running (cannot connect).", "error");
            }
        });
    }
});