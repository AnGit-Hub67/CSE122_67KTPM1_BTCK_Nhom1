# Phần SV3 chuẩn bị phát hành và nộp bài

Đây là checklist bàn giao, không xác nhận đã triển khai/nộp bài.

## TASK-10 — bộ thiết kế xin duyệt

Các link Canva/Screen Inventory đã có trên board. Nhóm cần chốt bản thiết kế cuối và bằng chứng giảng viên duyệt; không thay thế bằng ảnh frontend hoặc tự đánh dấu duyệt.

## TASK-20 — tích hợp và demo

- Review thay đổi SV1/SV2/SV3; tích hợp theo quy trình nhóm vào dev sau khi được yêu cầu. Hiện mới có bản ghép QA local.
- Chạy các bộ test trên chính SHA tích hợp, không chỉ trên nhánh riêng; kiểm tra generator layout để không mất sidebar.
- Kịch bản demo: Login student → Profile sửa họ tên → Booking chọn chuyên viên/ngày/giờ/lý do → Appointments → Login counselor tương ứng → Queue Confirm → Note → AI-3 tạo/sửa/chấp nhận → Lưu → Complete → Student thấy Completed → Admin Dashboard thống kê → Service archive và Visitor phản ánh.
- AI-1/2: mở Service Directory/Resource Library, chọn chủ đề, tạo/chấp nhận/bỏ/tạo lại; lưu tài nguyên, kiểm tra mục đã lưu. Student Dashboard có AI riêng của SV2.
- Quay OBS kịch bản trên, ghi mốc thời gian để nhóm gắn vào bảng minh chứng. Chưa có video OBS của lượt này.

## TASK-21 — website demo

Phụ thuộc TASK-20 chốt bản tích hợp. Repo là website tĩnh; có thể dùng GitHub Pages nếu nền tảng được môn học chấp nhận. Chưa đổi thiết lập Pages hoặc triển khai khi dev/main chưa tích hợp.

Sau khi nhóm chốt: chọn nguồn deploy chứa đủ login/register/profile và toàn bộ pages/assets; kiểm tra đường dẫn dưới subpath repository, mở link trên cửa sổ riêng để kiểm tra seed sạch và localStorage; thử trên mobile. Lưu link demo và SHA nguồn. Dùng `node tools/serve.cjs` làm phương án local dự phòng.

## TASK-26 — đóng gói

Phụ thuộc các đầu ra TASK-20–25: source tích hợp, báo cáo chỉnh sửa được + PDF, slide, minh chứng, video/link demo. Hiện thiếu một số đầu ra, không gọi bản code QA là bài nộp hoàn chỉnh.

Gói source được bàn giao local có thể dùng để review trước. Trước nộp: đối chiếu SHA, bỏ token/.git/node_modules/cache, kiểm tra link mở được, tên nhóm/thành viên, checksum gói và yêu cầu định dạng của môn học. Chỉ xác nhận đã nộp khi có biên nhận từ hệ thống/giảng viên.
