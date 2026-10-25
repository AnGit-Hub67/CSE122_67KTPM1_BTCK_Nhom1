/* SV2 owns booking.topic. Enhance existing SV3 queue cards without changing its workflow. */
(() => {
  'use strict';
  const labels = { general: 'Trao đổi chung', study: 'Học tập', career: 'Định hướng', connection: 'Kết nối' };
  const update = () => {
    let schedule;
    try { schedule = JSON.parse(localStorage.getItem('campusmind.counselor.v1') || 'null'); } catch { return; }
    if (!Array.isArray(schedule?.appointments)) return;
    for (const card of document.querySelectorAll('[data-appointment]')) {
      const appointment = schedule.appointments.find(a => a.id === card.dataset.appointment);
      if (!appointment) continue;
      let line = card.querySelector('[data-sv2-topic]');
      if (!line) { line = document.createElement('p'); line.dataset.sv2Topic = ''; card.append(line); }
      const text = 'Chủ đề: ' + (labels[appointment.topic] || 'Chưa ghi nhận');
      if (line.textContent !== text) line.textContent = text;
    }
  };
  const start = () => {
    if (document.body.dataset.role !== 'counselor') return;
    new MutationObserver(update).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
    window.addEventListener('storage', e => { if (e.key === 'campusmind.counselor.v1' || e.key === null) update(); });
    update();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
