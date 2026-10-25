# CampusMind

Frontend prototype hỗ trợ điều phối sức khỏe tinh thần sinh viên, môn CSE122, nhóm 1.

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


## SV1 — nâng cấp ngày 25/10/2026

TASK-12 và TASK-16 giữ nguyên phạm vi Trello. Logo dùng lại nguyên tệp người dùng cung cấp đã có trong bản SV3; không tạo chứng nhận, số liệu thành tích hoặc chuyên viên thật. Tham khảo cách phân nhóm dịch vụ, hồ sơ và bước tiếp theo của https://mindcare.vn/dich-vu-tham-van-tri-lieu-tam-ly/; không sao chép nội dung, hình ảnh hay thương hiệu.

- Trang chủ, Visitor và Admin Services dùng logo, skeleton, trạng thái empty/error/retry/success; hỗ trợ bàn phím, reduced motion, responsive và dark/light.
- Theme dùng `campusmind.theme.v1` và BroadcastChannel `campusmind.ui.v1`, tương thích shared design của SV3. CSS bổ sung chỉ nạp trên SV1; không đổi nghiệp vụ SV2/SV3.
- CRUD danh mục và Visitor dùng chung `service-store.js`, khóa `campusmind.admin.services.v1`, storage event và BroadcastChannel `campusmind.services.v1`. Giữ bộ lọc khi nhận cập nhật.

### Cấu hình MockAPI (tùy chọn)

Trong `assets/js/service-config.js`, `endpoint` hiện trỏ đến bản ghi catalog do chủ dự án cung cấp: `https://6add2cd4fa5e73d4ab2de718.mockapi.io/api/v1/catalogs/1`. Đây là URL dữ liệu công khai, không phải khóa xác thực; repo không chứa key. Để đổi môi trường, dùng URL HTTPS của **một bản ghi catalog có sẵn** thuộc MockAPI của nhóm; để chạy local-only, đặt chuỗi rỗng. Bản ghi có trường `items` kiểu Array; khởi tạo bằng toàn bộ mảng trong `assets/data/admin-services.json`. Adapter GET bản ghi và PUT `{ "items": [...] }`; ID dịch vụ nằm trong mảng nên không phụ thuộc ID do MockAPI sinh. Cần cho phép CORS GET/PUT và Content-Type JSON. Không trỏ vào URL collection trả về mảng bản ghi. URL không được chứa tài khoản, mật khẩu, query hoặc fragment. Đây là cấu hình triển khai, không phải dữ liệu người dùng nhập.

Không cấu hình: đọc seed/localStorage và lưu nội bộ. Có cấu hình: đọc nguồn trực tuyến, cache dữ liệu hợp lệ, làm mới khi trang đang mở mỗi 30 giây. Lỗi mạng/timeout/HTTP/schema: dùng cache hợp lệ hoặc seed và báo đang dùng danh mục trên thiết bị. Dữ liệu local hỏng vẫn báo lỗi và không bị tự ghi đè.

Nếu lưu trực tuyến không xác nhận được, giữ thay đổi local và đánh dấu `campusmind.admin.services.v1.offline`. Không tự phát lại PUT vì có thể ghi đè thay đổi từ thiết bị khác. Trong trạng thái này các lần tải/lưu tiếp theo dùng local. Để nối lại: sao lưu danh mục local, đối chiếu và cập nhật bản ghi MockAPI thủ công; sau khi hai bản khớp, xóa riêng khóa `.offline` trong công cụ trình duyệt rồi tải lại. Không xóa toàn bộ localStorage. UI không báo thành công trực tuyến khi chỉ lưu offline.

### Giới hạn phải giữ rõ

Đây vẫn là frontend học phần dùng dữ liệu **mock**, kể cả khi giao diện không mang nhãn “demo”. Danh tính, chuyên môn và lịch seed không phải xác nhận của người/chuyên viên thật. Không có chứng nhận hay cam kết bảo mật. Không nhập hồ sơ sức khỏe, ghi chú tham vấn hoặc thông tin cá nhân thật. MockAPI chỉ chứa danh mục công khai; không có xác thực/phân quyền máy chủ trong nhánh SV1. Không dùng endpoint công khai này làm backend production.

Web Locks + snapshot bảo vệ ghi giữa các tab cùng origin; fallback không có khóa nguyên tử. Kiểm tra dữ liệu remote trước PUT giúp phát hiện thay đổi đã xảy ra, nhưng MockAPI không có compare-and-swap nên không bảo đảm xử lý hai thiết bị ghi đồng thời. Nếu PUT thành công rồi localStorage lỗi, thao tác có thể đã tới server; tải lại và đối chiếu trước khi thử lại.

Lịch công khai chỉ chiếu counselorId/date/start/end từ `SV2Store.available`; không hiển thị thông tin lịch hẹn riêng tư. Nhánh SV1 độc lập không chứa `sv2-store.js` hoặc trang booking, nên hiển thị lỗi lịch có thử lại; chỉ bật đặt lịch khi nguồn chung thực sự trả về giờ trống. Cần tích hợp nhánh SV2/SV3 được nhóm duyệt để có luồng đặt lịch hoàn chỉnh. Không merge vào dev/final trong lần nâng cấp này.

Chạy kiểm thử: `node tests/visitor-smoke.cjs`, `node tests/admin-services-smoke.cjs`, `node tests/sv1-integration.cjs`, `node tests/layout-smoke.cjs`, `node tests/sv1-upgrade.cjs`, `node tools/build-layout.cjs --check`. Cần Playwright và Chromium. Các bộ kiểm thử hồi quy cấp cấu hình endpoint rỗng và dùng network interception khi cần, không ghi vào API thật. Bộ `tests/sv1-mockapi-live.cjs` chạy riêng khi đặt `SV1_LIVE_API=1`: GET và PUT lại danh mục không đổi qua trình duyệt, kiểm tra Visitor ở context độc lập và fallback/reconnect. Không chạy live test tự động khi chưa chủ động bật. Kiểm thử lịch tích hợp: đặt `SV1_TEST_ROOT` tới bản tích hợp SV1 + SV2 rồi chạy `node tests/public-schedule-integration.cjs`.

### Kết nối thực tế sau khi chủ dự án tạo resource

Ngày 25/10/2026: đã tạo một bản ghi `catalogs/1` từ đúng bốn dịch vụ seed và xác nhận trường `items` là mảng. Kiểm thử live Chromium đã PASS GET/PUT qua CORS, giữ nguyên dữ liệu sau PUT, Visitor ở context độc lập chỉ hiện dịch vụ active, fallback cache khi chặn mạng và quay lại remote khi nối lại. Không đọc/ghi resource `schedules` của SV3.

Nếu trình duyệt từng có khóa `campusmind.admin.services.v1.offline`, trang tiếp tục giữ dữ liệu local để tránh mất thay đổi; thực hiện đối chiếu theo hướng dẫn pending ở trên trước khi xóa khóa đó.


## Tích hợp SV3 vào bản SV1 — PR #11

Giữ Visitor, catalog adapter và giao diện SV1 hiện có trên dev; bổ sung Counselor, hàng đợi/lịch hẹn, ghi chú với tóm tắt mô phỏng, profile, Admin Dashboard, review dịch vụ và theme/layout SV3. Chạy `node tools/serve.cjs`, mở http://127.0.0.1:8877/login.html và chọn tài khoản giả lập theo vai trò. Đây chưa phải backend xác thực thật.

Hướng dẫn SV3: [phạm vi](docs/sv3-completion.md), [nâng cấp](docs/sv3-upgrade-2026-10-25.md), [MockAPI](docs/mockapi-setup.md). Config public SV3 vẫn giữ theo nguồn: đồng bộ bật khi không có config local; muốn chạy hoàn toàn local tạo assets/data/config.json với enableDemoRemoteSync false. Catalog SV1 vẫn theo service-config.js, không bị thay bằng cấu hình offline của ZIP tích hợp.

Bản này chỉ ghép SV1 + SV3. Chưa nhập module Student/Auth của SV2: đặt lịch, đăng ký và lịch công khai dựa trên SV2Store vẫn cần PR SV2 và một lượt tích hợp riêng. ZIP full-integrated-v3 chỉ dùng đối chiếu, không sao chép các phụ thuộc SV2 vào PR này.
