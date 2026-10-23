
(() => { 
  'use strict';
  const KEY = 'campusmind.counselor.v1', USERS = 'campusmind.sv2.users.v1';
  const SESSION = 'campusmind.sv2.student.session.v1';
  const dataURL = new URL('../data/', document.currentScript.src);
  const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
  const roles = ['student', 'counselor', 'admin'];
  let config, directory;
  const fail = message => { throw new Error(message); };
  const text = (v, max = 200) => typeof v === 'string' && v.length > 0 && v.length <= max;
  const dateOK = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v;
  const timeOK = v => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  const today = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const future = (date, time) => Date.parse(`${date}T${time}:00+07:00`) > Date.now();
  const unique = rows => new Set(rows.map(x => x.id)).size === rows.length;
  const studentId = () => sessionStorage.getItem(SESSION) || config.studentId;
  async function getJSON(file) {
    const r=await fetch(new URL(file,dataURL),{cache:'no-cache'});
    if(!r.ok)fail('Không tải được JSON ('+r.status+'). Hãy chạy bằng máy chủ HTTP và thử lại.');
    return r.json();
  }
  function readUsers() {
    const raw=localStorage.getItem(USERS);
    const users=raw===null?structuredClone(config.users):JSON.parse(raw);
    validateUsers(users);return {users,raw};
  }
  async function initRegistration() {
    config=await getJSON('sv2.json');
    if(config.version!==1)fail('Cấu hình demo không hợp lệ.');
    validateUsers(config.users);return readUsers();
  }
  async function register({name,email}) {
    name=typeof name==='string'?name.trim().replace(/\s+/g,' '):'';
    email=typeof email==='string'?email.trim().toLowerCase():'';
    if(name.length<2||name.length>150)fail('Họ tên cần từ 2 đến 150 ký tự.');
    if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail('Địa chỉ email không hợp lệ.');
    const task=()=>{
      const {users,raw}=readUsers();
      if(users.some(u=>u.email.toLowerCase()===email)){
        const err=new Error('Email đã được sử dụng. Hãy nhập email khác.');err.field='email';throw err;
      }
      const user={id:crypto.randomUUID(),name,email,role:'student',status:'active'};
      users.push(user);validateUsers(users);
      if(localStorage.getItem(USERS)!==raw)fail('Dữ liệu vừa thay đổi. Vui lòng thử lại.');
      localStorage.setItem(USERS,JSON.stringify(users));return user;
    };
    return navigator.locks?navigator.locks.request('campusmind.sv2.write',task):task();
  }
  function enterStudentDemo(id) {
    if(!readUsers().users.some(u=>u.id===id&&u.role==='student'&&u.status==='active'))fail('Tài khoản không còn hoạt động.');
    sessionStorage.setItem(SESSION,id);
  }
  function validateUsers(users) {
    if (!Array.isArray(users) || !unique(users) || !users.every(u => text(u.id,100) && text(u.name,150) && text(u.email,254) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email) && roles.includes(u.role) && ['active','disabled'].includes(u.status)) || new Set(users.map(u=>u.email.toLowerCase())).size!==users.length) fail('Dữ liệu người dùng không hợp lệ. Dữ liệu gốc được giữ nguyên.');
  }
  function validateSchedule(s) {
    if (!s || !['slots','appointments','notes','activity'].every(k=>Array.isArray(s[k])) || !unique(s.slots) || !unique(s.appointments) ||
      !s.slots.every(x=>text(x.id,100)&&dateOK(x.date)&&timeOK(x.start)&&timeOK(x.end)&&x.end>x.start&&(!x.counselorId||text(x.counselorId,100))) ||
      !s.appointments.every(x=>text(x.id,100)&&text(x.studentName,150)&&dateOK(x.date)&&timeOK(x.time)&&statuses.includes(x.status)&&(!x.end||timeOK(x.end))&&(x.reason===undefined||text(x.reason,500))) ||
      !s.notes.every(x=>typeof x.appointmentId==='string'&&typeof x.content==='string'&&typeof x.plan==='string') ||
      !s.activity.every(x=>text(x.text,200)&&Number.isFinite(Date.parse(x.at)))) fail('Dữ liệu lịch hẹn không hợp lệ. Không tự xóa hoặc đặt lại dữ liệu.');
  }
  function mockSchedule() {
    const slots=[];
    for(let offset=0;offset<config.horizonDays;offset++) {
      const d=new Date(today()+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+offset);
      for(const rule of config.weeklySlots.filter(r=>r.weekday===d.getUTCDay())) {
        const date=d.toISOString().slice(0,10);
        slots.push({id:`demo-${rule.counselorId}-${date}-${rule.start}`,date,start:rule.start,end:rule.end,counselorId:rule.counselorId,source:'sv2-mock'});
      }
    }
    return {slots,appointments:[],notes:[],activity:[]};
  }
  function read() {
    const raw=localStorage.getItem(KEY), userRaw=localStorage.getItem(USERS);
    const schedule=raw===null?mockSchedule():JSON.parse(raw), users=userRaw===null?structuredClone(config.users):JSON.parse(userRaw);
    validateSchedule(schedule);validateUsers(users);
    return {schedule,users,raw,userRaw};
  }
  async function init() {
    [config,directory]=await Promise.all([getJSON('sv2.json'),getJSON('visitor.json')]);
    if(config.version!==1||!Number.isInteger(config.horizonDays)||config.horizonDays<1||config.horizonDays>90||!Array.isArray(config.weeklySlots)||!Array.isArray(directory.counselors)||!Array.isArray(directory.resources))fail('Cấu hình demo không hợp lệ.');
    validateUsers(config.users);
    if(!config.weeklySlots.every(r=>directory.counselors.some(c=>c.id===r.counselorId)&&Number.isInteger(r.weekday)&&r.weekday>=0&&r.weekday<=6&&timeOK(r.start)&&timeOK(r.end)&&r.start<r.end))fail('Khung giờ JSON không hợp lệ.');
    return read();
  }
  const counselorOf = s => s.counselorId || config.legacyCounselorId;
  const active = (users,id,role) => users.some(u=>u.id===id&&u.role===role&&u.status==='active');
  function available(state,slot,ignoreId) {
    if(!future(slot.date,slot.start)||slot.available===false||!active(state.users,counselorOf(slot),'counselor'))return false;
    return !state.schedule.appointments.some(a=>a.id!==ignoreId&&a.status!=='Cancelled'&&a.date===slot.date&&(counselorOf(a)===counselorOf(slot)||a.studentId===studentId())&&a.time<slot.end&&(a.end||state.schedule.slots.find(s=>s.id===a.slotId)?.end||'23:59')>slot.start);
  }
  // Web Lock serializes SV2 tabs; revision comparison also detects writes from SV3.
  async function mutate(snapshot,kind,change,message) {
    const task=()=>{
      if(localStorage.getItem(KEY)!==snapshot.raw||localStorage.getItem(USERS)!==snapshot.userRaw)fail('Dữ liệu đã thay đổi ở tab khác. Đóng hộp thoại, tải lại trang và thử lại.');
      const state=read();change(state);
      if(kind==='schedule'){
        state.schedule.activity.unshift({text:message.slice(0,200),at:new Date().toISOString()});state.schedule.activity=state.schedule.activity.slice(0,100);
        validateSchedule(state.schedule);localStorage.setItem(KEY,JSON.stringify(state.schedule));
      }else{validateUsers(state.users);localStorage.setItem(USERS,JSON.stringify(state.users));}
      return read();
    };
    return navigator.locks?navigator.locks.request('campusmind.sv2.write',task):task();
  }
  async function book(snapshot,slotId,editId,reason) {
    if(typeof reason!=='string'||reason.trim().length<5||reason.trim().length>500)fail('Lý do đặt lịch cần từ 5 đến 500 ký tự.');
    return mutate(snapshot,'schedule',state=>{
      if(!active(state.users,studentId(),'student'))fail('Tài khoản sinh viên không hoạt động hoặc đã đổi vai trò.');
      const slot=state.schedule.slots.find(s=>s.id===slotId);
      const old=editId?state.schedule.appointments.find(a=>a.id===editId&&a.studentId===studentId()):null;
      if(editId&&(!old||!['Pending','Confirmed'].includes(old.status)||!future(old.date,old.time)))fail('Lịch này không thể đổi.');
      if(!slot||!available(state,slot,editId))fail('Khung giờ không còn khả dụng. Vui lòng chọn lại.');
      if(old&&old.slotId===slot.id)fail('Hãy chọn một khung giờ khác lịch hiện tại.');
      const a={...(old||{}),id:old?.id||crypto.randomUUID(),studentId:studentId(),studentName:state.users.find(u=>u.id===studentId()).name,counselorId:counselorOf(slot),slotId:slot.id,date:slot.date,time:slot.start,end:slot.end,reason:reason.trim(),status:'Pending',updatedAt:new Date().toISOString()};
      if(old)state.schedule.appointments[state.schedule.appointments.indexOf(old)]=a;else state.schedule.appointments.push(a);
    },editId?'Sinh viên đã đổi lịch hẹn':'Sinh viên đã đặt lịch hẹn');
  }
  const cancel=(snapshot,id)=>mutate(snapshot,'schedule',state=>{
    if(!active(state.users,studentId(),'student'))fail('Tài khoản sinh viên không hoạt động.');
    const a=state.schedule.appointments.find(a=>a.id===id&&a.studentId===studentId());
    if(!a||!['Pending','Confirmed'].includes(a.status)||!future(a.date,a.time))fail('Không thể hủy lịch này.');a.status='Cancelled';a.updatedAt=new Date().toISOString();
  },'Sinh viên đã hủy lịch hẹn');
  const createUser=(snapshot,fields)=>mutate(snapshot,'users',state=>{
    if(!active(state.users,config.adminId,'admin'))fail('Tài khoản quản trị không hoạt động.');
    const user={id:crypto.randomUUID(),name:String(fields.name||'').trim(),email:String(fields.email||'').trim().toLowerCase(),role:fields.role,status:'active'};
    if(state.users.some(u=>u.email.toLowerCase()===user.email))fail('Email đã được sử dụng bởi người dùng khác.');
    state.users.push(user);validateUsers(state.users);
  },'Đã thêm người dùng');
  const updateUser=(snapshot,id,patch)=>mutate(snapshot,'users',state=>{
    if(!active(state.users,config.adminId,'admin'))fail('Tài khoản quản trị không hoạt động.');
    const user=state.users.find(u=>u.id===id);if(!user)fail('Không tìm thấy người dùng.');
    const next={...user,...patch};next.name=next.name.trim();next.email=next.email.trim().toLowerCase();
    if(id===config.adminId&&(next.role!=='admin'||next.status!=='active'))fail('Không thể vô hiệu hóa hoặc đổi vai trò tài khoản quản trị đang dùng.');
    if(user.role==='admin'&&user.status==='active'&&(next.role!=='admin'||next.status!=='active')&&state.users.filter(u=>u.role==='admin'&&u.status==='active').length<=1)fail('Cần giữ ít nhất một quản trị viên hoạt động.');
    if(state.users.some(u=>u.id!==id&&u.email.toLowerCase()===next.email))fail('Email đã được sử dụng bởi người dùng khác.');
    if(!next.name)fail('Họ tên không được chỉ chứa khoảng trắng.');
    Object.assign(user,next);validateUsers(state.users);
  },'Cập nhật người dùng');
  window.SV2Store={KEY,USERS,SESSION,init,initRegistration,register,enterStudentDemo,read,book,cancel,createUser,updateUser,available,counselorOf,today,future,get studentId(){return studentId();},get config(){return config;},get directory(){return directory;}};
})();
