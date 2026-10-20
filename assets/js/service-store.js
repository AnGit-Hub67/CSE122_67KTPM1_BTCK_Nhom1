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
  async function read() {
    const snapshot = localStorage.getItem(key);
    if (snapshot !== null) return { items: validate(JSON.parse(snapshot)), snapshot };
    const response = await fetch("../../assets/data/admin-services.json", { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Không tải được dịch vụ.");
    return { items: validate(await response.json()), snapshot };
  }
  async function write(items, snapshot) {
    const commit = () => {
      if (localStorage.getItem(key) !== snapshot)
        throw new Error("Danh mục đã thay đổi ở tab khác. Hãy đóng hộp thoại và tải lại trang trước khi lưu.");
      validate(items);
      const next = JSON.stringify(items);
      localStorage.setItem(key, next);
      return next;
    };
    // Serialize writes across same-origin tabs, then reject stale edits.
    return navigator.locks ? navigator.locks.request(key, commit) : commit();
  }
  window.CampusMindServices = Object.freeze({ key, categories, read, write });
})();
