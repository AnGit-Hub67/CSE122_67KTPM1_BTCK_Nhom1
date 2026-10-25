/* Compatible with shared-upgrade.js: same theme key and channel, no role changes. */
(() => {
  'use strict';
  const key = 'campusmind.theme.v1';
  let channel;
  try { channel = new BroadcastChannel('campusmind.ui.v1'); } catch {}
  function apply(value) {
    const dark = value === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.textContent = dark ? 'Chuyển sang sáng' : 'Chuyển sang tối';
      button.setAttribute('aria-pressed', String(dark));
    });
  }
  try { apply(localStorage.getItem(key)); } catch { apply('light'); }
  window.addEventListener('storage', e => { if (e.key === key || e.key === null) apply(e.newValue); });
  if (channel) channel.onmessage = e => { if (e.data?.type === 'theme') apply(e.data.value); };
  document.addEventListener('DOMContentLoaded', () => {
    // Shared SV3 owns its button when present, avoiding two click handlers on integration.
    if (document.querySelector('script[src$="shared-upgrade.js"]')) return;
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.themeToggle = '';
    document.querySelector('.header-inner')?.append(button);
    apply(document.documentElement.dataset.theme);
    button.addEventListener('click', () => {
      const value = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(value);
      try { localStorage.setItem(key, value); } catch {}
      channel?.postMessage({type: 'theme', value});
    });
  });
})();
