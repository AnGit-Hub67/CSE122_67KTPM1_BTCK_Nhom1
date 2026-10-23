/* Shared SV3 adapter. Preserve the SV2 users/schedule contract and write lock. */
(() => {
  'use strict';
  const USERS='campusmind.sv2.users.v1', KEY='campusmind.counselor.v1', SESSION='campusmind.session.v1';
  const root=new URL('../../',document.currentScript.src);
  let seeds,config,legacy='minh-anh';
  const text=(v,max)=>typeof v==='string'&&v.length>0&&v.length<=max;
  function validateUsers(rows){
    if(!Array.isArray(rows)||new Set(rows.map(u=>u?.id)).size!==rows.length||!rows.every(u=>u&&text(u.id,100)&&text(u.name,150)&&text(u.email,254)&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email)&&['student','counselor','admin'].includes(u.role)&&['active','disabled'].includes(u.status))||new Set(rows.map(u=>u.email.toLowerCase())).size!==rows.length)throw Error('Dữ liệu người dùng không hợp lệ; dữ liệu gốc được giữ nguyên.');
    return rows;
  }
  async function init(){
    let r=await fetch(new URL('assets/data/sv2.json',root),{signal:AbortSignal.timeout(10000)});
    if(r.status===404)r=await fetch(new URL('assets/data/login-demo.json',root),{signal:AbortSignal.timeout(10000)});
    if(!r.ok)throw Error('Không tải được dữ liệu người dùng.');
    config=await r.json();seeds=validateUsers(config.users);legacy=config.legacyCounselorId||'minh-anh';return users();
  }
  function users(){const raw=localStorage.getItem(USERS);return {raw,items:validateUsers(raw===null?structuredClone(seeds):JSON.parse(raw))};}
  function current(){
    const raw=sessionStorage.getItem(SESSION);const session=raw===null?null:JSON.parse(raw);
    const student=sessionStorage.getItem('campusmind.sv2.student.session.v1');
    // Registration can establish a newer student session without modifying the SV1 key.
    const id=session?.role==='student'&&student?student:session?.id||student;
    return users().items.find(u=>u.id===id&&u.status==='active'&&(!session||u.role===session.role))||null;
  }
  const lock=fn=>navigator.locks?navigator.locks.request('campusmind.sv2.write',fn):Promise.resolve().then(fn);
  async function updateProfile(snapshot,id,fields){return lock(()=>{
    const now=users();if(now.raw!==snapshot)throw Error('Hồ sơ đã thay đổi ở tab khác. Hãy tải lại trước khi lưu.');
    const user=current();if(!user||user.id!==id)throw Error('Phiên demo hoặc tài khoản không còn hoạt động.');
    const name=fields.name.trim().replace(/\s+/g,' '),email=fields.email.trim().toLowerCase();
    if(name.length<2||name.length>150)throw Error('Họ tên cần 2–150 ký tự.');
    if(now.items.some(u=>u.id!==id&&u.email.toLowerCase()===email))throw Error('Email đã được sử dụng.');
    const item=now.items.find(u=>u.id===id);Object.assign(item,{name,email});validateUsers(now.items);
    localStorage.setItem(USERS,JSON.stringify(now.items));return users();
  });}
  function initialSchedule(){
    const slots=[];
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    if(config.weeklySlots){
      if(!Array.isArray(config.weeklySlots)||!Number.isInteger(config.horizonDays)||config.horizonDays<1||config.horizonDays>90)throw Error('Cấu hình lịch không hợp lệ.');
      for(let offset=0;offset<config.horizonDays;offset++){
        const d=new Date(today+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+offset);
        for(const rule of config.weeklySlots.filter(r=>r.weekday===d.getUTCDay())){
          const date=d.toISOString().slice(0,10);slots.push({id:`demo-${rule.counselorId}-${date}-${rule.start}`,date,start:rule.start,end:rule.end,counselorId:rule.counselorId,source:'sv2-mock'});
        }
      }
    }
    return {slots,appointments:[],notes:[],activity:[]};
  }
  window.SV3Store={USERS,KEY,SESSION,root,init,users,current,lock,updateProfile,initialSchedule,counselorOf:row=>row.counselorId||legacy};
})();
