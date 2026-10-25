# Ghi nhận sử dụng AI — cập nhật 26/10/2026

Tài liệu ghi nhận phần hỗ trợ quan sát được trong phiên làm việc, không thay thế khai báo cá nhân của cả nhóm.

## Công cụ và yêu cầu
Codex được người dùng yêu cầu đối chiếu ZIP SV1/SV2/SV3 và bản tích hợp, giải quyết xung đột PR #10/#11, kiểm thử, tạo PR phát hành #12 và review bằng tài khoản lehaianh30102007-hub. Yêu cầu review: “kiểm tra và ghi nhận xét thực tế ... làm nốt nhiệm vụ ở main”.

## Phần được hỗ trợ
- Chuẩn bị nội dung giải quyết conflict và ghép các luồng dùng dữ liệu chung; sửa/push SV2 theo ủy quyền.
- Chạy kiểm thử integration/layout cục bộ; đọc session/API và guard quản lý người dùng.
- Viết nội dung PR/review và cập nhật README cho đúng cấu hình thực tế; thực hiện Git theo yêu cầu.

## Kiểm chứng và giới hạn
Ngày 26/10/2026, layout và integration trên cây dev dd2e1e8 PASS; kiểm thử 25 trang ở 375/768/1440, hai theme và các luồng Student/Counselor/Admin/Visitor. Network ngoài localhost bị chặn. Test legacy sv3-completion còn selector cũ; chưa xác minh API thật, deploy hoặc toàn bộ rubric.

Review do Codex hỗ trợ theo ủy quyền phải được đọc đúng bản chất; không chứng minh thành viên đã tự đọc mọi dòng, quay OBS hoặc có khả năng vấn đáp. Chưa có minh chứng người dùng đã tự kiểm tra toàn bộ bản phát hành.

## Nhóm cần bổ sung
Mỗi sinh viên ghi công cụ/prompt thực đã dùng, file do AI hỗ trợ, lỗi đã tự phát hiện/sửa, cách tự kiểm tra và link OBS thực tế. Không ghi lùi ngày hoặc gán phần việc chưa làm. Các prompt/code nguồn trước phiên này chưa được tài liệu này kiểm chứng.
