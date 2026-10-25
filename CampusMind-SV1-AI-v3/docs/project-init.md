# TASK-01 — Khởi tạo repository và Git workflow

## Repository và nhánh chính

Repository: `AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1`.

- `main`: bản ổn định để bàn giao.
- `dev`: nhánh tích hợp của nhóm.
- `docs/project-init`: tài liệu khởi tạo để review vào `dev`.

Link cũ `AnGit-Hub67/cse122-campusmind-team01` chuyển tới cùng repo. Checklist TASK-01 trên Trello ghi nhận đã mời SV1, SV2, SV3.

## Các nhánh cũ đã đổi tên

Các tên `docs`, `feature`, `fix` chặn việc tạo nhánh dạng `docs/project-init`, `feature/student-booking` và `fix/booking-validation`.

Đã đổi tên để giữ nguyên lịch sử và dùng được quy ước mới:

| Tên cũ | Tên lưu lại |
|---|---|
| `docs` | `legacy-docs` |
| `feature` | `legacy-feature` |
| `fix` | `legacy-fix` |

Giữ nguyên `main` và `dev`. Trước khi đổi tên, ba nhánh cũ cùng trỏ tới commit `2997c4d938fc04b634b0733a3b80c1dd3535f94d`, chưa có công việc riêng.

## Cập nhật bản clone đã có nhánh cũ

Nếu máy đang có nhánh local `docs`, đổi tên và cập nhật upstream:

```bash
git branch -m docs legacy-docs
git fetch origin --prune
git branch --set-upstream-to=origin/legacy-docs legacy-docs
```

Thực hiện tương tự cho `feature` và `fix` nếu có. Nếu chưa có nhánh local này, chỉ cần `git fetch origin --prune`. Prune dọn remote-tracking ref đã cũ, không xóa branch local.

## Bắt đầu công việc mới

Lưu các thay đổi đang làm trước khi chuyển nhánh:

```bash
git fetch origin
git switch dev
git pull --ff-only origin dev
git switch -c feature/student-booking
```

Thay tên ví dụ bằng branch của task. Mở PR vào `dev` và nhờ một thành viên khác review. Chi tiết ở [CONTRIBUTING.md](../CONTRIBUTING.md).

## Bộ file khởi tạo

- `README.md`: tổng quan và hướng dẫn bắt đầu.
- `CONTRIBUTING.md`: branch, commit, PR, review và xử lý xung đột.
- `.github/pull_request_template.md`: mẫu nội dung PR.
- `.gitignore`: bỏ qua file môi trường và file sinh tự động.
- `.editorconfig`: UTF-8, LF và định dạng chung.
- `docs/project-init.md`: hướng dẫn chuyển sang quy trình mới.

TASK-01 chưa tạo ứng dụng frontend. Cấu trúc và layout thuộc TASK-11.

## Điều kiện đóng card

- Repo có `main`, `dev` và các thành viên có quyền làm việc cần thiết.
- Các nhánh trùng tiền tố đã được xử lý.
- Nhóm review và thống nhất quy tắc branch, commit, PR.
- PR khởi tạo được merge vào `dev`.
- Trello có link repo, PR và checklist đúng kết quả thực tế.

Quy tắc review trong tài liệu là quy ước nhóm. Bộ file không tự bật branch protection trên GitHub.
