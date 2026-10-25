/* Optional public Fake REST mirror for synthetic scheduling data ONLY.
   Never sends users, notes, summaries, appointment reasons or activity text. */
(() => {
  'use strict';
  const root=new URL('../../',document.currentScript.src),key='campusmind.counselor.v1';
  let channel,configPromise,remoteRevision,serial=Promise.resolve();
  try{channel=new BroadcastChannel('campusmind.data.v1');}catch{}
  const announce=key=>channel?.postMessage({key});
  // Broadcast only invalidation keys, never consultation payloads.
  if(channel)channel.onmessage=e=>{if([key,'campusmind.sv2.users.v1','campusmind.admin.services.v1'].includes(e.data?.key))window.dispatchEvent(new StorageEvent('storage',{key:e.data.key}));};
  function status(message){window.dispatchEvent(new CustomEvent('campusmind:remote-status',{detail:message}));}
  async function config(){
    if(!configPromise)configPromise=(async()=>{try{
      // A private development override is absent from static deployments.
      const localHost=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
      let r=await fetch(new URL(localHost?'assets/data/config.json':'assets/data/config.public.json',root),{signal:AbortSignal.timeout(3000)});
      if(localHost&&r.status===404)r=await fetch(new URL('assets/data/config.public.json',root),{signal:AbortSignal.timeout(3000)});
      if(r.status===404)return null;if(!r.ok)throw Error();const c=await r.json();if(!c.enableDemoRemoteSync)return null;
      const u=new URL(c.mockApiRecordUrl);
      if(u.protocol!=='https:'||!u.hostname.endsWith('.mockapi.io')||u.username||u.password||u.search||u.hash||!/^\/[A-Za-z0-9/_-]+$/.test(u.pathname))throw Error();
      return u.href;
    }catch{status('Chưa thể kết nối nguồn dữ liệu. Đang dùng dữ liệu trên trình duyệt.');return null;}})();return configPromise;
  }
  const allowedStatus=['Pending','Confirmed','Completed','Cancelled'];
  const id=v=>typeof v==='string'&&/^[\w-]{1,100}$/.test(v);
  const day=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
  const time=v=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
  function project(data){
    if(!data||!Array.isArray(data.slots)||!Array.isArray(data.appointments)||data.slots.length>2000||data.appointments.length>2000)throw Error('Dữ liệu remote không hợp lệ.');
    const slots=data.slots.map(s=>{if(!id(s.id)||!id(s.counselorId)||!day(s.date)||!time(s.start)||!time(s.end)||s.end<=s.start)throw Error('Khung giờ remote không hợp lệ.');return {id:s.id,counselorId:s.counselorId,date:s.date,start:s.start,end:s.end,available:s.available!==false};});
    const appointments=data.appointments.map(a=>{if(!id(a.id)||!id(a.counselorId)||!id(a.slotId)||!day(a.date)||!time(a.time)||!time(a.end)||!allowedStatus.includes(a.status))throw Error('Lịch hẹn remote không hợp lệ.');return {id:a.id,counselorId:a.counselorId,slotId:a.slotId,date:a.date,time:a.time,end:a.end,status:a.status};});
    if(new Set(slots.map(s=>s.id)).size!==slots.length||new Set(appointments.map(a=>a.id)).size!==appointments.length)throw Error('Mã remote bị trùng.');
    return {slots,appointments};
  }
  async function request(url,options={}){const r=await fetch(url,{...options,signal:AbortSignal.timeout(4000)});if(!r.ok)throw Error('MockAPI chưa sẵn sàng.');const data=await r.json();if(data.version!==1||typeof data.revision!=='string')throw Error('MockAPI sai cấu trúc.');return data;}
  async function hydrate(){
    const url=await config();if(!url)return;
    try{const before=localStorage.getItem(key),data=await request(url);const safe=project(data);remoteRevision=data.revision;
      if(before===null&&localStorage.getItem(key)===null){localStorage.setItem(key,JSON.stringify({...safe,appointments:safe.appointments.map(a=>({...a,studentName:'Sinh viên'})),notes:[],activity:[]}));announce(key);}
      status('');
    }catch{status('Chưa thể tải dữ liệu trực tuyến. Dữ liệu trên trình duyệt hiện có được giữ nguyên.');}
  }
  function publish(){serial=serial.catch(()=>{}).then(async()=>{
    const url=await config();if(!url)return;
    try{const snapshot=localStorage.getItem(key);if(snapshot===null)return;const safe=project(JSON.parse(snapshot));const latest=await request(url);
      if(remoteRevision===undefined||latest.revision!==remoteRevision)throw Error('Remote đã thay đổi; không ghi đè.');
      const revision=crypto.randomUUID();await request(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:1,revision,...safe})});remoteRevision=revision;
      status('');
    }catch{status('Chưa đồng bộ được dữ liệu. Thay đổi đã lưu trên trình duyệt; hãy thử lại sau.');}
  });return serial;}
  window.CampusDemoSync={announce,hydrate,publish,project};
})();
