# Lịch sử sử dụng AI trong quá trình xây dựng CampusMind

**Nhóm 1 · CSE122 · Cập nhật ngày 26/10/2026**

Báo cáo ghi lại quá trình dùng **Codex** để xây dựng, sửa lỗi, kiểm thử và bàn giao CampusMind. Nội dung được sắp theo diễn biến công việc của từng phần SV1, SV2, SV3, thay vì chỉ liệt kê yêu cầu cuối cùng.

Các prompt dưới đây là trích đoạn đã đối chiếu hoặc phần tóm tắt được ghi rõ. Chúng thuộc phiên làm việc chung và các phiên tiếp nối: phân loại theo nhiệm vụ được hỗ trợ, không mặc nhiên xác nhận ai trực tiếp nhập prompt. Kết quả kiểm thử là ghi nhận tại từng mốc lịch sử, không phải kết quả chạy lại khi viết báo cáo này.

## Đọc nhanh

| Phần | Sinh viên | Quá trình chính |
|---|---|---|
| [SV1](#sv1) | Doãn Tuấn Nghĩa — doctorfalcon | Hoàn thiện Visitor/Admin Service → nối Login/Booking → sửa lịch và nội dung → nâng cấp giao diện, MockAPI |
| [SV2](#sv2) | Lê Hải Anh — lehaianh30102007-hub | Xây Student/Admin Users → bổ sung Register/AI → sửa phiên/quyền frontend → sửa theo audit và bàn giao ZIP |
| [SV3](#sv3) | Vũ Khánh An — AnGit-Hub67 | Hoàn thiện Counselor/Profile/Dashboard → sửa liên thông → nâng cấp lịch/đánh giá → QA và deploy |
| [Tích hợp cả nhóm](#tich-hop) | Phần việc chung | Đối chiếu các bản → xử lý xung đột → kiểm thử → dev/main → tài liệu và OBS |

<a id="sv1"></a>
## 1. SV1 — Doãn Tuấn Nghĩa

**Phạm vi:** TASK-12 Service Directory, Resource Library, Counselor Detail; TASK-16 Admin Service Management và các giao diện công khai liên quan. Công cụ hỗ trợ: Codex.

### Giai đoạn 1 — Hoàn thiện các phần còn thiếu và nối luồng sử dụng

**Yêu cầu:** kiểm tra code/nhánh/PR đang có, đối chiếu yêu cầu rồi bổ sung đúng phần SV1, không viết lại phần SV2/SV3. Trích prompt: “Hoàn thiện các nhiệm vụ còn thiếu của Sinh viên 1 trong CampusMind” và “mock data/localStorage đồng bộ các trang, validation, loading/empty/error, accessibility”. [S1]

**Cách AI hỗ trợ:** kiểm tra các chức năng Visitor và quản lý dịch vụ đã tồn tại; bổ sung Login dùng dữ liệu tài khoản chung, gợi ý dịch vụ/tài nguyên mô phỏng, nối Counselor Detail sang Booking với đúng chuyên viên. Phần lưu tài nguyên được chỉnh để xử lý dữ liệu hỏng và tránh ghi đè thay đổi giữa các tab.

**Kết quả:** báo cáo ngày 23/10 ghi 14 file thay đổi, gồm `login.html`, `assets/js/login.js`, `assets/js/visitor-ai.js`, `assets/js/visitor.js` và các bài kiểm thử. Bản ghi hội thoại xác nhận commit `0581926`, kiểm thử Visitor, Admin Service, Login, layout và hồi quy SV2 trên bản ghép local. Lúc đó chưa merge vào dev/main. [Báo cáo chi tiết](sv1-completion.md)

### Giai đoạn 2 — Sửa tính nhất quán của lịch, dữ liệu và nội dung

**Vấn đề:** lịch công khai và phần đặt lịch cần dùng cùng nguồn; thời lượng dịch vụ chưa thống nhất; giao diện còn nội dung người dùng không muốn giữ.

**Prompt:** “đồng bộ lịch khả dụng với dữ liệu chung Student/Counselor, thống nhất 50/60 phút” và phản hồi “không để chữ demo nữa”. [S2]

**Cách AI hỗ trợ:** nối lịch khả dụng vào nguồn Student/Counselor, thống nhất thời lượng 50 phút theo bản sửa, giữ liên thông Admin–Visitor, điều chỉnh nội dung công khai và thông tin quyền xem dữ liệu. Việc bỏ nhãn “demo” trên UI không làm frontend có backend hoặc xác thực thật; giới hạn được giữ trong tài liệu.

**Kết quả:** hội thoại ghi commit `d423b26`, 21 file thay đổi và kiểm thử logic/tích hợp tại 375/768/1440px. Nhánh SV1 riêng vẫn cần phần Student/Counselor để có nguồn lịch chung. [Báo cáo ngày 24/10](sv1-audit-2026-10-24.md)

### Giai đoạn 3 — Nâng cấp giao diện, trạng thái và đồng bộ

**Prompt:** yêu cầu giao diện chỉn chu, logo CampusMind, Loading skeleton/Empty/Error Retry/Success, responsive/accessibility, Dark/Light Mode; trích yêu cầu dữ liệu: “đồng bộ service CRUD và Visitor qua shared data + storage/BroadcastChannel”. [S3]

**Cách AI hỗ trợ:** bổ sung CSS trải nghiệm và theme, cải thiện giao diện công khai, đồng bộ danh mục giữa Admin và Visitor, chuẩn bị adapter có endpoint cấu hình được và fallback offline. Các file tiêu biểu được ghi trong báo cáo gồm `assets/css/sv1-experience.css`, `assets/js/sv1-theme.js` và nhóm xử lý dữ liệu dịch vụ.

**Thiếu sót và lần sửa:** các lượt test tích hợp đầu chưa qua vì bản sao kiểm thử thiếu bộ quản lý phiên chung. Codex bổ sung đúng thành phần vào bản sao rồi chạy lại, không sửa nghiệp vụ SV2/SV3 chỉ để test qua.

**Kết quả:** báo cáo ghi kiểm thử CRUD, cập nhật giữa tab, xung đột dữ liệu cũ, fallback, theme và responsive; hội thoại ghi commit `640bb7d` cập nhật PR #7. [Báo cáo nâng cấp](sv1-upgrade-2026-10-25.md)

### Giai đoạn 4 — Hướng dẫn tạo và nối MockAPI

**Prompt:** “Mock API tí chỉ tao tạo để mày thêm vào sau đuwngf có làm sai yêu cầu”, tiếp đó “chỉ tao tạo MockAPI đi”. Người dùng xác nhận đã có project CampusMind từ phần SV3 và cung cấp resource catalog. [S3]

**Cách AI hỗ trợ:** ban đầu giữ endpoint trống; hướng dẫn tạo `catalogs` trong project hiện có, kiểm tra cấu trúc `items`, khởi tạo catalog từ dịch vụ có sẵn và nối cấu hình. Không tạo lại hoặc ghi vào resource `schedules` của SV3.

**Kiểm thử và bàn giao:** hội thoại ghi đọc/ghi catalog qua trình duyệt, Visitor ở phiên riêng đọc dữ liệu, fallback cache khi mất mạng và kết nối lại; commit `41400dc` trên [PR #7](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/pull/7). Đây là mốc kết nối lịch sử; cấu hình hiện tại xem README mục 9.

<a id="sv2"></a>
## 2. SV2 — Lê Hải Anh

**Phạm vi:** TASK-13 Student Dashboard/Booking/Appointments; TASK-17 Admin User Management; TASK-18 dữ liệu, session, đăng ký/đăng nhập và phần AI UX liên quan. Công cụ hỗ trợ: Codex.

### Giai đoạn 1 — Xây các trang Student và quản lý người dùng

**Prompt:** “Thực hiện đầy đủ phần Sinh viên 2 (SV2) của đồ án Frontend CampusMind cuối môn”, gồm ba trang Student và `admin-user-management.html`; yêu cầu dùng layout/schema hiện có, JSON/localStorage, trạng thái giao diện, validation và responsive. [S4]

**Cách AI hỗ trợ:** xây Dashboard; Booking chọn chuyên viên/ngày/giờ, kiểm tra slot và lưu lịch; Appointments tìm/lọc, đổi/hủy có xác nhận; Admin Users tìm/lọc, sửa và bật/tắt tài khoản.

**Bàn giao:** yêu cầu đầu tiên là ZIP, không push. Sau prompt “ý là đẩy lên github cho tao ấy”, Codex ghi nhận đưa 12 file lên nhánh SV2, commit `7a69c29`. Ghi nhận lúc đó là 17 nhóm test đạt, nhưng phần sửa cuối chưa chạy lại toàn bộ trình duyệt; không diễn giải thành mọi test đều đạt. [S4]

### Giai đoạn 2 — Đối chiếu yêu cầu và bổ sung chức năng thiếu

**Prompt:** “KIỂM TRA XEM TẤT CẢ CODE TRONG GITHUBĐÃ ĐÚNG THEO YÊU CẦU TRÊN TRELLO CHƯA” được tóm tắt theo nội dung yêu cầu; prompt tiếp theo có nguyên văn “làm nốt cái register của sinh viên 2 đi”. [S4]

**Phát hiện:** bản đầu còn thiếu Register, lý do đặt lịch, AI gợi ý trên Dashboard và chức năng thêm người dùng. Việc có đủ tên màn hình chưa có nghĩa là đủ các thao tác bên trong.

**Cách AI hỗ trợ:** bổ sung Register với validation/email trùng; thêm lý do đặt lịch và giữ khi đổi lịch; thêm AI gợi ý mô phỏng có giải thích, sửa/chấp nhận/bỏ qua/lưu; thêm người dùng trong Admin.

**Kết quả:** hội thoại ghi Register tại `723c5c6` với 15 nhóm kiểm thử; phần bổ sung tại `6870b67`. Một số ca Counselor được bỏ qua khi chưa tích hợp SV3. Register ở mốc này là mô phỏng frontend, chưa có xác thực mật khẩu thật. [S4]

### Giai đoạn 3 — Sửa phiên đăng nhập và quyền thao tác frontend

**Yêu cầu:** sửa phần SV2 theo audit về phiên đăng nhập, dữ liệu liên thông và quản lý người dùng; xác minh tài khoản `lehaianh30102007-hub` trước commit/push. [S5]

**Cách AI hỗ trợ:** chuẩn bị bản sửa, hướng dẫn kết nối GitHub khi chưa xác minh được credential, rồi tiếp tục commit sau khi danh tính và quyền ghi được xác nhận. Bản sửa được ghi nhận là sửa phiên đăng nhập và quyền frontend, không phải triển khai bảo mật máy chủ.

**Kết quả:** commit [84ca606](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/commit/84ca606dc489af6e7f812f8cfd98a60672925b8e), 16 file thay đổi, 51 nhóm kiểm thử trong ghi nhận bàn giao; luồng giao diện Counselor vẫn cần kiểm tra sau tích hợp. [S5]

### Giai đoạn 4 — Sửa theo audit và bàn giao lại bộ code đầy đủ

**Prompt:** “CHỈ sửa SV2: TASK-13 Student Dashboard/Booking/Appointments; TASK-17 Admin User Management; TASK-18 SV2 store/session/auth/register”; yêu cầu ZIP/PATCH để người dùng tự commit, chỉnh sidebar, đồng bộ dữ liệu và chuẩn bị adapter không bịa endpoint. Người dùng tiếp tục đưa bảng lỗi đối chiếu như chủ đề đặt lịch chưa lưu, ghi chú bị bắt buộc và tài nguyên đã lưu chưa phản ánh đúng. [S6]

**Cách AI hỗ trợ:** chỉnh phần SV2 và đóng gói bản bàn giao theo yêu cầu. Bảng lỗi do người dùng cung cấp được dùng làm đầu vào; riêng việc xuất hiện trong bảng không đủ để khẳng định tất cả các lỗi đã được sửa.

**Hai lần phản hồi và sửa có bằng chứng:**

1. Người dùng hỏi “html chưa được kết nối với css js và json à”. Codex thừa nhận ZIP chỉ chứa file thay đổi, nên chạy riêng thiếu CSS/JS/logo; sau đó bàn giao ZIP đầy đủ và ghi đã kiểm thử sau giải nén.
2. Người dùng chỉ ra trang đăng nhập Chuyên viên vẫn hiện tạo tài khoản Sinh viên. Codex sửa nhãn và đường dẫn đăng ký đúng vai trò, bàn giao bản v2.

**Kết quả:** có bằng chứng bàn giao ZIP đầy đủ và v2 trong S6; không suy ra người dùng đã tự commit hoặc toàn bộ API/test đều đạt từ việc nhận file.

<a id="sv3"></a>
## 3. SV3 — Vũ Khánh An

**Phạm vi:** TASK-11 layout; TASK-14 Counselor; TASK-15 Admin Dashboard; AI mô phỏng, tích hợp/QA/deploy trong phạm vi được giao. Công cụ hỗ trợ: Codex.

### Giai đoạn 1 — Hoàn thiện Profile, Counselor, ghi chú và Dashboard

**Prompt:** “làm nốt phần của sinh viên 3 đi”; trong cùng phiên người dùng yêu cầu kiểm tra tài khoản Khánh An và xác nhận dùng `AnGit-Hub67`. [S1]

**Cách AI hỗ trợ:** bổ sung Profile; lịch, hàng đợi và ghi chú theo chuyên viên; AI-3 tạo bản nháp tóm tắt từ nội dung mẫu, cho sửa/chấp nhận/bỏ/tạo lại; Dashboard đọc số liệu từ store chung và nối điều hướng. Bản tóm tắt không thay ghi chú gốc và chỉ lưu theo thao tác chấp nhận/lưu.

**Kết quả:** hội thoại ghi commit [b08cfa2](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/commit/b08cfa2254e9b9ab10ce9d802af3666bd4f9e9ff), kiểm thử trên bản ghép local cùng SV1/SV2, responsive 375/768/1366/1440px. Các file tiêu biểu: `profile.html`, `assets/js/sv3-store.js`, `assets/js/counselor.js`, `assets/js/counselor-ai.js`, `assets/js/admin-dashboard.js`. [Báo cáo hoàn thiện](sv3-completion.md)

### Giai đoạn 2 — Sửa phiên, lịch trùng và luồng liên thông

**Prompt:** yêu cầu sửa shared layout theo phiên chung, đồng bộ slot/trạng thái với Student Booking, xử lý quyền mock và kiểm thử Visitor → Student → Counselor → Admin; người dùng nhắc “chữa của sinh viên 3 đi xong kiểm tra xem có phải Angit không nhé”. [S7]

**Cách AI hỗ trợ:** sửa login/logout và điều hướng theo phiên, quyền frontend Counselor/Admin, kiểm tra lịch trùng, đồng bộ slot/trạng thái với SV2 và số liệu dashboard. Các vấn đề ngoài phạm vi được tách ra để không ghi đè nghiệp vụ của thành viên khác.

**Kết quả:** commit [d8f366a](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/commit/d8f366a42846c37d309ff8aef604902917335ffd), ghi nhận 25 nhóm kiểm thử và 38 ảnh responsive; PR #5/#6 khi đó vẫn thuộc các nhánh cũ, chưa được tự merge. [Báo cáo sửa tích hợp](sv3-review-2026-10-24.md)

### Giai đoạn 3 — Nâng cấp giao diện và sửa phần AI đã bỏ sót

**Prompt:** “sửa của phần sinh viên 3 cho đúng yêu cầu đã phần của các sinh viên khác sửa sau”. [S8]

**Cách AI hỗ trợ ban đầu:** sidebar/logo, sáng–tối đa tab, skeleton, hồ sơ chuyên viên, đồng bộ dữ liệu, adapter MockAPI tùy chọn và lọc/xuất báo cáo Admin.

**Phản hồi quan trọng:** “sao lịch tuần 7 cột và giao diện đánh giá sao/bình luận chưa triển khai.” Codex thừa nhận đã thu hẹp phạm vi quá mức, bỏ sót yêu cầu và chốt bàn giao sớm. Đây là lỗi trong quá trình dùng AI, không phải phần chờ SV1/SV2. [S8]

**Lần sửa tiếp theo:** sau khi người dùng cung cấp endpoint và yêu cầu làm tiếp, Codex bổ sung lịch tuần 7 cột, chuyển tuần/mở nghỉ lịch, phần xem sao/bình luận của Counselor/Admin; nối resource lịch và ghi nhận kiểm tra GET/PUT, không gửi ghi chú hoặc danh tính lên resource đó.

**Kết quả:** cập nhật [PR #8](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/pull/8), ghi nhận test chức năng, lỗi/rỗng/retry, XSS, đa tab và responsive sáng/tối. [Báo cáo nâng cấp](sv3-upgrade-2026-10-25.md)

### Giai đoạn 4 — Kiểm tra bản phát hành và triển khai Pages

**Prompt:** “dùng tài khoản Angithub làm phần việc ở main đi”. [S9]

**Cách AI hỗ trợ:** bật GitHub Pages từ main, sửa lỗi tải cấu hình 404 qua PR #14 vào dev rồi PR #15 vào main; cập nhật README và báo cáo QA.

**Kết quả:** nguồn ghi kiểm tra website 25 trang, 5 độ rộng, hai theme, không phát hiện lỗi JavaScript/HTTP trong phạm vi đó. Điện thoại thật, zoom 200% và các minh chứng bàn giao vẫn cần kiểm tra/bổ sung. [QA/deploy](sv3-pages-qa.md)

<a id="tich-hop"></a>
## 4. Quá trình tích hợp và bàn giao chung

Các phần không được hoàn thành chỉ trong một lần sinh code. Lịch sử cho thấy vòng lặp: yêu cầu → tạo/sửa → đối chiếu → người dùng phản hồi → sửa tiếp → kiểm thử bản ghép → đưa lên GitHub.

| Bước | AI hỗ trợ và kết quả được ghi nhận |
|---|---|
| Đối chiếu yêu cầu | Đọc repo, bản Trello/Screen Inventory đã lưu, báo cáo audit và các phần SV. Những lúc Trello không truy cập được chỉ dùng bản lưu, không coi là đã đọc trạng thái mới nhất. |
| Ghép và xử lý xung đột | Bản ghi cũ mô tả đối chiếu bốn ZIP, ghép luồng và xử lý xung đột PR #10/#11. Đây là tóm tắt công việc chung, không gán riêng cho một sinh viên. |
| Kiểm thử tích hợp | Bản ghi cũ nêu layout/integration tại dev `dd2e1e8` đạt; 25 trang, 375/768/1440px, hai theme, mạng ngoài localhost bị chặn. Test legacy `sv3-completion` còn selector cũ. |
| Phát hành | S9 ghi tạo PR #12 từ dev vào main; sửa tài liệu qua PR #13. Prompt dùng tài khoản SV2 review và làm tiếp main dẫn tới thao tác merge bằng SV2; sau đó mới tiếp tục deploy bằng SV3. Không đổi việc này thành lịch sử do riêng SV3 thực hiện. |
| Tài liệu và OBS | Phiên hiện tại cập nhật Canva, playlist từng sinh viên và báo cáo này qua các PR tài liệu vào dev; không sửa code ứng dụng. |

Nguồn lịch sử tích hợp: [bản báo cáo AI trước lần viết lại](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/blob/cbb873f8a10122f1bf12a8fb78ed57b8f1732961/docs/ai-usage-report.md), [PR #12](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/pull/12), [PR #13](https://github.com/AnGit-Hub67/CSE122_67KTPM1_BTCK_Nhom1/pull/13).

## 5. Những lỗi và điều chỉnh đáng chú ý khi dùng AI

| Trường hợp | Điều đã xảy ra | Cách xử lý có ghi nhận |
|---|---|---|
| SV1 — bản ghép kiểm thử | Thiếu bộ quản lý phiên chung khiến test đầu không qua | Bổ sung đúng thành phần vào bản sao kiểm thử và chạy lại |
| SV2 — bàn giao ZIP | ZIP chỉ có file thay đổi, chạy riêng thiếu tài nguyên | Người dùng phản hồi; Codex tạo ZIP đầy đủ và kiểm thử sau giải nén |
| SV2 — nhãn đăng ký | Trang Chuyên viên vẫn dẫn/ghi tạo tài khoản Sinh viên | Người dùng chỉ lỗi; Codex sửa nhãn/đường dẫn và bàn giao v2 |
| SV3 — bỏ sót yêu cầu | Chưa có lịch tuần 7 cột và phần đánh giá nhưng đã bàn giao | Người dùng nhắc; Codex thừa nhận bỏ sót rồi bổ sung, cập nhật PR #8 |
| Nội dung phân công | Một câu trả lời cũ trong S1 ghi nhầm TASK quản lý người dùng và Dashboard | Báo cáo này đối chiếu lại: Admin Users là TASK-17, Admin Dashboard là TASK-15; không chép nguyên nhận định sai |
| Kết luận hoàn thành | Một số câu trả lời sớm nói đã đủ phần code, nhưng các lần audit/phản hồi sau tiếp tục phát hiện thiếu | Ghi kết quả theo từng mốc, không dùng lời kết luận sớm làm xác nhận toàn bộ bài đã hoàn thành |

Các lần sửa trên có hỗ trợ Codex. Khi nguồn chỉ ghi “người dùng phản hồi”, báo cáo giữ nguyên cách gọi đó; không tự gán việc phát hiện hoặc viết bản sửa cho một sinh viên cụ thể.

## 6. Phần tự làm và tự kiểm chứng cần từng thành viên bổ sung

Lịch sử đã đối chiếu chứng minh được yêu cầu, phản hồi và các đầu ra có hỗ trợ AI. Để hoàn thành khai báo cá nhân, mỗi sinh viên bổ sung ngắn gọn vào dòng của mình:

| Sinh viên | Công cụ/prompt trực tiếp sử dụng | File/hàm tự viết hoặc tự sửa | Cách tự kiểm tra và kết quả |
|---|---|---|---|
| SV1 — Doãn Tuấn Nghĩa | Cần xác nhận các lượt trong mục 1 và công cụ khác nếu có | Cần nêu file/hàm và commit/diff thực tế | Cần ghi thao tác, ngày, kết quả và video liên quan |
| SV2 — Lê Hải Anh | Cần xác nhận các lượt trong mục 2 và công cụ khác nếu có | Cần nêu phần tự sửa sau khi nhận ZIP hoặc khi tích hợp | Cần ghi thao tác, ngày, kết quả và video liên quan |
| SV3 — Vũ Khánh An | Cần xác nhận các lượt trong mục 3 và công cụ khác nếu có | Cần nêu file/hàm, phần tự sửa hoặc cấu hình trực tiếp | Cần ghi thao tác, ngày, kết quả và video liên quan |

Không dùng tên tài khoản commit, kết quả test do Codex chạy hoặc playlist làm bằng chứng thay cho phần tự làm. Chưa xác nhận model/phiên bản Codex. AI-1/AI-2/AI-3 trong sản phẩm là chức năng mô phỏng; việc dùng Codex để xây sản phẩm là hoạt động khác.

## 7. Video OBS

Họ tên và playlist do người dùng xác nhận ngày 26/10/2026. Chưa xác minh nội dung/quyền xem hoặc ánh xạ từng video với màn hình.

| Sinh viên | Playlist |
|---|---|
| SV1 — Doãn Tuấn Nghĩa | [Mở video SV1](https://www.youtube.com/playlist?list=PLW791Q36zdro) |
| SV2 — Lê Hải Anh | [Mở video SV2](https://youtube.com/playlist?list=PLT0-SlKPwchE&si=e5V-T6V0sKWc5x9S) |
| SV3 — Vũ Khánh An | [Mở video SV3](https://youtube.com/playlist?list=PLJL2Iv-yK-68&si=Qv022_IZfgSUQ6N5) |

## 8. Nguồn và phạm vi xác nhận

| Mã | Hội thoại đã đối chiếu | ID tra cứu |
|---|---|---|
| S1 | Hoàn thiện nhiệm vụ SV1 CampusMind — có cả lượt tiếp nối SV3 | `01a167fe-7163-75f0-a7ff-b36dc0a4d695` |
| S2 | Sửa các chức năng SV1 CampusMind | `01a16cf9-0153-7f02-9a18-1e430afd0f5c` |
| S3 | Hoàn thiện giao diện SV1 CampusMind | `01a17096-73e2-7233-81d6-9aabd1d68882` |
| S4 | Implement CampusMind SV2 pages | `01a16399-b05c-7a82-ad29-1463828afd33` |
| S5 | Sửa phần Sinh viên 2 CampusMind | `01a16b95-737e-7881-a69f-59193a85e6b4` |
| S6 | Sửa chức năng SV2 CampusMind | `01a1725b-54c9-7d30-b476-353db26a1909` |
| S7 | Sửa lỗi SV3 CampusMind | `01a16bb0-bc6c-70f3-8088-065d6e45e9e3` |
| S8 | Nâng cấp CampusMind ưu tiên SV3 | `01a16eec-ae64-75c2-b7a2-3e72f89dc1bd` |
| S9 | Audit 4 ZIP CampusMind | `01a173b4-ded6-70e2-ab55-7e23a62de0bc` |

ID hội thoại phục vụ tra cứu của người có quyền truy cập; không phải link chia sẻ công khai. Khi nộp, nhóm có thể bổ sung ảnh/bản xuất prompt được phép chia sẻ. Báo cáo tổng hợp các mốc đã kiểm chứng, không tuyên bố đã bao phủ mọi lần dùng AI.

Review cũ do Codex hỗ trợ, kể cả review sau merge, không chứng minh sinh viên đã tự đọc toàn bộ code và không thay đổi thứ tự lịch sử. Các PR tài liệu hiện tại bỏ qua bước thành viên khác review theo yêu cầu người dùng; không tạo review giả. Chưa xác nhận hoàn tất toàn bộ ĐK5, tiêu chí 7.3 hoặc rubric khi phần khai báo cá nhân/minh chứng còn thiếu.
