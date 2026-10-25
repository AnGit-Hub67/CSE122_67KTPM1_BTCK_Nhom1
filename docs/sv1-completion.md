# SV1 — bổ sung frontend ngày 23/10/2026

## Đối chiếu trước khi sửa

Đã đọc GitHub refs, PR và README trước khi sửa:

| Nhánh | SHA |
|---|---|
| main | 2997c4d938fc04b634b0733a3b80c1dd3535f94d |
| dev | 1869b6b483c771b797e4eb71eb3834631bab906c |
| feature/sv1-final — PR #7 mở | e142946d6d142ba91b03caebcd14d41747f65cb8 |
| feature/sv2-final | 663b0007389a696d8c4bf4173e08629a06923802 |
| feature/counselor-pages — PR #5 mở | c82831932a9754f5d143963a032813a93cefa3ab |
| feature/admin-dashboard — PR #6 mở | b9245c0b3bac32fbecc9dd7b8d9836361ab05d20 |

PR #1–4 đã merge vào dev. main chỉ có README; không phải bản demo ứng dụng.

Yêu cầu TASK-12/16/18/19 và SCR-01 lấy từ README, tài liệu trong repo và bản audit Trello/Screen Inventory ngày 22/10 đã lưu trong workspace. Trello live trả Unauthorized ngày 23/10; chưa xác minh checklist hoặc phân công mới trên board. README giao AI mock tổng thể cho SV3; thay đổi này chỉ bổ sung hai widget trên trang Visitor SV1 để đáp ứng khoảng trống đã ghi trong audit, không sửa AI-3 hoặc mã SV3.

TASK-12/16 đã có chức năng trong PR #7: search/filter, xem hồ sơ, tài nguyên lưu/bỏ lưu; Create/Read/Update/Archive dịch vụ, validation, persistence và đồng bộ Visitor. Không viết lại các phần đã đạt. Khoảng trống được bổ sung: Login demo SCR-01, CTA Booking thật khi có nhánh SV2, AI-1/AI-2 trên Visitor, bảo vệ thao tác lưu tài nguyên giữa các tab và dữ liệu lưu bị hỏng.

## Phạm vi file

- `login.html`, `assets/css/login.css`, `assets/js/login.js`, `assets/data/login-demo.json`: chọn tài khoản đang hoạt động, login/logout demo, loading/empty/error/retry, đọc người dùng đã đăng ký, xử lý storage bị chặn/hỏng.
- `assets/js/visitor-ai.js`: gợi ý theo chủ đề từ danh mục hiện hành, processing/result/reason, accept/edit/reject/regenerate; lưu tài nguyên vào cùng danh sách Visitor. Kết quả bị vô hiệu hóa khi danh mục dịch vụ đổi ở tab khác. Đây là bộ chọn nội dung dựa trên quy tắc, không gọi AI thật, không chẩn đoán.
- `assets/js/visitor.js`: Counselor chuyển đến `student-booking.html?counselor=<id>`; nếu trang chưa được tích hợp/lỗi kết nối thì hiển thị thông báo có thể đóng bằng Escape. Lưu tài nguyên đọc lại snapshot dưới Web Lock, bảo toàn dữ liệu lỗi.
- `assets/js/main.js`: thêm đường dẫn Login vào navbar hiện có, không thay sidebar của SV2/SV3.
- `assets/css/visitor.css`, hai HTML Service Directory/Resource Library: bố cục và tải widget mới.
- `tests/visitor-smoke.cjs`, `tests/sv1-completion.cjs`: cập nhật hợp đồng CTA và test bổ sung.
- README và tài liệu này: cách chạy, phạm vi và phụ thuộc tích hợp.

Không sửa file nghiệp vụ SV2/SV3. Admin Service Management kế thừa nguyên vẹn bản PR #7 đã kiểm thử, không có thay đổi mới không cần thiết.

## Hợp đồng dữ liệu và tích hợp

- Users: `campusmind.sv2.users.v1` (localStorage), cùng schema SV2. Seed ưu tiên `assets/data/sv2.json`; chỉ khi 404 mới dùng `login-demo.json`. Seed fallback giữ nguyên ID của SV2 tại SHA nêu trên, không ghi đè users hiện có.
- Student session: `campusmind.sv2.student.session.v1` (sessionStorage), đúng khóa SV2 đang dùng. Session demo tổng quát: `campusmind.session.v1` gồm id/role. Counselor session tổng quát chưa được mã SV3 sử dụng để lọc hàng đợi; không tuyên bố có phân quyền hay xác thực thật.
- Saved resources: `campusmind.visitor.savedResources.v1` (localStorage), dùng chung thao tác lưu trong danh mục và gợi ý; cập nhật giữa các tab. Không lưu thông tin sức khỏe hoặc mật khẩu.
- Service catalog: `campusmind.admin.services.v1`, dùng store PR #7 và seed Admin; chỉ dịch vụ active được gợi ý/hiển thị.
- Nhánh này tiếp tục PR #7 trên `feature/sv1-complete`; không merge các nhánh khác vào Git. Booking, Register, các trang Counselor vẫn thuộc nhánh riêng. Khi chỉ chạy SV1, Login chuyển đến trang tổng quan nếu trang nghiệp vụ chưa có; CTA Booking báo rõ chưa sẵn sàng.
- Bản ghép kiểm thử local thêm đúng file nghiệp vụ SV2/SV3 từ các SHA trên, giữ nguyên nội dung byte-for-byte. Chạy luồng Login → Student và Visitor → Booking trong bản ghép. Đây không phải bản tích hợp đã merge lên dev/main.

## Kiểm thử

Chạy qua HTTP bằng server tích hợp trong từng test. Cần Node.js, Playwright và Chromium; ứng dụng không cần build/backend.

```sh
node tests/visitor-smoke.cjs
node tests/admin-services-smoke.cjs
node tests/sv1-integration.cjs
node tests/layout-smoke.cjs
node tests/sv1-completion.cjs
node tools/build-layout.cjs --check
```

`tests/sv1-completion.cjs` hỗ trợ `CAMPUSMIND_ROOT` để trỏ tới bản ghép và `QA_DIR` để lưu ảnh. Nhánh SV1 chạy độc lập các test phía trên; bản ghép chạy thêm `tests/sv2-smoke.cjs`, `tests/register-smoke.cjs`, `tests/sv2-extras.cjs` của SV2. CTA test cũ chủ động mock 404 để kiểm tra fallback; test mới kiểm tra điều hướng thật và counselor preselection khi Booking có mặt.

Đã kiểm tra responsive 375/768/1440, không tràn trang, labels/live regions, focus/keyboard, lỗi dữ liệu/mạng/lưu, đăng nhập với tài khoản mới hoặc bị vô hiệu hóa, gợi ý và đồng bộ danh mục. Không phải chứng nhận WCAG đầy đủ; chưa kiểm thử Safari/Firefox hoặc thiết bị thật.

Kết quả thực chạy ngày 23/10/2026: Visitor smoke PASS; SV1 completion PASS (độc lập và bản ghép, gồm Booking chọn đúng chuyên viên); Admin Services smoke PASS; SV1 integration PASS; Layout smoke PASS (18 view); layout generator check PASS; SV2 smoke PASS (20 nhóm); Register smoke PASS (15 nhóm); SV2 extras PASS (9 nhóm). Ảnh và manifest các file ghép nằm trong thư mục `sv1-completion-qa` ngoài repo. Không đưa ảnh phát sinh hoặc file của SV2/SV3 vào commit.

## Danh tính Git

Trước khi tạo nhánh/commit: Git credential được gọi qua GitHub `/user`, trả login `doctorfalcon`, user id `234856066`; repo permissions `push=true`. Email cấu hình tác giả được đối chiếu với email verified của chính tài khoản qua `/user/emails`. Không thay author/committer, không dùng `--author` và không đưa token vào file/log.

Không merge dev/main. Profile, AI-3, lọc Counselor theo session, Dashboard Admin và hợp nhất layout toàn nhóm còn thuộc phạm vi tích hợp/SV3; không đánh dấu toàn bộ dự án Done.
