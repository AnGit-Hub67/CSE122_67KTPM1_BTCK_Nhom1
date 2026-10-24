(() => {
  'use strict';
  const S=SV3Store,$=id=>document.getElementById(id);let version=0,reportRows=[],reportReady=false;
  const tools=document.createElement('section');tools.className='report-tools';tools.setAttribute('aria-label','Lọc và xuất báo cáo lịch hẹn');
  function select(id,label,options){const wrap=document.createElement('label');wrap.textContent=label;const field=document.createElement('select');field.id=id;for(const [value,text] of options){const o=document.createElement('option');o.value=value;o.textContent=text;field.append(o);}field.addEventListener('change',load);wrap.append(field);tools.append(wrap);return field;}
  const period=select('report-period','Thời gian lịch hẹn',[['all','Toàn bộ'],['7','7 ngày gần nhất'],['30','30 ngày gần nhất'],['90','90 ngày gần nhất']]);
  const status=select('report-filter','Trạng thái',[['all','Tất cả'],['Pending','Chờ xác nhận'],['Confirmed','Đã xác nhận'],['Completed','Hoàn thành'],['Cancelled','Đã hủy']]);
  const exports=[];
  for(const kind of ['CSV','JSON','In báo cáo']){const b=document.createElement('button');b.type='button';b.textContent=kind;b.disabled=true;exports.push(b);tools.append(b);b.onclick=()=>{
    if(!reportReady||S.current()?.role!=='admin')return;
    if(kind==='In báo cáo'){window.print();return;}
    const safe=reportRows.map(a=>({date:a.date,status:a.status}));
    const csvCell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
    const data=kind==='JSON'?JSON.stringify({filters:{period:period.value,status:status.value},appointments:safe},null,2):'\uFEFFdate,status\r\n'+safe.map(a=>[a.date,a.status].map(csvCell).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([data],{type:kind==='JSON'?'application/json':'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='campusmind-report.'+kind.toLowerCase();a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };}
  $('work-status').before(tools);const count=document.createElement('p');count.id='report-count';count.setAttribute('role','status');tools.after(count);
  async function load(){
    const request=++version;reportReady=false;exports.forEach(b=>b.disabled=true);count.textContent='';$('work-status').textContent='Đang tải số liệu…';$('work-content').hidden=true;$('work-error').hidden=true;$('retry').hidden=true;
    try{
      await S.init();if(S.current()?.role!=='admin')throw Error('Cần đăng nhập demo bằng tài khoản quản trị.');const users=S.users().items;const catalog=await CampusMindServices.read();
      const work=JSON.parse(localStorage.getItem(S.KEY)||'{"appointments":[],"activity":[]}');
      if(!work||!Array.isArray(work.appointments)||!Array.isArray(work.activity)||!work.appointments.every(a=>a&&typeof a.id==='string'&&['Pending','Confirmed','Completed','Cancelled'].includes(a.status))||!work.activity.every(a=>a&&typeof a.text==='string'&&Number.isFinite(Date.parse(a.at))))throw Error('Dữ liệu lịch không hợp lệ.');
      if(request!==version)return;if(S.current()?.role!=='admin')throw Error('Phiên quản trị đã thay đổi.');
      const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
      const end=Date.parse(today+'T00:00:00Z'),start=end-(Number(period.value)-1)*86400000;
      reportRows=work.appointments.filter(a=>(status.value==='all'||a.status===status.value)&&(period.value==='all'||(Date.parse(a.date+'T00:00:00Z')>=start&&Date.parse(a.date+'T00:00:00Z')<=end)));
      count.textContent=reportRows.length?`${reportRows.length} lịch hẹn phù hợp · ${period.selectedOptions[0].text} · ${status.selectedOptions[0].text}`:'Không có lịch hẹn phù hợp. Chọn Toàn bộ hoặc mở rộng bộ lọc.';
      reportReady=true;exports.forEach(b=>b.disabled=false);
      $('services-count').textContent=catalog.items.filter(s=>s.status==='active').length;
      $('users-count').textContent=users.length;$('active-users-count').textContent=users.filter(u=>u.status==='active').length;
      $('pending-count').textContent=reportRows.filter(a=>a.status==='Pending').length;$('completed-count').textContent=reportRows.filter(a=>a.status==='Completed').length;
      $('activity').replaceChildren();
      for(const event of [...work.activity].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,10)){
        const item=document.createElement('li'),date=document.createElement('small'),p=document.createElement('p');date.className='meta';date.textContent=new Date(event.at).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});p.textContent=event.text;item.append(date,p);$('activity').append(item);
      }
      $('activity-empty').hidden=work.activity.length>0;$('work-content').hidden=false;$('work-status').textContent='Đã cập nhật số liệu trên trình duyệt này.';
    }catch(err){if(request!==version)return;$('work-error').textContent='Không thể đọc số liệu. '+err.message+' Dữ liệu hiện có được giữ nguyên.';$('work-error').hidden=false;$('retry').hidden=false;$('work-status').textContent='Chưa thể cập nhật số liệu.';}
  }
  $('refresh').addEventListener('click',load);$('retry').addEventListener('click',load);
  $('users-link').addEventListener('click',async e=>{
    e.preventDefault();try{if(S.current()?.role!=='admin')throw Error();const r=await fetch(e.currentTarget.href,{method:'HEAD',signal:AbortSignal.timeout(10000)});if(!r.ok||S.current()?.role!=='admin')throw Error();location.href='admin-user-management.html';}
    catch{$('users-help').textContent='Trang quản lý người dùng chưa sẵn sàng trong bản demo này. Hãy kiểm tra bản tích hợp hoặc kết nối rồi thử lại.';}
  });
  window.addEventListener('storage',e=>{if([CampusMindServices.key,S.USERS,S.KEY].includes(e.key)||e.key===null)load();});load();
})();
