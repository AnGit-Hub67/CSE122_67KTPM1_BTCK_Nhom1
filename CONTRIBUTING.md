# Quy trình Git của nhóm CampusMind

## 1. Nhận việc

1. Nhận card trên Trello và đọc mục tiêu, checklist, điều kiện bắt đầu.
2. Chuyển card sang “Đang làm”.
3. Đồng bộ `dev`, sau đó tạo nhánh riêng.

## 2. Đặt tên branch

Tên dùng chữ thường, không dấu, các từ cách nhau bằng dấu gạch ngang:

| Loại | Ví dụ |
|---|---|
| Tài liệu | `docs/project-init` |
| Chức năng | `feature/student-booking` |
| Sửa lỗi | `fix/booking-validation` |
| Cấu hình | `chore/deploy-demo` |

Không tạo nhánh chỉ mang tên `docs`, `feature`, `fix` hoặc `chore`, vì chúng chặn nhánh có cùng tiền tố và dấu `/`. Các nhánh cũ đã đổi tên; cách cập nhật bản clone nằm trong [project-init.md](docs/project-init.md).

## 3. Bắt đầu một task

Đảm bảo các thay đổi đang làm đã được lưu/commit trước khi chuyển nhánh.

```bash
git fetch origin
git switch dev
git pull --ff-only origin dev
git switch -c feature/student-booking
```

Thay tên nhánh ví dụ bằng branch của task. Không code trực tiếp trên `main` hoặc `dev`.

## 4. Commit

Dạng chung:

```text
<type>: <mô tả ngắn>
```

| Type | Khi dùng |
|---|---|
| `feat` | Thêm chức năng |
| `fix` | Sửa lỗi |
| `style` | Điều chỉnh CSS, bố cục, định dạng |
| `docs` | Tài liệu, thiết kế, README |
| `refactor` | Tổ chức lại code, giữ nguyên hành vi |
| `test` | Thêm hoặc sửa kiểm thử |
| `chore` | Cấu hình và công việc bảo trì |

Ví dụ:

```text
docs: add project Git workflow
feat: add student booking form
fix: preserve booking input after validation error
style: stack appointment cards on mobile
```

Mỗi commit nên giải quyết một việc rõ ràng. Tránh mô tả như `update`, `done`, `final`. Trước khi commit, kiểm tra thay đổi và chỉ stage file thuộc task:

```bash
git status
git diff
git add README.md CONTRIBUTING.md
git diff --cached
git commit -m "docs: add project Git workflow"
```

Các tên file trên là ví dụ cho task tài liệu; thay bằng file thực tế của task.

## 5. Push và mở Pull Request

```bash
git push -u origin feature/student-booking
```

Trên GitHub, tạo PR với:

- Base: `dev`.
- Compare: branch task vừa push.
- Title: có mã task và thay đổi cụ thể, ví dụ `TASK-13: thêm form Student Booking`.
- Description: vấn đề, phần đã làm, cách kiểm tra, link card, ảnh nếu thay đổi giao diện.
- Reviewer: một thành viên khác trong nhóm.

Điền [mẫu PR](.github/pull_request_template.md). Không tự đánh dấu mục đã kiểm tra nếu chưa thực hiện.

## 6. Review và merge

Reviewer kiểm tra đúng phạm vi task, luồng tương tác, responsive/state liên quan và khả năng chạy. Tác giả sửa các điểm cần thiết trên cùng branch, commit rồi push; PR sẽ tự cập nhật.

Sau khi được review và các kiểm tra liên quan đạt:

1. Merge PR vào `dev`, có thể dùng Squash and merge để gom task thành một commit.
2. Gắn link PR vào card Trello.
3. Đánh dấu checklist đã hoàn thành và chuyển card sang “Đã xong”.
4. Đồng bộ `dev` trên máy trước khi nhận task tiếp theo.

Quy tắc review trên là quy ước nhóm. Bộ file này không tự bật branch protection. Nếu cần GitHub bắt buộc review trước merge, chủ repository cấu hình rule phù hợp cho `main` và `dev`.

## 7. Xử lý xung đột

Khi branch task có thay đổi xung đột với `dev`, giải quyết trên branch task:

```bash
git fetch origin
git switch feature/student-booking
git merge origin/dev
```

Đọc từng vùng xung đột, thống nhất với thành viên liên quan, sửa file, kiểm tra lại rồi commit và push. Không dùng force push lên `main` hoặc `dev`. Không ghi đè phần của người khác chỉ để hết xung đột.

## 8. Bản bàn giao

TASK-20 tích hợp và kiểm thử trên `dev`. Khi bản demo đã ổn định, tạo PR `dev` vào `main` với mô tả kết quả kiểm tra. Nhóm review PR này trước khi merge và dùng commit trên `main` làm mốc bàn giao.

