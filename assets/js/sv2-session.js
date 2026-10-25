(() => {
  'use strict';
  const key = 'campusmind.session.v1', channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('campusmind.session') : null;
  const routes = { student: 'pages/student/student-dashboard.html', counselor: 'pages/counselor/index.html', admin: 'pages/admin/admin-user-management.html' };
  let serverUser = null;
  const local = () => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
  const signal = () => { channel?.postMessage('changed'); window.dispatchEvent(new Event('campus-session')); };
  const current = () => window.CampusAPI?.authConfigured('me') ? serverUser : local();
  const setLocal = user => { localStorage.setItem(key, JSON.stringify({ id: user.id, role: user.role, mode: 'local' })); sessionStorage.setItem(key, JSON.stringify({ id: user.id, role: user.role })); signal(); };
  const refresh = async () => { if (window.CampusAPI?.authConfigured('me')) { const result = await CampusAPI.auth('me', undefined, 'GET'); serverUser = result?.user || null; return serverUser; } const user = local(); if (user) sessionStorage.setItem(key, JSON.stringify({ id: user.id, role: user.role })); else sessionStorage.removeItem(key); return user; };
  const logout = async () => { if (CampusAPI.authConfigured('logout')) await CampusAPI.auth('logout', {}); serverUser = null; localStorage.removeItem(key); sessionStorage.removeItem('campusmind.sv2.navigator.v1'); sessionStorage.removeItem(key); sessionStorage.removeItem('campusmind.sv2.student.session.v1'); signal(); };
  const route = user => user.role === 'counselor' && user.approval !== 'approved' && user.mode !== 'local' ? 'account-status.html' : routes[user.role];
  window.CampusAuth = { key, current, setLocal, refresh, logout, route };
  channel?.addEventListener('message', () => window.dispatchEvent(new Event('campus-session')));
  window.addEventListener('storage', e => { if (e.key === key || e.key === null) window.dispatchEvent(new Event('campus-session')); });
})();
