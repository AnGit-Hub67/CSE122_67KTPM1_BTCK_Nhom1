(() => {
  const S=window.SV2Store,select=document.getElementById('account'),status=document.getElementById('login-status'),form=document.getElementById('demo-login');
  form.hidden=true;
  S.initRegistration().then(({users})=>{select.replaceChildren(new Option('Chọn tài khoản',''),...users.filter(u=>u.status==='active').map(u=>new Option(`${u.name} · ${u.role}`,u.id)));form.hidden=false;status.textContent='Chưa chọn tài khoản.';}).catch(err=>{status.textContent=err.message;});
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const button=form.querySelector('button');if(button.disabled)return;button.disabled=true;
    try{
      const {users}=await S.initRegistration();
      const user=users.find(u=>u.id===select.value&&u.status==='active');
      if(!user)throw Error('Tài khoản không còn hoạt động.');
      sessionStorage.setItem('campusmind.session.v1',JSON.stringify({id:user.id,role:user.role}));
      sessionStorage.removeItem(S.SESSION);
      location.href={student:'pages/student/student-dashboard.html',admin:'pages/admin/admin-user-management.html',counselor:'pages/counselor/index.html'}[user.role];
    }catch(err){status.textContent=err.message;}finally{button.disabled=false;}
  });
})();
