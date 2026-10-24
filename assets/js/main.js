// Frontend demo session only: this does not provide server authorization.
(() => {
  const root=new URL('../../',document.currentScript.src);
  const key='campusmind.session.v1', usersKey='campusmind.sv2.users.v1';
  let seeds=[];
  const current=()=>{
    const session=JSON.parse(sessionStorage.getItem(key)||'null');
    const users=JSON.parse(localStorage.getItem(usersKey)||'null')||seeds;
    if(!Array.isArray(users))throw Error('Dữ liệu người dùng không hợp lệ.');
    return users.find(u=>u.id===session?.id&&u.role===session?.role&&u.status==='active')||null;
  };
  const main=document.querySelector('main'),admin=document.body.dataset.role==='admin';
  if(admin&&main)main.hidden=true;
  const login=new URL('sv2-login.html',root).href;
  const ready=(async()=>{
    try{
      const r=await fetch(new URL('assets/data/sv2.json',root));
      if(!r.ok)throw Error('Không tải được tài khoản demo.');
      seeds=(await r.json()).users;
      const user=current(),nav=document.getElementById('primary-navigation');
      const entry=document.createElement('a');entry.href=login;entry.textContent=user?user.name+' · Đổi tài khoản':'Đăng nhập demo';nav?.append(entry);
      if(user){const exit=document.createElement('button');exit.type='button';exit.textContent='Đăng xuất';exit.addEventListener('click',()=>{sessionStorage.removeItem(key);sessionStorage.removeItem('campusmind.sv2.student.session.v1');location.reload();});nav?.append(exit);}
      if(admin&&user?.role!=='admin')throw Error('Cần đăng nhập demo bằng tài khoản quản trị.');
      if(admin&&main)main.hidden=false;
      return user;
    }catch(err){
      const notice=document.createElement('p');notice.className='notice';notice.setAttribute('role','alert');notice.textContent=err.message+' ';
      const a=document.createElement('a');a.href=login;a.textContent='Đăng nhập demo';notice.append(a);main?.before(notice);return null;
    }
  })();
  window.CampusSession={current,ready};
  window.addEventListener('storage',event=>{if(event.key===usersKey||event.key===null){try{if(!current()||admin&&current().role!=='admin')location.reload();}catch{location.reload();}}});
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
