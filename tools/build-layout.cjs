// Static HTML stays usable without JS. Run after adding pages or changing routes.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const check = process.argv.includes("--check");
const exists = file => fs.existsSync(path.join(root, file));
const visitorReady = fs.existsSync(
  path.join(root, "pages/visitor/visitor-service-directory.html"),
);
const routes = [
  ["Trang chủ", "index.html"],
  [
    "Dịch vụ",
    visitorReady
      ? "pages/visitor/visitor-service-directory.html"
      : "pages/visitor/index.html",
  ],
  ...(visitorReady
    ? [
        ["Tài nguyên", "pages/visitor/visitor-resource-library.html"],
        ["Chuyên viên", "pages/visitor/visitor-counselor-detail.html"],
      ]
    : []),
];
const roles = [
  ["Sinh viên", "student"],
  ["Chuyên viên", "counselor"],
  ["Quản trị viên", "admin"],
];
if (exists('profile.html')) routes.push(['Hồ sơ', 'profile.html']);
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (
      entry.name.startsWith(".") ||
      ["node_modules", "tools", "tests", "assets"].includes(entry.name)
    )
      return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory()
      ? files(full)
      : entry.name.endsWith(".html")
        ? [full]
        : [];
  });
}
let changed = 0;
for (const file of files(root)) {
  const source = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const href = (target) => {
    const [pathname, fragment] = target.split("#");
    return escape(
      path
        .relative(path.dirname(file), path.join(root, pathname))
        .replaceAll("\\", "/") + (fragment ? `#${fragment}` : ""),
    );
  };
  const anchor = ([label, target]) =>
    `<a href="${href(target)}"${relative === target ? ' aria-current="page"' : ""}>${label}</a>`;
  const role = source.match(/data-role="(student|counselor|admin)"/)?.[1];
  const logo = `<img class="brand-logo" src="${href('assets/images/campusmind-logo.png')}" alt="CampusMind" width="540" height="422">`;
  const parts = {
    header: `<header class="site-header"><div class="header-inner"><a class="brand" href="${href("index.html")}" aria-label="CampusMind — Trang chủ">Campus<span>Mind</span></a><button type="button" class="nav-toggle" data-nav-toggle aria-controls="primary-navigation" aria-expanded="true" hidden>Menu</button><nav id="primary-navigation" aria-label="Điều hướng chính">${routes.map(anchor).join("\n")}</nav></div></header>`,
    footer: `<footer class="site-footer"><div class="footer-inner"><div><strong>CampusMind</strong><p>Một điểm tựa trong hành trình sinh viên.</p><small>© 2026 CampusMind · Bản prototype học phần CSE122</small></div><nav aria-label="Thông tin CampusMind">${anchor(["Giới thiệu", "index.html#about"])}</nav></div></footer>`,
    "visitor-entry": visitorReady
      ? `<div class="actions">${routes
          .slice(1, 4)
          .map(
            ([label, target]) =>
              `<a class="button" href="${href(target)}">${label}</a>`,
          )
          .join("")}</div>`
      : '<p class="notice">Các trang dịch vụ, tài nguyên và hồ sơ chuyên viên được tích hợp từ TASK-12.</p>',
    sidebar: role
      ? `<aside class="sidebar" aria-label="Khu vực ${roles.find((item) => item[1] === role)[0]}"><strong>Khu vực ${roles.find((item) => item[1] === role)[0]}</strong><button type="button" class="nav-toggle" data-nav-toggle aria-controls="role-navigation" aria-expanded="true" hidden>Điều hướng khu vực</button><nav id="role-navigation" aria-label="Điều hướng vai trò">${anchor(["Tổng quan", `pages/${role}/index.html`])}${role === "admin" ? anchor(["Quản lý dịch vụ", "pages/admin/admin-service-management.html"]) : ""}${anchor(["Khám phá dịch vụ", routes[1][1]])}${anchor(["Trang chủ", "index.html"])}<span class="sidebar-note">${role === "admin" ? "Quản lý danh mục dịch vụ hỗ trợ sinh viên." : "Các chức năng nghiệp vụ sẽ được bổ sung ở task của từng vai trò."}</span></nav></aside>`
      : "",
  };
  if (role) {
    const menus = {
      student: [['Đặt lịch tham vấn','pages/student/student-booking.html'],['Lịch hẹn của tôi','pages/student/student-appointments.html'],['Thư viện tài nguyên','pages/visitor/visitor-resource-library.html']],
      counselor: [['Lịch làm việc','pages/counselor/counselor-schedule.html'],['Hàng đợi lịch hẹn','pages/counselor/counselor-appointment-queue.html']],
      admin: [['Bảng tổng quan','pages/admin/admin-dashboard.html'],['Quản lý dịch vụ','pages/admin/admin-service-management.html'],['Quản lý người dùng','pages/admin/admin-user-management.html']]
    };
    const dashboard = role === 'student' && exists('pages/student/student-dashboard.html') ? 'pages/student/student-dashboard.html' : `pages/${role}/index.html`;
    const links = [[role==='student'?'Tổng quan sinh viên':'Tổng quan', dashboard], ...menus[role].filter(([,target])=>exists(target)), ...(exists('profile.html') ? [['Hồ sơ','profile.html']] : [])];
    const label = roles.find(item=>item[1]===role)[0];
    parts.header = '';
    parts.sidebar = `<aside class="sidebar" aria-label="Khu vực ${label}"><a class="brand" href="${href(dashboard)}">${logo}</a><strong>${role==='student'?'Không gian Sinh viên':'Khu vực '+label}</strong><button type="button" class="nav-toggle" data-nav-toggle aria-controls="role-navigation" aria-expanded="true" hidden>Điều hướng khu vực</button><nav id="role-navigation" aria-label="Điều hướng vai trò">${links.map(anchor).join('')}<button type="button" data-theme-toggle>Đổi giao diện</button><button type="button" data-logout>Đăng xuất</button></nav></aside>`;
  }
  if (!role) parts.header = parts.header.replace('Campus<span>Mind</span>', logo);
  parts.footer += '<p class="crisis-line">Nếu bạn đang gặp khủng hoảng, hãy gọi 115 hoặc đến cơ sở y tế gần nhất.</p>';
  let output = source;
  // Legacy SV2 pages predate layout markers. Replace only the shared shell,
  // leaving main, dialogs and all business scripts byte-for-byte unchanged.
  for(const [key,pattern] of [['header',/<header class="site-header">[\s\S]*?<\/header>/],['sidebar',/<aside class="sidebar"[^>]*>[\s\S]*?<\/aside>/],['footer',/<footer class="site-footer">[\s\S]*?<\/footer>/]]){
    if(!source.includes(`<!-- campusmind:${key} -->`))output=output.replace(pattern,`<!-- campusmind:${key} -->\n${parts[key]}\n<!-- /campusmind:${key} -->`);
  }
  if (!source.includes('assets/js/demo-sync.js')) output = output.replace(/<script defer src="([^"]*assets\/js\/main.js)"><\/script>/, `<script defer src="${href('assets/js/demo-sync.js')}"></script>$&`);
  output = output.replace(/ data-student-dashboard="[^"]*"/g, '').replace('<body', `<body data-student-dashboard="${exists('pages/student/student-dashboard.html')?'pages/student/student-dashboard.html':'pages/student/index.html'}"`);
  if (!source.includes('assets/js/shared-upgrade.js')) output = output.replace('</head>', `<script defer src="${href('assets/js/shared-upgrade.js')}"></script></head>`);
  if (!source.includes('assets/css/shared-upgrade.css')) output = output.replace('</head>', `<link rel="stylesheet" href="${href('assets/css/shared-upgrade.css')}"></head>`);
  for (const [key, html] of Object.entries(parts)) {
    output = output.replace(
      new RegExp(
        `<!-- campusmind:${key} -->[\\s\\S]*?<!-- /campusmind:${key} -->`,
        "g",
      ),
      `<!-- campusmind:${key} -->\n${html}\n<!-- /campusmind:${key} -->`,
    );
  }
  if (output !== source) {
    changed++;
    if (!check) fs.writeFileSync(file, output);
    else console.error(`Layout outdated: ${relative}`);
  }
}
if (check && changed) process.exitCode = 1;
else
  console.log(
    check
      ? "Shared layouts are up to date."
      : `Updated ${changed} shared layouts.`,
  );
