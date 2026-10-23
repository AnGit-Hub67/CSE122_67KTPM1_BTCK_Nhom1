# Bổ sung SV2 — Booking Reason, AI-1 mock, Admin Create User

Ngày 23/10/2026. Chỉ sửa phạm vi SV2; không sửa hoặc merge mã SV1/SV3.

## Lý do đặt lịch

Booking yêu cầu lý do 5–500 ký tự sau trim; hiển thị trong bước xác nhận và danh sách lịch. Trường `reason` được lưu cùng appointment trong `campusmind.counselor.v1`. Đổi lịch nạp lại lý do, cho chỉnh sửa và giữ nguyên các trường của SV3. Appointment cũ không có reason vẫn đọc được; khi đổi phải điền lý do. Không gửi nội dung lên mạng. Chỉ sử dụng dữ liệu giả cho demo.

## Thêm người dùng

Nút Thêm người dùng trong Admin mở modal gồm họ tên/email/role; trạng thái ban đầu active, ID UUID. Có validation, kiểm tra email trùng không phân biệt hoa thường, xác nhận hoặc quay lại. Ghi vào `campusmind.sv2.users.v1` dùng chung với Register. Kiểm tra snapshot và Web Locks giữ nguyên cơ chế chống ghi từ tab cũ. Mọi role vẫn là demo, chưa có xác thực máy chủ.

Thêm tài khoản role counselor chưa tự tạo hồ sơ chuyên viên hoặc availability trong `visitor.json`: cần phối hợp quy trình quản lý hồ sơ/lịch của nhóm. Admin Create không tạo mật khẩu hoặc thông tin đăng nhập.

## AI-1 Support Navigator trên Dashboard

- Đọc `assets/data/sv2-ai.json`. Đây là bộ quy tắc điều hướng mô phỏng, **không phải mô hình AI thật**, không chẩn đoán hay tư vấn chuyên môn.
- Chọn nhu cầu → Processing → gợi ý và giải thích vì sao → chấp nhận/chỉnh sửa/bỏ qua/gợi ý khác/đổi lựa chọn/lưu.
- Chỉnh sửa nội dung yêu cầu chấp nhận lại trước khi lưu. Gợi ý khác xoay vòng lựa chọn trong cùng nhóm. Lưu lại cùng kết quả sẽ cập nhật, không tạo bản sao trùng.
- Các liên kết đưa đến tài nguyên, hồ sơ chuyên viên hoặc trang đặt lịch có thật. Không tự tạo nội dung y tế hoặc truy cập API ngoài.
- Key `campusmind.sv2.navigator.v1`: mảng `{id,studentId,text,reason,route}`. Mỗi tài khoản chỉ hiển thị gợi ý của chính mình. Lưu tối đa 1.000 ký tự mỗi nội dung; không lưu nhu cầu dạng văn bản tự do.
- Có Empty/Loading/Disabled/Success/Error/retry; lỗi tải AI không làm mất Dashboard. Dữ liệu JSON/storage lỗi không bị tự xóa; lỗi ghi giữ nội dung để thử lại.
- Module và dữ liệu AI là file riêng; không đụng tới AI-2/AI-3 của SV1/SV3 hoặc danh sách savedResources của Visitor.

## Lựa chọn dữ liệu và giới hạn

Không sử dụng MockAPI trong thay đổi này vì không có endpoint đã cấu hình và ứng dụng đang dùng chung JSON/localStorage. Người dùng cho phép MockAPI nhưng không bắt buộc. Cách hiện tại chạy offline sau khi tải asset, không đưa dữ liệu demo lên dịch vụ thứ ba và giữ hợp đồng SV1/SV3.

Chưa hoàn thành Login/xác thực của SV1, Profile/AI-3 của SV3, hợp nhất các nhánh, dashboard thống kê chung hoặc toàn bộ luồng cuối môn. Cần kiểm thử lại trên bản nhóm tích hợp trước nộp. LocalStorage/sessionStorage không phải cơ chế bảo mật hay phân quyền thực.

## Kiểm thử

- `node tests/sv2-extras.cjs`: lý do validation/lưu/đổi; Admin Create/trùng email/xác nhận/hủy/reload; AI lựa chọn/processing/result/reason, chỉnh sửa/chấp nhận, đổi/bỏ qua, quota/retry/reload, cô lập theo tài khoản, fetch lỗi, corrupt storage và responsive 1440/768/375px.
- `node tests/sv2-smoke.cjs`: hồi quy nghiệp vụ SV2; hai ca liên thông SV3 SKIP khi chạy nhánh này vì không có trang Counselor.
- `node tests/register-smoke.cjs`: 15 nhóm hồi quy Register và phiên mới → Booking → Admin disable.

Các bài test cần Node.js, Playwright và Chromium. Dùng `CHROMIUM_PATH` nếu chỉ định browser có sẵn; `EXTRAS_QA` chỉ định thư mục ảnh/kết quả của bài bổ sung. Không chạy các test trên dữ liệu cá nhân thật.
