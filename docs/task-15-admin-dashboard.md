# TASK-15 — Admin Dashboard

Card: https://trello.com/c/XI22I4Ok

Chạy HTTP server tại thư mục repo, mở `pages/admin/admin-dashboard.html` hoặc vào khu vực Admin từ trang chủ.

- Sidebar và đường dẫn từ trang tổng quan Admin.
- Thẻ thống kê dịch vụ active, lịch chờ xác nhận, buổi gặp hoàn thành.
- Hoạt động gần đây sắp xếp mới nhất, giới hạn 10 mục; cập nhật thủ công hoặc từ thay đổi LocalStorage ở tab khác.
- Thao tác nhanh mở quản lý dịch vụ. Quản lý người dùng hiển thị chưa khả dụng cho đến TASK-17; không đặt liên kết hỏng.
- Loading/empty/error state; không tạo số liệu hoặc hoạt động giả; lỗi dữ liệu không bị biến thành số 0.

## Dữ liệu và giới hạn

Đọc danh mục **đã lưu** ở `campusmind.admin.services.v1`; không đọc dữ liệu seed của TASK-16. Đọc `appointments` và `activity` từ `campusmind.counselor.v1` theo hợp đồng TASK-14. Không có dữ liệu lưu thì thống kê bằng 0. Bảng hoạt động hiện chỉ phản ánh sự kiện do phân hệ Counselor ghi lại; chưa có nhật ký dịch vụ/người dùng. Không đọc hoặc hiển thị nội dung ghi chú.

Số liệu thuộc trình duyệt hiện tại; chưa có backend hay phân quyền và chưa phải thống kê toàn hệ thống. TASK-14 và TASK-15 có thể merge độc lập; khi TASK-14 chưa tích hợp, các chỉ số lịch hẹn bằng 0.

## Kiểm tra

Đã kiểm tra số liệu theo dữ liệu lưu, sắp xếp hoạt động, trạng thái rỗng và lỗi dữ liệu, nút cập nhật và bố cục 375/768/1440 px. Dữ liệu kiểm thử không được đưa vào ứng dụng.
