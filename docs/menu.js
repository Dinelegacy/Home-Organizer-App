const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
        const open = menu.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // close menu when clicking a link
    menu.addEventListener("click", (e) => {
        if (e.target.matches("a")) {
            menu.classList.remove("open");
            menuBtn.setAttribute("aria-expanded", "false");
        }
    });
}