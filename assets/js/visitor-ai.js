/* Rule-based AI prototype: catalog matching, no diagnosis or external model. */
(() => {
  'use strict';
  const page = document.body.dataset.page;
  if (!['services', 'resources'].includes(page)) return;
  const isService = page === 'services';
  const key = isService ? 'campusmind.visitor.savedServices.v1' : 'campusmind.visitor.savedResources.v1';
  let items = [], revision = 0, offset = 0, ready = false;
  const el = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  const action = (label, handler) => {
    const button = el('button', label); button.type = 'button';
    button.addEventListener('click', handler); return button;
  };
  const panel = el('section', '', 'panel suggestion-panel');
  panel.id = 'suggestion-panel'; panel.setAttribute('aria-labelledby', 'suggestion-title');
  const heading = el('h2', isService ? 'AI-1 · Tìm hướng hỗ trợ phù hợp' : 'AI-2 · Gợi ý tài nguyên');
  heading.id = 'suggestion-title';
  const intro = el('p', 'Gợi ý mô phỏng theo chủ đề bạn chọn, không phải chẩn đoán hay tư vấn chuyên môn. Bạn quyết định nội dung muốn sử dụng.');
  const form = el('form'); form.noValidate = true;
  const label = el('label', 'Bạn muốn tìm hỗ trợ về chủ đề nào?'); label.htmlFor = 'suggestion-topic';
  const topic = el('select'); topic.id = 'suggestion-topic'; topic.disabled = true;
  const submit = el('button', 'Tạo gợi ý'); submit.type = 'submit'; submit.disabled = true;
  const status = el('p', 'Đang chuẩn bị danh mục…'); status.id = 'suggestion-status'; status.setAttribute('role', 'status');
  const loading = el('div', '', 'loading-skeleton'); loading.hidden = true; loading.setAttribute('aria-hidden', 'true');
  loading.append(el('span'), el('span'), el('span'));
  const result = el('div'); result.id = 'suggestion-result'; result.tabIndex = -1;
  const savedPanel = el('section', '', 'suggestion-saved'); savedPanel.setAttribute('aria-label', 'Lựa chọn đã lưu');
  form.append(label, topic, submit);
  panel.append(heading, intro, form, status, loading, result, savedPanel);
  document.querySelector('#filters').before(panel);

  function readSaved() {
    const ids = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(ids) || !ids.every(id => typeof id === 'string')) throw Error('Invalid saved list');
    return new Set(ids);
  }
  function renderSaved() {
    savedPanel.replaceChildren();
    try {
      const ids = readSaved(), matches = items.filter(item => ids.has(item.id));
      savedPanel.append(el('h3', isService ? 'Dịch vụ bạn đã chọn' : 'Tài nguyên bạn đã lưu'));
      if (!matches.length) savedPanel.append(el('p', 'Chưa có lựa chọn đã lưu trong danh mục hiện tại.'));
      for (const item of matches) {
        const row = el('div', '', 'suggestion-saved-row');
        row.append(el('span', item.title), action('Xem trong danh mục', () => apply(item)), action('Bỏ lưu', () => persist(item, false)));
        savedPanel.append(row);
      }
    } catch { savedPanel.append(el('p', 'Không đọc được danh sách đã lưu. Dữ liệu cũ được giữ nguyên; hãy kiểm tra bộ nhớ trình duyệt.')); }
  }
  function apply(item) {
    window.dispatchEvent(new CustomEvent('campusmind:accept-suggestion', {detail: {id: item.id}}));
  }
  function persist(item, add) {
    if (add && (!ready || !items.some(value => value.id === item.id))) {
      status.textContent = 'Danh mục đã thay đổi. Hãy tạo lại gợi ý trước khi lưu.'; return false;
    }
    try {
      const ids = readSaved(); add ? ids.add(item.id) : ids.delete(item.id);
      localStorage.setItem(key, JSON.stringify([...ids]));
      window.dispatchEvent(new StorageEvent('storage', {key}));
      renderSaved();
      status.textContent = add ? 'Đã chấp nhận và lưu trên trình duyệt này. Lựa chọn vẫn còn sau khi tải lại trang.' : 'Đã bỏ lưu lựa chọn.';
      if (add) apply(item);
      return true;
    } catch {
      status.textContent = 'Không thể lưu thay đổi. Dữ liệu cũ được giữ nguyên. Kiểm tra quyền hoặc dung lượng lưu trữ rồi thử lại.';
      return false;
    }
  }
  function clear(message) {
    revision++; result.replaceChildren(); loading.hidden = true;
    panel.setAttribute('aria-busy', 'false'); topic.disabled = !ready; submit.disabled = !ready;
    status.textContent = message;
  }
  window.addEventListener('campusmind:catalog-loading', () => {
    ready = false; clear('Đang tải danh mục để chuẩn bị gợi ý…'); savedPanel.replaceChildren();
  });
  window.addEventListener('campusmind:catalog-error', () => {
    ready = false; clear('Không tải được dữ liệu để gợi ý. Chọn Thử lại trong danh mục bên dưới.');
  });
  window.addEventListener('campusmind:catalog', event => {
    items = event.detail.items; ready = true;
    const previous = topic.value;
    topic.replaceChildren(new Option('Chọn chủ đề', ''), ...[...new Set(items.map(item => item.category))].map(value => new Option(value, value)), new Option('Tôi chưa xác định được chủ đề', '__unsure__'));
    if ([...topic.options].some(option => option.value === previous)) topic.value = previous;
    clear(items.length ? 'Chọn chủ đề để nhận gợi ý.' : 'Danh mục hiện chưa có nội dung. Chưa đủ dữ liệu để gợi ý.');
    renderSaved();
  });
  topic.addEventListener('change', () => { offset = 0; clear('Đã đổi chủ đề. Chọn Tạo gợi ý để phân tích lại.'); });
  async function generate() {
    if (!ready || submit.disabled) return;
    clear('Đang phân tích chủ đề và đối chiếu danh mục…');
    if (!topic.value || topic.value === '__unsure__') {
      status.textContent = 'Chưa đủ thông tin để gợi ý phù hợp. Hãy chọn một chủ đề cụ thể hoặc tự khám phá danh mục bên dưới.';
      result.append(action('Tự khám phá danh mục', () => document.querySelector('#search').focus()));
      topic.focus(); return;
    }
    const version = revision, chosenTopic = topic.value;
    submit.disabled = true; topic.disabled = true; loading.hidden = false; panel.setAttribute('aria-busy', 'true');
    await new Promise(resolve => setTimeout(resolve, 450));
    if (version !== revision) return;
    submit.disabled = false; topic.disabled = false; loading.hidden = true; panel.setAttribute('aria-busy', 'false');
    const candidates = items.filter(item => item.category === chosenTopic);
    if (!candidates.length) { status.textContent = 'Chưa có nội dung khớp chủ đề. Thử chủ đề khác hoặc khám phá danh mục.'; return; }
    const item = candidates[offset++ % candidates.length];
    const card = el('article', '', 'card suggestion-card');
    card.append(el('span', isService ? 'Hướng hỗ trợ đề xuất' : 'Tài nguyên đề xuất', 'badge'), el('h3', item.title), el('p', item.description), el('p', item.format || item.duration, 'meta'), el('h4', 'Vì sao có gợi ý này?'));
    const reasons = el('ul');
    reasons.append(el('li', `Khớp chủ đề bạn chọn: ${chosenTopic}.`), el('li', isService ? 'Dịch vụ đang hoạt động trong danh mục.' : 'Tài nguyên có nội dung để đọc trong thư viện.'), el('li', 'Kết quả dựa trên quy tắc khớp chủ đề; chưa đánh giá nhu cầu cá nhân hay mức độ sức khỏe.'));
    card.append(reasons);
    if (candidates.length === 1) card.append(el('p', 'Chủ đề này chỉ có một lựa chọn; tạo lại có thể trả về cùng kết quả.', 'meta'));
    const actions = el('div', '', 'actions');
    actions.append(action('Chấp nhận và lưu', () => persist(item, true)), action('Chỉnh sửa nhu cầu', () => { clear('Chọn lại chủ đề để chỉnh sửa nhu cầu.'); topic.focus(); }), action('Từ chối', () => { clear('Đã bỏ qua gợi ý. Các lựa chọn đã lưu không thay đổi.'); submit.focus(); }), action('Tạo lại', generate));
    card.append(actions); result.replaceChildren(card);
    status.textContent = 'Đã tạo gợi ý. Hãy kiểm tra lý do trước khi chấp nhận.'; result.focus();
  }
  form.addEventListener('submit', event => { event.preventDefault(); generate(); });
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) renderSaved(); });
})();
