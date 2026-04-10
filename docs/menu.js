document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    if (!btn || !menu) return;

    function setMenuState(isOpen) {
        menu.classList.toggle("open", isOpen);
        btn.setAttribute("aria-expanded", String(isOpen));
        btn.textContent = isOpen ? "×" : "☰";
    }

    setMenuState(false);

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.contains("open");
        setMenuState(!isOpen);
    });

    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && e.target !== btn) {
            setMenuState(false);
        }
    });

    menu.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => setMenuState(false))
    );

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setMenuState(false);
    });
});