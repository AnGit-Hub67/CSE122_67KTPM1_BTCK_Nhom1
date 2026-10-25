(async () => {
  'use strict';
  // Shared frontend guard; production still requires server-side authorization.
  if ((await window.CampusSession.ready)?.role !== 'admin') return;
  const KEY = 'campusmind.admin.services.v1';
  const $ = (id) => document.getElementById(id);
  const labels = { active: 'Đang hoạt động', inactive: 'Tạm ngưng', archived: 'Đã lưu trữ' };
  const categories = ['Tham vấn', 'Đồng hành', 'Hoạt động nhóm', 'Workshop'];
  const fields = ['name', 'category', 'duration', 'description', 'status'];
  const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().trim();
  let services = [], editing = null, archiving = null, opener = null;
  function validRecord(s) {
    return s && typeof s.id === 'string' && s.id.length > 0 &&
      typeof s.name === 'string' && s.name.trim().length >= 3 && s.name.length <= 100 &&
      categories.includes(s.category) && Number.isInteger(s.duration) && s.duration >= 15 && s.duration <= 240 && s.duration % 5 === 0 &&
      typeof s.description === 'string' && s.description.trim().length >= 10 && s.description.length <= 500 && Object.hasOwn(labels, s.status);
  }
  function render() {
    const query = normalize($('service-search').value);
    const status = $('status-filter').value;
    const filtered = services.filter(s => (status === 'all' || s.status === status) && normalize(`${s.name} ${s.id} ${s.category}`).includes(query));
    for (const key of Object.keys(labels)) $(key + '-count').textContent = services.filter(s => s.status === key).length;
    $('result-count').textContent = `${filtered.length} / ${services.length} dịch vụ`;
    $('service-rows').replaceChildren();
    filtered.forEach(s => {
      const row = document.createElement('tr');
      const cell = () => { const td = document.createElement('td'); row.append(td); return td; };
      const name = cell();
      const title = document.createElement('strong'); title.textContent = s.name;
      const code = document.createElement('p'); code.textContent = s.id;
      const description = document.createElement('p'); description.textContent = s.description;
      name.append(title, code, description);
      cell().textContent = s.category; cell().textContent = `${s.duration} phút`;
      const badge = document.createElement('span'); badge.className = `badge ${s.status === 'active' ? 'teal' : s.status}`; badge.textContent = labels[s.status]; cell().append(badge);
      const actions = cell();
      if (s.status === 'archived') { actions.textContent = 'Chỉ xem'; }
      else {
        const group = document.createElement('div'); group.className = 'actions';
        for (const [action, text] of [['edit', 'Sửa'], ['archive', 'Lưu trữ']]) {
          const button = document.createElement('button'); button.type = 'button'; button.textContent = text;
          button.setAttribute('aria-label', `${text}: ${s.name}`); button.dataset.id = s.id; button.dataset.action = action; group.append(button);
        }
        actions.append(group);
      }
      $('service-rows').append(row);
    });
    $('table-wrap').hidden = filtered.length === 0;
    $('empty-state').hidden = filtered.length !== 0;
    $('empty-title').textContent = services.length ? 'Không tìm thấy dịch vụ' : 'Chưa có dịch vụ';
    $('empty-description').textContent = services.length ? 'Thử từ khóa khác hoặc xóa bộ lọc để xem danh sách.' : 'Chọn “Thêm dịch vụ” để tạo dịch vụ đầu tiên.';
  }
  async function load() {
    $('load-error').hidden = true; $('loading-state').hidden = false;
    $('table-wrap').hidden = true; $('empty-state').hidden = true;
    $('service-results').setAttribute('aria-busy', 'true'); $('add-service').disabled = true;
    try {
      const saved = localStorage.getItem(KEY);
      let data;
      if (saved !== null) data = JSON.parse(saved);
      else {
        const response = await fetch('../../assets/data/admin-services.json');
        if (!response.ok) throw new Error('Load failed');
        data = await response.json();
      }
      if (!Array.isArray(data) || !data.every(validRecord) || new Set(data.map(s => s.id)).size !== data.length) throw new Error('Invalid data');
      services = data; render(); $('add-service').disabled = false;
    } catch { $('load-error').hidden = false; $('result-count').textContent = 'Chưa tải được dữ liệu'; }
    finally { $('loading-state').hidden = true; $('service-results').setAttribute('aria-busy', 'false'); }
  }
  function persist(next, errorId) {
    if (window.CampusSession.current()?.role !== 'admin') {
      $(errorId).textContent = 'Phiên quản trị không còn hợp lệ. Đăng nhập lại.';
      $(errorId).hidden = false; return false;
    }
    try { localStorage.setItem(KEY, JSON.stringify(next)); services = next; return true; }
    catch { const error = $(errorId); error.textContent = 'Không thể lưu thay đổi. Kiểm tra quyền hoặc dung lượng lưu trữ của trình duyệt rồi thử lại. Nội dung bạn nhập vẫn được giữ.'; error.hidden = false; return false; }
  }
  function resetFilters() { $('service-search').value = ''; $('status-filter').value = 'all'; render(); }
  function openForm(service, button) {
    editing = service?.id ?? null; opener = button;
    $('service-form').reset(); $('save-error').hidden = true;
    for (const key of fields) { $(key + '-error').textContent = ''; $('service-' + key).removeAttribute('aria-invalid'); if (service) $('service-' + key).value = service[key]; }
    $('form-title').textContent = editing ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ';
    $('service-dialog').showModal(); $('service-name').focus();
  }
  for (const id of ['service-dialog', 'archive-dialog']) $(id).addEventListener('close', () => {
    if (opener?.isConnected) opener.focus(); else $('add-service').focus();
  });
  $('add-service').addEventListener('click', e => openForm(null, e.currentTarget));
  $('service-rows').addEventListener('click', e => {
    const button = e.target.closest('button[data-id]'); if (!button) return;
    const service = services.find(s => s.id === button.dataset.id); if (!service || service.status === 'archived') return;
    if (button.dataset.action === 'edit') openForm(service, button);
    else { archiving = service.id; opener = button; $('archive-error').hidden = true; $('archive-description').textContent = `Bạn sắp lưu trữ “${service.name}”.`; $('archive-dialog').showModal(); }
  });
  $('service-form').addEventListener('submit', e => {
    e.preventDefault(); $('save-error').hidden = true;
    const value = Object.fromEntries(fields.map(k => [k, $('service-' + k).value.trim()]));
    value.duration = Number(value.duration);
    const errors = {
      name: value.name.length < 3 || value.name.length > 100 ? 'Nhập tên từ 3 đến 100 ký tự.' : services.some(s => s.id !== editing && normalize(s.name) === normalize(value.name)) ? 'Tên dịch vụ đã tồn tại, kể cả dịch vụ đã lưu trữ.' : '',
      category: categories.includes(value.category) ? '' : 'Vui lòng chọn nhóm dịch vụ.',
      duration: Number.isInteger(value.duration) && value.duration >= 15 && value.duration <= 240 && value.duration % 5 === 0 ? '' : 'Nhập từ 15 đến 240 phút, theo bước 5 phút.',
      description: value.description.length >= 10 && value.description.length <= 500 ? '' : 'Nhập mô tả từ 10 đến 500 ký tự.',
      status: ['active', 'inactive'].includes(value.status) ? '' : 'Chọn trạng thái hợp lệ.'
    };
    for (const key of fields) { $(key + '-error').textContent = errors[key]; $('service-' + key).setAttribute('aria-invalid', String(!!errors[key])); }
    const first = fields.find(k => errors[k]); if (first) { $('service-' + first).focus(); return; }
    const next = editing ? services.map(s => s.id === editing ? { ...s, ...value } : s) : [...services, { id: 'CM-' + crypto.randomUUID(), ...value }];
    if (!persist(next, 'save-error')) return;
    resetFilters(); $('feedback').textContent = editing ? 'Đã cập nhật dịch vụ.' : 'Đã thêm dịch vụ.'; $('service-dialog').close();
  });
  $('confirm-archive').addEventListener('click', () => {
    if (!services.some(s => s.id === archiving && s.status !== 'archived')) return;
    const next = services.map(s => s.id === archiving ? { ...s, status: 'archived' } : s);
    if (!persist(next, 'archive-error')) return;
    render(); $('feedback').textContent = 'Đã lưu trữ dịch vụ. Bạn có thể tìm lại bằng bộ lọc “Đã lưu trữ”.'; $('archive-dialog').close();
  });
  $('service-search').addEventListener('input', render);
  $('status-filter').addEventListener('change', render);
  $('clear-filters').addEventListener('click', resetFilters);
  $('retry-load').addEventListener('click', load);
  load();
})();
