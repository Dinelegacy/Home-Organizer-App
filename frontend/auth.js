const API_BASE = "http://127.0.0.1:3000";

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

async function login(email, password) {
    const res = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.message || "Login failed");
        return;
    }

    localStorage.setItem("token", data.token);
    window.location.href = "app.html";
}

async function register(email, password) {
    const res = await fetch(`${API_BASE}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
    }

    alert("Account created. You can login now.");
    window.location.href = "login.html";
}

if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        login(
            document.getElementById("email").value.trim(),
            document.getElementById("password").value.trim()
        );
    });
}

if (registerBtn) {
    registerBtn.addEventListener("click", () => {
        register(
            document.getElementById("email").value.trim(),
            document.getElementById("password").value.trim()
        );
    });
}