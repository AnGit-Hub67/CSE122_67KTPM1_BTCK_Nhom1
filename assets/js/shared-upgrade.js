/* Shared navigation only: never changes Student business data. */
(() => {
  'use strict';
  const root=new URL('../../',document.currentScript.src),themeKey='campusmind.theme.v1';
  let channel;try{channel=new BroadcastChannel('campusmind.ui.v1');}catch{}
  function theme(value){
    document.documentElement.dataset.theme=value==='dark'?'dark':'light';
    document.querySelectorAll('[data-theme-toggle]').forEach(b=>{b.textContent=value==='dark'?'Chuyển sang sáng':'Chuyển sang tối';b.setAttribute('aria-pressed',String(value==='dark'));});
  }
  try{theme(localStorage.getItem(themeKey));}catch{theme('light');}
  window.addEventListener('storage',e=>{if(e.key===themeKey||e.key===null)theme(e.newValue);});
  if(channel)channel.onmessage=e=>{if(e.data?.type==='theme')theme(e.data.value);};
  function button(text,attribute){const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute(attribute,'');return b;}
  function enhance(user){
    const continuation=document.querySelector('#login-continue');
    if(continuation&&['admin','counselor'].includes(user?.role))continuation.href=new URL(`pages/${user.role}/index.html`,root);
    let sidebar=document.querySelector('.sidebar');
    if(user&&!sidebar&&document.querySelector('main')){
      const shell=document.createElement('div');shell.className='app-shell';const main=document.querySelector('main');main.before(shell);
      sidebar=document.createElement('aside');sidebar.className='sidebar';sidebar.dataset.dynamicSidebar='';shell.append(sidebar,main);
      const logo=document.createElement('img');logo.src=new URL('assets/images/campusmind-logo.png',root);logo.alt='CampusMind';logo.className='brand-logo';sidebar.append(logo);
      const toggle=button('Điều hướng khu vực','data-drawer-toggle');toggle.setAttribute('aria-controls','role-navigation');toggle.setAttribute('aria-expanded','false');sidebar.append(toggle);
      const nav=document.createElement('nav');nav.id='role-navigation';nav.setAttribute('aria-label','Điều hướng vai trò');sidebar.append(nav);
      const menus={student:[['Tổng quan sinh viên',document.body.dataset.studentDashboard||'pages/student/index.html'],['Đặt lịch tham vấn','pages/student/student-booking.html'],['Lịch hẹn của tôi','pages/student/student-appointments.html']],counselor:[['Tổng quan chuyên viên','pages/counselor/index.html'],['Lịch làm việc','pages/counselor/counselor-schedule.html'],['Hàng đợi lịch hẹn','pages/counselor/counselor-appointment-queue.html']],admin:[['Bảng tổng quan','pages/admin/admin-dashboard.html'],['Quản lý dịch vụ','pages/admin/admin-service-management.html']]};
      const links=[...(user.role==='admin'?[['Đánh giá dịch vụ','pages/admin/index.html']]:[]),...menus[user.role],...(user.role==='student'?[['Thư viện tài nguyên','pages/visitor/visitor-resource-library.html']]:[]),['Hồ sơ','profile.html']];
      for(const [label,path] of links){const a=document.createElement('a');a.href=new URL(path,root);a.textContent=label;nav.append(a);}
      nav.append(button('Đổi giao diện','data-theme-toggle'),button('Đăng xuất','data-logout'));
      const compact=matchMedia('(max-width:700px)');const resize=()=>{toggle.hidden=!compact.matches;nav.hidden=compact.matches;toggle.setAttribute('aria-expanded',String(!nav.hidden));};compact.addEventListener('change',resize);resize();
      toggle.onclick=()=>{nav.hidden=!nav.hidden;toggle.setAttribute('aria-expanded',String(!nav.hidden));if(!nav.hidden)nav.querySelector('a')?.focus();};
    }
    const header=document.querySelector('.site-header');if(header)header.hidden=Boolean(user);
    if(sidebar&&document.body.dataset.role)sidebar.hidden=!user||user.role!==document.body.dataset.role;
    if(!user&&sidebar?.hasAttribute('data-dynamic-sidebar')){const shell=sidebar.parentElement;shell.before(shell.querySelector('main'));shell.remove();sidebar=null;}
    if(!sidebar&&!document.querySelector('[data-theme-toggle]'))document.querySelector('.header-inner')?.append(button('Đổi giao diện','data-theme-toggle'));
    try{theme(localStorage.getItem(themeKey));}catch{}
  }
  window.addEventListener('campusmind:session',e=>enhance(e.detail));
  window.CampusSession?.ready.then(enhance);
  // Loading has structure; empty/error remain their own existing views.
  const content=document.querySelector('#work-content')||document.querySelector('#profile-form');
  const workStatus=document.querySelector('#work-status')||document.querySelector('#profile-status');
  if(content&&workStatus){
    const skeleton=document.createElement('div');skeleton.id='shared-skeleton';skeleton.setAttribute('aria-hidden','true');
    for(let i=0;i<3;i++){const row=document.createElement('div');row.className='skeleton-block';skeleton.append(row);}workStatus.after(skeleton);
    const update=()=>{skeleton.hidden=!content.hidden||!workStatus.textContent.startsWith('Đang');};
    new MutationObserver(update).observe(workStatus,{childList:true,subtree:true,characterData:true});new MutationObserver(update).observe(content,{attributes:true,attributeFilter:['hidden']});update();
  }
  window.addEventListener('campusmind:remote-status',e=>{
    let box=document.querySelector('#remote-status');if(!box){box=document.createElement('p');box.id='remote-status';box.setAttribute('role','status');document.querySelector('#work-status')?.after(box);}
    box.textContent=e.detail;const retry=button('Thử đồng bộ lại','data-remote-retry');retry.onclick=()=>window.CampusDemoSync?.publish();box.append(document.createTextNode(' '),retry);
  });
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-theme-toggle]')){const value=document.documentElement.dataset.theme==='dark'?'light':'dark';theme(value);try{localStorage.setItem(themeKey,value);}catch{}channel?.postMessage({type:'theme',value});}
    if(e.target.closest('[data-logout]')){try{sessionStorage.removeItem('campusmind.session.v1');sessionStorage.removeItem('campusmind.sv2.student.session.v1');location.href=new URL('login.html',root);}catch{e.target.textContent='Không thể đăng xuất — thử lại';}}
    if(e.target.closest('[data-nav-toggle]')?.getAttribute('aria-expanded')==='true')document.querySelector('#role-navigation a')?.focus();
  });
  // Escape and an explicit close control make the mobile drawer usable by keyboard.
  const observer=new MutationObserver(()=>{
    const nav=document.querySelector('#role-navigation');if(!nav||nav.querySelector('[data-close-drawer]'))return;
    const close=button('Đóng menu','data-close-drawer');close.className='drawer-close';close.onclick=()=>{nav.hidden=true;const toggle=document.querySelector('[aria-controls="role-navigation"]');toggle?.setAttribute('aria-expanded','false');toggle?.focus();};nav.prepend(close);
  });observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('keydown',e=>{const nav=document.querySelector('#role-navigation');if(!nav||nav.hidden||!matchMedia('(max-width:700px)').matches)return;if(e.key==='Escape')nav.querySelector('[data-close-drawer]')?.click();if(e.key==='Tab'){const items=[...nav.querySelectorAll('a,button')].filter(x=>!x.hidden);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
})();
