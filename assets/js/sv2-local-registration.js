/* Explicit fictional workflow. No password, OTP, certificate or health text is stored. */
(() => {
  'use strict';
  const root = new URL('../../', document.currentScript.src);
  const KEY = 'campusmind.sv2.users.v1';
  const node = (tag, text) => { const n = document.createElement(tag); n.textContent = text; return n; };
  const panel = document.createElement('details');
  panel.className = 'auth-card local-registration';
  panel.append(node('summary', 'Đăng ký bằng dữ liệu giả định'));
  panel.append(node('p', 'Luồng cục bộ cho mục đích học tập, không xác thực danh tính. Chỉ nhập biệt danh và email @example.test. Không nhập mật khẩu, giấy tờ hoặc thông tin sức khỏe.'));
  const form = document.createElement('form');
  const field = (id, label, type) => {
    const l = node('label', label); l.htmlFor = id;
    const input = document.createElement(type === 'select' ? 'select' : 'input');
    input.id = id; if (type !== 'select') input.type = type;
    input.required = true; form.append(l, input); return input;
  };
  const name = field('local-name', 'Biệt danh giả định *', 'text'); name.minLength = 2; name.maxLength = 150;
  const email = field('local-email', 'Email giả định (@example.test) *', 'email'); email.maxLength = 254;
  const role = field('local-role', 'Vai trò *', 'select');
  role.append(new Option('Sinh viên', 'student'), new Option('Chuyên viên', 'counselor'));
  const submit = node('button', 'Tạo hồ sơ cục bộ'); submit.type = 'submit'; form.append(submit);
  const status = node('p', ''); status.id = 'local-registration-status'; status.setAttribute('role', 'status');
  const verify = node('button', 'Mô phỏng xác minh email'); verify.type = 'button'; verify.hidden = true;
  const login = node('a', 'Tiếp tục đăng nhập cục bộ'); login.href = new URL('sv2-login.html', root); login.hidden = true;
  panel.append(form, status, verify, login); document.querySelector('main').append(panel);
  const pendingKey = 'campusmind.sv2.pending-registration.v1';
  let pendingId = null, busy = false;
  try { pendingId = sessionStorage.getItem(pendingKey); } catch { }
  if (pendingId) { verify.hidden = false; panel.open = true; status.textContent = 'Bạn có hồ sơ sinh viên cục bộ chưa hoàn tất bước xác minh.'; }
  const locked = task => navigator.locks ? navigator.locks.request('campusmind.sv2.write', task) : task();
  const announce = () => { try { const c = new BroadcastChannel('campusmind.data'); c.postMessage({ sourceId: 'registration' }); c.close(); } catch { } };
  const run = async task => {
    if (busy) return; busy = true; submit.disabled = verify.disabled = true; form.setAttribute('aria-busy', 'true');
    try { await task(); } catch (e) { status.textContent = e.message; }
    finally { busy = false; submit.disabled = verify.disabled = false; form.setAttribute('aria-busy', 'false'); }
  };
  const ensureLocal = () => {
    if (CampusAPI.authConfigured('me') || CampusAPI.configured('users')) throw Error('Luồng cục bộ chỉ dùng khi chưa kết nối API người dùng và xác thực.');
  };
  form.addEventListener('submit', event => {
    event.preventDefault(); if (!form.reportValidity()) return;
    run(async () => {
      ensureLocal();
      const alias = name.value.trim(), address = email.value.trim().toLowerCase(), selectedRole = role.value;
      if (alias.length < 2 || alias.length > 150) throw Error('Biệt danh cần 2–150 ký tự.');
      if (!/^[a-z0-9._+-]+@example\.test$/.test(address)) throw Error('Chỉ dùng email giả định kết thúc bằng @example.test.');
      await SV2Store.initRegistration();
      await locked(() => {
        const users = SV2Store.read().users;
        if (users.some(u => u.email.toLowerCase() === address)) throw Error('Email này đã có hồ sơ. Dùng email giả định khác hoặc đăng nhập.');
        const user = { id: crypto.randomUUID(), name: alias, email: address, role: selectedRole, status: 'disabled', emailVerified: false, localRegistration: true };
        if (selectedRole === 'counselor') user.approval = 'pending';
        users.push(user); localStorage.setItem(KEY, JSON.stringify(users)); pendingId = user.id;
        if (selectedRole === 'student') sessionStorage.setItem(pendingKey, pendingId);
        else sessionStorage.removeItem(pendingKey);
        announce();
      });
      form.reset(); login.hidden = true; verify.hidden = selectedRole !== 'student';
      status.textContent = selectedRole === 'student' ? 'Đã tạo hồ sơ cục bộ. Chọn mô phỏng xác minh email để kích hoạt.' : 'Hồ sơ cục bộ đang chờ duyệt. Đăng nhập bằng tài khoản quản trị cục bộ và duyệt trong Quản lý người dùng.';
      if (selectedRole === 'counselor') { login.hidden = false; login.href = new URL('sv2-login.html?role=admin', root); }
    });
  });
  verify.addEventListener('click', () => run(async () => {
    ensureLocal(); await SV2Store.initRegistration();
    await locked(() => {
      const users = SV2Store.read().users, user = users.find(u => u.id === pendingId && u.role === 'student' && u.localRegistration);
      if (!user) throw Error('Hồ sơ không còn tồn tại.');
      user.emailVerified = true; user.status = 'active'; localStorage.setItem(KEY, JSON.stringify(users)); announce();
    });
    sessionStorage.removeItem(pendingKey);
    verify.hidden = true; login.hidden = false; login.href = new URL('sv2-login.html?role=student', root);
    status.textContent = 'Đã hoàn tất bước xác minh cục bộ; không gửi email thật. Bạn có thể chọn tài khoản vừa tạo khi đăng nhập cục bộ.';
  }));
})();
