(() => {
  'use strict';
  const KEY = 'campusmind.counselor.v1';
  const $ = id => document.getElementById(id);
  const labels = {Pending:'Chờ xác nhận', Confirmed:'Đã xác nhận', Completed:'Hoàn thành', Cancelled:'Đã hủy'};
  const screen = $('main').dataset.screen;
  let state, revision, dirty = false, cancelling = null;
  const today = () => {const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const day = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;
  const time = s => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  const text = (s,max) => typeof s === 'string' && s.length <= max;
  function read() {
    const raw = localStorage.getItem(KEY);
    const data = raw === null ? {slots:[],appointments:[],notes:[],activity:[]} : JSON.parse(raw);
    if (!data || !['slots','appointments','notes','activity'].every(k => Array.isArray(data[k]))) throw Error('shape');
    if (!data.slots.every(s => text(s.id,100) && s.id && day(s.date) && time(s.start) && time(s.end) && s.end>s.start) ||
        !data.appointments.every(a => text(a.id,100) && a.id && text(a.studentName,150) && day(a.date) && time(a.time) && Object.hasOwn(labels,a.status)) ||
        !data.notes.every(n => text(n.appointmentId,100) && text(n.content,5000) && text(n.plan,3000)) ||
        !data.activity.every(a => text(a.text,200) && typeof a.at==='string' && Number.isFinite(Date.parse(a.at)))) throw Error('invalid');
    for(const k of ['slots','appointments']) if(new Set(data[k].map(x=>x.id)).size!==data[k].length) throw Error('duplicate');
    if(new Set(data.notes.map(x=>x.appointmentId)).size!==data.notes.length) throw Error('duplicate note');
    return {data,raw};
  }
  function error(message){$('work-error').textContent=message;$('work-error').hidden=false;}
  function save(next,message){
    try {
      if(localStorage.getItem(KEY)!==revision) {error('Dữ liệu đã thay đổi ở cửa sổ khác. Tải lại trang để cập nhật trước khi lưu. Nội dung đang nhập vẫn được giữ.');return false;}
      next.activity=[{text:message,at:new Date().toISOString()},...next.activity].slice(0,100);
      const raw=JSON.stringify(next);localStorage.setItem(KEY,raw);state=next;revision=raw;
      $('work-error').hidden=true;$('work-status').textContent=message;return true;
    } catch {error('Không thể lưu dữ liệu. Kiểm tra quyền hoặc dung lượng trình duyệt rồi thử lại. Nội dung đang nhập vẫn được giữ.');return false;}
  }
  function element(tag,content,className){const e=document.createElement(tag);e.textContent=content;if(className)e.className=className;return e;}
  function button(label,handler){const e=element('button',label);e.type='button';e.addEventListener('click',handler);return e;}
  function empty(container,message){container.append(element('p',message,'empty'));}
  function renderAppointments(){
    const list=$('appointments');if(!list)return;list.replaceChildren();
    const query=$('search').value.trim().toLocaleLowerCase('vi');
    const filtered=state.appointments.filter(a=>(!$('date').value||a.date===$('date').value)&&`${a.id} ${a.studentName}`.toLocaleLowerCase('vi').includes(query)&&(!$('status-filter')||$('status-filter').value==='all'||a.status===$('status-filter').value)).sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    if(!filtered.length)empty(list,state.appointments.length?'Không có lịch hẹn phù hợp bộ lọc.':'Chưa có lịch hẹn. Các yêu cầu đặt lịch được tích hợp từ phân hệ Sinh viên.');
    for(const a of filtered){
      const card=element('article','','panel');card.append(element('h3',a.studentName||a.id),element('p',`${a.date} · ${a.time} · ${a.id}`),element('span',labels[a.status],'badge'));
      const actions=element('div','','actions');
      if(screen==='counselor-schedule'){const link=element('a','Xem hàng đợi','button');link.href=`counselor-appointment-queue.html?date=${encodeURIComponent(a.date)}`;actions.append(link);}
      else {
        if(a.status==='Pending')actions.append(button('Xác nhận lịch',()=>transition(a.id,'Confirmed')));
        if(['Pending','Confirmed'].includes(a.status))actions.append(button('Hủy lịch',()=>{cancelling=a.id;$('cancel-dialog').showModal();}));
        if(['Confirmed','Completed'].includes(a.status)){const link=element('a','Ghi chú buổi gặp','button');link.href=`counselor-session-note.html?id=${encodeURIComponent(a.id)}`;actions.append(link);}
      }
      card.append(actions);list.append(card);
    }
  }
  function transition(id,status){const next=structuredClone(state);const a=next.appointments.find(x=>x.id===id);if(!a)return;if(status==='Confirmed'&&a.status!=='Pending')return;if(status==='Cancelled'&&!['Pending','Confirmed'].includes(a.status))return;a.status=status;if(save(next,`Lịch ${id}: ${labels[status]}`))renderAppointments();}
  function renderSlots(){if(!$('slots'))return;$('slots').replaceChildren();if(!state.slots.length)empty($('slots'),'Chưa có khung giờ tiếp nhận.');
    for(const s of [...state.slots].sort((a,b)=>`${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`))){const card=element('article','','panel');card.append(element('h3',`${s.date} · ${s.start}–${s.end}`));
      const occupied=state.appointments.some(a=>a.date===s.date&&a.time>=s.start&&a.time<s.end&&a.status!=='Cancelled');
      const remove=button('Xóa khung giờ',()=>{const next=structuredClone(state);next.slots=next.slots.filter(x=>x.id!==s.id);if(save(next,'Đã xóa khung giờ tiếp nhận'))renderSlots();});remove.disabled=occupied;card.append(remove);if(occupied)card.append(element('p','Khung giờ có lịch hẹn nên không thể xóa.'));$('slots').append(card);
    }
  }
  function renderNote(){if(!$('note-context'))return;const id=new URLSearchParams(location.search).get('id');const a=state.appointments.find(x=>x.id===id);$('note-context').replaceChildren();$('note-form').hidden=true;
    if(!a){empty($('note-context'),'Không tìm thấy lịch hẹn. Hãy chọn một lịch trong hàng đợi.');return;}
    $('note-context').append(element('h2',a.studentName||a.id),element('p',`${a.date} · ${a.time} · ${labels[a.status]}`));
    if(!['Confirmed','Completed'].includes(a.status)){empty($('note-context'),'Lịch hẹn cần được xác nhận trước khi ghi chú.');return;}
    const note=state.notes.find(x=>x.appointmentId===id);$('note-content').value=note?.content||'';$('note-plan').value=note?.plan||'';$('note-form').hidden=false;
    $('complete').disabled=a.status==='Completed';$('complete').textContent=a.status==='Completed'?'Buổi gặp đã hoàn thành':'Hoàn thành buổi gặp';
  }
  function saveNote(complete){const id=new URLSearchParams(location.search).get('id');const a=state.appointments.find(x=>x.id===id);if(!a||!['Confirmed','Completed'].includes(a.status))return;
    if(!$('note-form').reportValidity())return;const content=$('note-content').value.trim();if(!content){error('Nội dung ghi chú không được để trống.');$('note-content').focus();return;}
    const next=structuredClone(state);const note={appointmentId:id,content,plan:$('note-plan').value.trim(),updatedAt:new Date().toISOString()};next.notes=next.notes.filter(x=>x.appointmentId!==id);next.notes.push(note);
    if(complete)next.appointments.find(x=>x.id===id).status='Completed';
    if(save(next,complete?`Đã hoàn thành lịch ${id}`:`Đã lưu ghi chú lịch ${id}`)){dirty=false;$('note-saved').textContent='Đã lưu lúc '+new Date().toLocaleTimeString('vi-VN');renderNote();}
  }
  async function load(){ $('work-content').hidden=true;$('retry').hidden=true;$('work-error').hidden=true;$('work-status').textContent='Đang tải dữ liệu…';await new Promise(r=>requestAnimationFrame(r));
    try {const result=read();state=result.data;revision=result.raw;renderAppointments();renderSlots();renderNote();$('work-content').hidden=false;$('work-status').textContent='Dữ liệu đã sẵn sàng.';}
    catch {error('Không đọc được dữ liệu lưu trữ. Dữ liệu hiện có được giữ nguyên; kiểm tra dữ liệu hoặc quyền truy cập rồi thử lại.');$('retry').hidden=false;$('work-status').textContent='Tải dữ liệu thất bại.';}
  }
  ['search','date','status-filter'].forEach(id=>$(id)?.addEventListener('input',renderAppointments));
  $('clear')?.addEventListener('click',()=>{$('search').value='';$('date').value='';if($('status-filter'))$('status-filter').value='all';renderAppointments();});
  const dateParam=new URLSearchParams(location.search).get('date');if($('date')&&day(dateParam))$('date').value=dateParam;
  $('slot-form')?.addEventListener('submit',e=>{e.preventDefault();const date=$('slot-date').value,start=$('slot-start').value,end=$('slot-end').value;
    $('slot-error').textContent='';if(!day(date)||date<today()||!time(start)||!time(end)||end<=start||new Date(`${date}T${start}`)<=new Date()){$('slot-error').textContent='Chọn thời gian trong tương lai; giờ kết thúc phải sau giờ bắt đầu.';return;}
    if(state.slots.some(s=>s.date===date&&start<s.end&&end>s.start)){$('slot-error').textContent='Khung giờ trùng với thời gian đã có.';return;}
    const next=structuredClone(state);next.slots.push({id:crypto.randomUUID(),date,start,end});if(save(next,'Đã thêm khung giờ tiếp nhận')){renderSlots();$('slot-form').reset();}
  });
  $('cancel-dialog')?.addEventListener('close',()=>{if($('cancel-dialog').returnValue==='confirm')transition(cancelling,'Cancelled');cancelling=null;});
  $('note-form')?.addEventListener('input',()=>dirty=true);$('note-form')?.addEventListener('submit',e=>{e.preventDefault();saveNote(false);});$('complete')?.addEventListener('click',()=>saveNote(true));
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  window.addEventListener('storage',e=>{if(e.key===KEY){if(dirty)error('Dữ liệu đã thay đổi ở cửa sổ khác. Hãy giữ lại nội dung đang nhập trước khi tải lại.');else load();}});
  $('retry').addEventListener('click',load);load();
})();
