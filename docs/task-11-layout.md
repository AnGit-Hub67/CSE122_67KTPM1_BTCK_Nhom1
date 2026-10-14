# TASK-11 — Cấu trúc frontend và layout dùng chung

## Chạy

Từ thư mục repo, chạy `python -m http.server 8080`, rồi mở `http://localhost:8080/`.
Không cần build hoặc backend để sử dụng các trang đã commit. JavaScript chỉ bổ sung menu thu gọn và dialog; header, sidebar, footer và liên kết vẫn có trong HTML khi JavaScript tắt.

## Cấu trúc

```text
index.html                 Trang chủ công khai
pages/visitor/             Khu vực Visitor, tích hợp các trang TASK-12
pages/student/             Khung Student cho task nghiệp vụ tiếp theo
pages/counselor/           Khung Counselor với sidebar
pages/admin/               Khung Admin với sidebar
pages/ui-kit.html          Mẫu component và các trạng thái
assets/css/base.css        Token, reset nhẹ, primitive và focus
assets/css/components.css  Navbar, footer, sidebar, card, form, button, badge, state, dialog
assets/css/responsive.css  Quy tắc tablet/mobile và reduced motion
assets/js/main.js          Menu responsive và dialog dùng chung
assets/data/               Mock data
assets/images/             Tài sản hình ảnh
tools/build-layout.cjs     Nguồn chung cho header/footer/sidebar và đường dẫn
tests/layout-smoke.cjs     Kiểm thử layout trên trình duyệt
```

## Tái sử dụng

1. Tạo HTML semantic, `lang="vi"`, viewport, title riêng; nạp `base.css`, `components.css`, CSS trang nếu có, rồi `responsive.css`. Nạp `main.js` với `defer`.
2. Thêm skip link tới `main#main[tabindex="-1"]`.
3. Đặt các cặp marker `<!-- campusmind:header -->...<!-- /campusmind:header -->` và `footer` tương tự. Không sửa thủ công nội dung bên trong marker.
4. Với khung vai trò, đặt `data-role="student|counselor|admin"` trên body; `.app-shell` chứa marker `sidebar` và main. Mỗi trang có tiêu đề h1 duy nhất.
5. Chạy `node tools/build-layout.cjs` để cập nhật layout trên toàn bộ trang; chạy `node tools/build-layout.cjs --check` để phát hiện layout chưa cập nhật. Script tính đường dẫn theo vị trí trang, không cần URL bắt đầu từ gốc website, nên dùng được khi deploy dưới thư mục con.

Script tự nhận biết ba trang TASK-12. Khi chưa có chúng, điều hướng dẫn đến trang vào Visitor và giải thích trạng thái tích hợp; khi chúng có mặt, menu và trang vào Visitor dẫn tới dịch vụ/tài nguyên/chuyên viên thật. Không tạo liên kết tới trang đăng nhập chưa tồn tại.

Menu thu gọn ở 700px trở xuống. Nút có `aria-controls`/`aria-expanded`; Escape trong menu đóng và trả focus. Khi đổi kích thước sang desktop, điều hướng tự hiển thị lại. Sidebar là điều hướng nội tuyến, không phải modal nên không khóa focus.

Các class ổn định: `.button`, `.primary`, `.secondary`, `.danger`, `.input`, `.card`, `.panel`, `.badge`, `.notice`, `.state`, `.grid`, `.hero`, `.actions`. Button disabled phải có lý do hiển thị; input lỗi dùng `aria-invalid` và `aria-describedby`. Dialog native cần tiêu đề qua `aria-labelledby`, dùng `data-dialog-open="id"` và `data-dialog-close`.

Token màu theo hướng dẫn CampusMind; màu chữ/nút tối hơn được dùng khi cần tăng độ tương phản. Các khung vai trò chưa có xác thực và không phải ranh giới bảo mật. Chức năng đặt lịch/quản lý nằm ở các task nghiệp vụ khác.

## Kiểm thử

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/layout-smoke.cjs
node tools/build-layout.cjs --check
```

`LAYOUT_SCREENSHOTS` tùy chọn để lưu ảnh ra thư mục ngoài repo. Bộ test gồm 6 trang × 375/768/1440px; đường dẫn trang, assets, anchor; menu và sidebar với Escape/resize; dialog trả focus; skip link; điều hướng khi tắt JavaScript. Khi ghép TASK-12, chạy thêm `node tests/visitor-smoke.cjs`.

Chưa đánh giá accessibility đầy đủ bằng screen reader hoặc kiểm thử Safari/Firefox. Các khung vai trò chỉ là nền tảng layout, không phải màn hình nghiệp vụ hoàn chỉnh.

Kết quả kiểm tra: bộ layout smoke test PASS trên Chromium cho cả 18 cấu hình; đã xem ảnh trang chủ desktop và Admin mobile. Trình kiểm tra layout đồng bộ và kiểm tra cú pháp JavaScript đều đạt.
