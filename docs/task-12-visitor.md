# TASK-12 — Visitor vertical slice

## Chạy ứng dụng

Từ thư mục gốc repo, chạy một máy chủ static, ví dụ:

```sh
python -m http.server 8080
```

Mở `http://localhost:8080/pages/visitor/visitor-service-directory.html`.
Không mở bằng `file://`: trình duyệt cần HTTP để đọc mock JSON.
Không cần build, tài khoản hay backend. JavaScript cần được bật.

## Phạm vi

- Service Directory: 6 dịch vụ, tìm kiếm tiếng Việt có/không dấu, lọc chủ đề kết hợp từ khóa, liên kết tới đúng chuyên viên.
- Resource Library: 4 tài nguyên đọc trong dialog, tìm kiếm/lọc chủ đề, lưu/bỏ lưu, lọc mục đã lưu. Dữ liệu được lưu trên trình duyệt hiện tại; đồng bộ thay đổi giữa các tab cùng origin.
- Counselor Detail: 3 hồ sơ chọn bằng `?id=minh-anh`, `?id=quang-huy`, `?id=thu-ha`. Mặc định là Minh Anh. ID sai có trạng thái không tìm thấy; Thu Hà chưa có lịch và CTA disabled.
- Loading, empty, lỗi HTTP/JSON/schema, timeout 10 giây, thử lại và lỗi localStorage được xử lý. Không báo lưu thành công nếu trình duyệt từ chối ghi.
- HTML semantic, nhãn form, skip link, focus rõ, trạng thái live, native dialog có Escape và trả focus, không chèn dữ liệu bằng HTML.

## Tích hợp với TASK-11

Tại commit gốc `3e7fd3f`, `dev` chưa có frontend hay layout TASK-11.
Ba trang nằm trong `pages/visitor/`, dùng chung `assets/css/visitor.css`, `assets/js/visitor.js` và `assets/data/visitor.json`.
CSS sử dụng bảng màu CampusMind từ hướng dẫn dự án: primary `#5B5FEF`, secondary `#14B8A6`, navy `#172554`, background `#F8FAFC`, radius 8/12/16px; nút và chữ dùng sắc tím đậm hơn để dễ đọc. Font Inter có fallback Arial, không phụ thuộc mạng ngoài.
Khi layout TASK-11 được tích hợp, có thể thay header/footer và chuyển các token sang CSS chung. Chưa tạo trang của vai trò khác hoặc sửa tài liệu TASK-01.

CTA đặt lịch hiện mở giải thích về luồng Student chưa được tích hợp, không gửi yêu cầu hoặc giả báo đặt lịch thành công. Lịch theo tuần chỉ là minh họa, không phải lịch trống thực tế. Nội dung và hồ sơ không phải tư vấn chuyên môn hay thông tin chuyên viên thật.

## Kiểm thử

Bộ smoke test dùng Node.js + Playwright, tự khởi động và đóng HTTP server:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/visitor-smoke.cjs
```

Tùy chọn: `VISITOR_BROWSER` trỏ tới executable Chromium tương thích; `VISITOR_SCREENSHOTS` trỏ tới thư mục ảnh kết quả ngoài repo.

Các kiểm tra gồm search/filter kết hợp, reset, localStorage sau reload, JSON lưu hỏng, lỗi ghi, dialog/Escape, focus khi bỏ lưu, liên kết từng dịch vụ, hồ sơ sai ID, CTA hết lịch, HTTP lỗi/retry, schema lỗi, loading, liên kết nội bộ và viewport 375/768/1440px cho cả ba trang.

Kiểm tra thủ công thêm trước khi bàn giao toàn dự án: đọc bằng screen reader, Safari/Firefox, tích hợp layout TASK-11 và luồng đăng nhập/đặt lịch Student khi các task đó có mặt.

Kết quả ngày 14/10/2026: smoke test PASS trên Chromium headless; cả 9 cấu hình viewport không tràn ngang, liên kết nội bộ trả thành công và không có lỗi JavaScript. Đã xem ảnh Service Directory desktop, Resource Library mobile và Counselor Detail tablet/desktop. Đây là kiểm tra accessibility cơ bản, chưa phải đánh giá WCAG đầy đủ.
