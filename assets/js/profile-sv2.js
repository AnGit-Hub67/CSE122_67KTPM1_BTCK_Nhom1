(async () => {
    const box = document.getElementById('profile-content'); await CampusSession.ready; const user = CampusSession.current();
    if (!user) {
        box.append(Object.assign(document.createElement('h2'), { textContent: 'Chào bạn, hãy bắt đầu hành trình của mình' }));
        const welcome = document.createElement('p'); welcome.textContent = 'Tạo tài khoản để theo dõi lịch hẹn và tìm lại tài nguyên bạn quan tâm.'; box.append(welcome);
        const grid = document.createElement('div'); grid.className = 'profile-benefits'; for (const [title, description] of [['Lịch hẹn', 'Theo dõi yêu cầu, đổi hoặc hủy lịch khi cần.'], ['Nhật ký cảm xúc', 'Một khoảng riêng để nhìn lại ngày. Chức năng nhật ký cần được tích hợp; trang này không lưu nội dung sức khỏe.'], ['Tài nguyên đã lưu', 'Tìm lại những bài viết bạn đã chọn trong thư viện.']]) { const article = document.createElement('article'), h = document.createElement('h3'), p = document.createElement('p'); h.textContent = title; p.textContent = description; article.append(h, p); grid.append(article); } box.append(grid); for (const [text, url] of [['Đăng nhập', 'sv2-login.html'], ['Tạo tài khoản', 'register.html']]) { const a = document.createElement('a'); a.textContent = text; a.href = url; a.className = 'button'; box.append(a); } return;
    }
    const line = text => { const p = document.createElement('p'); p.textContent = text; box.append(p); };
    line(user.name + ' · ' + ({ student: 'Sinh viên', counselor: 'Chuyên viên', admin: 'Quản trị viên' }[user.role] || '')); if (user.email) line('Email: ' + user.email);
    line(CampusAuth.current()?.mode === 'local' ? 'Phiên cục bộ; chưa xác minh danh tính.' : user.role === 'counselor' ? (user.approval === 'approved' ? 'Đã xác minh' : user.approval === 'rejected' ? 'Hồ sơ chưa được duyệt: ' + (user.rejectionReason || 'Liên hệ đơn vị vận hành.') : 'Chờ xác minh') : user.emailVerified ? 'Email đã xác minh bởi máy chủ.' : 'Email chưa xác minh.');
    const labels = { email: 'Email', degree: 'Học vị', specialty: 'Chuyên môn', experience: 'Số năm kinh nghiệm', license: 'Số chứng chỉ' };
    for (const [key, label] of Object.entries(labels)) { const value = user.submittedProfile?.[key]; if (typeof value === 'string' || typeof value === 'number') line(label + ': ' + value); }
})();
