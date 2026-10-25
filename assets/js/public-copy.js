/* Wording for public SV1 surfaces with either shared session implementation. */
(() => {
  'use strict';
  function refresh(user) {
    const isLogin = anchor => /\/(?:sv2-)?login\.html$/.test(new URL(anchor.href).pathname);
    document.querySelectorAll('#primary-navigation a').forEach(anchor => {
      if (isLogin(anchor)) anchor.textContent = user ? 'Tài khoản · Đổi tài khoản' : 'Đăng nhập';
    });
    const notice = document.querySelector('main')?.previousElementSibling;
    if (notice?.matches('.notice[role="alert"]')) {
      for (const node of notice.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace(/\bdemo\b/gi, 'học phần');
      }
      const login = notice.querySelector('a');
      if (login && isLogin(login)) login.textContent = 'Đăng nhập';
    }
  }
  window.addEventListener('campusmind:session', event => refresh(event.detail));
  if (window.CampusSession) window.CampusSession.ready.then(refresh).catch(() => refresh(null));
})();
