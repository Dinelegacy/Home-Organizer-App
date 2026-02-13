// menu.js
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    if (!btn || !menu) return;

    function setMenuState(isOpen) {
        menu.classList.toggle("open", isOpen);
        btn.setAttribute("aria-expanded", String(isOpen));
        btn.textContent = isOpen ? "×" : "☰";
    }

    // default state
    setMenuState(false);

    // toggle on click
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.contains("open");
        setMenuState(!isOpen);
    });

    // close when clicking outside
    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && e.target !== btn) {
            setMenuState(false);
        }
    });

    // close when clicking a link
    menu.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => setMenuState(false))
    );

    // close on ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setMenuState(false);
    });
});