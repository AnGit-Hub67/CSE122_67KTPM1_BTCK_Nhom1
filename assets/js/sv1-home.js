(() => {
  'use strict';
  const root = new URL('../../', document.currentScript.src);
  const container = document.querySelector('#home-people'), status = document.querySelector('#home-people-status');
  const el = (tag, text, cls) => { const e = document.createElement(tag); e.textContent = text; if (cls) e.className = cls; return e; };
  let version = 0;
  async function load() {
    const current = ++version;
    container.setAttribute('aria-busy', 'true');
    status.textContent = 'Đang tải hồ sơ…';
    container.replaceChildren(...Array.from({length:3}, () => {
      const card = el('div', '', 'card loading-skeleton'); card.setAttribute('aria-hidden','true');
      for (let i=0;i<3;i++) card.append(el('span','')); return card;
    }));
    try {
      const response = await fetch(new URL('assets/data/visitor.json', root), {signal:AbortSignal.timeout(10000)});
      if (!response.ok) throw Error();
      const data = await response.json();
      if (!Array.isArray(data.counselors)) throw Error();
      if (current !== version) return;
      const people = CampusMindPublicProfiles.read(data.counselors).slice(0,3);
      container.replaceChildren(...people.map(p => {
        const card = el('article','', 'card'), avatar = el('div',p.initials,'avatar'); avatar.setAttribute('aria-hidden','true');
        const a = el('a','Xem hồ sơ'); a.href = new URL('pages/visitor/visitor-counselor-detail.html?id='+encodeURIComponent(p.id),root);
        card.append(avatar,el('h3',[p.qualification,p.name].filter(Boolean).join(' ')),el('p',p.expertise.join(' · ')),el('p',p.experience || 'Chưa bổ sung kinh nghiệm'),a);return card;
      }));
      status.textContent = people.length ? 'Thông tin minh họa cho mục đích học tập.' : 'Chưa có hồ sơ chuyên viên. Vui lòng quay lại sau.';
    } catch {
      if (current !== version) return;
      container.replaceChildren(); status.textContent = 'Chưa tải được hồ sơ. ';
      const retry = el('button','Thử lại'); retry.type = 'button'; retry.onclick = load; status.append(retry);
    } finally { if (current === version) container.setAttribute('aria-busy','false'); }
  }
  window.addEventListener('storage', e => { if (e.key === null || e.key === 'campusmind.sv2.users.v1') load(); });
  load();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const counters = [...document.querySelectorAll('[data-counter]')];
  const finish = () => counters.forEach(e => { e.textContent = e.dataset.counter+'+'; });
  if (!motion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target); const start = performance.now(), total = Number(entry.target.dataset.counter);
      function frame(now) {
        const progress = motion.matches ? 1 : Math.min(1,(now-start)/700);
        entry.target.textContent = Math.round(total*progress)+'+';
        if (progress<1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }));
    counters.forEach(e => observer.observe(e));
    motion.addEventListener('change', () => { if (motion.matches) { observer.disconnect(); finish(); } });
  }
})();
