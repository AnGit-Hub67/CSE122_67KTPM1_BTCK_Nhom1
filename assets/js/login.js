/* Demo account selection; compatible with SV2 registration, never stores passwords. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const usersKey = 'campusmind.sv2.users.v1';
  const sessionKey = 'campusmind.session.v1';
  const studentKey = 'campusmind.sv2.student.session.v1';
  const roles = { student: 'Sinh viên', counselor: 'Chuyên viên', admin: 'Quản trị viên' };
  const routes = { student: 'pages/student/student-dashboard.html', counselor: 'pages/counselor/counselor-schedule.html', admin: 'pages/admin/admin-service-management.html' };
  let seeds, busy = false;
  function users() {
    const raw = localStorage.getItem(usersKey);
    const rows = raw === null ? seeds : JSON.parse(raw);
    if (!Array.isArray(rows) || new Set(rows.map(u => u?.id)).size !== rows.length || !rows.every(u => u && typeof u.id === 'string' && u.id && typeof u.name === 'string' && u.name && Object.hasOwn(roles, u.role) && ['active', 'disabled'].includes(u.status))) throw Error('Dữ liệu tài khoản không hợp lệ. Dữ liệu gốc được giữ nguyên.');
    return rows;
  }
  function error(err) { $('login-error').textContent = 'Không thể tiếp tục. ' + (err instanceof SyntaxError ? 'Dữ liệu đã lưu bị lỗi.' : err.message); }
  async function exists(url) { const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) }); return r.ok; }
  async function load() {
    $('login-form').hidden = true; $('login-success').hidden = true; $('login-retry').hidden = true; $('login-error').textContent = ''; $('login-status').textContent = 'Đang tải tài khoản…';
    try {
      let response = await fetch('assets/data/sv2.json', { signal: AbortSignal.timeout(10000) });
      if (response.status === 404) response = await fetch('assets/data/login-demo.json', { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw Error('Không tải được tài khoản. Hãy thử lại.');
      seeds = (await response.json()).users;
      const rows = users().filter(u => u.status === 'active');
      $('account').replaceChildren(new Option('Chọn tài khoản', ''), ...rows.map(u => new Option(`${u.name} · ${roles[u.role]}`, u.id)));
      $('account').setAttribute('aria-describedby', 'account-help');
      $('login-form').hidden = !rows.length;
      $('login-status').textContent = rows.length ? 'Sẵn sàng chọn tài khoản.' : 'Chưa có tài khoản đang hoạt động.';
      $('registration').hidden = !await exists('register.html');
    } catch (err) { error(err); $('login-status').textContent = 'Chưa tải được tài khoản.'; $('login-retry').hidden = false; }
  }
  $('login-form').addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return;
    busy = true; const submit = event.submitter; submit.disabled = true; $('login-form').setAttribute('aria-busy', 'true'); $('login-error').textContent = '';
    try {
      const selectedId = $('account').value;
      let user = users().find(u => u.id === selectedId && u.status === 'active');
      if (!user) throw Error('Chọn một tài khoản đang hoạt động.');
      const target = routes[user.role];
      const available = await exists(target);
      // Recheck after network work: another tab may have disabled the account.
      user = users().find(u => u.id === selectedId && u.status === 'active');
      if (!user) throw Error('Tài khoản vừa bị vô hiệu hóa. Hãy chọn lại.');
      const oldStudent = sessionStorage.getItem(studentKey);
      try {
        if (user.role === 'student') sessionStorage.setItem(studentKey, user.id); else sessionStorage.removeItem(studentKey);
        sessionStorage.setItem(sessionKey, JSON.stringify({ id: user.id, role: user.role }));
      } catch (err) { if (oldStudent !== null) sessionStorage.setItem(studentKey, oldStudent); else sessionStorage.removeItem(studentKey); throw err; }
      $('login-name').textContent = `${user.name} · ${roles[user.role]}`;
      $('login-continue').href = available ? target : `pages/${user.role}/index.html`;
      $('login-status').textContent = available ? 'Đã chọn tài khoản thành công.' : 'Đã chọn tài khoản. Trang nghiệp vụ chưa có ở phiên bản này; bạn có thể mở trang tổng quan.';
      $('login-form').hidden = true; $('login-success').hidden = false; $('login-success').focus();
    } catch (err) { error(err); $('login-error').focus(); }
    finally { busy = false; submit.disabled = false; $('login-form').setAttribute('aria-busy', 'false'); }
  });
  $('logout').addEventListener('click', () => { try { sessionStorage.removeItem(studentKey); sessionStorage.removeItem(sessionKey); load(); } catch (err) { error(err); } });
  $('login-retry').addEventListener('click', load);
  window.addEventListener('storage', event => { if (event.key === usersKey || event.key === null) load(); });
  load();
})();
