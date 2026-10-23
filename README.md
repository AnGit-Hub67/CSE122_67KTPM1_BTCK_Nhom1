# CampusMind

Frontend prototype hỗ trợ điều phối sức khỏe tinh thần sinh viên, môn CSE122, nhóm 1.

## Bổ sung SV3

Profile, lịch/hàng đợi theo chuyên viên, ghi chú với AI-3 mô phỏng, thống kê users/services và điều hướng chung được bổ sung trên `feature/sv3-complete`. Xem [bàn giao SV3 và kiểm thử](docs/sv3-completion.md) và [checklist tích hợp/triển khai/nộp bài](docs/sv3-release-checklist.md). Chạy local bằng `node tools/serve.cjs`. Tài khoản GitHub **AnGit-Hub67** đã được xác thực cho phần SV3; không merge dev/main.

## Bổ sung SV1 ngày 23/10/2026

Nhánh `feature/sv1-complete` tiếp tục bản SV1 trong PR #7: thêm `login.html` (chọn tài khoản demo, tương thích đăng ký SV2), gợi ý mô phỏng trên Service Directory/Resource Library, nối Counselor Detail sang Booking và bảo vệ lưu tài nguyên giữa các tab. Xem [phạm vi, phụ thuộc và kiểm thử SV1](docs/sv1-completion.md).

Chạy qua HTTP như hướng dẫn bên dưới, mở `/login.html` hoặc danh mục Visitor. Booking/Register/Counselor vẫn ở các nhánh phụ trách, cần tích hợp để chạy toàn bộ hành trình. Login là mô phỏng frontend, không có xác thực mật khẩu hoặc phân quyền máy chủ. Không có merge vào `dev`/`main` trong lượt bổ sung này.

## Liên kết dự án

- Repository: https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1
- Trello: https://trello.com/b/tijjtgu7/cse122-campusmind-team-1
- TASK-01: https://trello.com/c/FfMO7XNp

## Phạm vi

CampusMind gồm bốn vai trò: Visitor, Student, Counselor và Admin. Nhóm triển khai giao diện bằng HTML, CSS và JavaScript, sử dụng dữ liệu giả và LocalStorage cho prototype. Ba chức năng AI được mô phỏng theo TASK-19.

TASK-11 bổ sung cấu trúc frontend, trang chủ, navbar/footer và sidebar dùng chung, cùng bộ component responsive. Xem [hướng dẫn layout và tích hợp](docs/task-11-layout.md). Các khung Student/Counselor/Admin chưa có chức năng nghiệp vụ hoặc xác thực.

## Bắt đầu

Chạy bản frontend từ thư mục repo với `python -m http.server 8080`, rồi mở `http://localhost:8080/`. Không cần backend hoặc build. Xem bộ component tại `pages/ui-kit.html`.

```bash
git clone https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1.git
cd CSE122_67KTPM1_BTCK_Nhom1
git switch dev
git pull --ff-only origin dev
```

Các nhánh cũ `docs`, `feature`, `fix` đã đổi thành `legacy-docs`, `legacy-feature`, `legacy-fix`. Xem [hướng dẫn cập nhật bản clone](docs/project-init.md).

## Nhánh và Pull Request

| Nhánh | Mục đích |
|---|---|
| `main` | Bản ổn định để bàn giao/demo |
| `dev` | Tích hợp công việc của nhóm |
| `docs/<ten-cong-viec>` | Tài liệu, thiết kế và hướng dẫn |
| `feature/<ten-chuc-nang>` | Chức năng hoặc giao diện mới |
| `fix/<ten-loi>` | Sửa lỗi |
| `chore/<ten-cong-viec>` | Cấu hình và công việc bảo trì |

Mỗi task dùng một nhánh từ `dev`. Mở PR vào `dev`, có một thành viên khác review rồi mới merge. Nhóm chỉ đưa bản tích hợp đã kiểm tra từ `dev` vào `main`.

Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết quy tắc branch, commit, review và xử lý xung đột.

## Phân công

| Thành viên | Phần phụ trách chính |
|---|---|
| SV1 | Visitor, Admin Service, phối hợp thiết kế và tài liệu |
| SV2 | Student, Admin User, Mock Data và LocalStorage |
| SV3 | Git workflow, layout chung, Counselor, Admin Dashboard và AI mock |

Tên tài khoản GitHub tương ứng SV1/SV2/SV3 được nhóm xác nhận riêng. Checklist Trello hiện ghi nhận đã mời đủ thành viên.

## Trạng thái khởi tạo

- Repo, `main` và `dev` đã tồn tại.
- Bộ tài liệu gồm README, CONTRIBUTING và mẫu PR.
- Nhánh `docs/project-init` chứa tài liệu để nhóm review và tích hợp vào `dev`.
- TASK-01 khởi tạo quy trình; TASK-11 bổ sung frontend và layout dùng chung.
