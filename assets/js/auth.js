(() => {
  'use strict';
  const $ = id => document.getElementById(id), API = window.CampusAPI;
  let role = new URLSearchParams(location.search).get('role') || 'student', busy = false, lockedUntil = 0;
  if (!['student', 'counselor', 'admin'].includes(role)) role = 'student';
  const registration = document.body.dataset.auth === 'register';
  const say = (message, error = false) => { $('auth-status').textContent = message; $('auth-status').setAttribute('role', error ? 'alert' : 'status'); };
  const run = async fn => { if (busy || lockedUntil > Date.now()) return; busy = true; $('auth-submit').disabled = true; $('auth-form').setAttribute('aria-busy', 'true'); try { await fn(); } catch (e) { say(e.message, true); if (e.retryAt) { const until = Date.parse(e.retryAt); if (Number.isFinite(until)) lockedUntil = until; } if (e.challenge) { $('challenge').hidden = false; say(e.message + ' Hãy hoàn tất bước xác thực do máy chủ yêu cầu.', true); } } finally { busy = false; $('auth-submit').disabled = (registration && role === 'admin') || lockedUntil > Date.now(); $('auth-form').setAttribute('aria-busy', 'false'); } };
  setInterval(() => { if (!lockedUntil) return; const seconds = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)); say(seconds ? 'Máy chủ tạm khóa đăng nhập. Thử lại sau ' + Math.floor(seconds / 60) + ' phút ' + seconds % 60 + ' giây.' : 'Có thể gửi lại yêu cầu; máy chủ sẽ kiểm tra trạng thái tài khoản.'); if (!seconds) { lockedUntil = 0; $('auth-submit').disabled = registration && role === 'admin'; } }, 1000);
  function choose(next) {
    role = next; $('auth-form').reset(); $('challenge').hidden = true;
    document.querySelectorAll('[data-role-choice]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.roleChoice === role)));
    document.querySelectorAll('[data-only]').forEach(e => { e.hidden = e.dataset.only !== role; for (const input of e.querySelectorAll('input,select,textarea')) input.disabled = e.hidden; });
    $('role-title').textContent = { student: 'Sinh viên', counselor: 'Chuyên viên tâm lý', admin: 'Quản trị viên' }[role];
    if (registration) document.querySelector('label[for=email]').textContent = role === 'counselor' ? 'Email công việc *' : 'Email *';
    if ($('register-link')) { $('register-link').hidden = role === 'admin'; $('register-link').href = 'register.html?role=' + role; $('register-link').textContent = role === 'counselor' ? 'Tạo tài khoản chuyên viên' : 'Tạo tài khoản sinh viên'; }
    if (!registration) { let invitation = $('invitation-link'); if (!invitation) { invitation = document.createElement('a'); invitation.id = 'invitation-link'; invitation.href = 'admin-invitation.html'; invitation.textContent = 'Tiếp nhận lời mời quản trị'; $('auth-form').querySelector('.actions').append(invitation); } invitation.hidden = role !== 'admin'; }
    $('auth-submit').disabled = (registration && role === 'admin') || lockedUntil > Date.now();
    $('auth-submit').textContent = registration ? 'Gửi đăng ký' : 'Đăng nhập';
    say(registration && role === 'admin' ? 'Quản trị viên chỉ nhận lời mời có thời hạn từ quản trị viên cấp cao.' : API.authConfigured(registration ? (role === 'student' ? 'registerStudent' : 'registerCounselor') : 'login') ? 'Sẵn sàng kết nối máy chủ.' : 'Chưa kết nối máy chủ xác thực. Biểu mẫu chưa gửi; không nhập mật khẩu hoặc hồ sơ thật.');
    if (!registration) { document.querySelector('details.auth-card').hidden = API.authConfigured('me'); loadLocal(); }
  }
  async function loadLocal() {
    try { const { users } = await SV2Store.initRegistration(); $('account').replaceChildren(new Option('Chọn tài khoản cục bộ', ''), ...users.filter(u => u.role === role && u.status === 'active' && !(u.localRegistration && u.role === 'counselor' && u.approval !== 'approved')).map(u => new Option(u.name, u.id))); } catch (e) { say(e.message, true); }
  }
  document.querySelectorAll('[data-role-choice]').forEach(b => b.addEventListener('click', () => { if (!busy) choose(b.dataset.roleChoice); }));
  $('show-password').addEventListener('click', () => { const show = $('password').type === 'password'; $('password').type = show ? 'text' : 'password'; $('show-password').textContent = show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'; $('show-password').setAttribute('aria-pressed', String(show)); });
  $('auth-form').addEventListener('submit', e => {
    e.preventDefault(); if (!$('auth-form').reportValidity()) return; run(async () => {
      if (registration) {
        if (role === 'admin') throw Error('Không có đăng ký quản trị công khai.');
        if (!API.authConfigured(role === 'student' ? 'registerStudent' : 'registerCounselor')) throw Error('Chưa kết nối máy chủ đăng ký. Chưa gửi hoặc lưu hồ sơ.');
        if ($('password').value.trim().length < 8) throw Error('Mật khẩu cần ít nhất 8 ký tự không phải khoảng trắng.');
        const payload = new FormData($('auth-form')); payload.set('role', role);
        const name = String(payload.get('name') || '').trim(); if (name.length < 2) throw Error('Họ tên cần ít nhất 2 ký tự, không chỉ khoảng trắng.'); payload.set('name', name);
        if (role === 'counselor' && ['degree', 'specialty', 'license'].some(k => !String(payload.get(k) || '').trim())) throw Error('Học vị, chuyên môn và số chứng chỉ không được để trống.');
        if (role === 'student') { const birth = payload.get('birthDate'); if (!birth || Date.parse(birth) >= Date.now()) throw Error('Ngày sinh phải trước ngày hôm nay.'); }
        const files = payload.getAll('credentials').filter(f => f instanceof File && f.size);
        if (role === 'counselor' && !files.length) throw Error('Cần tải lên bằng cấp hoặc chứng chỉ.');
        if (files.some(f => !['application/pdf', 'image/jpeg', 'image/png'].includes(f.type) || f.size > 5 * 1024 * 1024)) throw Error('Tệp phải là PDF, JPG hoặc PNG, tối đa 5 MB mỗi tệp.');
        const result = await API.auth(role === 'student' ? 'registerStudent' : 'registerCounselor', payload);
        if (!['email_verification_required', 'pending'].includes(result?.status)) throw Error('Phản hồi đăng ký không hợp lệ. Liên hệ đơn vị vận hành trước khi gửi lại.');
        $('auth-form').reset(); say(result.status === 'pending' ? 'Máy chủ đã nhận hồ sơ. Chuyên viên đang chờ duyệt; chưa được truy cập chức năng chính.' : 'Máy chủ đã nhận đăng ký. Kiểm tra email để xác minh trước khi đăng nhập.');
        $('challenge').hidden = false;
      } else {
        if (!API.authConfigured('me') || !API.authConfigured('logout')) throw Error('Đăng nhập cần kết nối máy chủ xác thực, kiểm tra phiên và đăng xuất. Chưa gửi mật khẩu.');
        const result = await API.auth('login', { role, identifier: $('identifier').value.trim(), password: $('password').value, remember: $('remember').checked, otp: $('otp').value, captchaToken: $('captcha-token').value });
        if (result?.challenge) { $('challenge').hidden = false; say('Cần xác thực bổ sung: ' + String(result.challenge)); return; }
        const user = await CampusAuth.refresh();
        if (!user || user.role !== role) throw Error('Máy chủ chưa xác nhận phiên đúng vai trò.');
        if (['counselor', 'admin'].includes(role) && user.mfaVerified !== true) throw Error('Cần hoàn tất xác thực hai lớp trên máy chủ.');
        if (user.status !== 'active' && !(role === 'counselor' && user.approval !== 'approved')) throw Error('Tài khoản chưa đủ điều kiện truy cập.');
        $('password').value = ''; location.href = CampusAuth.route(user);
      }
    });
  });
  $('local-enter')?.addEventListener('click', () => run(async () => { const { users } = await SV2Store.initRegistration(); if (API.authConfigured('me')) throw Error('Chế độ xác thực máy chủ đang được bật. Hãy dùng biểu mẫu đăng nhập.'); const user = users.find(u => u.id === $('account').value && u.role === role && u.status === 'active' && !(u.localRegistration && u.role === 'counselor' && u.approval !== 'approved')); if (!user) throw Error('Hãy chọn tài khoản còn hoạt động.'); CampusAuth.setLocal(user); location.href = CampusAuth.route({ ...user, mode: 'local' }); }));
  $('forgot')?.addEventListener('click', () => run(async () => { if (!$('identifier').value.trim()) throw Error('Nhập email hoặc số điện thoại trước.'); await API.auth('reset', { identifier: $('identifier').value.trim(), role }); say('Yêu cầu đã được gửi. Nếu thông tin hợp lệ, máy chủ sẽ gửi hướng dẫn khôi phục.'); }));
  $('verify')?.addEventListener('click', () => run(async () => { if (!$('verification-id').value.trim() || !$('otp').value.trim()) throw Error('Nhập mã hồ sơ và mã xác minh từ email.'); await API.auth('verify', { id: $('verification-id').value.trim(), otp: $('otp').value.trim() }); say('Máy chủ đã nhận xác minh. Bạn có thể quay lại đăng nhập.'); }));
  window.addEventListener('storage', e => { if (!registration && (e.key === 'campusmind.sv2.users.v1' || e.key === null)) loadLocal(); });
  choose(role);
})();
