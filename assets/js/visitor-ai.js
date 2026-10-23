/* TASK-19 mock: deterministic catalog matching, no external AI or health advice. */
(() => {
  'use strict';
  const page = document.body.dataset.page;
  if (!['services', 'resources'].includes(page)) return;
  const savedKey = 'campusmind.visitor.savedResources.v1';
  let items = [], revision = 0, offset = 0, current;
  const node = (tag, text) => { const n = document.createElement(tag); if (text) n.textContent = text; return n; };
  const panel = node('section'); panel.className = 'panel suggestion-panel'; panel.setAttribute('aria-labelledby', 'suggestion-title');
  const heading = node('h2', page === 'services' ? 'Gợi ý dịch vụ · AI-1 mô phỏng' : 'Gợi ý tài nguyên · AI-2 mô phỏng'); heading.id = 'suggestion-title';
  const note = node('p', 'Chọn chủ đề để thử gợi ý theo danh mục. Đây là mô phỏng quy tắc, không phải AI thật hoặc tư vấn chuyên môn.');
  const form = node('form'); const label = node('label', 'Chủ đề bạn muốn khám phá'); label.htmlFor = 'suggestion-topic';
  const topic = node('select'); topic.id = 'suggestion-topic';
  const submit = node('button', 'Tạo gợi ý'); submit.type = 'submit'; submit.disabled = true;
  const status = node('p', 'Đang chuẩn bị danh mục…'); status.setAttribute('role', 'status');
  const result = node('div'); result.id = 'suggestion-result'; result.tabIndex = -1;
  form.append(label, topic, submit); panel.append(heading, note, form, status, result);
  document.getElementById('filters').before(panel);
  function action(text, fn) { const b = node('button', text); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function clear(message) { revision++; current = null; result.replaceChildren(); status.textContent = message; panel.setAttribute('aria-busy', 'false'); }
  window.addEventListener('campusmind:catalog-loading', () => { clear('Đang tải lại danh mục…'); submit.disabled = true; topic.disabled = true; });
  window.addEventListener('campusmind:catalog-error', () => { clear('Không tải được danh mục để gợi ý. Dùng nút Thử lại ở danh mục bên dưới.'); submit.disabled = true; topic.disabled = true; });
  window.addEventListener('campusmind:catalog', event => {
    items = event.detail.items;
    const previous = topic.value;
    topic.replaceChildren(new Option('Chọn chủ đề', ''), ...[...new Set(items.map(item => item.category))].map(value => new Option(value, value)));
    if ([...topic.options].some(o => o.value === previous)) topic.value = previous;
    clear(items.length ? 'Sẵn sàng tạo gợi ý.' : 'Chưa có nội dung trong danh mục.'); submit.disabled = !items.length; topic.disabled = !items.length;
  });
  topic.addEventListener('change', () => { offset = 0; clear('Đã thay đổi chủ đề. Chọn Tạo gợi ý để tiếp tục.'); });
  async function generate() {
    if (!topic.value) { status.textContent = 'Vui lòng chọn một chủ đề.'; topic.focus(); return; }
    clear('Đang tạo gợi ý mô phỏng…'); const version = revision;
    submit.disabled = true; topic.disabled = true; panel.setAttribute('aria-busy', 'true');
    await new Promise(resolve => setTimeout(resolve, 400));
    if (version !== revision) return;
    const candidates = items.filter(item => item.category === topic.value);
    submit.disabled = false; topic.disabled = false; panel.setAttribute('aria-busy', 'false');
    if (!candidates.length) { status.textContent = 'Không có gợi ý phù hợp. Thử chủ đề khác.'; return; }
    current = candidates[offset++ % candidates.length];
    const selected = current;
    result.append(node('h3', selected.title), node('p', selected.description), node('p', `Lý do gợi ý: nội dung thuộc chủ đề “${selected.category}” bạn đã chọn. ${candidates.length === 1 ? 'Chủ đề hiện chỉ có một lựa chọn.' : ''}`));
    const actions = node('div'); actions.className = 'actions';
    actions.append(action('Chấp nhận và xem', () => {
      window.dispatchEvent(new CustomEvent('campusmind:accept-suggestion', { detail: selected })); status.textContent = 'Đã lọc danh mục theo gợi ý bạn chọn.';
    }), action('Sửa chủ đề', () => { clear('Chọn lại chủ đề để sửa yêu cầu.'); topic.focus(); }), action('Bỏ qua gợi ý', () => { clear('Đã bỏ qua gợi ý.'); submit.focus(); }), action('Tạo lại', generate));
    if (page === 'resources') actions.append(action('Lưu gợi ý', async () => {
      const write = () => {
        const saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
        if (!Array.isArray(saved) || !saved.every(id => typeof id === 'string')) throw Error('Dữ liệu mục đã lưu bị lỗi.');
        localStorage.setItem(savedKey, JSON.stringify([...new Set([...saved, selected.id])]));
      };
      try {
        if (navigator.locks) await navigator.locks.request(savedKey, write); else write();
        window.dispatchEvent(new StorageEvent('storage', { key: savedKey }));
        status.textContent = 'Đã lưu tài nguyên. Bạn có thể xem hoặc bỏ lưu trong danh mục.';
      } catch { status.textContent = 'Không thể lưu gợi ý. Dữ liệu cũ được giữ nguyên; kiểm tra bộ nhớ rồi thử lại.'; }
    }));
    result.append(actions); status.textContent = 'Đã tạo gợi ý. Bạn quyết định có sử dụng hay không.'; result.focus();
  }
  form.addEventListener('submit', event => { event.preventDefault(); generate(); });
})();
