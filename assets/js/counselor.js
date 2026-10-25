(() => {
  'use strict';
  const S=SV3Store, KEY=S.KEY, $=id=>document.getElementById(id);
  const labels={Pending:'Chờ xác nhận',Confirmed:'Đã xác nhận',Completed:'Hoàn thành',Cancelled:'Đã hủy'};
  const screen=$('main').dataset.screen;
  let state,revision,userRevision,counselorId,dirty=false,cancelling=null,busy=false,loadVersion=0;
  const day=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
  const time=s=>typeof s==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
  const text=(s,max)=>typeof s==='string'&&s.length<=max;
  const owns=row=>S.counselorOf(row)===counselorId;
  const element=(tag,content,cls)=>{const e=document.createElement(tag);e.textContent=content;if(cls)e.className=cls;return e;};
  const button=(label,handler)=>{const e=element('button',label);e.type='button';e.addEventListener('click',handler);return e;};
  function error(message){$('work-error').textContent=message;$('work-error').hidden=false;}
  function read(){
    const raw=localStorage.getItem(KEY),data=raw===null?S.initialSchedule():JSON.parse(raw);
    if(!data||!['slots','appointments','notes','activity'].every(k=>Array.isArray(data[k])))throw Error('Dữ liệu lịch không hợp lệ.');
    if(!data.slots.every(s=>s&&text(s.id,100)&&s.id&&day(s.date)&&time(s.start)&&time(s.end)&&s.end>s.start&&(s.counselorId===undefined||text(s.counselorId,100)))||
      !data.appointments.every(a=>a&&text(a.id,100)&&a.id&&text(a.studentName,150)&&day(a.date)&&time(a.time)&&Object.hasOwn(labels,a.status)&&(a.end===undefined||time(a.end))&&(a.counselorId===undefined||text(a.counselorId,100)))||
      !data.notes.every(n=>n&&text(n.appointmentId,100)&&text(n.content,5000)&&text(n.plan,3000)&&(n.summary===undefined||text(n.summary,3000)))||
      !data.activity.every(a=>a&&text(a.text,200)&&Number.isFinite(Date.parse(a.at))))throw Error('Dữ liệu lịch không hợp lệ.');
    for(const [key,field] of [['slots','id'],['appointments','id'],['notes','appointmentId']])if(new Set(data[key].map(x=>x[field])).size!==data[key].length)throw Error('Dữ liệu bị trùng mã.');
    return {data,raw};
  }
  async function save(change,message){
    if(busy)return false;busy=true;$('work-content').setAttribute('aria-busy','true');
    const controls=[...$('work-content').querySelectorAll('button,input,textarea,select')].map(control=>[control,control.disabled]);
    controls.forEach(([control])=>control.disabled=true);
    try{return await S.lock(()=>{
      if(localStorage.getItem(KEY)!==revision||S.users().raw!==userRevision)throw Error('Dữ liệu đã thay đổi ở tab khác. Nội dung đang nhập được giữ; tải lại trước khi lưu.');
      if(S.current()?.id!==counselorId||S.current()?.role!=='counselor')throw Error('Tài khoản chuyên viên không còn hoạt động.');
      const next=structuredClone(state);change(next);
      next.activity=[{text:message.slice(0,200),at:new Date().toISOString()},...next.activity].slice(0,100);
      const raw=JSON.stringify(next);localStorage.setItem(KEY,raw);state=next;revision=raw;
      window.CampusDemoSync?.announce(KEY);window.CampusDemoSync?.publish();
      $('work-error').hidden=true;$('work-status').textContent=message;return true;
    });}catch(err){error(err.message+' Thay đổi chưa được lưu.');return false;}
    finally{busy=false;controls.forEach(([control,disabled])=>control.disabled=disabled);$('work-content').setAttribute('aria-busy','false');}
  }
  function empty(container,message){container.append(element('p',message,'empty'));}
  function focusCard(id){const card=[...document.querySelectorAll('[data-appointment]')].find(c=>c.dataset.appointment===id);(card?.querySelector('button,a')||card||$('appointments')).focus();}
  function renderAppointments(){
    const list=$('appointments');if(!list)return;list.tabIndex=-1;list.replaceChildren();
    const query=$('search').value.trim().toLocaleLowerCase('vi');
    const rows=state.appointments.filter(a=>owns(a)&&(!$('date').value||a.date===$('date').value)&&`${a.id} ${a.studentName}`.toLocaleLowerCase('vi').includes(query)&&(!$('status-filter')||$('status-filter').value==='all'||a.status===$('status-filter').value)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    if($('status-filter')){
      let tabs=$('queue-tabs');if(!tabs){tabs=element('div','','queue-tabs');tabs.id='queue-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Nhóm lịch hẹn');$('status-filter').parentElement.before(tabs);}
      const base=state.appointments.filter(a=>owns(a)&&(!$('date').value||a.date===$('date').value)&&`${a.id} ${a.studentName}`.toLocaleLowerCase('vi').includes(query));
      tabs.replaceChildren(...[['all','Tất cả'],['Pending','Chờ xác nhận'],['Confirmed','Sắp tới'],['Completed','Hoàn thành']].map(([value,label])=>{const count=base.filter(a=>value==='all'||a.status===value).length;const b=button(`${label} (${count})`,()=>{$('status-filter').value=value;renderAppointments();$('queue-tabs').querySelector(`[data-status="${value}"]`)?.focus();});b.dataset.status=value;b.setAttribute('aria-pressed',String($('status-filter').value===value));return b;}));
    }
    if(!rows.length)empty(list,'Chưa có lịch hẹn phù hợp. Hãy xóa bộ lọc hoặc chờ sinh viên gửi yêu cầu đặt lịch.');
    for(const a of rows){
      const card=element('article','','panel');card.dataset.appointment=a.id;card.tabIndex=-1;
      const avatar=element('span',(a.studentName||'Sinh viên').trim().split(/\s+/).slice(-2).map(s=>s[0]).join(''),'avatar');avatar.setAttribute('aria-hidden','true');card.append(avatar);
      card.append(element('h3',a.studentName||a.id),element('p',`${a.date} · ${a.time} · ${a.id}`),element('span',labels[a.status],'badge'));
      card.append(element('p','Chủ đề: '+(typeof a.topic==='string'&&a.topic.trim()?a.topic:'Chưa cung cấp')));
      if(a.reason)card.append(element('p','Lý do đặt lịch: '+a.reason));
      const actions=element('div','','actions');
      if(screen==='counselor-schedule'){const link=element('a','Xem hàng đợi','button');link.href=`counselor-appointment-queue.html?date=${encodeURIComponent(a.date)}`;actions.append(link);}
      else{
        if(a.status==='Pending')actions.append(button('Xác nhận lịch',()=>transition(a.id,'Confirmed')));
        if(['Pending','Confirmed'].includes(a.status))actions.append(button('Hủy lịch',()=>{cancelling=a.id;$('cancel-dialog').returnValue='';$('cancel-dialog').showModal();}));
        if(['Confirmed','Completed'].includes(a.status)){const link=element('a','Ghi chú buổi gặp','button');link.href=`counselor-session-note.html?id=${encodeURIComponent(a.id)}`;actions.append(link);}
      }
      card.append(actions);list.append(card);
    }
  }
  async function transition(id,status){
    const ok=await save(next=>{const a=next.appointments.find(x=>x.id===id&&owns(x));if(!a||!['Pending','Confirmed'].includes(a.status)||(status==='Confirmed'&&a.status!=='Pending'))throw Error('Lịch không còn ở trạng thái phù hợp.');if(status==='Confirmed'){
      const slot=next.slots.find(s=>s.id===a.slotId&&S.counselorOf(s)===counselorId&&s.date===a.date&&s.start===a.time);
      if(!slot||slot.available===false||Date.parse(a.date+'T'+a.time+':00+07:00')<=Date.now())throw Error('Khung giờ không còn khả dụng.');
      const end=a.end||slot.end;
      if(next.appointments.some(x=>x.id!==a.id&&x.status!=='Cancelled'&&x.date===a.date&&(S.counselorOf(x)===counselorId||(a.studentId&&x.studentId===a.studentId))&&x.time<end&&(x.end||next.slots.find(s=>s.id===x.slotId)?.end||'23:59')>a.time))throw Error('Lịch hẹn bị trùng thời gian.');
    }a.status=status;a.updatedAt=new Date().toISOString();},`Lịch ${id}: ${labels[status]}`);
    if(ok){renderAppointments();focusCard(id);}
  }
  function occupied(s){return state.appointments.some(a=>S.counselorOf(a)===S.counselorOf(s)&&a.date===s.date&&a.time<s.end&&(a.end||state.slots.find(slot=>slot.id===a.slotId)?.end||'23:59')>s.start&&a.status!=='Cancelled');}
  let weekOffset=0;
  const vnToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  function renderWeek(){
    if(screen!=='counselor-schedule')return;
    let section=$('weekly-calendar');
    if(!section){section=element('section','','panel');section.id='weekly-calendar';$('slot-form').closest('section').before(section);}
    section.replaceChildren();section.append(element('h2','Lịch làm việc theo tuần'));
    const monday=new Date(vnToday()+'T00:00:00Z');monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7+weekOffset*7);
    const days=Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setUTCDate(d.getUTCDate()+i);return d.toISOString().slice(0,10);});
    const controls=element('div','','actions');
    controls.append(button('Tuần trước',()=>{weekOffset--;renderWeek();}),element('strong',days[0]+' — '+days[6]),button('Tuần sau',()=>{weekOffset++;renderWeek();}),button('Tuần hiện tại',()=>{weekOffset=0;renderWeek();}));section.append(controls);
    section.append(element('p','Giờ Việt Nam (UTC+7). Chọn ô còn trống/nghỉ để đổi lịch tiếp nhận; ô đã có lịch hẹn mở hàng đợi. Khung giờ đã qua không chỉnh sửa.'));
    const wrapper=element('div','','week-scroll');wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label','Lịch tuần, cuộn ngang để xem đủ bảy ngày');
    const table=element('table','','week-table'),caption=element('caption','Lịch tuần từ '+days[0]+' đến '+days[6]);table.append(caption);
    const head=element('thead',''),header=element('tr','');const timeHead=element('th','Giờ');timeHead.scope='col';header.append(timeHead);
    days.forEach((date,i)=>{const th=element('th',(i===6?'Chủ nhật':'Thứ '+(i+2))+' '+date.slice(8)+'/'+date.slice(5,7));th.scope='col';header.append(th);});head.append(header);table.append(head);
    const body=element('tbody','');
    for(const start of ['08:00','09:00','10:00','13:30','14:30','15:30','19:00']){
      const end=String(Number(start.slice(0,2))+1).padStart(2,'0')+start.slice(2),row=element('tr',''),th=element('th',start);th.scope='row';row.append(th);
      for(const date of days){
        const cell=element('td',''),slot=state.slots.find(s=>owns(s)&&s.date===date&&s.start<end&&s.end>start);
        const booked=occupied({counselorId,date,start,end}),past=Date.parse(date+'T'+start+':00+07:00')<=Date.now();
        const available=slot&&slot.available!==false,label=booked?'Đã có lịch hẹn':available?'Còn trống':'Nghỉ';
        const action=button(label,async()=>{
          if(booked){location.href='counselor-appointment-queue.html?date='+encodeURIComponent(date);return;}
          const ok=await save(next=>{
            if(Date.parse(date+'T'+start+':00+07:00')<=Date.now())throw Error('Khung giờ đã qua.');
            if(slot){const target=next.slots.find(s=>s.id===slot.id&&owns(s));if(!target||occupied(target))throw Error('Khung giờ đã có lịch hẹn.');target.available=!available;}
            else next.slots.push({id:crypto.randomUUID(),counselorId,date,start,end,available:true});
          },`${date} ${slot?slot.start+'–'+slot.end:start+'–'+end}: ${available?'Đã chuyển sang nghỉ':'Đã mở lịch tiếp nhận'}`);
          if(ok){renderSlots();$('weekly-calendar').querySelector(`[data-cell="${date}-${start}"]`)?.focus();}
        });action.dataset.cell=date+'-'+start;action.className='week-cell '+(booked?'booked':available?'available':'rest');action.disabled=past&&!booked;
        action.setAttribute('aria-label',`${date} ${start}–${end}: ${label}${past?' · Đã qua':''}${slot?' · Khung thực tế '+slot.start+'–'+slot.end:''}`);
        cell.append(action);if(past)cell.append(element('small','Đã qua'));row.append(cell);
      }body.append(row);
    }table.append(body);wrapper.append(table);section.append(wrapper);
  }
  function renderSlots(){
    renderWeek();
    if(!$('slots'))return;const list=$('slots');list.replaceChildren();list.tabIndex=-1;
    const rows=state.slots.filter(owns).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
    if(!rows.length)empty(list,'Chưa có khung giờ tiếp nhận. Dùng biểu mẫu Thêm khung giờ phía trên để mở lịch.');
    for(const s of rows){const card=element('article','','panel');card.append(element('h3',`${s.date} · ${s.start}–${s.end}`));
      const remove=button('Xóa khung giờ',async()=>{if(occupied(s))return;const ok=await save(next=>{next.slots=next.slots.filter(x=>x.id!==s.id||!owns(x));},'Đã xóa khung giờ tiếp nhận');if(ok){renderSlots();(list.querySelector('button')||list).focus();}});
      remove.disabled=occupied(s);card.append(element('p',s.available===false?'Không tiếp nhận đặt lịch':Date.parse(s.date+'T'+s.start+':00+07:00')<=Date.now()?'Khung giờ đã qua':remove.disabled?'Đã có lịch hẹn':'Có thể đặt lịch'));card.append(remove);if(remove.disabled)card.append(element('p','Khung giờ có lịch hẹn nên không thể xóa.'));list.append(card);
    }
  }
  function noteAppointment(){const id=new URLSearchParams(location.search).get('id');return state?.appointments.find(x=>x.id===id&&owns(x));}
  function renderNote(){
    if(!$('note-context'))return;const a=noteAppointment();$('note-context').replaceChildren();$('note-form').hidden=true;
    if(!a){empty($('note-context'),'Không tìm thấy lịch hẹn của chuyên viên đang chọn. Hãy chọn lịch trong hàng đợi.');return;}
    $('note-context').append(element('h2',a.studentName||a.id),element('p',`${a.date} · ${a.time} · ${labels[a.status]}`));
    if(!['Confirmed','Completed'].includes(a.status)){empty($('note-context'),'Cần xác nhận lịch trước khi ghi chú.');return;}
    const note=state.notes.find(n=>n.appointmentId===a.id);$('note-content').value=note?.content||'';$('note-plan').value=note?.plan||'';$('note-summary').value=note?.summary||'';
    $('note-form').hidden=false;$('complete').disabled=a.status==='Completed';$('complete').textContent=a.status==='Completed'?'Buổi gặp đã hoàn thành':'Hoàn thành buổi gặp';
    window.dispatchEvent(new Event('campusmind:note-loaded'));
  }
  async function saveNote(complete){
    const a=noteAppointment();if(!a||!['Confirmed','Completed'].includes(a.status)||!$('note-form').reportValidity())return;
    const content=$('note-content').value.trim();if(!content){error('Nội dung ghi chú không được để trống.');$('note-content').focus();return;}
    const plan=$('note-plan').value.trim(),summary=$('note-summary').value.trim();
    const ok=await save(next=>{const old=next.notes.find(n=>n.appointmentId===a.id)||{};const note={...old,appointmentId:a.id,content,plan,summary,updatedAt:new Date().toISOString()};next.notes=next.notes.filter(n=>n.appointmentId!==a.id);next.notes.push(note);if(complete){const appointment=next.appointments.find(x=>x.id===a.id);appointment.status='Completed';appointment.updatedAt=new Date().toISOString();}},complete?`Đã hoàn thành lịch ${a.id}`:`Đã lưu ghi chú lịch ${a.id}`);
    if(ok){dirty=false;$('note-saved').textContent='Đã lưu ghi chú và tóm tắt lúc '+new Date().toLocaleTimeString('vi-VN');renderNote();}
  }
  function buildSelector(){
    if (['counselor-schedule', 'counselor-appointment-queue'].includes(document.querySelector('main')?.dataset.screen)) return;
    if($('counselor-account'))return;
    const box=element('section','','panel'),label=element('p','Chuyên viên đang làm việc'),name=element('strong','');
    name.id='counselor-account';const link=element('a','Đổi tài khoản tại trang đăng nhập');link.href=new URL(document.body.dataset.loginRoute||'login.html',S.root).href;
    box.append(label,name,element('br',''),link);$('work-content').prepend(box);
  }
  async function load(){
    const version=++loadVersion;$('work-content').hidden=true;$('retry').hidden=true;$('work-error').hidden=true;$('work-status').textContent='Đang tải dữ liệu…';
    try{await S.init();if(version!==loadVersion)return;const users=S.users();userRevision=users.raw;
      const active=S.current();
      if(active?.role!=='counselor')throw Error('Cần đăng nhập bằng tài khoản chuyên viên.');
      counselorId=active.id;
      const result=read();state=result.data;revision=result.raw;buildSelector();if($('counselor-account'))$('counselor-account').textContent=active.name;
      renderAppointments();renderSlots();renderNote();$('work-content').hidden=false;$('work-status').textContent='Dữ liệu đã sẵn sàng. Giờ Việt Nam (UTC+7).';
    }catch(err){if(version!==loadVersion)return;error(err.message+' Dữ liệu hiện có được giữ nguyên.');$('retry').hidden=false;$('work-status').textContent='Tải dữ liệu thất bại.';}
  }
  ['search','date','status-filter'].forEach(id=>$(id)?.addEventListener('input',renderAppointments));
  $('clear')?.addEventListener('click',()=>{$('search').value='';$('date').value='';if($('status-filter'))$('status-filter').value='all';renderAppointments();});
  const dateParam=new URLSearchParams(location.search).get('date');if($('date')&&day(dateParam))$('date').value=dateParam;
  $('slot-form')?.addEventListener('submit',async e=>{e.preventDefault();const date=$('slot-date').value,start=$('slot-start').value,end=$('slot-end').value;$('slot-error').textContent='';
    if(!day(date)||!time(start)||!time(end)||end<=start||Date.parse(`${date}T${start}:00+07:00`)<=Date.now()){$('slot-error').textContent='Chọn thời gian trong tương lai; giờ kết thúc phải sau giờ bắt đầu (UTC+7).';$('slot-date').focus();return;}
    if(state.slots.some(s=>owns(s)&&s.date===date&&start<s.end&&end>s.start)||state.appointments.some(a=>owns(a)&&a.status!=='Cancelled'&&a.date===date&&a.time<end&&(a.end||state.slots.find(s=>s.id===a.slotId)?.end||'23:59')>start)){$('slot-error').textContent='Khung giờ trùng với thời gian đã có của chuyên viên này.';return;}
    if(await save(next=>next.slots.push({id:crypto.randomUUID(),counselorId,date,start,end}),'Đã thêm khung giờ tiếp nhận')){renderSlots();$('slot-form').reset();$('slot-date').focus();}
  });
  $('cancel-dialog')?.addEventListener('close',()=>{const id=cancelling;cancelling=null;if($('cancel-dialog').returnValue==='confirm')transition(id,'Cancelled');});
  $('note-form')?.addEventListener('input',()=>dirty=true);$('note-form')?.addEventListener('submit',e=>{e.preventDefault();saveNote(false);});$('complete')?.addEventListener('click',()=>saveNote(true));
  $('note-discard')?.addEventListener('click',()=>$('discard-dialog').showModal());
  $('discard-dialog')?.addEventListener('close',()=>{if($('discard-dialog').returnValue==='discard'){dirty=false;load();}});
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  window.addEventListener('storage',e=>{if([KEY,S.USERS].includes(e.key)||e.key===null){if(dirty||busy)error('Dữ liệu đã thay đổi ở tab khác. Nội dung đang nhập được giữ; lưu bản nháp riêng hoặc bỏ thay đổi để tải lại.');else load();}});
  $('retry').addEventListener('click',load);load();
})();
