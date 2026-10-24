/* Read-only projection of the Student/Counselor store. Never render private records. */
(() => {
  'use strict';
  const source = new URL('sv2-store.js', document.currentScript.src);
  let loading;
  async function read() {
    if (!window.SV2Store) {
      loading ||= new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = source.href;
        script.onload = resolve;
        script.onerror = () => { script.remove(); reject(new Error('Student integration unavailable')); };
        document.head.append(script);
      }).catch(error => { loading = null; throw error; });
      await loading;
    }
    const store = window.SV2Store;
    const state = await store.init();
    return state.schedule.slots.filter(slot => store.available(state, slot)).map(slot => ({
      counselorId: store.counselorOf(slot), date: slot.date, start: slot.start, end: slot.end,
    })).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  }
  window.CampusMindPublicSchedule = Object.freeze({ read });
})();
