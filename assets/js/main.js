(() => {
 const root=new URL('../../',document.currentScript.src);
 try{const s=JSON.parse(localStorage.getItem('campusmind.session.v1')||'null');if(s?.mode==='local')sessionStorage.setItem('campusmind.session.v1',JSON.stringify({id:s.id,role:s.role}));else sessionStorage.removeItem('campusmind.session.v1');}catch{}
 const load=name=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL('assets/js/'+name+'.js',root);s.onload=resolve;s.onerror=()=>reject(Error('Không tải được kết nối phiên.'));document.head.append(s);});
 const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('assets/css/sv2-official.css',root);document.head.append(style);
 if(!window.CampusShell)load('sv2-shell').catch(()=>{});

 const protectedRole=document.body.dataset.role;
 const main=document.querySelector('main');if(protectedRole&&main)main.hidden=true;
 let users=[];
 const current=()=>{const s=window.CampusAuth?.current();if(!s)return null;if(s.mode!=='local')return s;const rows=JSON.parse(localStorage.getItem('campusmind.sv2.users.v1')||'null')||users;return rows.find(u=>u.id===s.id&&u.role===s.role&&u.status==='active')||null;};
 const ready=(async()=>{try{
 if(!window.CampusConfig)await load('sv2-config');if(!window.CampusAPI)await load('sv2-api');if(!window.CampusAuth)await load('sv2-session');
 const r=await fetch(new URL('assets/data/sv2.json',root));if(!r.ok)throw Error('Không tải được dữ liệu phiên.');users=(await r.json()).users;
 await CampusAuth.refresh();const user=current();
 if(protectedRole&&(!user||user.role!==protectedRole||user.status!=='active'||user.role==='counselor'&&CampusAuth.current()?.mode!=='local'&&user.approval!=='approved'))throw Error('Vui lòng đăng nhập đúng vai trò để tiếp tục.');
 if(main)main.hidden=false;
 if(user){
   document.querySelector('.site-header')?.remove();
   if(user.role==='admin'&&document.querySelector('.sidebar')&&!document.querySelector('.sidebar a[href*="admin-user-management"]')){const a=document.createElement('a');a.textContent='Quản lý người dùng';a.href=new URL('pages/admin/admin-user-management.html',root);(document.querySelector('.sidebar nav')||document.querySelector('.sidebar')).append(a);}
   if(!document.querySelector('.sidebar')&&main&&!document.querySelector('script[src$="shared-upgrade.js"]')){
     const shell=document.createElement('div');shell.className='app-shell';main.before(shell);
     main.querySelector(':scope > .campus-brand')?.remove();const side=document.createElement('aside');side.className='sidebar';const nav=document.createElement('nav');nav.setAttribute('aria-label','Điều hướng vai trò');
     const links=user.role==='counselor'&&CampusAuth.current()?.mode!=='local'&&user.approval!=='approved'?[['Hồ sơ đã nộp','account-status.html']]:user.role==='student'?[['Không gian Sinh viên','pages/student/student-dashboard.html'],['Tổng quan sinh viên','pages/student/student-dashboard.html'],['Đặt lịch','pages/student/student-booking.html'],['Lịch hẹn','pages/student/student-appointments.html'],['Thư viện','pages/visitor/visitor-resource-library.html'],['Hồ sơ','profile.html']]:user.role==='admin'?[['Quản lý người dùng','pages/admin/admin-user-management.html'],['Quản lý dịch vụ','pages/admin/admin-service-management.html'],['Đánh giá dịch vụ','pages/admin/index.html']]:[['Khu vực chuyên viên','pages/counselor/index.html'],['Hồ sơ','profile.html']];
     for(const [label,url] of links){const a=document.createElement('a');a.textContent=label;a.href=new URL(url,root);nav.append(a);}const exit=document.createElement('button');exit.type='button';exit.textContent='Đăng xuất';exit.dataset.logout='';nav.append(exit);side.append(theme,nav);shell.append(side,main);
     const heading=nav.querySelector('a');if(user.role==='student'&&heading){const h=document.createElement('h2');h.className='workspace-title';h.append(heading);side.prepend(h);}
     const brand=document.createElement('a');brand.className='campus-brand';brand.href=new URL(CampusAuth.route({...user,mode:CampusAuth.current()?.mode}),root);const logo=document.createElement('img');logo.src=new URL('assets/images/campusmind-logo.png',root);logo.alt='';logo.className='brand-logo';brand.append(logo,document.createTextNode('CampusMind'));side.prepend(brand);
     nav.id='session-navigation';const toggle=document.createElement('button');toggle.type='button';toggle.className='nav-toggle';toggle.dataset.navToggle='';toggle.textContent='Điều hướng khu vực';toggle.setAttribute('aria-controls',nav.id);side.insertBefore(toggle,nav);window.CampusInitNavigation?.();
     for(const a of nav.querySelectorAll('a'))if(new URL(a.href).pathname===location.pathname)a.setAttribute('aria-current','page');
   }
 }

 return user;
 }catch(e){const p=document.createElement('p');p.className='notice';p.setAttribute('role','alert');p.textContent=e.message+' ';const a=document.createElement('a');a.href=new URL('sv2-login.html',root);a.textContent='Đăng nhập';p.append(a);main?.before(p);return null;}})();
 document.addEventListener('click',async e=>{if(!e.target.closest('[data-logout]'))return;try{await CampusAuth.logout();location.href=new URL('sv2-login.html',root);}catch(err){alert(err.message);}});
 window.CampusSession={current,ready};
 window.addEventListener('campus-session',()=>{if(protectedRole||document.querySelector('.sidebar'))location.reload();});
 window.addEventListener('storage',e=>{if(e.key==='campusmind.sv2.users.v1'||e.key===null){try{if(document.querySelector('.sidebar')&&(!current()||(protectedRole&&current().role!==protectedRole)))location.reload();}catch{location.reload();}}});
 const themeKey='campusmind.theme.v1';const apply=theme=>document.documentElement.dataset.theme=theme==='dark'?'dark':'light';try{apply(localStorage.getItem(themeKey));}catch{}
 const theme=document.createElement('button');theme.type='button';theme.textContent='Sáng / Tối';theme.setAttribute('aria-label','Chuyển giao diện sáng hoặc tối');theme.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';apply(next);try{localStorage.setItem(themeKey,next);}catch{}});if(!document.querySelector('[data-theme-toggle]')&&!document.querySelector('script[src$="shared-upgrade.js"]'))(document.querySelector('.sidebar')||document.querySelector('main'))?.prepend(theme);
 window.addEventListener('storage',e=>{if(e.key===themeKey)apply(e.newValue);});
})();
// Shared progressive enhancement. Navigation remains visible without JavaScript.
(() => {
  "use strict";
  const compact = matchMedia("(max-width: 700px)");
  window.CampusInitNavigation = () => document.querySelectorAll("[data-nav-toggle]").forEach((button) => {
    if(button.dataset.navReady)return;button.dataset.navReady="true";
    const navigation = document.getElementById(
      button.getAttribute("aria-controls"),
    );
    if (!navigation) return;
    function setOpen(open, restoreFocus = false) {
      button.setAttribute("aria-expanded", String(open));
      navigation.hidden = !open;
      if (restoreFocus) button.focus();
    }
    function resize() {
      const focusedInside = navigation.contains(document.activeElement);
      button.hidden = !compact.matches;
      setOpen(!compact.matches, compact.matches && focusedInside);
    }
    button.addEventListener("click", () =>
      setOpen(button.getAttribute("aria-expanded") !== "true"),
    );
    navigation.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && compact.matches) {
        setOpen(false, true);
      }
    });
    compact.addEventListener("change", resize);
    resize();
  });
  window.CampusInitNavigation();
  document.querySelectorAll("[data-dialog-open]").forEach((button) => {
    button.addEventListener("click", () =>
      document.getElementById(button.dataset.dialogOpen)?.showModal(),
    );
  });
  document.querySelectorAll("[data-dialog-close]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });
})();
