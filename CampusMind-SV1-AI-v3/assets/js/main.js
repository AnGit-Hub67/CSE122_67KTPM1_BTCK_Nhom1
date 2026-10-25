// Shared progressive enhancement. Navigation remains visible without JavaScript.
(() => {
  "use strict";
  // This parameter preserves navigation context only; it does not grant a role.
  if (document.body.dataset.page === "services" && new URLSearchParams(location.search).get("from") === "admin") {
    const root = new URL("../../", document.currentScript.src);
    const main = document.querySelector("main");
    if (main && !document.querySelector(".sidebar")) {
      const shell = document.createElement("div");
      shell.className = "app-shell";
      const sidebar = document.createElement("aside");
      sidebar.className = "sidebar";
      sidebar.setAttribute("aria-label", "Khu vực Quản trị viên");
      sidebar.innerHTML = '<strong>Khu vực Quản trị viên</strong><button type="button" class="nav-toggle" data-nav-toggle aria-controls="role-navigation" aria-expanded="true" hidden>Điều hướng khu vực</button><nav id="role-navigation" aria-label="Điều hướng vai trò"></nav>';
      const nav = sidebar.querySelector("nav");
      for (const [label, route] of [["Tổng quan", "pages/admin/index.html"], ["Quản lý dịch vụ", "pages/admin/admin-service-management.html"], ["Khám phá dịch vụ", "pages/visitor/visitor-service-directory.html?from=admin"], ["Trang chủ", "index.html"]]) {
        const a = document.createElement("a");
        a.textContent = label;
        a.href = new URL(route, root).href;
        if (label === "Khám phá dịch vụ") a.setAttribute("aria-current", "page");
        nav.append(a);
      }
      const note = document.createElement("span");
      note.className = "sidebar-note";
      note.textContent = "Quản lý danh mục dịch vụ hỗ trợ sinh viên.";
      nav.append(note);
      main.before(shell);
      shell.append(sidebar, main);
    }
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
