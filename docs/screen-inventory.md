# CampusMind — Screen Inventory

Cập nhật 26/10/2026 theo các tệp trên `dev`; bổ sung hiện tại cho [bản đặc tả](projectproposal.md), chưa phải bằng chứng inventory được duyệt trước code. TASK-03 trên Trello từng dự kiến 15 màn hình; bảng này kiểm kê cấu trúc repo hiện tại, không tự xác nhận kế hoạch cũ đã được duyệt lại.

## Màn hình nghiệp vụ và tài khoản

Mã U/O/Flow dẫn tới mục 3 và 6 của đặc tả. C/R/U là tạo/xem/sửa; Cancel/Archive/Disable được ghi riêng. States dưới đây là trạng thái cần đối chiếu khi nghiệm thu, không thay kết quả kiểm thử từng màn hình. AI1 = Support Navigator; AI2 = Resource Recommender; AI3 = Counselor Summary Assistant. Phân công SV theo README/Trello, không khẳng định ai tự viết từng dòng mã.

| ID | Role | User Goal | User Task | Screen | File | CRUD | States | AI | Assignee | Task ID | Branch tích hợp | OBS |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| V01 | Visitor | O1 | U-V1 / F-V | Danh mục dịch vụ | [visitor-service-directory.html](../pages/visitor/visitor-service-directory.html) | R | Loading, Empty, Error, kết quả lọc | — | SV1 | TASK-12 | feature/sv1 | SV1; chờ video V01 |
| V02 | Visitor | O1, O7 | U-V2 / F-V | Thư viện tài nguyên | [visitor-resource-library.html](../pages/visitor/visitor-resource-library.html) | R, lưu/bỏ lưu | Loading, Empty, Error, gợi ý/đã lưu | AI2 | SV1 | TASK-12, TASK-19 | feature/sv1 | SV1; chờ video V02 |
| V03 | Visitor | O1 | U-V1 / F-V | Chi tiết chuyên viên | [visitor-counselor-detail.html](../pages/visitor/visitor-counselor-detail.html) | R | Có/không có hồ sơ, còn/hết giờ | — | SV1 | TASK-12 | feature/sv1 | SV1; chờ video V03 |
| S01 | Student | O3, O7 | U-S2, U-S4 / F-S | Tổng quan sinh viên | [student-dashboard.html](../pages/student/student-dashboard.html) | R, lưu/áp dụng gợi ý | Loading, Empty, Error, AI processing/result | AI1 | SV2 | TASK-13, TASK-19 | feature/sv2 | SV2; chờ video S01 |
| S02 | Student | O3, O4 | U-S2, U-S3 / F-S | Đặt/đổi lịch | [student-booking.html](../pages/student/student-booking.html) | C, U | Giờ trống/hết chỗ, validation, Pending, Error | — | SV2 | TASK-13 | feature/sv2 | SV2; chờ video S02 |
| S03 | Student | O4 | U-S3 / F-S | Lịch hẹn của tôi | [student-appointments.html](../pages/student/student-appointments.html) | R, Cancel | Pending, Confirmed, Completed, Cancelled, Empty | — | SV2 | TASK-13 | feature/sv2 | SV2; chờ video S03 |
| C01 | Counselor | O5 | U-C1 / F-C | Lịch làm việc | [counselor-schedule.html](../pages/counselor/counselor-schedule.html) | C, R, quản lý giờ | Loading, Empty, Error, giờ trống/bị chiếm | — | SV3 | TASK-14 | feature/sv3 | SV3; chờ video C01 |
| C02 | Counselor | O5 | U-C2 / F-C | Hàng đợi lịch hẹn | [counselor-appointment-queue.html](../pages/counselor/counselor-appointment-queue.html) | R, U, Cancel | Pending, Confirmed, Completed, Cancelled, Empty | — | SV3 | TASK-14 | feature/sv3 | SV3; chờ video C02 |
| C03 | Counselor | O5, O7 | U-C3 / F-C | Ghi chú buổi gặp | [counselor-session-note.html](../pages/counselor/counselor-session-note.html) | C, R, U | Chưa lưu/đã lưu, validation, AI result/error, Completed | AI3 | SV3 | TASK-14, TASK-19 | feature/sv3 | SV3; chờ video C03 |
| A01 | Admin | O6 | U-A1 / F-A | Tổng quan quản trị | [admin-dashboard.html](../pages/admin/admin-dashboard.html) | R | Loading, Empty, Error, thống kê | — | SV3 | TASK-15 | feature/sv3 | SV3; chờ video A01 |
| A02 | Admin | O6 | U-A2 / F-A | Quản lý dịch vụ | [admin-service-management.html](../pages/admin/admin-service-management.html) | C, R, U, Archive | active, inactive, archived, validation, Error | — | SV1 | TASK-16 | feature/sv1 | SV1; chờ video A02 |
| A03 | Admin | O2, O6 | U-A3 / F-A | Quản lý người dùng | [admin-user-management.html](../pages/admin/admin-user-management.html) | C, R, U, Disable/Enable | active, disabled, phê duyệt/từ chối, validation | — | SV2 | TASK-17 | feature/sv2 | SV2; chờ video A03 |
| G01 | Các role | O2 | U-S1; đầu F-C/F-A | Đăng nhập | [sv2-login.html](../sv2-login.html) | Đăng nhập/đọc tài khoản | Chưa đăng nhập, đang xử lý, lỗi, chuyển theo role | — | SV2 | Phần tài khoản trong PR #10; chưa có TASK riêng xác minh | feature/sv2 | SV2; chờ video G01 |
| G02 | Visitor | O2 | U-S1 / F-S; tiếp nhận Counselor | Đăng ký | [register.html](../register.html) | C | Validation, thành công, chờ duyệt, lỗi | — | SV2 | Phần tài khoản trong PR #10; chưa có TASK riêng xác minh | feature/sv2 | SV2; chờ video G02 |
| G03 | Role đã đăng nhập | O2 | U-S1; hồ sơ F-C/F-A | Hồ sơ | [profile.html](../profile.html) | R, U | Loading, validation, lưu thành công/lỗi | — | SV2 + SV3 | Phần hồ sơ trong PR #10/#11; chờ TASK riêng | feature/sv2, feature/sv3 | SV2/SV3; chờ phân công video G03 |
| G04 | Người đăng ký | O2 | U-S1; theo dõi phê duyệt | Trạng thái tài khoản | [account-status.html](../account-status.html) | R | Chờ duyệt, approved/rejected hoặc chưa cấu hình | — | SV2 | Phần tài khoản trong PR #10; chờ TASK riêng | feature/sv2 | SV2; chờ video G04 |

## Trang hỗ trợ, điểm vào và chuyển hướng

Liệt kê đầy đủ để không bỏ sót tệp HTML. Trang chuyển hướng không cần tính thành một màn hình nghiệp vụ riêng; các trang hỗ trợ có nội dung độc lập vẫn cần nhóm xác định video phù hợp khi chốt phạm vi bảo vệ.

| ID | Role / nhiệm vụ | Trang và đường dẫn | Phân loại / trạng thái | Phân công, TASK và minh chứng |
|---|---|---|---|---|
| X01 | Visitor / bắt đầu U-V1 | [index.html](../index.html) | Trang chủ, điểm vào công khai | SV1; PR #9; chờ TASK/video riêng |
| X02 | Visitor / U-V1, U-V2 | [pages/visitor/index.html](../pages/visitor/index.html) | Trang khám phá, điều hướng | SV1; TASK-12/PR #9; chờ video riêng |
| X03 | Counselor / bắt đầu F-C | [pages/counselor/index.html](../pages/counselor/index.html) | Trang vào Counselor | SV3; TASK-14/PR #11; chờ video riêng |
| X04 | Admin / bắt đầu F-A | [pages/admin/index.html](../pages/admin/index.html) | Trang vào Admin | SV3; TASK-15/PR #11; chờ video riêng |
| X05 | Người đăng ký / U-S1 | [policies.html](../policies.html) | Nội dung chính sách, R | SV2; PR #10; chờ TASK/video riêng |
| X06 | Admin / U-A3 | [admin-invitation.html](../admin-invitation.html) | Lời mời quản trị; tính năng phụ thuộc cấu hình, không mặc định hoạt động trên server | SV2; PR #10; chờ TASK/video riêng |
| X07 | Nhóm phát triển / nhất quán thiết kế | [pages/ui-kit.html](../pages/ui-kit.html) | Trang tham chiếu thành phần, không là role nghiệp vụ | Dùng chung; TASK-05/TASK-11; chờ xác minh video |
| R01 | Các role / đăng nhập | [login.html](../login.html) | Chuyển hướng đến G01 | Không đếm thêm màn hình |
| R02 | Student / F-S | [pages/student/index.html](../pages/student/index.html) | Chuyển hướng đến S01 | Không đếm thêm màn hình |

## Thiết kế, TASK và minh chứng

- [Canva chung](https://www.canva.com/design/DAHZFwJb2RM/ccayXXID6SeELUIiNR-KoQ/edit): chưa xác minh trang tương ứng từng Screen ID hoặc quyền Anyone with the link can view.
- [TASK-03 — Screen Inventory](https://trello.com/c/WQZYt8OX), [TASK-04 — User Flow](https://trello.com/c/pb2tEDvq), [TASK-10 — Thiết kế](https://trello.com/c/B16QcYSH), [TASK-19 — AI](https://trello.com/c/XuQa6TID).
- [TASK-12](https://trello.com/c/eR2oStxx), [TASK-13](https://trello.com/c/XAvF4AxQ), [TASK-14](https://trello.com/c/5tWgeLRX), [TASK-15](https://trello.com/c/XI22I4Ok), [TASK-16](https://trello.com/c/uDJSzInd), [TASK-17](https://trello.com/c/MIXlL52P).
- [TASK-05](https://trello.com/c/oAOGw6w6), [TASK-11](https://trello.com/c/c47WkGzB) là công việc nền tảng chung. Mã TASK được đối chiếu với thẻ thật; việc ánh xạ các trang phụ cần nhóm chốt thêm.
- [PR #9](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/pull/9), [PR #10](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/pull/10), [PR #11](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/pull/11): đã đối chiếu danh sách tệp. Nhánh trong bảng là nhánh tích hợp lịch sử; xem giải thích khác biệt với nhánh kế hoạch Trello và commit thật ở mục 9 của [đặc tả](projectproposal.md).

| Sinh viên | Playlist người dùng cung cấp | Tình trạng ánh xạ |
|---|---|---|
| SV1 — Doãn Tuấn Nghĩa | [Playlist SV1](https://www.youtube.com/playlist?list=PLW791Q36zdro) | Chờ URL video riêng cho từng màn hình |
| SV2 — Lê Hải Anh | [Playlist SV2](https://youtube.com/playlist?list=PLT0-SlKPwchE&si=e5V-T6V0sKWc5x9S) | Chờ URL video riêng cho từng màn hình |
| SV3 — Vũ Khánh An | [Playlist SV3](https://youtube.com/playlist?list=PLJL2Iv-yK-68&si=Qv022_IZfgSUQ6N5) | Chờ URL video riêng cho từng màn hình |

Không bỏ ba playlist đã nhận. Chưa kiểm tra quyền xem/nội dung từng video; playlist không thay bằng chứng 1 màn hình–1 video. Khi bổ sung, ghi Screen ID, URL video thật, người trình bày, commit/PR tương ứng và trang Canva; chỉ đánh dấu đã duyệt/review khi có bằng chứng. Đây là bảng kiểm kê tài liệu, không phải báo cáo toàn bộ kiểm thử UI đã đạt.
