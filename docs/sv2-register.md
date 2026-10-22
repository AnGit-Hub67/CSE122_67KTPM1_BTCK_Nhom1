# SCR-02 — Đăng ký sinh viên (SV2)

## Chạy thử

Chạy `node tools/sv2-serve.cjs` tại thư mục repo, mở `http://127.0.0.1:8080/register.html`. Menu ba trang Student cũng có liên kết Đăng ký sinh viên. Dùng HTTP thay vì mở file trực tiếp. Đường dẫn dữ liệu được xác định từ file script nên hoạt động cả khi host repo dưới một đường dẫn con.

## Chức năng

- Họ tên, email, mật khẩu mô phỏng và nhập lại mật khẩu; kiểm tra bắt buộc, độ dài, định dạng email, khoảng trắng và khớp mật khẩu.
- Chuẩn hóa email thành chữ thường, từ chối email trùng với tài khoản seed hoặc tài khoản đã tạo (kể cả tài khoản disabled).
- Chỉ tạo role `student`, status `active`, ID UUID; không cho tự đăng ký Admin/Counselor.
- Người dùng mới được thêm vào `campusmind.sv2.users.v1`, cùng schema `{id,name,email,role,status}` mà Admin đang sử dụng; giữ nguyên người dùng và các dữ liệu phân hệ khác.
- Thành công có màn xác nhận; nút “Vào tài khoản vừa tạo (demo)” ghi ID vào sessionStorage `campusmind.sv2.student.session.v1`. Dashboard/Booking/Appointments dùng ID này; khi chưa chọn phiên thì dùng studentId demo mặc định trong JSON.
- Tài khoản mới hiển thị trong Admin. Nếu Admin vô hiệu hóa hoặc đổi role, lần tải/truy cập tiếp theo và thao tác ghi lịch bị chặn.
- Các trạng thái Loading, Disabled, Error/retry, validation và Success; nhãn form, aria-describedby/invalid, live status/alert, focus vào lỗi đầu tiên hoặc phần thành công. Có nút hiện/ẩn mật khẩu.
- Đọc dữ liệu mới nhất khi lưu và dùng Web Locks cùng SV2 để tránh đăng ký trùng giữa tab. Không ghi đè JSON hỏng. Lỗi quota/quyền không báo thành công giả và giữ nội dung form.

## Giới hạn quan trọng

Đây là **đăng ký và phiên người dùng mô phỏng frontend**, không phải xác thực bảo mật. Mật khẩu chỉ kiểm tra biểu mẫu, **không được lưu hoặc gửi lên mạng**; form nói rõ điều này. Chưa thể đăng nhập bằng mật khẩu vừa nhập. Khi SV1 làm Login, nhóm cần thống nhất hợp đồng session và cơ chế credentials/mock hoặc backend riêng; không coi sessionStorage hiện tại là phân quyền thật.

Người dùng được lưu theo origin trên trình duyệt, không đồng bộ thiết bị. Chỉ dùng thông tin giả. Đóng phiên tab không xóa người dùng đã đăng ký. Để quay lại sinh viên seed trong demo, xóa riêng khóa session `campusmind.sv2.student.session.v1` rồi tải lại; không xóa users hoặc lịch hẹn.

Trình duyệt không hỗ trợ Web Locks chỉ có kiểm tra snapshot, chưa bảo đảm nguyên tử đa tab. Đăng ký vẫn hoạt động khi storage lịch Counselor bị lỗi, nhưng vào khu vực Student sẽ yêu cầu sửa lỗi lịch trước khi dùng nghiệp vụ. Không tự thay đổi dữ liệu lỗi.

## Kiểm thử ngày 23/10/2026

`node tests/register-smoke.cjs` (cần Playwright/Chromium) đạt 15 nhóm: validation và focus; trùng email không phân biệt hoa thường; hiện/ẩn mật khẩu; lỗi lưu và retry; tạo student/không lưu password; phiên mới → đặt lịch đúng ID/reload; Admin thấy và disable user; độc lập storage lịch; đăng ký đồng thời; chống chèn HTML; dữ liệu users hỏng; mạng lỗi; loading/disabled; 1440/768/375px và nhãn; không lỗi JavaScript chưa bắt.

Đã chạy lại `tests/sv2-smoke.cjs` trên nhánh SV2: các nhóm nghiệp vụ áp dụng đạt; hai ca SV3 được SKIP đúng vì nhánh SV2 chưa có trang Counselor. Không tuyên bố các ca SKIP đã đạt trong lần này. Tùy chọn `CHROMIUM_PATH` chỉ định browser có sẵn; `REGISTER_QA` chỉ định thư mục ảnh và results.json.

Chưa kiểm thử Safari/Firefox hoặc screen reader thực tế. Không chỉnh sửa file SV1/SV3, không tạo Login/Profile trong thay đổi này.
