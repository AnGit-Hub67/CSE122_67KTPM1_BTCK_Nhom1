# CampusMind

Frontend prototype hỗ trợ điều phối sức khỏe tinh thần sinh viên, môn CSE122, nhóm 1.

## Liên kết dự án

- Repository: https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1
- Trello: https://trello.com/b/tijjtgu7/cse122-campusmind-team-1
- TASK-01: https://trello.com/c/FfMO7XNp

## Phạm vi

CampusMind gồm bốn vai trò: Visitor, Student, Counselor và Admin. Nhóm triển khai giao diện bằng HTML, CSS và JavaScript, sử dụng dữ liệu giả và LocalStorage cho prototype. Ba chức năng AI được mô phỏng theo TASK-19.

TASK-01 chỉ khởi tạo repository và quy trình Git. Cấu trúc frontend, layout và các màn hình được triển khai từ TASK-11. Bộ khởi tạo này chưa có ứng dụng để chạy.

## Bắt đầu

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
- Chưa triển khai frontend trong TASK-01.

