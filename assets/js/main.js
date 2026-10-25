// Shared frontend demo session. Local storage is not server authorization.
(() => {
  'use strict';
  const root=new URL('../../',document.currentScript.src),key='campusmind.session.v1',usersKey='campusmind.sv2.users.v1';
  const main=document.querySelector('main'),role=['student','admin','counselor'].includes(document.body.dataset.role)?document.body.dataset.role:null;
  const login=new URL(document.body.dataset.loginRoute||'login.html',root).href;let seeds=[],notice;
  if(role&&main)main.hidden=true;
  const current=()=>{
    const session=JSON.parse(sessionStorage.getItem(key)||'null'),raw=localStorage.getItem(usersKey),users=raw===null?seeds:JSON.parse(raw);
    if(!Array.isArray(users))throw Error('Dữ liệu tài khoản không hợp lệ.');
    return users.find(u=>u.id===session?.id&&u.role===session?.role&&u.status==='active')||null;
  };
  function render(){
    let user=null,problem='';try{user=current();}catch{problem='Không đọc được phiên hoặc tài khoản.';}
    const nav=document.getElementById('primary-navigation');
    nav?.querySelectorAll('[data-session-link]').forEach(e=>e.remove());
    const entry=document.createElement('a');entry.dataset.sessionLink='';entry.href=login;entry.textContent=user?user.name+' · Đổi tài khoản':'Đăng nhập';nav?.append(entry);
    if(user){const exit=document.createElement('button');exit.dataset.sessionLink='';exit.type='button';exit.textContent='Đăng xuất';exit.addEventListener('click',()=>{
      try{sessionStorage.removeItem(key);sessionStorage.removeItem('campusmind.sv2.student.session.v1');location.reload();}catch{exit.textContent='Không thể đăng xuất — thử lại';}
    });nav?.append(exit);}
    document.querySelectorAll('header a,footer a').forEach(a=>{if(new URL(a.href).pathname.endsWith('/ui-kit.html'))a.remove();});
    if(role&&main){const allowed=!problem&&user?.role===role;main.hidden=!allowed;
      if(!allowed){if(!notice){notice=document.createElement('p');notice.className='notice';notice.setAttribute('role','alert');main.before(notice);}notice.replaceChildren(document.createTextNode(problem||'Cần đăng nhập đúng vai trò để mở khu vực này. '));const a=document.createElement('a');a.href=login;a.textContent='Đăng nhập';notice.append(a);}
      else{notice?.remove();notice=null;}
    }
    window.dispatchEvent(new CustomEvent('campusmind:session',{detail:user}));
    return user;
  }
  const ready=(async()=>{try{let r=await fetch(new URL('assets/data/sv2.json',root),{signal:AbortSignal.timeout(10000)});if(r.status===404)r=await fetch(new URL('assets/data/login-demo.json',root),{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();seeds=(await r.json()).users;}catch{seeds=[];}return render();})();
  window.CampusSession={current,ready,refresh:render};
  window.addEventListener('storage',e=>{if(e.key===usersKey||e.key===null)render();});
  window.addEventListener('pageshow',()=>ready.then(render));
  // SV1 login changes its success/form visibility without navigating.
  for(const id of ['login-success','login-form']){const e=document.getElementById(id);if(e)new MutationObserver(()=>ready.then(render)).observe(e,{attributes:true,attributeFilter:['hidden']});}
})();

// Shared progressive enhancement. Navigation remains visible without JavaScript.
(() => {
  "use strict";
  const compact = matchMedia("(max-width: 700px)");
  document.querySelectorAll("[data-nav-toggle]").forEach((button) => {
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
  document.querySelectorAll("[data-dialog-open]").forEach((button) => {
    button.addEventListener("click", () =>
      document.getElementById(button.dataset.dialogOpen)?.showModal(),
    );
  });
  document.querySelectorAll("[data-dialog-close]").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });
})();
