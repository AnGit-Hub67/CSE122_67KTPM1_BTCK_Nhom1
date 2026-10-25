(() => {
    const $ = id => document.getElementById(id); let busy = false;
    $('invite-form').addEventListener('submit', async e => {
        e.preventDefault(); if (busy || !$('invite-form').reportValidity()) return; busy = true; $('invite-submit').disabled = true;
        try { const result = await CampusAPI.auth('acceptInvite', { token: $('invite-token').value, name: $('invite-name').value.trim(), password: $('invite-password').value, otp: $('invite-otp').value }); if (result?.status !== 'accepted') throw Error('Máy chủ chưa xác nhận lời mời. Hoàn tất thiết lập 2FA theo hướng dẫn của đơn vị vận hành.'); $('invite-form').reset(); $('invite-status').textContent = 'Máy chủ đã xác nhận lời mời. Đăng nhập để tiếp tục.'; } catch (e) { $('invite-status').textContent = e.message; } finally { busy = false; $('invite-submit').disabled = false; }
    });
})();
