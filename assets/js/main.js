// Shared progressive enhancement. Navigation remains visible without JavaScript.
(() => {
  "use strict";
  const navigation = document.querySelector('#primary-navigation');
  if (navigation) {
    const login = document.createElement('a');
    login.href = new URL('../../login.html', document.currentScript.src).href;
    login.textContent = 'Đăng nhập demo';
    navigation.append(login);
  }
  const compact = matchMedia("(max-width: 700px)");
  document.querySelectorAll("[data-nav-toggle]").forEach((button) => {
    const navigation = document.getElementById(
      button.getAttribute("aria-controls"),
    );
    if (!navigation) return;
    function setOpen(open, restoreFocus = false) {
      button.setAttribute("aria-expanded", String(open));
      navigation.hidden = !open;
      if (restoreFocus) button.focus();
    }
    function resize() {
      const focusedInside = navigation.contains(document.activeElement);
      button.hidden = !compact.matches;
      setOpen(!compact.matches, compact.matches && focusedInside);
    }
    button.addEventListener("click", () =>
      setOpen(button.getAttribute("aria-expanded") !== "true"),
    );
    navigation.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && compact.matches) {
        setOpen(false, true);
      }
    });
    compact.addEventListener("change", resize);
    resize();
  });
  document.querySelectorAll("[data-dialog-open]").forEach((button) => {
    button.addEventListener("click", () =>
      document.getElementById(button.dataset.dialogOpen)?.showModal(),
    );
  });
  document.querySelectorAll("[data-dialog-close]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });
})();
