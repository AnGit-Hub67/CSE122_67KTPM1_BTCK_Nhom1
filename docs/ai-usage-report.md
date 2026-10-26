# Báo cáo sử dụng AI theo nhiệm vụ SV1, SV2, SV3

Cập nhật: 26/10/2026. Công cụ có bằng chứng: **Codex**; chưa xác nhận model/phiên bản hoặc công cụ khác của từng thành viên.

## Cách ghi nhận

Prompt trong phiên chung và các phiên tiếp nối được phân loại theo **nhiệm vụ được hỗ trợ**, không mặc nhiên xác nhận sinh viên phụ trách là người nhập prompt. Tài khoản commit/review không chứng minh ai tự viết hoặc tự kiểm tra code. Các trích đoạn dưới đây lấy từ hội thoại đã đối chiếu; kết quả lịch sử chỉ áp dụng cho mốc trong nguồn, không phải kiểm thử chạy lại khi lập báo cáo.

## SV1 — doctorfalcon

**Phạm vi:** TASK-12 Visitor Service Directory, Resource Library, Counselor Detail; TASK-16 Admin Service Management; giao diện công khai, navigation/accessibility. **Công cụ:** Codex.

### Prompt hỗ trợ nhiệm vụ SV1

- Trích yêu cầu đầu phiên S1: “TASK-12 Visitor Service Directory, Resource Library, Counselor Detail; TASK-16 Admin Service Management; các giao diện công khai thuộc SV1.”
- Trích cùng yêu cầu: “đồng bộ service CRUD và Visitor qua shared data + storage/BroadcastChannel; hỗ trợ MockAPI qua endpoint cấu hình được và fallback offline, không bịa endpoint hoặc đưa key thật vào repo”.
- Prompt tiếp nối S1: “chỉ tao tạo MockAPI đi”. Sau đó người dùng cung cấp endpoint và yêu cầu tiếp tục.

**AI hỗ trợ:** giao diện/trạng thái, theme, đồng bộ danh mục, lịch công khai; adapter và cấu hình MockAPI, hướng dẫn tạo resource, kiểm thử. [Báo cáo SV1](sv1-upgrade-2026-10-25.md) liệt kê file và kết quả. Cuối S1 ghi commit `41400dc` trên [PR #7](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/pull/7) cho kết nối catalog/kiểm thử. Đây là lịch sử; cấu hình remote hiện tại xem README mục 9.

**Thiếu sót khi AI làm và cách khắc phục:** báo cáo SV1 ghi các lượt kiểm thử tích hợp đầu không qua do bản sao kiểm thử thiếu bộ quản lý phiên chung. Codex bổ sung đúng thành phần vào bản sao và chạy lại; không sửa nghiệp vụ SV2/SV3 chỉ để test qua. Đây là thiếu sót chuẩn bị môi trường kiểm thử, chưa có bằng chứng SV1 tự phát hiện/sửa.

**Kiểm chứng có ghi nhận:** CRUD, lịch liên thông, theme, responsive, layout trong báo cáo; cuối S1 ghi đọc/ghi catalog thật, fallback và hồi quy đạt tại mốc đó. Không thay cho việc SV1 tự kiểm tra hoặc xác nhận API hiện tại.

**SV1 cần xác nhận:**

- Người trực tiếp dùng công cụ/nhập prompt: **[CẦN SV1 XÁC NHẬN]**.
- File/hàm tự viết: **[CẦN SV1 BỔ SUNG]**.
- Lỗi tự phát hiện, cách tự sửa và diff: **[CẦN SV1 BỔ SUNG]**.
- Cách tự kiểm chứng, ngày/kết quả và video: **[CẦN SV1 BỔ SUNG]**.

## SV2 — lehaianh30102007-hub

**Phạm vi:** TASK-13 Student Dashboard/Booking/Appointments; TASK-17 Admin User Management; TASK-18 store/session/auth/register, dữ liệu/API và AI UX. **Công cụ:** Codex.

### Prompt hỗ trợ nhiệm vụ SV2

- Trích yêu cầu đầu phiên S2: “CHỈ sửa SV2: TASK-13 Student Dashboard/Booking/Appointments; TASK-17 Admin User Management; TASK-18 SV2 store/session/auth/register; chỉ thay đổi shared code nếu không thể tránh và ghi rõ.”
- Trích cùng yêu cầu: “Chuẩn bị MockAPI client adapter cấu hình được với endpoint/schema tài liệu để user tự tạo API sau; không bịa endpoint hoặc API key.”
- Phản hồi sau bàn giao: “html chưa được kết nối với css js và json à”.
- Phản hồi nhãn sai vai trò: “đây đang ở trang đăng nhập của chuyên viên sao lại có tạo tài khoản sinh viên mà không phải tạo tài khoản chuyên viên”.

**AI hỗ trợ:** sửa phần Student/tài khoản/người dùng và adapter theo yêu cầu, đóng gói ZIP/PATCH để người dùng tự commit. Prompt nêu phạm vi yêu cầu, không tự chứng minh mọi yêu cầu đã hoàn thành. S2 có bằng chứng bàn giao ZIP đầy đủ và bản v2 sửa nhãn/liên kết đăng ký theo vai trò; không suy ra người dùng đã commit từ việc nhận ZIP.

**Lỗi AI và cách khắc phục:** Codex thừa nhận ZIP đầu chỉ chứa file thay đổi nên chạy riêng thiếu CSS/JS/logo; sau phản hồi đã tạo ZIP đầy đủ và ghi đã kiểm thử sau giải nén. Người dùng tiếp tục phát hiện trang đăng nhập Chuyên viên hiện nhãn tạo tài khoản Sinh viên; Codex sửa nhãn và liên kết tới đăng ký Chuyên viên, bàn giao v2. Nguồn xác nhận người dùng phát hiện, Codex sửa; chưa xác nhận người phản hồi chính là SV2 hoặc SV2 tự sửa code.

**Kiểm chứng có ghi nhận:** S2 ghi đã kiểm thử bản đầy đủ sau giải nén. Chưa đủ để khẳng định mọi test, API thật hoặc mọi mục trong báo cáo đối chiếu đều đạt; cần bổ sung log cho các mục chưa có kết quả cụ thể.

**SV2 cần xác nhận:**

- Người trực tiếp dùng công cụ/nhập prompt: **[CẦN SV2 XÁC NHẬN]**.
- File/hàm tự viết: **[CẦN SV2 BỔ SUNG]**.
- Phần tự sửa sau khi nhận ZIP và commit/diff: **[CẦN SV2 BỔ SUNG]**.
- Cách tự kiểm chứng, ngày/kết quả và video: **[CẦN SV2 BỔ SUNG]**.

## SV3 — AnGit-Hub67

**Phạm vi:** TASK-11 layout; TASK-14 Counselor; TASK-15 Admin Dashboard; AI mock, responsive, tích hợp/QA/deploy thuộc phần SV3. **Công cụ:** Codex.

### Prompt hỗ trợ nhiệm vụ SV3

- S3: “sửa của phần sinh viên 3 cho đúng yêu cầu đã phần của các sinh viên khác sửa sau”.
- S3: “sao lịch tuần 7 cột và giao diện đánh giá sao/bình luận chưa triển khai.”
- Trích prompt S3 kèm endpoint do người dùng cung cấp: “lịch tuần 7 cột và giao diện đánh giá sao/bình luận làm luôn cả cái này đi”.
- S4: “dùng tài khoản Angithub làm phần việc ở main đi”.

**AI hỗ trợ:** layout/sidebar, theme, skeleton, hồ sơ, luồng Counselor, dashboard, lịch tuần và phần xem đánh giá; adapter MockAPI lịch và kiểm thử. Xem [báo cáo SV3](sv3-upgrade-2026-10-25.md) và [PR #8](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/pull/8). S4 ghi bật Pages, sửa lỗi cấu hình qua PR #14 vào dev rồi PR #15 vào main, cập nhật README và [báo cáo QA/deploy](sv3-pages-qa.md). Đây là thao tác lịch sử có Codex hỗ trợ.

**Lỗi AI và cách khắc phục:** S3 ghi Codex thừa nhận thu hẹp phạm vi quá mức, bàn giao sớm và bỏ sót lịch tuần 7 cột cùng giao diện đánh giá đã có trong yêu cầu. Sau phản hồi, Codex bổ sung hai phần, cập nhật PR #8 và ghi kết quả kiểm thử. Người dùng phát hiện thiếu sót; chưa có bằng chứng SV3 tự viết phần sửa. Lỗi 404 cấu hình khi deploy và cách sửa được ghi trong báo cáo QA/deploy.

**Kiểm chứng có ghi nhận:** S3 ghi kiểm thử chức năng, rỗng/lỗi/retry, XSS, đa tab và responsive; S4/QA ghi kiểm tra Pages 25 trang, 5 độ rộng, sáng/tối. Kết quả tự động không thay cho điện thoại thật, zoom 200%, kiểm tra bàn phím và xác nhận hiểu code của SV3.

**SV3 cần xác nhận:**

- Người trực tiếp dùng công cụ/nhập prompt: **[CẦN SV3 XÁC NHẬN]**.
- File/hàm tự viết: **[CẦN SV3 BỔ SUNG]**.
- Phần tự sửa và bằng chứng/diff: **[CẦN SV3 BỔ SUNG]**.
- Cách tự kiểm chứng, ngày/kết quả và video: **[CẦN SV3 BỔ SUNG]**.

## Công việc chung — tích hợp, review và tài liệu

- [Bản ghi AI trước lần sửa này](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/blob/cbb873f8a10122f1bf12a8fb78ed57b8f1732961/docs/ai-usage-report.md) tóm tắt yêu cầu đối chiếu ZIP SV1/SV2/SV3, xử lý xung đột PR #10/#11, kiểm thử và tạo PR #12. Đây là tóm tắt yêu cầu chung, không phải prompt nguyên văn của một cá nhân.
- S4 có prompt: “dùng tài khoản lehaianh mở PR → **Files changed → Review changes**, kiểm tra và ghi nhận xét thực tế.  và làm nốt nhiệm vụ ở main đi”. Đây là hỗ trợ review/phát hành chung bằng tài khoản SV2; không gán toàn bộ code tích hợp hoặc nhiệm vụ deploy cho SV2. Lịch sử S4 ghi SV2 merge PR #12, sau đó triển khai bằng SV3.
- Bản ghi cũ nêu layout/integration tại dev `dd2e1e8` đạt: 25 trang, 375/768/1440px, hai theme, chặn mạng ngoài localhost. Test legacy `sv3-completion` còn selector cũ. Đây là kết quả lịch sử, không phải xác nhận toàn bộ suite/API thật đều đạt.
- S5 yêu cầu cập nhật Canva/OBS và báo cáo AI. Trong phiên tài liệu hiện tại, prompt bổ sung là: “kiểu từ cái phiên làm việc chung ấy ghi rõ prompt phần nào đang prompt cho phần nhiệm vụ của sinh viên nào”. Codex đọc nguồn, phân loại prompt và sửa tài liệu, không sửa code ứng dụng.
- Lần cập nhật tài liệu này bỏ qua bước thành viên khác review theo yêu cầu người dùng. Không tạo review giả hoặc coi tự kiểm tra tài liệu là review của thành viên khác. Review cũ có hỗ trợ Codex, kể cả review sau merge, không chứng minh từng sinh viên đã tự đọc/hiểu code và không thay đổi trình tự lịch sử.

## Nguồn đối chiếu

| Mã | Tên phiên | ID hội thoại |
|---|---|---|
| S1 | Hoàn thiện giao diện SV1 CampusMind | `01a17096-73e2-7233-81d6-9aabd1d68882` |
| S2 | Sửa chức năng SV2 CampusMind | `01a1725b-54c9-7d30-b476-353db26a1909` |
| S3 | Nâng cấp CampusMind ưu tiên SV3 | `01a16eec-ae64-75c2-b7a2-3e72f89dc1bd` |
| S4 | Audit 4 ZIP CampusMind | `01a173b4-ded6-70e2-ab55-7e23a62de0bc` |
| S5 | Hướng dẫn dự án CampusMind | `6aa7785d-a5cc-83ec-8771-2c09e3b5b0eb` |

ID phục vụ tra cứu trong lịch sử của người có quyền truy cập, không phải link chia sẻ công khai. Nhóm cần bổ sung bản xuất/ảnh prompt được phép chia sẻ khi nộp minh chứng.

## Xác nhận trước khi nộp

Mỗi sinh viên điền thông tin thực về công cụ, prompt bổ sung có nguồn, phần tự làm, lỗi tự sửa, kiểm thử tự thực hiện và URL OBS có thể xem. Chưa xác minh được video riêng hoặc nội dung [playlist nhóm cung cấp](https://www.youtube.com/playlist?list=PLW791Q36zdro). Báo cáo này chưa xác nhận hoàn tất ĐK5/tiêu chí 7.3 hay toàn bộ rubric.
