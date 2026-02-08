const btn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

if (btn && menu) {
    btn.addEventListener("click", () => {
        const open = menu.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            menu.classList.remove("open");
            btn.setAttribute("aria-expanded", "false");
        }
    });
}