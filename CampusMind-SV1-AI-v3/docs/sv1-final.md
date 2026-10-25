# Bàn giao frontend SV1 — TASK-12 và TASK-16

## Phạm vi

Bốn màn hình:

- `pages/visitor/visitor-service-directory.html`
- `pages/visitor/visitor-resource-library.html`
- `pages/visitor/visitor-counselor-detail.html`
- `pages/admin/admin-service-management.html`

Các chức năng chạy bằng JavaScript và dữ liệu JSON tách riêng, giữ Design System, layout semantic và điều hướng chung hiện có. Không sửa mã Student, Counselor, Dashboard hoặc trình sinh layout.

## Chạy

Tại thư mục repo:

```sh
python -m http.server 8080
```

Mở `http://localhost:8080/pages/visitor/visitor-service-directory.html`, và mở Admin trong tab khác cùng origin để kiểm tra cập nhật danh mục.

## Hợp đồng dữ liệu

| Nội dung | Nguồn ban đầu | Khóa localStorage |
|---|---|---|
| Danh mục dịch vụ | `assets/data/admin-services.json` | `campusmind.admin.services.v1` |
| Tài nguyên và chuyên viên | `assets/data/visitor.json` | Không lưu bản sao |
| Tài nguyên đã lưu | Mảng ID rỗng | `campusmind.visitor.savedResources.v1` |

`service-store.js` là lớp đọc/kiểm tra/lưu danh mục cho cả Admin và Visitor.

- Giữ nguyên các trường `id`, `name`, `category`, `duration`, `description`, `status` và khóa v1 mà Dashboard sử dụng.
- `counselorId` là trường tùy chọn mới. Dữ liệu cũ không có trường này vẫn hợp lệ; Admin có thể phân công khi sửa.
- Visitor chỉ hiển thị `active`; `inactive` và `archived` vẫn giữ trong Admin.
- Dịch vụ không có chuyên viên hợp lệ hiển thị nút disabled, không sinh link hồ sơ hỏng.
- Không còn hai danh sách dịch vụ độc lập trong JSON Admin và Visitor.
- JSON/schema hỏng không bị tự động ghi đè. Người dùng thấy lỗi và có nút thử lại.
- Mỗi bản đọc Admin giữ snapshot. Web Locks tuần tự hóa ghi giữa tab trên trình duyệt hỗ trợ; kiểm tra snapshot từ chối thao tác từ biểu mẫu cũ.
- Storage event cập nhật danh sách ở tab khác. Biểu mẫu đang mở được giữ để tránh mất nội dung nhập.
- Bản tải chậm cũ không ghi đè kết quả của lần tải mới hơn.

## Hành vi đã kiểm tra

| Nhóm | Kiểm tra |
|---|---|
| Visitor | Search tiếng Việt, lọc kết hợp/reset, đọc bài qua dialog, save/unsave/reload, đồng bộ mục đã lưu giữa tab, xóa danh sách có xác nhận/hủy, focus, ID chuyên viên sai, lịch trống/disabled. |
| Admin | Create/Read/Update/Archive, validation, trùng tên, tìm/lọc, thống kê, hủy/Escape/xác nhận, giữ nội dung khi lỗi lưu, từ chối sửa từ tab cũ, hiển thị chuỗi HTML dưới dạng văn bản. |
| Liên thông | Admin tạo → Visitor xuất hiện; chọn chuyên viên → đúng hồ sơ; tạm ngưng/archive → Visitor ẩn; chưa phân công → disabled; reload; dữ liệu hỏng → lỗi, không còn danh sách cũ. |
| Trạng thái | Loading/busy, controls disabled, empty, HTTP/JSON/storage error, retry, success. |
| Giao diện | Bốn màn hình ở 375/768/1440px, không tràn toàn trang; bảng Admin cuộn vùng riêng; dùng bàn phím, skip link, dialog focus; layout chung 18 cấu hình. |

Đã chạy ngày 20/10/2026 bằng Chromium:

```sh
node tests/visitor-smoke.cjs
node tests/admin-services-smoke.cjs
node tests/sv1-integration.cjs
node tests/layout-smoke.cjs
node tools/build-layout.cjs --check
```

Tất cả PASS. Tests cần Node.js, Playwright và Chromium. Có thể cài bằng:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
```

`VISITOR_SCREENSHOTS` và `ADMIN_SCREENSHOTS` cho phép xuất ảnh giao diện khi chạy kiểm thử. Đã xem ảnh đại diện Visitor desktop/mobile/tablet và Admin desktop/mobile.

## Riêng tư và giới hạn còn lại

- Chỉ dùng hồ sơ giả lập. Không thu thập câu trả lời tự ghi chú, chẩn đoán, nội dung buổi tham vấn hoặc dữ liệu cá nhân nhạy cảm thật.
- Mục đã lưu chỉ chứa ID nhưng có thể gợi ý mối quan tâm; UI nêu rõ người dùng chung trình duyệt có thể thấy và cung cấp xóa toàn bộ qua xác nhận.
- localStorage không phải nơi bảo mật, không có mã hóa hay phân quyền thực sự. Dữ liệu chỉ thuộc origin/trình duyệt hiện tại.
- Chưa có backend, đăng nhập, phân quyền Admin phía máy chủ hay đồng bộ nhiều người dùng.
- Đặt lịch thuộc Student, chưa có trên `dev` tại thời điểm thực hiện. Nút hướng dẫn nêu rõ chưa gửi yêu cầu hoặc giữ chỗ; lịch chuyên viên là dữ liệu giả lập theo tuần.
- Web Locks có fallback kiểm tra snapshot trên trình duyệt không hỗ trợ, nhưng fallback không bảo đảm khóa nguyên tử giữa hai tab ghi cùng lúc.
- Chưa kiểm thử Safari/Firefox hoặc screen reader thực tế; không tuyên bố đạt toàn bộ WCAG.
- PR #5 (Counselor) và #6 (Dashboard) đang mở khi kiểm tra. Không nhập các thay đổi đó vào nhánh này; việc tích hợp toàn bộ sản phẩm và review trước merge vẫn cần nhóm thực hiện.
