# Bàn giao SV3 — 23/10/2026

## Căn cứ và phạm vi

Đã đọc trực tiếp board Trello ngày 23/10: TASK-11 (layout), TASK-14 (Counselor), TASK-15 (Admin Dashboard), TASK-19 (3 AI mock), TASK-20 (tích hợp/QA); đối chiếu Profile SCR-03 trong Screen Inventory đã lưu. TASK-01/03/08 đã có repo/inventory/wireframe từ trước, không làm lại hoặc tự xác nhận giảng viên đã duyệt.

- Trello: https://trello.com/b/tijjtgu7/cse122-campusmind-team-1
- TASK-14: https://trello.com/c/5tWgeLRX
- TASK-15: https://trello.com/c/XI22I4Ok
- TASK-19: https://trello.com/c/XuQa6TID

Mốc nguồn: dev `1869b6b`, main `2997c4d`; SV1 `0581926`; SV2 `663b000`; Counselor PR #5 `c828319`; Admin Dashboard PR #6 `b9245c0`. Các nhánh SV3 cũ chưa được merge dev. Bản làm việc mới `feature/sv3-complete` dựa trên SV1 đã kiểm thử, kế thừa HTML/CSS SV3 từ hai mốc trên rồi bổ sung nghiệp vụ. Không đưa source nghiệp vụ SV2 vào nhánh SV3; chỉ thêm nguyên bản vào bản ghép QA local.

## Phần đã triển khai

1. **Profile:** xem/sửa họ tên và email tài khoản demo hiện tại; dùng users/session của SV1/SV2; validation, email trùng, loading/empty/error/retry, hủy có xác nhận, bảo toàn bản nháp khi storage thay đổi, từ chối ghi bằng snapshot cũ. Không cho tự đổi role/status.
2. **Counselor:** chọn chuyên viên demo; lọc lịch, slots và note theo counselorId; không mở note của chuyên viên khác; thêm/xóa khung giờ, chặn trùng theo từng chuyên viên, bảo vệ slot đang có lịch hẹn; xác nhận/hủy lịch; focus sau cập nhật; chuẩn giờ UTC+7.
3. **Session Note + AI-3:** nhập ghi chú/kế hoạch, tạo bản tóm tắt từ chính nội dung mẫu, processing/error/retry, sửa bản nháp, chấp nhận/bỏ/tạo lại; chỉ lưu tóm tắt sau khi chấp nhận và bấm Lưu ghi chú. Ghi chú gốc luôn giữ nguyên. Hoàn thành buổi gặp cập nhật Appointment cho Student. Không gọi AI thật, không tạo chẩn đoán hoặc lời khuyên lâm sàng.
4. **Admin Dashboard:** thống kê tổng users/users active, services active cùng store/seed với Visitor và Admin Service, Pending/Completed, hoạt động lịch hẹn; đồng bộ giữa tab, lỗi dữ liệu giữ nguyên; liên kết Admin User khi bản ghép có SV2.
5. **Layout:** generator biết các route đã tồn tại, tạo menu của cả ba vai trò và Profile; trang tổng quan Counselor/Admin có CTA thật. Chỉ sửa phần header/sidebar/footer được đánh dấu trong trang SV1/SV2; không sửa business JS của các phần này.

## File chính

| Nhóm | File |
|---|---|
| Profile | `profile.html`, `assets/js/profile.js` |
| Adapter dữ liệu | `assets/js/sv3-store.js` |
| Counselor | 3 HTML trong `pages/counselor/`, `assets/js/counselor.js`, `assets/css/counselor.css` |
| AI-3 | `assets/js/counselor-ai.js`, `assets/data/counselor-ai.json` |
| Dashboard | `pages/admin/admin-dashboard.html`, `assets/js/admin-dashboard.js`, `assets/css/admin-dashboard.css` |
| Layout/entry | `tools/build-layout.cjs`, `pages/admin/index.html`, `pages/counselor/index.html`, header/sidebar chung trong HTML hiện có |
| Test & chạy | `tests/sv3-completion.cjs`, `tools/prepare-sv3-integration.cjs`, `tools/serve.cjs` |

## Hợp đồng dữ liệu

- Users: `campusmind.sv2.users.v1`; seed ưu tiên `sv2.json`, chỉ fallback `login-demo.json` nếu file chưa có (404). Profile giữ nguyên các trường khác của người dùng.
- Session: `campusmind.session.v1`; student tương thích `campusmind.sv2.student.session.v1` của Register. Đây là chọn tài khoản demo, không phải bảo mật backend.
- Schedule: `campusmind.counselor.v1` gồm slots/appointments/notes/activity. Giữ trường bổ sung của SV2; note bổ sung `summary` bên cạnh content/plan. Bản ghi cũ thiếu counselorId quy về legacyCounselorId (mặc định minh-anh), tương thích adapter SV2.
- Cùng Web Lock `campusmind.sv2.write`, so sánh snapshot lịch và users trước ghi. Nếu trình duyệt không có Web Locks, còn snapshot check nhưng không bảo đảm khóa giữa nhiều tab; Chromium test dùng Web Locks.
- Khi có config SV2, seed lịch tuần tạo đúng ID/ngày/giờ như SV2; bản standalone chỉ có slots do người dùng demo tạo. `storage.clear()` được xử lý, trừ khi có draft cần giữ.
- UI là prototype dữ liệu giả. Lọc theo chuyên viên không thay thế phân quyền máy chủ.

## Chạy và kiểm thử

Chạy standalone: `node tools/serve.cjs`, mở http://127.0.0.1:8080/login.html. Có thể đổi cổng bằng biến môi trường PORT.

Tạo bản ghép local trong thư mục mới bằng `node tools/prepare-sv3-integration.cjs` sau khi fetch các nhánh. Tool không merge Git, không đổi nhánh khác; chỉ lấy các file SV2 được liệt kê trong manifest rồi tái tạo phần layout chung. Không chạy lại trên thư mục QA đã tồn tại. Trong bản ghép, chạy `node tools/serve.cjs` để demo đủ các màn.

Các test cần Node.js, Playwright và Chromium đã cài. `tests/sv3-completion.cjs` hỗ trợ CAMPUSMIND_ROOT, QA_DIR.

Kết quả thực chạy trên bản ghép:

| Bộ kiểm tra | Kết quả |
|---|---|
| SV3 completion | PASS: Profile, Counselor, AI-3, Dashboard, storage lỗi/xung đột, 20 ảnh tại 375/768/1366/1440 |
| SV2 smoke | PASS 20 nhóm, có Booking → Counselor Confirmed → Completed |
| Register smoke | PASS 15 nhóm |
| SV2 extras | PASS 9 nhóm |
| Layout smoke | PASS 18 view, keyboard/skip link/no-JS/menu |
| Layout generator check | PASS standalone và bản ghép |
| Visitor smoke | PASS; test chờ lưu bất đồng bộ hoàn tất trước reload |
| Admin Services / SV1 integration / SV1 completion | PASS, không sửa business logic SV1 |

Đã xem ảnh Note mobile và Dashboard desktop, chỉnh ô tóm tắt và bố cục statistic cards. Không coi đây là chứng nhận WCAG; chưa test Firefox/Safari hoặc thiết bị thật.

## Danh tính Git và bước còn lại

Người dùng xác nhận phần SV3 phải commit/push bằng **AnGit-Hub67**, không phải doctorfalcon. Kiểm tra GitHub API: tác giả liên kết của các commit SV3 cũ là AnGit-Hub67, email `khanhan06072007@gmail.com`; committer là GitHub web-flow. Metadata này xác nhận tác giả liên kết, không tự chứng minh người thực hiện mọi lần push trong lịch sử.

Đã kết nối AnGit-Hub67 bằng Git Credential Manager qua trình duyệt; GitHub /user xác nhận login AnGit-Hub67, ID 325230208 và repo có quyền push. Token không có quyền đọc /user/emails (404), nên không dùng email riêng tư chưa xác minh: commit dùng địa chỉ GitHub noreply 325230208+AnGit-Hub67@users.noreply.github.com của chính tài khoản đã xác thực. Author/committer được áp dụng riêng cho lệnh commit SV3; push chỉ định credential.username=AnGit-Hub67. Không đổi cấu hình chung của worktree SV1/SV2.

Không merge dev/main. Xem `docs/sv3-release-checklist.md` cho TASK-10/20/21/26 còn phụ thuộc đầu ra nhóm và việc duyệt/nộp bài.
