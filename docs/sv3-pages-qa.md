# SV3 — triển khai và QA GitHub Pages, 26/10/2026

Thực hiện bằng tài khoản AnGit-Hub67 với hỗ trợ Codex theo ủy quyền. Đây là ghi nhận thao tác và kết quả kiểm thử, không thay thế OBS hoặc vấn đáp cá nhân.

## Triển khai
- Nguồn: main, root; HTTPS bật.
- URL: https://angit-hub67.github.io/CSE122_67KTPM1_BTCK_Nhom1/
- Lần build đầu thành công tại commit c1ff3c464c99362f1e1f85fef3c2de667254f0c4.

## Kiểm thử bản public
Chạy luồng tests/integration.cjs với base là URL Pages và giữ đường dẫn repository; context trình duyệt mới, chỉ dữ liệu demo trong localStorage. Mọi host ngoài angit-hub67.github.io bị chặn, không ghi API ngoài.

PASS: yêu cầu session Student; danh sách 6 chuyên viên; lưu tài nguyên; đặt lịch → Counselor xác nhận/ghi chú/tóm tắt mô phỏng/hoàn thành → Student; hồ sơ → Visitor; dịch vụ Admin → Visitor/Dashboard; guard không tự xóa Admin. 25 trang ở 320/375/768/1280/1440px với light/dark không tràn ngang, không có JavaScript pageerror.

## Lỗi phát hiện và sửa
Bản deploy thử tải assets/data/config.json không tồn tại rồi mới fallback. Nhật ký HTTP ghi nhận 404 ở đường dẫn này. demo-sync.js được sửa: chỉ thử override khi chạy localhost, còn deploy đọc config.public.json trực tiếp. Không bật remote sync hoặc thay đổi dữ liệu nghiệp vụ.

Test tests/demo-sync-config.cjs PASS cho đường dẫn project Pages, override local có/không tồn tại, IPv6 loopback, cache cấu hình và remote sync tắt. Layout check PASS. Kết quả kiểm tra lại bản public sau merge được ghi tại PR phát hành liên quan.

## Còn lại trước bàn giao học phần
- Kiểm tra trên điện thoại thật, zoom 200% và bàn phím đầy đủ.
- Hoàn thiện screen inventory/mockup, OBS, khai báo AI cá nhân và đối chiếu cấu trúc rubric. Không tuyên bố đã có thiết kế trước code nếu không có lịch sử chứng minh.
- Test legacy sv3-completion còn selector cũ; backend/auth/AI thật chưa được cấu hình hoặc xác minh.
