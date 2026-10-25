(() => {
  'use strict';
  const store=window.CampusMindServices, key='campusmind.admin.activity.v1';
  if(!store||store.activityKey)return;
  const root=new URL('../../',document.currentScript.src);
  async function write(items,snapshot){
    const commit=async()=>{
      const journal=JSON.parse(localStorage.getItem(key)||'[]');
      if(!Array.isArray(journal)||!journal.every(e=>e&&typeof e.text==='string'&&Number.isFinite(Date.parse(e.at))))throw Error('Nhật ký dịch vụ không hợp lệ. Hãy tải lại trước khi lưu.');
      let before;
      if(snapshot===null){const r=await fetch(new URL('assets/data/admin-services.json',root),{signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Không đọc được danh mục trước khi lưu.');before=await r.json();}
      else before=JSON.parse(snapshot);
      if(!Array.isArray(before))throw Error('Danh mục trước khi lưu không hợp lệ.');
      const events=items.flatMap(item=>{
        const old=before.find(x=>x.id===item.id);
        if(old&&JSON.stringify(old)===JSON.stringify(item))return [];
        const action=!old?'Đã thêm dịch vụ':item.status==='archived'&&old.status!=='archived'?'Đã lưu trữ dịch vụ':old.status!==item.status?'Đã đổi trạng thái dịch vụ':'Đã cập nhật dịch vụ';
        return [{id:crypto.randomUUID(),text:`${action}: ${item.name}`.slice(0,200),at:new Date().toISOString()}];
      });
      const result=await store.write(items,snapshot);
      if(events.length){
        try{localStorage.setItem(key,JSON.stringify([...events,...journal].slice(0,100)));window.dispatchEvent(new StorageEvent('storage',{key}));}
        catch{setTimeout(()=>{const box=document.getElementById('feedback');if(box)box.textContent+=' Dịch vụ đã lưu nhưng chưa ghi được nhật ký trên trình duyệt.';},0);}
      }
      return result;
    };
    return navigator.locks?navigator.locks.request(key,commit):commit();
  }
  window.CampusMindServices=Object.freeze({...store,write,activityKey:key});
})();
