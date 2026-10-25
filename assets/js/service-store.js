/* Public catalog only. Never store appointments, notes or student identities here. */
(() => {
  "use strict";
  const key = "campusmind.admin.services.v1";
  const categories = ["Tham vấn", "Đồng hành", "Hoạt động nhóm", "Workshop"];
  function validate(items) {
    if (!Array.isArray(items) || new Set(items.map(s => s?.id)).size !== items.length ||
      !items.every(s => s && typeof s.id === "string" && s.id.trim() &&
        typeof s.name === "string" && s.name.trim().length >= 3 && s.name.length <= 100 &&
        categories.includes(s.category) &&
        Number.isInteger(s.duration) && s.duration >= 15 && s.duration <= 240 && s.duration % 5 === 0 &&
        typeof s.description === "string" && s.description.trim().length >= 10 && s.description.length <= 500 &&
        ["active", "inactive", "archived"].includes(s.status) &&
        (s.counselorId === undefined || typeof s.counselorId === "string")))
      throw new Error("Dữ liệu dịch vụ không hợp lệ. Dữ liệu gốc vẫn được giữ nguyên.");
    return items;
  }

  const pendingKey = key + '.offline';
  let lastMode = 'local', channel;
  try { channel = new BroadcastChannel('campusmind.services.v1'); } catch {}
  function changed() { window.dispatchEvent(new StorageEvent('storage', { key })); }
  if (channel) channel.onmessage = e => { if (e.data?.type === 'changed') changed(); };
  function endpoint() {
    const value = window.CampusMindServiceConfig?.endpoint?.trim();
    if (!value) return null;
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash)
      throw new Error('Cấu hình nguồn dịch vụ cần URL HTTPS không chứa thông tin xác thực.');
    return url.href;
  }
  async function request(url, options = {}) {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(8000), credentials: 'omit' });
    if (!response.ok) throw new Error('Nguồn trực tuyến chưa khả dụng.');
    return validate((await response.json()).items);
  }
  const locked = task => navigator.locks ? navigator.locks.request(key, task) : task();
  async function read() {
    return locked(async () => {
      let snapshot = localStorage.getItem(key);
      // Reject corrupt local data; never silently replace user edits.
      let items = snapshot === null ? null : validate(JSON.parse(snapshot));
      const url = endpoint();
      lastMode = url ? 'offline' : 'local';
      if (url && !localStorage.getItem(pendingKey)) {
        try {
          items = await request(url);
          const next = JSON.stringify(items);
          if (next !== snapshot) { localStorage.setItem(key, next); channel?.postMessage({type:'changed'}); }
          snapshot = next; lastMode = 'remote';
        } catch { /* Keep validated cache or seed; never claim a remote success. */ }
      }
      if (items === null) {
        const response = await fetch('../../assets/data/admin-services.json', { signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error('Không tải được dịch vụ.');
        items = validate(await response.json());
      }
      return { items, snapshot, mode: lastMode };
    });
  }
  async function write(items, snapshot) {
    return locked(async () => {
      if (localStorage.getItem(key) !== snapshot)
        throw new Error('Danh mục đã thay đổi ở tab khác. Hãy đóng hộp thoại và tải lại trang trước khi lưu.');
      validate(items);
      const next = JSON.stringify(items), url = endpoint();
      lastMode = url ? 'offline' : 'local';
      if (url && !localStorage.getItem(pendingKey)) {
        let remote;
        try { remote = await request(url); } catch {}
        if (remote && JSON.stringify(remote) !== snapshot)
          throw new Error('Danh mục đã thay đổi ở tab khác. Hãy đóng hộp thoại và tải lại trang trước khi lưu.');
        if (remote) {
          try {
            const saved = await request(url, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({items}) });
            if (JSON.stringify(saved) !== next) throw new Error('Response mismatch');
            lastMode = 'remote';
          } catch { /* Ambiguous response: retain local edits; no automatic replay. */ }
        }
      }
      // Marker first: a failed local write must never allow a later remote refresh to erase edits.
      if (lastMode === 'offline') localStorage.setItem(pendingKey, 'pending');
      localStorage.setItem(key, next);
      channel?.postMessage({type:'changed'});
      return next;
    });
  }
  function saveNotice() {
    return lastMode === 'offline' ? ' Thay đổi chỉ lưu trên thiết bị; chưa xác nhận lưu trực tuyến.' :
      lastMode === 'remote' ? ' Đã lưu vào nguồn trực tuyến.' : ' Đã lưu trên trình duyệt này.';
  }
  window.CampusMindServices = Object.freeze({ key, categories, read, write, saveNotice });
  // Remote edits from another device are fetched while the page is visible.
  setInterval(() => { if (!document.hidden && window.CampusMindServiceConfig?.endpoint) changed(); }, 30000);
})();
