(() => {
  'use strict';
  const S = window.SV2Store, $ = id => document.getElementById(id), screen = document.body.dataset.screen;
  const labels = { Pending: 'Chờ xác nhận', Confirmed: 'Đã xác nhận', Completed: 'Hoàn thành', Cancelled: 'Đã hủy', active: 'Hoạt động', disabled: 'Vô hiệu hóa' };
  const topics = { general: 'Trao đổi chung', study: 'Học tập', career: 'Định hướng', connection: 'Kết nối' };
  const roles = { student: 'Sinh viên', counselor: 'Chuyên viên', admin: 'Quản trị viên' };
  let state, selected = '', editingUser = null, action = null, returnFocus = null;
  const editId = new URLSearchParams(location.search).get('edit');
  const el = (tag, text = '', cls = '') => { const n = document.createElement(tag); n.textContent = text; if (cls) n.className = cls; return n; };
  const link = (label, url, cls = '') => { const a = el('a', label, cls); a.href = url; return a; };
  const button = (label, fn) => { const b = el('button', label); b.type = 'button'; b.addEventListener('click', fn); return b; };
  const badge = status => { const b = el('span', labels[status], 'badge'); b.dataset.status = status; return b; };
  const name = id => state.users.find(u => u.id === id)?.name || S.directory.counselors.find(c => c.id === id)?.name || 'Chuyên viên chưa xác định';
  const mine = () => state.schedule.appointments.filter(a => a.studentId === S.studentId);
  const when = a => `${a.date.split('-').reverse().join('/')} · ${a.time}–${a.end || '…'} (UTC+7)`;
  const error = err => { $('work-error').textContent = message(err); $('work-error').hidden = false; $('retry').hidden = false; };
  const message = err => err instanceof SyntaxError ? 'JSON lưu trữ bị lỗi. Dữ liệu hiện có được giữ nguyên; xem README để sao lưu và khôi phục.' : err.name === 'QuotaExceededError' || err.name === 'SecurityError' ? 'Không thể lưu/đọc dữ liệu trình duyệt. Kiểm tra quyền và dung lượng rồi thử lại; thao tác chưa được lưu.' : err.message || 'Có lỗi xảy ra. Hãy thử lại.';
  function confirmation(title, body, fn) {
    returnFocus = document.activeElement; action = fn; $('confirm-title').textContent = title; $('confirm-body').textContent = body; $('confirm-error').textContent = ''; $('confirm-yes').disabled = false; $('confirm-no').disabled = false; $('confirm-dialog').showModal();
  }
  $('confirm-no').addEventListener('click', () => $('confirm-dialog').close());
  $('confirm-dialog').addEventListener('close', () => { action = null; if (returnFocus?.isConnected && returnFocus.getClientRects().length) returnFocus.focus(); else $('main').focus(); });
  $('confirm-dialog').addEventListener('cancel', e => { if ($('confirm-yes').disabled) e.preventDefault(); });
  $('confirm-yes').addEventListener('click', async () => {
    if (!action) return; $('confirm-yes').disabled = true; $('confirm-no').disabled = true;
    try { await action(); $('confirm-dialog').close(); } catch (err) { $('confirm-error').textContent = message(err); } finally { $('confirm-yes').disabled = false; $('confirm-no').disabled = false; }
  });
  function success(next, text) { state = next; $('work-error').hidden = true; $('work-status').textContent = text; }
  function stats(items) { $('summary').replaceChildren(...items.map(([label, value]) => { const p = el('div', '', 'sv2-stat'); p.append(el('strong', String(value)), el('span', label)); return p; })); }
  function appointment(a, actions = true) {
    const card = el('article', '', 'panel'); card.append(el('h2', name(S.counselorOf(a))), el('p', when(a)), badge(a.status), el('p', `Mã lịch: ${a.id}`, 'meta'));
    card.append(el('p', 'Chủ đề: ' + (topics[a.topic] || 'Chưa ghi nhận')));
    card.append(el('p', a.format === 'onsite' ? 'Hình thức: Trực tiếp' : 'Hình thức: Trực tuyến'));
    if (actions) {
      const row = el('div', '', 'actions'); const can = ['Pending', 'Confirmed'].includes(a.status) && S.future(a.date, a.time);
      if (can) { row.append(link('Đổi lịch', `student-booking.html?edit=${encodeURIComponent(a.id)}`, 'button'), button('Hủy lịch', () => confirmation('Hủy lịch hẹn?', `${name(S.counselorOf(a))} · ${when(a)}. Bạn có thể đặt lịch mới sau khi hủy.`, async () => { success(await S.cancel(state, a.id), 'Đã hủy lịch hẹn.'); renderAppointments(); }))); }
      else { const b = button('Không thể đổi / hủy', () => { }); b.disabled = true; row.append(b); card.append(el('p', 'Chỉ đổi hoặc hủy lịch đang chờ hoặc đã xác nhận còn ở tương lai.', 'meta')); } card.append(row);
    } return card;
  }
  function renderDashboard() {
    const all = mine(); stats([['Lịch đang chờ / đã xác nhận', all.filter(a => ['Pending', 'Confirmed'].includes(a.status)).length], ['Buổi gặp hoàn thành', all.filter(a => a.status === 'Completed').length], ['Lịch đã hủy', all.filter(a => a.status === 'Cancelled').length]]);
    const next = all.filter(a => ['Pending', 'Confirmed'].includes(a.status) && S.future(a.date, a.time)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
    $('upcoming').replaceChildren(next ? appointment(next, false) : el('p', 'Bạn chưa có lịch hẹn sắp tới. Chọn một thời gian khi bạn sẵn sàng.', 'sv2-empty'));
    const savedIDs = JSON.parse(localStorage.getItem('campusmind.visitor.savedResources.v1') || '[]');
    if (!Array.isArray(savedIDs) || !savedIDs.every(id => typeof id === 'string')) throw Error('Danh sách tài nguyên đã lưu không hợp lệ.');
    const savedResources = S.directory.resources.filter(r => savedIDs.includes(r.id));
    $('resources').replaceChildren(...savedResources.map(r => { const item = el('article', '', 'sv2-resource'); item.append(el('h3', r.title), el('p', r.description)); return item; }));
    if (!savedResources.length) $('resources').append(el('p', 'Bạn chưa lưu tài nguyên nào. Mở thư viện để chọn tài nguyên.', 'sv2-empty'));
    window.SV2AI?.init(S);
  }
  function renderAppointments() {
    const q = $('search').value.trim().toLocaleLowerCase('vi'), status = $('status-filter').value;
    const rows = mine().filter(a => (!status || a.status === status) && `${a.id} ${name(S.counselorOf(a))} ${a.date}`.toLocaleLowerCase('vi').includes(q)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    $('result-count').textContent = `${rows.length} lịch hẹn phù hợp`;
    $('appointments').replaceChildren(...rows.map(a => appointment(a)));
    if (!rows.length) { const p = el('div', '', 'state'); p.append(el('h2', mine().length ? 'Không tìm thấy lịch phù hợp' : 'Chưa có lịch hẹn'), el('p', mine().length ? 'Thử đổi từ khóa hoặc xóa bộ lọc.' : 'Lịch đặt thành công sẽ xuất hiện tại đây.'), link('Đặt lịch mới', 'student-booking.html', 'button primary')); $('appointments').append(p); }
  }
  function renderSlots() {
    selected = ''; $('book').disabled = true; $('selection').textContent = 'Chọn một khung giờ khả dụng để tiếp tục.';
    const cid = $('counselor').value, c = S.directory.counselors.find(c => c.id === cid);
    for (const option of $('format').options) option.disabled = Boolean(c && !c.format.includes(option.value === 'online' ? 'Trực tuyến' : 'Trực tiếp'));
    if ($('format').selectedOptions[0]?.disabled) $('format').value = [...$('format').options].find(o => !o.disabled)?.value || '';
    $('counselor-info').textContent = c ? `${c.role} · ${c.format}` : '';
    const dates = [...new Set(state.schedule.slots.filter(s => S.counselorOf(s) === cid && S.available(state, s, editId)).map(s => s.date))].sort();
    $('date-help').textContent = cid ? (dates.length ? 'Ngày còn lịch trống: ' + dates.slice(0, 5).map(d => d.split('-').reverse().join('/')).join(', ') + '.' : 'Chuyên viên chưa có lịch trống. Vui lòng chọn chuyên viên khác.') : 'Chọn chuyên viên để xem các ngày còn lịch trống.';
    const slots = state.schedule.slots.filter(s => S.counselorOf(s) === cid && s.date === $('date').value).sort((a, b) => a.start.localeCompare(b.start));
    $('slots').replaceChildren();
    if (!slots.length) $('slots').append(el('p', 'Không có khung giờ ngày này. Hãy chọn ngày hoặc chuyên viên khác.', 'sv2-empty'));
    for (const s of slots) {
      const label = el('label', '', 'sv2-slot'), input = document.createElement('input'); input.type = 'radio'; input.name = 'slot'; input.value = s.id; input.required = true; input.disabled = !S.available(state, s, editId) || state.schedule.appointments.some(a => a.id === editId && a.slotId === s.id);
      input.addEventListener('change', () => { selected = s.id; $('book').disabled = false; $('selection').textContent = `${name(cid)} · ${s.date} · ${s.start}–${s.end} (UTC+7)${s.source === 'sv2-mock' ? ' · Khung giờ dự kiến' : ''}`; });
      label.append(input, el('span', `${s.start}–${s.end}${input.disabled ? ' · Không khả dụng' : ''}${s.source === 'sv2-mock' ? ' · Dự kiến' : ''}`)); $('slots').append(label);
    }
  }
  function setupBooking() {
    const old = editId ? mine().find(a => a.id === editId) : null;
    if (editId && (!old || !['Pending', 'Confirmed'].includes(old.status) || !S.future(old.date, old.time))) throw Error('Lịch yêu cầu đổi không tồn tại, không thuộc sinh viên hoặc đã đóng/quá giờ. Quay lại trang Lịch hẹn của tôi.');
    $('booking-title').textContent = editId ? 'Chọn thời gian thay thế' : 'Chọn lịch hẹn'; $('book').textContent = editId ? 'Xem lại đổi lịch' : 'Đặt lịch';
    $('specialty').replaceChildren(new Option('Tất cả chuyên môn', ''), ...[...new Set(S.directory.counselors.flatMap(c => c.expertise || [c.role]))].map(t => new Option(t, t)));
    $('counselor').replaceChildren(el('option', 'Chọn chuyên viên'))
      ; $('counselor').firstChild.value = '';
    for (const c of S.directory.counselors) { const o = el('option', name(c.id)); o.value = c.id; o.disabled = !state.users.some(u => u.id === c.id && u.role === 'counselor' && u.status === 'active'); $('counselor').append(o); }
    $('date').min = S.today();
    const requested = new URLSearchParams(location.search).get('counselor');
    const cid = old ? S.counselorOf(old) : requested;
    if (cid && [...$('counselor').options].some(o => o.value === cid && !o.disabled)) $('counselor').value = cid;
    $('date').value = old?.date || state.schedule.slots.filter(s => S.counselorOf(s) === cid && S.available(state, s)).map(s => s.date).sort()[0] || S.today(); $('reason').value = ''; $('topic').value = old?.topic || 'general'; if (old?.format) $('format').value = old.format; renderSlots();
  }
  $('booking-form')?.addEventListener('submit', e => {
    e.preventDefault(); if (!$('booking-form').reportValidity() || !selected) return;
    const reason = $('reason').value.trim(); if (reason.length > 500) { $('reason-error').textContent = 'Ghi chú tối đa 500 ký tự.'; $('reason').setAttribute('aria-invalid', 'true'); $('reason').focus(); return; }
    $('reason-error').textContent = ''; $('reason').setAttribute('aria-invalid', 'false');
    const slotId = selected; confirmation(editId ? 'Xác nhận đổi lịch?' : 'Xác nhận đặt lịch?', $('selection').textContent + ' · Chủ đề: ' + topics[$('topic').value] + (reason ? ' · Ghi chú: ' + reason : '') + (editId ? ' · Lịch cũ sẽ được thay thế và chuyển về trạng thái chờ xác nhận.' : ''), async () => {
      success(await S.book(state, slotId, editId, reason, { format: $('format').value, topic: $('topic').value }), editId ? 'Đã đổi lịch. Yêu cầu đang chờ xác nhận.' : 'Đặt lịch thành công. Yêu cầu đang chờ xác nhận.'); $('reason').value = ''; renderSlots();
    });
  });
  $('specialty')?.addEventListener('change', () => { for (const option of $('counselor').options) { const c = S.directory.counselors.find(c => c.id === option.value); if (c) { const match = !$('specialty').value || (c.expertise || [c.role]).includes($('specialty').value); option.hidden = !match; option.disabled = !match || !state.users.some(u => u.id === c.id && u.status === 'active' && u.role === 'counselor'); } } $('counselor').value = ''; renderSlots(); });
  $('export-summary')?.addEventListener('click', () => { const counts = Object.fromEntries(['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => [status, mine().filter(a => a.status === status).length])); const url = URL.createObjectURL(new Blob([JSON.stringify({ generatedAt: new Date().toISOString(), counts }, null, 2)], { type: 'application/json' })); const a = link('Tải', url); a.download = 'campusmind-summary.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
  $('date')?.addEventListener('change', renderSlots);
  $('counselor')?.addEventListener('change', () => {
    $('date').value = state.schedule.slots.filter(s => S.counselorOf(s) === $('counselor').value && S.available(state, s, editId)).map(s => s.date).sort()[0] || S.today(); renderSlots();
  });
  function renderUsers() {
    stats([['Tổng người dùng', state.users.length], ['Đang hoạt động', state.users.filter(u => u.status === 'active').length], ['Đã vô hiệu hóa', state.users.filter(u => u.status === 'disabled').length]]);
    const q = $('search').value.trim().toLocaleLowerCase('vi'), role = $('role-filter').value, status = $('status-filter').value;
    const rows = state.users.filter(u => (!role || u.role === role) && (!status || u.status === status) && `${u.name} ${u.email} ${u.id}`.toLocaleLowerCase('vi').includes(q));
    $('result-count').textContent = `${rows.length} / ${state.users.length} người dùng`; $('users-empty').hidden = rows.length > 0; $('users').replaceChildren();
    for (const u of rows) {
      const row = el('tr'), who = el('td', u.name); const statusCell = el('td'); statusCell.append(badge(u.status)); const actions = el('td'), wrap = el('div', '', 'actions');
      const edit = button('Chỉnh sửa', () => { editingUser = u.id; $('edit-title').textContent = 'Chỉnh sửa người dùng'; $('edit-id').textContent = u.email; $('edit-name').value = u.name; $('edit-email').value = u.email; $('edit-role').value = u.role; $('edit-error').textContent = ''; $('edit-dialog').showModal(); }); edit.setAttribute('aria-label', 'Chỉnh sửa ' + u.name);
      const toggle = button(u.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt', () => confirmation(u.status === 'active' ? 'Vô hiệu hóa người dùng?' : 'Kích hoạt người dùng?', `${u.name} (${u.email}). ${u.status === 'active' ? 'Dữ liệu và lịch hẹn hiện có sẽ được giữ lại.' : ''}`, async () => { success(await S.updateUser(state, u.id, { status: u.status === 'active' ? 'disabled' : 'active' }), 'Đã cập nhật trạng thái người dùng.'); renderUsers(); }));
      toggle.setAttribute('aria-label', (u.status === 'active' ? 'Vô hiệu hóa ' : 'Kích hoạt ') + u.name); toggle.disabled = u.id === S.currentUser()?.id;
      const remove = button('Xóa', () => confirmation('Xóa người dùng?', u.name + ' · Chỉ xóa nếu chưa có lịch liên kết.', async () => { success(await S.deleteUser(state, u.id), 'Đã xóa người dùng.'); renderUsers(); })); remove.disabled = u.id === S.currentUser()?.id;
      wrap.append(edit, toggle, remove);
      if (u.role === 'counselor') {
        statusCell.append(el('small', u.approval === 'approved' ? 'Đã xác minh' : u.approval === 'rejected' ? 'Từ chối' : 'Chờ xác minh'));
        for (const [decision, label] of [['approved', 'Duyệt hồ sơ'], ['rejected', 'Từ chối hồ sơ']]) { const b = button(label, () => { let reason = ''; if (decision === 'rejected') { reason = prompt('Lý do từ chối (ít nhất 5 ký tự)') || ''; if (!reason) return; } confirmation(label + '?', u.name, async () => { success(await S.approval(u.id, decision, reason), CampusAPI.authConfigured('approval') ? 'Máy chủ đã cập nhật hồ sơ.' : 'Đã cập nhật trạng thái hồ sơ cục bộ.'); renderUsers(); }); }); b.disabled = !CampusAPI.authConfigured('approval') && CampusAuth.current()?.mode !== 'local'; b.title = b.disabled ? 'Cần API phê duyệt và gửi email trên máy chủ' : ''; wrap.append(b); }
      } actions.append(wrap); if (toggle.disabled) actions.append(el('small', 'Tài khoản quản trị đang dùng')); row.append(who, el('td', u.email), el('td', roles[u.role]), statusCell, actions); $('users').append(row);
    }
  }
  $('add-user')?.addEventListener('click', () => { editingUser = null; $('edit-form').reset(); $('edit-title').textContent = 'Thêm người dùng'; $('edit-id').textContent = 'Tài khoản mới sẽ có trạng thái Hoạt động.'; $('edit-error').textContent = ''; $('edit-dialog').showModal(); });
  $('edit-form')?.addEventListener('submit', e => {
    e.preventDefault(); if (!$('edit-form').reportValidity()) return;
    const patch = { name: $('edit-name').value.trim(), email: $('edit-email').value.trim().toLowerCase(), role: $('edit-role').value };
    if (!patch.name) { $('edit-error').textContent = 'Họ tên không được chỉ chứa khoảng trắng.'; $('edit-name').focus(); return; }
    if (state.users.some(u => u.id !== editingUser && u.email.toLowerCase() === patch.email)) { $('edit-error').textContent = 'Email đã được sử dụng.'; $('edit-email').focus(); return; }
    confirmation(editingUser ? 'Lưu thay đổi người dùng?' : 'Thêm người dùng mới?', `${patch.name} · ${patch.email} · ${roles[patch.role]}`, async () => { success(editingUser ? await S.updateUser(state, editingUser, patch) : await S.createUser(state, patch), editingUser ? 'Đã lưu thông tin người dùng.' : 'Đã thêm người dùng.'); $('edit-dialog').close(); renderUsers(); });
  });
  function renderList() { if (screen === 'student-appointments') renderAppointments(); else if (screen === 'admin-user-management') renderUsers(); }
  ['search', 'status-filter', 'role-filter'].forEach(id => $(id)?.addEventListener('input', renderList));
  $('clear')?.addEventListener('click', () => { ['search', 'status-filter', 'role-filter'].forEach(id => { if ($(id)) $(id).value = ''; }); renderList(); });
  async function load() {
    $('loading-skeleton').hidden = false; $('work-content').hidden = true; $('work-content').setAttribute('aria-busy', 'true'); $('work-error').hidden = true; $('retry').hidden = true; $('work-status').textContent = 'Đang tải dữ liệu…';
    try {
      await window.CampusSession?.ready; state = await S.init();
      const id = S.currentUser()?.id, role = document.body.dataset.role;
      if (!state.users.some(u => u.id === id && u.role === role && u.status === 'active')) throw Error('Bạn chưa đăng nhập đúng vai trò hoặc tài khoản đã bị vô hiệu hóa. Chọn Đăng nhập để tiếp tục.');
      if ($('data-mode')) $('data-mode').textContent = CampusAPI.configured('schedule') ? 'Đang dùng dịch vụ dữ liệu REST; không dùng cho dữ liệu sức khỏe cá nhân hoặc xác thực danh tính.' : 'Dữ liệu cục bộ chỉ dành cho thông tin giả định; chưa kết nối dịch vụ tham vấn thật.'; if (screen === 'student-dashboard') renderDashboard(); else if (screen === 'student-booking') setupBooking(); else renderList();
      $('work-content').hidden = false; $('work-status').textContent = role === 'student' ? 'Tài khoản: ' + state.users.find(u => u.id === id).name : 'Dữ liệu đã sẵn sàng.';
    } catch (err) { error(err); $('retry').hidden = false; $('work-status').textContent = 'Tải dữ liệu thất bại.'; }
    finally { $('loading-skeleton').hidden = true; $('work-content').setAttribute('aria-busy', 'false'); }
  }
  // Do not discard an in-progress form or confirmation on external changes.
  function externalChange() { if (screen === 'student-booking' || document.querySelector('dialog[open]')) { error(Error('Dữ liệu vừa thay đổi. Nội dung đang nhập được giữ. Thử tải lại trước khi xác nhận.')); } else load(); }
  window.addEventListener('storage', e => { if ([S.KEY, S.USERS, null].includes(e.key)) externalChange(); else if (e.key === 'campusmind.visitor.savedResources.v1' && screen === 'student-dashboard') { try { renderDashboard(); } catch (err) { error(err); } } });
  if (typeof BroadcastChannel === 'function') { const channel = new BroadcastChannel('campusmind.data'); channel.onmessage = e => { if (e.data?.sourceId !== window.CampusDataSource) externalChange(); }; }
  $('retry').addEventListener('click', load); load();
})();
