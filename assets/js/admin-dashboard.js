(() => {
  'use strict';
  const S=SV3Store,$=id=>document.getElementById(id);let version=0;
  async function load(){
    const request=++version;$('work-status').textContent='Đang tải số liệu…';$('work-content').hidden=true;$('work-error').hidden=true;$('retry').hidden=true;
    try{
      await S.init();const users=S.users().items;const catalog=await CampusMindServices.read();
      const work=JSON.parse(localStorage.getItem(S.KEY)||'{"appointments":[],"activity":[]}');
      if(!work||!Array.isArray(work.appointments)||!Array.isArray(work.activity)||!work.appointments.every(a=>a&&typeof a.id==='string'&&['Pending','Confirmed','Completed','Cancelled'].includes(a.status))||!work.activity.every(a=>a&&typeof a.text==='string'&&Number.isFinite(Date.parse(a.at))))throw Error('Dữ liệu lịch không hợp lệ.');
      if(request!==version)return;
      $('services-count').textContent=catalog.items.filter(s=>s.status==='active').length;
      $('users-count').textContent=users.length;$('active-users-count').textContent=users.filter(u=>u.status==='active').length;
      $('pending-count').textContent=work.appointments.filter(a=>a.status==='Pending').length;$('completed-count').textContent=work.appointments.filter(a=>a.status==='Completed').length;
      $('activity').replaceChildren();
      for(const event of [...work.activity].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,10)){
        const item=document.createElement('li'),date=document.createElement('small'),p=document.createElement('p');date.className='meta';date.textContent=new Date(event.at).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});p.textContent=event.text;item.append(date,p);$('activity').append(item);
      }
      $('activity-empty').hidden=work.activity.length>0;$('work-content').hidden=false;$('work-status').textContent='Đã cập nhật số liệu trên trình duyệt này.';
    }catch(err){if(request!==version)return;$('work-error').textContent='Không thể đọc số liệu. '+err.message+' Dữ liệu hiện có được giữ nguyên.';$('work-error').hidden=false;$('retry').hidden=false;$('work-status').textContent='Chưa thể cập nhật số liệu.';}
  }
  $('refresh').addEventListener('click',load);$('retry').addEventListener('click',load);
  $('users-link').addEventListener('click',async e=>{
    e.preventDefault();try{const r=await fetch(e.currentTarget.href,{method:'HEAD',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();location.href='admin-user-management.html';}
    catch{$('users-help').textContent='Trang quản lý người dùng chưa sẵn sàng trong bản demo này. Hãy kiểm tra bản tích hợp hoặc kết nối rồi thử lại.';}
  });
  window.addEventListener('storage',e=>{if([CampusMindServices.key,S.USERS,S.KEY].includes(e.key)||e.key===null)load();});load();
})();
