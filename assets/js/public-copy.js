/* Public wording adapter for the optional shared SV2 session header. */
(async () => {
  'use strict';
  if (!window.CampusSession) return;
  const user = await window.CampusSession.ready;
  document.querySelectorAll('#primary-navigation a').forEach(anchor => {
    if (new URL(anchor.href).pathname.endsWith('/sv2-login.html')) {
      anchor.textContent = user ? 'Tài khoản · Đổi tài khoản' : 'Đăng nhập';
    }
  });
  // Shared session failures are displayed before <main>, outside the role content.
  const notice = document.querySelector('main')?.previousElementSibling;
  if (notice?.matches('.notice[role="alert"]')) {
    for (const node of notice.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace(/\bdemo\b/gi, 'học phần');
    }
    const login = notice.querySelector('a');
    if (login && new URL(login.href).pathname.endsWith('/sv2-login.html')) login.textContent = 'Đăng nhập';
  }
})();
