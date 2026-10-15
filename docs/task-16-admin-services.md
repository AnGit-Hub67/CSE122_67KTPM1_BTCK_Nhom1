# TASK-16 — Quản lý dịch vụ Admin

## Chạy và truy cập
Phục vụ repo bằng HTTP (ví dụ `python -m http.server 8080`), mở `pages/admin/admin-service-management.html`, hoặc vào Tổng quan Admin → Quản lý dịch vụ.

## Hành vi
- Tái sử dụng token, header/footer/sidebar, menu responsive và dialog native của TASK-11. Chỉ bổ sung route Admin vào nguồn layout chung.
- Bảng semantic, thống kê, tìm theo tên/mã/nhóm không phân biệt dấu và hoa thường, kết hợp bộ lọc trạng thái.
- Thêm/sửa qua modal; tên 3–100 ký tự và không trùng tên đã chuẩn hóa (kể cả bản lưu trữ), nhóm cố định, thời lượng 15–240 phút theo bước 5, mô tả 10–500 ký tự.
- Lưu trữ cần xác nhận; Hủy/Escape không thay đổi dữ liệu. Bản lưu trữ chỉ đọc, vẫn có trong bảng và bộ lọc.
- Mock ban đầu: `assets/data/admin-services.json`. Thay đổi lưu dưới khóa riêng `campusmind.admin.services.v1`; không sửa dữ liệu Visitor. Chỉ cập nhật UI sau khi lưu thành công. Thêm/sửa xóa bộ lọc để thấy kết quả ngay.
- Lỗi tải, JSON/schema không hợp lệ và lỗi localStorage hiển thị rõ; không tự ghi đè dữ liệu hỏng. Lỗi lưu giữ nội dung form. Có thử lại khi tải lỗi. Không có thao tác xóa vĩnh viễn.
- Label, lỗi liên kết qua aria-describedby/aria-invalid, live status, focus sau modal, skip link và hướng dẫn khi tắt JavaScript. Bảng cuộn ngang có thể focus trên màn hình nhỏ.

## Kiểm tra
Dùng Node.js + Playwright/Chromium đã cài:

```sh
node tests/admin-services-smoke.cjs
node tests/layout-smoke.cjs
node tools/build-layout.cjs --check
node --check assets/js/admin-services.js
```

`ADMIN_SCREENSHOTS` là thư mục tùy chọn để xuất ảnh 1440/768/375px. Bộ test TASK-16 kiểm tra CRUD và reload, lọc/search, validation, hủy/Escape/xác nhận archive, quota storage, JSON hỏng, rỗng, network failure/retry, loading, focus, navigation/assets, no-JS và không tràn trang ở ba viewport.

Giới hạn: prototype frontend, không có backend/xác thực hoặc đồng bộ giữa người dùng; localStorage không giải quyết ghi đồng thời nhiều tab. Kiểm thử Chromium, chưa kiểm thử screen reader thực tế/Safari/Firefox. Không triển khai restore vì ngoài phạm vi Create/Read/Update/Archive.
