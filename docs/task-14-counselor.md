# TASK-14 — Counselor

Card: https://trello.com/c/5tWgeLRX

Chạy HTTP server tại thư mục repo, mở `pages/counselor/index.html`.

## Chức năng

- Schedule: thêm khung giờ tương lai, chặn giờ kết thúc không hợp lệ và khung giờ chồng lấn; xóa khung giờ chưa có lịch hẹn.
- Queue: tìm theo tên/mã, lọc ngày/trạng thái, xác nhận yêu cầu, hủy có hộp xác nhận, mở ghi chú bằng ID lịch hẹn.
- Session Note: lưu/sửa nội dung và kế hoạch theo dõi; hoàn thành buổi gặp đồng thời lưu ghi chú; giữ nội dung nếu lưu thất bại và cảnh báo khi rời trang chưa lưu.
- Mặc định không tạo chuyên viên hoặc lịch hẹn mẫu. Có trạng thái rỗng, tải và lỗi, đồng bộ thay đổi giữa các tab, phát hiện ghi đè từ tab khác.

## Hợp đồng dữ liệu

LocalStorage key `campusmind.counselor.v1`, đối tượng gồm các mảng `slots`, `appointments`, `notes`, `activity`.

- `slots`: `{id, date: YYYY-MM-DD, start: HH:mm, end: HH:mm}`.
- `appointments`: `{id, studentName, date: YYYY-MM-DD, time: HH:mm, status}`. Status: `Pending`, `Confirmed`, `Completed`, `Cancelled`.
- `notes`: `{appointmentId, content, plan, updatedAt}`.
- `activity`: `{text, at}`; thời gian ISO, tối đa 100 sự kiện; không chứa nội dung ghi chú.

Chuyển trạng thái: Pending → Confirmed hoặc Cancelled; Confirmed → Completed hoặc Cancelled. Completed và Cancelled không quay lại hàng đợi. Ghi chú chỉ mở cho Confirmed/Completed. Phân hệ Student cần ghi yêu cầu theo hợp đồng này trong bước tích hợp; TASK-13 hiện chưa có trên dev nên chưa có luồng đặt lịch liên phân hệ. Không dùng dữ liệu giả để che phần chưa tích hợp.

Đây là frontend môn học, chưa có backend, đăng nhập hay phân quyền theo chuyên viên; không dùng để lưu dữ liệu sức khỏe thật. AI Summary thuộc TASK-19, chưa được triển khai ở task này.

## Kiểm tra

Đã kiểm tra bằng trình duyệt: thêm/chặn trùng giờ, tải lại, lọc hàng đợi, xác nhận/hủy, quay lại từ hộp hủy, lưu/sửa và hoàn thành ghi chú, lỗi quota, dữ liệu hỏng không bị ghi đè, nội dung HTML hiển thị như văn bản. Kiểm tra bố cục ở 375/768/1440 px. Dữ liệu kiểm thử chỉ nằm trong phiên kiểm thử, không được đưa vào ứng dụng.
