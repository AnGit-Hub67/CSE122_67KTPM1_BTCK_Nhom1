# CampusMind

## 1. Giới thiệu
Frontend prototype điều phối hỗ trợ sức khỏe tinh thần sinh viên, môn CSE122, nhóm 1. Bản phát hành tích hợp phần việc SV1, SV2 và SV3; dữ liệu mặc định là dữ liệu giả trên thiết bị.

## 2. Liên kết dự án
- [Repository](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1)
- [Trello](https://trello.com/b/tijjtgu7/cse122-campusmind-team-1)
- [Thiết kế Canva do nhóm cung cấp](https://www.canva.com/design/DAHZFwJb2RM/ccayXXID6SeELUIiNR-KoQ/edit) — nhóm cần xác nhận quyền xem; xem [tài liệu thiết kế](docs/projectproposal.md).
- [Website GitHub Pages](https://angit-hub67.github.io/CSE122_67KTPM1_BTCK_Nhom1/) — triển khai từ `main` / root, HTTPS.
- **[Mở báo cáo lịch sử sử dụng AI — SV1, SV2, SV3](docs/ai-usage-report.md)** — prompt theo nhiệm vụ, phần AI hỗ trợ, lỗi/cách sửa và phần cần từng sinh viên xác nhận.

### Video OBS theo sinh viên

Thông tin sinh viên sở hữu playlist do người dùng xác nhận ngày 26/10/2026. Chưa xác minh nội dung/quyền xem hoặc URL video riêng; playlist không thay thế minh chứng mỗi màn hình một video.

| Sinh viên | Họ tên | Playlist YouTube/OBS |
|---|---|---|
| SV1 | Doãn Tuấn Nghĩa | [Mở playlist SV1](https://www.youtube.com/playlist?list=PLW791Q36zdro) |
| SV2 | Lê Hải Anh | [Mở playlist SV2](https://youtube.com/playlist?list=PLT0-SlKPwchE&si=e5V-T6V0sKWc5x9S) |
| SV3 | Vũ Khánh An | [Mở playlist SV3](https://youtube.com/playlist?list=PLJL2Iv-yK-68&si=Qv022_IZfgSUQ6N5) |

Khi xác minh được từng video, bổ sung bảng **Mã màn hình | Tên màn hình | Link video YouTube** theo screen inventory. Hiện chưa có ánh xạ màn hình–video đủ bằng chứng nên chưa điền URL video riêng; từng sinh viên cần cung cấp link và kiểm tra quyền xem trước bàn giao.

## 3. Thành viên và phạm vi
| Sinh viên / Họ tên | GitHub | Phạm vi chính |
|---|---|---|
| SV1 — Doãn Tuấn Nghĩa | doctorfalcon | Visitor, quản lý dịch vụ, design system, navigation và accessibility |
| SV2 — Lê Hải Anh | lehaianh30102007-hub | Student, đặt lịch, tài khoản, quản lý người dùng, dữ liệu/API và AI UX |
| SV3 — Vũ Khánh An | AnGit-Hub67 | Counselor, ghi chú, Admin Dashboard, responsive QA, tích hợp và deploy |

Mỗi người cần hiểu và trình bày phần việc thực tế. Việc tạo/merge PR không thay thế bằng chứng code, review, OBS và vấn đáp.

## 4. Chức năng đã tích hợp
Visitor xem dịch vụ/chuyên viên/tài nguyên và lưu gợi ý. Student đặt lịch và theo dõi lịch hẹn. Counselor xác nhận lịch, ghi chú, chỉnh sửa tóm tắt mô phỏng và hoàn thành buổi gặp. Admin quản lý dịch vụ/người dùng và xem hoạt động. Hồ sơ công khai và lịch dùng dữ liệu chung trong cùng trình duyệt.

## 5. Công nghệ
HTML, CSS, JavaScript thuần, JSON, LocalStorage và session phía trình duyệt. Không cần bước build để chạy giao diện. Node.js dùng cho máy chủ phát triển, sinh layout và kiểm thử; Playwright dùng cho kiểm thử trình duyệt.

## 6. Cấu trúc hiện tại
- `pages/`: trang theo vai trò.
- `assets/css/`: CSS chung và theo module; có `responsive.css`.
- `assets/js/`: session, API, store, nghiệp vụ; có `main.js`, `sv2-api.js`.
- `assets/data/`: JSON seed và cấu hình công khai.
- `docs/`, `tests/`, `tools/`: tài liệu, kiểm thử, công cụ.

Cấu trúc đang chạy dùng `assets/css` và `assets/js`; chưa tương ứng hoàn toàn tên đường dẫn `css/style.css`, `js/api.js`, `js/modules/` trong rubric. Không đổi tên/di chuyển tùy tiện vì các trang đang tham chiếu cấu trúc này.

## 7. Chạy trên máy
Clone repository, chuyển nhánh `main` để chạy bản phát hành, hoặc `dev` để kiểm tra bản tích hợp. Trong thư mục repo:

```sh
node tools/serve.cjs
```

Mở `http://127.0.0.1:8877/`. Có thể dùng VS Code Live Server từ thư mục gốc. Luôn dùng HTTP, không mở HTML bằng `file://` vì trang dùng fetch JSON. Seed cục bộ không cần API bên ngoài; đây không phải ứng dụng PWA được bảo đảm hoạt động khi mất mạng hoàn toàn.

## 8. Tài khoản thử nghiệm
Mở `sv2-login.html`, mở mục tài khoản cục bộ rồi chọn theo vai trò. Các ID kiểm thử gồm `sv-demo-01`, `minh-anh`, `admin-demo-01`. Đây là session demo; không có bảo vệ/phân quyền máy chủ. Không nhập dữ liệu cá nhân hoặc ghi chú tham vấn thật.

## 9. Cấu hình API
- `assets/js/sv2-config.js`: REST, auth và AI proxy mặc định rỗng. Các thao tác yêu cầu backend thật chưa được cấu hình.
- `assets/js/service-config.js`: `endpoint: ''`, danh mục chạy seed/LocalStorage.
- `assets/data/config.public.json`: `enableDemoRemoteSync: false`. URL MockAPI công khai được giữ trong cấu hình nhưng đồng bộ mặc định tắt.
- `assets/data/config.json` nếu tự tạo chỉ được đọc trên localhost/127.0.0.1/[::1], không commit. Bản deploy đọc thẳng config.public.json để tránh 404 cho override không tồn tại.

Chỉ cấu hình API do nhóm quản lý, có CORS phù hợp. Không đưa API key, token hay mật khẩu vào JS/JSON frontend. Auth và AI thật cần backend/proxy; cấu hình URL không tự tạo backend. Xem [hướng dẫn MockAPI](docs/mockapi-setup.md) như tài liệu tùy chọn, không phải xác nhận đồng bộ đang bật.

## 10. Dữ liệu và giới hạn
Dữ liệu liên thông qua LocalStorage trên cùng origin/trình duyệt, không mặc nhiên đồng bộ giữa thiết bị. AI hiện dùng dữ liệu/mẫu mô phỏng, không phải tư vấn y khoa. Không xóa toàn bộ LocalStorage để xử lý lỗi nếu cần giữ dữ liệu. Trước khi bật remote, sao lưu và đối chiếu dữ liệu; API công khai không phù hợp hồ sơ riêng tư.

## 11. Kiểm thử
Cài Playwright trong môi trường phát triển nếu chưa có:

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tools/build-layout.cjs --check
node tests/integration.cjs
```

Có thể đặt `CHROMIUM_PATH` tới Chrome/Edge đã cài. Integration chặn mạng ngoài localhost và dùng dữ liệu thử riêng. Kết quả kiểm tra ngày 26/10/2026: layout PASS; integration PASS gồm luồng liên thông và 25 trang tại 375/768/1440px, light/dark, không phát hiện pageerror/tràn ngang. Đây là kiểm thử cục bộ, không phải CI hoặc xác nhận deploy/API thật.

## 12. Vấn đề còn biết
`tests/sv3-completion.cjs` là test legacy còn chờ selector `#counselor-account` đã bị bỏ. Chưa coi test này hoặc toàn bộ suite cũ là pass; test integration hiện kiểm tra luồng Counselor qua session chung. Bản Pages đã được kiểm tra tự động tại 320/375/768/1280/1440px, hai theme. Còn cần kiểm tra zoom 200%, bàn phím và điện thoại thật theo rubric; viewport giả lập không thay cho điện thoại thật.

## 13. Git và review
Mỗi task tạo nhánh từ `dev`, commit có nghĩa theo Conventional Commits, push và mở PR vào `dev`. Thành viên khác review nội dung thực tế. Bản ổn định đi qua PR `dev` → `main`; không push code trực tiếp vào `main`. Giữ nguyên tác giả các commit. Không tạo commit/review giả để tăng đóng góp. Xem [CONTRIBUTING](CONTRIBUTING.md).

## 14. Deploy
SV3 (AnGit-Hub67) đã bật GitHub Pages, nguồn `main`, thư mục `/ (root)`, HTTPS. Xem [báo cáo QA/deploy](docs/sv3-pages-qa.md). Sau khi build thành công, kiểm tra trang chủ và các trang con dưới đường dẫn repository, ảnh/CSS/JS/JSON, tài khoản demo, cửa sổ ẩn danh và điện thoại. Chỉ ghi link deploy đã được kiểm tra; sửa lỗi qua nhánh task → PR dev → PR main.

## 15. Minh chứng và sử dụng AI
Xem [báo cáo AI theo nhiệm vụ SV1, SV2, SV3](docs/ai-usage-report.md): prompt có nguồn, phần AI hỗ trợ, lỗi/cách khắc phục và các trường xác nhận phần tự làm, tự kiểm chứng. Prompt phiên chung được phân loại theo nhiệm vụ, không mặc nhiên xác nhận ai nhập prompt. Từng sinh viên bổ sung thông tin cá nhân và video OBS thật. `docs/screen-inventory.md` và minh chứng thiết kế trước khi viết code chưa được xác minh trong bản này; bổ sung tài liệu hiện tại không chứng minh được thứ tự lịch sử. Không đánh dấu hoàn tất rubric khi chưa có bằng chứng.
