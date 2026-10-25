# Cấu hình Fake REST cho SV3

Đã kết nối URL do người dùng cung cấp: `https://6add2cd4fa5e73d4ab2de718.mockapi.io/api/v1/schedules/1`. Record 1 được tạo trên resource rỗng, kiểm tra GET/PUT thực tế thành công. `assets/data/config.public.json` chứa URL public này (không phải secret). Trình duyệt ưu tiên `config.json` local; nếu không có thì dùng cấu hình public. Muốn demo hoàn toàn local: tạo `config.json` với `enableDemoRemoteSync: false`.

Khi API offline, vẫn dùng store local qua HTTP localhost. `storage` đồng bộ các tab cùng origin; BroadcastChannel bổ sung tín hiệu invalidation (không truyền nội dung tư vấn). Phiên từng role ở sessionStorage riêng mỗi tab. Các bước dưới dành cho đổi sang một dự án MockAPI khác:

1. Tạo dự án MockAPI của bạn, resource lịch demo, một record ban đầu có các trường: `version` (number) = 1, `revision` (string) = `initial`, `slots` (array) = [], `appointments` (array) = []. MockAPI cấp `id`.
2. Copy `assets/data/config.example.json` thành `assets/data/config.json` (đã gitignore). Điền URL HTTPS **đến record cụ thể** do MockAPI cấp, bật `enableDemoRemoteSync: true`. Không điền URL collection, token hoặc API key.
3. Reload trang SV3. Adapter GET record, kiểm tra schema. Chỉ nhập dữ liệu remote khi store local chưa tồn tại; không thay bản local hiện có. Mỗi thao tác Counselor lưu local thành công sẽ GET kiểm tra revision rồi PUT snapshot lịch demo.
4. Nếu lỗi mạng, cấu hình sai, remote đổi revision: giữ local, hiện thông báo và nút thử đồng bộ lại. Xung đột revision cần đối chiếu thủ công; không tự ghi đè dữ liệu bên khác. Không có hàng đợi bền vững sau khi đóng tab: mở lại và bấm thử đồng bộ để gửi snapshot local.

Chỉ gửi mã lịch/khung giờ/chuyên viên, ngày giờ, trạng thái. **Không gửi notes/content/plan/summary, tên sinh viên, studentId, lý do đặt lịch, activity, hồ sơ hoặc session.** Mọi dữ liệu phải là giả lập. Khi nhập remote, tên hiển thị là “Sinh viên demo”. Adapter không phải backend phân quyền; MockAPI công khai không được dùng với dữ liệu bệnh nhân. Revision check không phải giao dịch nguyên tử: hai thiết bị ghi đồng thời vẫn có thể tranh chấp; bản demo ưu tiên đồng bộ cùng trình duyệt qua Web Locks/localStorage.

Không thay module đặt lịch SV2. Booking SV2 vẫn dùng store cùng tên, sự kiện storage cập nhật SV3 ngay; lịch sẽ được mirror khi chuyên viên thao tác. Đồng bộ ghi từ SV2 trực tiếp lên remote là đầu việc tích hợp của SV2, chưa sửa ở nhánh này.

AI-3 chỉ chạy mock trích câu tại trình duyệt. Không có LLM thật, proxy hoặc API key; không quảng cáo chức năng AI thật. Khi cần API thật phải xây proxy có xác thực riêng, không thêm key vào config frontend.
