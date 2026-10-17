(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const keys=['campusmind.admin.services.v1','campusmind.counselor.v1'];
  async function load(){
    $('work-status').textContent='Đang tải số liệu…';$('work-content').hidden=true;$('work-error').hidden=true;$('retry').hidden=true;
    await new Promise(r=>requestAnimationFrame(r));
    try {
      const services=JSON.parse(localStorage.getItem(keys[0])||'[]');
      const work=JSON.parse(localStorage.getItem(keys[1])||'{"appointments":[],"activity":[]}');
      if(!Array.isArray(services)||!services.every(s=>s&&typeof s.id==='string'&&['active','inactive','archived'].includes(s.status))||!work||!Array.isArray(work.appointments)||!Array.isArray(work.activity)||!work.appointments.every(a=>a&&typeof a.id==='string'&&['Pending','Confirmed','Completed','Cancelled'].includes(a.status))||!work.activity.every(a=>a&&typeof a.text==='string'&&Number.isFinite(Date.parse(a.at))))throw Error('Invalid data');
      $('services-count').textContent=services.filter(s=>s.status==='active').length;
      $('pending-count').textContent=work.appointments.filter(a=>a.status==='Pending').length;
      $('completed-count').textContent=work.appointments.filter(a=>a.status==='Completed').length;
      $('activity').replaceChildren();
      for(const event of [...work.activity].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,10)){const item=document.createElement('li');const date=document.createElement('small');date.className='meta';date.textContent=new Date(event.at).toLocaleString('vi-VN');const p=document.createElement('p');p.textContent=event.text;item.append(date,p);$('activity').append(item);}
      $('activity-empty').hidden=work.activity.length>0;$('work-content').hidden=false;
      $('work-status').textContent='Cập nhật lúc '+new Date().toLocaleTimeString('vi-VN');
    }catch{$('work-error').textContent='Không thể đọc số liệu. Dữ liệu lưu trữ có lỗi hoặc trình duyệt chặn truy cập. Dữ liệu hiện có được giữ nguyên.';$('work-error').hidden=false;$('retry').hidden=false;$('work-status').textContent='Chưa thể cập nhật số liệu.';}
  }
  $('refresh').addEventListener('click',load);$('retry').addEventListener('click',load);window.addEventListener('storage',e=>{if(keys.includes(e.key)||e.key===null)load();});load();
})();
