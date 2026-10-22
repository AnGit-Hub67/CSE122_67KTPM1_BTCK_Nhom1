# Bàn giao SV2 — TASK-13 và TASK-17

**Bổ sung 23/10/2026:** đã có SCR-02 `register.html`, lưu user vào store chung và mở phiên sinh viên demo để đặt lịch dưới ID mới. Xem [hướng dẫn Register và kiểm thử](sv2-register.md). Phần này không thay thế Login/xác thực của SV1.

## Phạm vi và chạy thử

Bốn trang hoàn chỉnh, dữ liệu từ JSON/localStorage, không nhúng người hoặc lịch giả trong HTML:

- `pages/student/student-dashboard.html`
- `pages/student/student-booking.html`
- `pages/student/student-appointments.html`
- `pages/admin/admin-user-management.html`

Tại thư mục repo chạy `node tools/sv2-serve.cjs`, mở http://127.0.0.1:8080. Không cần cài thư viện để chạy ứng dụng. Có thể dùng Live Server thay thế. Không mở qua file:// vì cần tải JSON.

Nhánh SV2 được tạo từ `dev` tại `1869b6b483c771b797e4eb71eb3834631bab906c`. Chỉ bổ sung file riêng; không sửa file SV1/SV3, CSS chung, main.js hay trình sinh layout. Đã đối chiếu `feature/sv1-final` tại `e142946d6d142ba91b03caebcd14d41747f65cb8` và `feature/counselor-pages` tại `c82831932a9754f5d143963a032813a93cefa3ab`. Bản tham chiếu local được kiểm tra Git blob hash với cây GitHub, có xét CRLF/LF.

## Chức năng

- Dashboard: thống kê theo sinh viên demo, lịch sắp tới, tài nguyên từ `visitor.json` của SV1. Không dùng AI hoặc đưa ra chẩn đoán.
- Booking: chọn chuyên viên/ngày/giờ; gợi ý ngày trống; khóa slot đã đặt, quá giờ, bị tắt hoặc chuyên viên bị vô hiệu hóa. Xác nhận trước lưu, ghi Pending, kiểm tra lại trạng thái và xung đột khi lưu.
- Appointments: tìm mã/chuyên viên/ngày, lọc Pending/Confirmed/Completed/Cancelled; đổi lịch giữ ID và chuyển về Pending; hủy có xác nhận; lịch kết thúc/quá giờ bị khóa thao tác.
- Admin: tìm tên/email/ID, lọc role/status kết hợp, sửa tên/email/role, bật/tắt tài khoản, xác nhận trước ghi; email trùng và tên chỉ chứa khoảng trắng bị từ chối. Không tắt/hạ quyền quản trị đang dùng hoặc quản trị hoạt động cuối cùng.
- Semantic HTML, nhãn form, skip link, native dialog, Escape, trả focus, live status/error, menu mobile, bảng cuộn trong vùng riêng. Empty/Loading/Error/Success/Disabled có hành vi tương ứng.

## Schema và tích hợp

| Dữ liệu | Nguồn / khóa |
|---|---|
| Chuyên viên, tài nguyên | `assets/data/visitor.json` giữ nguyên của SV1 |
| Người dùng và quy tắc lịch demo | `assets/data/sv2.json` |
| Người dùng đã sửa | `campusmind.sv2.users.v1`: mảng `{id,name,email,role,status}` |
| Lịch hẹn, slot, ghi chú, hoạt động | `campusmind.counselor.v1`: `{slots,appointments,notes,activity}` của SV3 |

Giữ trường lịch hẹn SV3 `id,studentName,date,time,status`; bổ sung `studentId,counselorId,slotId,end,updatedAt`. Slot giữ `id,date,start,end`, có thêm `counselorId,source`. Chỉ hiển thị lịch có `studentId` đúng tài khoản demo; không đoán quyền sở hữu lịch cũ thiếu trường này. Trạng thái Confirmed của SV3 vẫn được hỗ trợ.

Nếu khóa lịch chưa tồn tại, sinh lịch demo 28 ngày từ weeklySlots, theo UTC+7. Chỉ ghi các slot này vào khóa chung khi đặt lịch thành công lần đầu. Nếu khóa đã có, dùng nguyên slot của khóa đó, kể cả mảng rỗng; không tự thêm lịch demo. Lịch demo đã lưu không tự gia hạn. Slot SV3 cũ không có counselorId được gán bằng `legacyCounselorId` trong cấu hình; đây là quy ước demo, cần thống nhất với SV3 trước dùng nhiều chuyên viên thật.

Ghi chú và trường mở rộng được giữ khi cập nhật. Lịch không có giờ kết thúc được coi là chiếm thời gian từ giờ bắt đầu đến cuối ngày để tránh cho đặt trùng không an toàn. Dữ liệu hỏng không tự bị xóa. Web Locks tuần tự hóa thao tác SV2; snapshot ngăn ghi từ bản cũ, lỗi dung lượng không báo thành công giả.

Sau khi nhóm tích hợp, thêm link tới dashboard/booking/appointments vào menu student và link quản lý người dùng vào menu admin. Các trang mới có menu riêng hoạt động ngay. Không chạy trình sinh layout để ghi đè phần điều hướng của thành viên khác. Trang index sinh viên cũ được giữ nguyên; vào trực tiếp URL trang mới hoặc dùng server SV2.

## Kiểm thử và giới hạn kết quả

Ngày 22/10/2026 đã chạy Chromium và PASS 17 nhóm trong `docs/sv2-browser-results.json`: đặt/lưu/reload/khóa slot, hủy/đổi, SV3 xác nhận → SV2 đọc Confirmed, tìm/lọc, validation, XSS dạng văn bản, disable/enable, bảo vệ admin, lỗi quota, snapshot cũ, JSON hỏng, fetch lỗi/retry, loading, menu bàn phím, 12 ảnh ở 1440/768/375px và không có lỗi JavaScript chưa bắt.

**Phạm vi xác nhận:** kết quả trên thuộc bản trước chỉnh sửa cuối về min-width bảng mobile, gợi ý ngày trống và fallback focus khi đóng edit dialog. Đã kiểm tra cú pháp bản cuối; chưa chạy lại toàn bộ browser suite sau các sửa đó. Kiểm thử bổ sung hoàn thành lịch qua SV3, bảo toàn ghi chú và ghi đồng thời đã được viết nhưng chưa xác nhận chạy thành công: lần chạy lại bị chặn ở bước xin quyền chạy trình duyệt. Không coi các ca bổ sung là PASS.

Để chạy lại từ thư mục repo:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/sv2-smoke.cjs
```

`CHROMIUM_PATH` tùy chọn trỏ đến Chromium có sẵn; `SV2_ROOT` chỉ định thư mục ứng dụng; `SV2_QA` chỉ định thư mục ảnh/kết quả. Tests dùng browser context riêng, không sửa dữ liệu trình duyệt cá nhân. Khi chưa tích hợp trang SV3, tests báo SKIP các ca liên thông SV3 thay vì giả lập chúng là đã đạt.

## Giới hạn sản phẩm

- Chỉ frontend demo, không backend, không xác thực/phân quyền thực, không đồng bộ thiết bị. Không nhập dữ liệu sức khỏe hoặc thông tin cá nhân thật vào localStorage.
- Disable user chỉ được thực thi trong module SV2; SV1/SV3 chưa dùng user store này. Các lịch đang có được giữ nguyên khi disable.
- SV3 hiện chưa phân tách hàng đợi theo counselorId; nhiều chuyên viên và khóa ghi chung giữa SV2/SV3 cần thống nhất tiếp. Không tuyên bố tích hợp phân quyền nhiều người dùng hoàn chỉnh.
- Web Locks chỉ bảo vệ các writer dùng cùng khóa; SV3 và trình duyệt không hỗ trợ khóa vẫn có giới hạn race condition. Backend cần kiểm tra và khóa slot nguyên tử khi triển khai thật.
- Chưa kiểm thử Firefox/Safari, thiết bị thật, screen reader hoặc audit WCAG đầy đủ.
- GitHub branch chứa mã nguồn; chưa cấu hình GitHub Pages hay xuất bản website công khai.

Nếu storage lỗi, sao lưu giá trị khóa liên quan qua DevTools trước khi sửa/xóa thủ công. Không dùng `localStorage.clear()` trên origin dùng chung; xóa khóa counselor sẽ làm mất cả dữ liệu SV3. Ưu tiên profile/origin demo mới khi cần bắt đầu lại.
