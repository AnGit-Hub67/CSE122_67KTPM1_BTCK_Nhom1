
(() => {
  'use strict';
  const $=id=>document.getElementById(id),KEY='campusmind.sv2.navigator.v1';
  const source=new URL('../data/sv2-ai.json',document.currentScript.src);
  const routes={resources:'../visitor/visitor-resource-library.html',counselors:'../visitor/visitor-counselor-detail.html',booking:'student-booking.html'};
  let S,data,current=null,accepted=false,busy=false,started=false,offset=0;
  const node=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e;};
  const report=err=>{$('ai-error').textContent=err instanceof SyntaxError?'Dữ liệu gợi ý đã lưu bị lỗi; dữ liệu gốc được giữ nguyên.':err.message;$('ai-error').hidden=false;};
  function read(){const rows=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(rows)||!rows.every(r=>r&&typeof r.id==='string'&&typeof r.studentId==='string'&&typeof r.text==='string'&&r.text.length<=1000&&typeof r.reason==='string'&&Object.hasOwn(routes,r.route)))throw Error('Dữ liệu gợi ý đã lưu không hợp lệ; không tự đặt lại.');return rows;}
  function saved(){const rows=read().filter(r=>r.studentId===S.studentId);$('ai-saved').replaceChildren();if(!rows.length)$('ai-saved').append(node('p','Bạn chưa lưu gợi ý nào.'));for(const r of rows){const a=node('article','');a.className='sv2-resource';a.append(node('p',r.text),node('p',r.reason));const link=node('a','Mở hướng đi đã lưu');link.href=routes[r.route];a.append(link);$('ai-saved').append(a);}}
  function controls(working){busy=working;$('ai-panel').setAttribute('aria-busy',String(working));for(const id of ['ai-generate','ai-topic','ai-regenerate','ai-edit','ai-reject','ai-accept'])$(id).disabled=working;$('ai-draft').readOnly=working;$('ai-save').disabled=working||!accepted;}
  async function load(){
    $('ai-error').hidden=true;$('ai-retry').hidden=true;$('ai-form').hidden=true;$('ai-result').hidden=true;current=null;accepted=false;controls(true);$('ai-status').textContent='Đang tải bộ gợi ý…';
    try{const r=await fetch(source,{cache:'no-cache'});if(!r.ok)throw Error('Không tải được bộ gợi ý. Hãy thử lại.');data=await r.json();if(data.version!==1||!Array.isArray(data.topics)||!data.topics.every(t=>typeof t.id==='string'&&typeof t.label==='string'&&typeof t.reason==='string'&&Array.isArray(t.suggestions)&&t.suggestions.length&&t.suggestions.every(s=>typeof s.text==='string'&&typeof s.label==='string'&&Object.hasOwn(routes,s.route))))throw Error('Bộ gợi ý không hợp lệ.');
      $('ai-topic').replaceChildren();const empty=node('option','Chọn một nhu cầu');empty.value='';$('ai-topic').append(empty);for(const t of data.topics){const o=node('option',t.label);o.value=t.id;$('ai-topic').append(o);}saved();$('ai-form').hidden=false;$('ai-status').textContent=data.topics.length?'Chọn nhu cầu để nhận một hướng đi mô phỏng.':'Chưa có gợi ý khả dụng.';
    }catch(err){report(err);$('ai-retry').hidden=false;$('ai-status').textContent='Chưa tải được gợi ý.';}finally{controls(false);}
  }
  async function generate(){
    if(busy||!$('ai-form').reportValidity())return;const topic=data.topics.find(t=>t.id===$('ai-topic').value);if(!topic)return;
    controls(true);accepted=false;$('ai-save').disabled=true;$('ai-error').hidden=true;$('ai-result').hidden=true;$('ai-status').textContent='Đang xử lý lựa chọn (mock)…';
    await new Promise(r=>setTimeout(r,350));
    const suggestion=topic.suggestions[offset%topic.suggestions.length];current={id:crypto.randomUUID(),studentId:S.studentId,text:suggestion.text,reason:topic.reason+' Đây là gợi ý điều hướng theo quy tắc, bạn có thể chỉnh sửa hoặc bỏ qua.',route:suggestion.route};
    $('ai-why').textContent=current.reason;$('ai-draft').value=current.text;const link=node('a',suggestion.label);link.href=routes[suggestion.route];$('ai-target').replaceChildren(link);$('ai-result').hidden=false;$('ai-status').textContent='Đã tạo gợi ý mock. Chưa lưu.';controls(false);$('ai-result').focus();
  }
  function init(store){if(started)return;started=true;S=store;
    $('ai-form').addEventListener('submit',e=>{e.preventDefault();offset=0;generate();});
    $('ai-topic').addEventListener('change',()=>{current=null;accepted=false;$('ai-result').hidden=true;$('ai-save').disabled=true;});
    $('ai-regenerate').addEventListener('click',()=>{offset++;generate();});
    $('ai-draft').addEventListener('input',()=>{accepted=false;$('ai-save').disabled=true;$('ai-status').textContent='Đã chỉnh sửa. Chấp nhận lại trước khi lưu.';});
    $('ai-accept').addEventListener('click',()=>{if(!$('ai-draft').value.trim()||$('ai-draft').value.length>1000){report(Error('Nội dung gợi ý cần 1–1000 ký tự.'));$('ai-draft').focus();return;}accepted=true;$('ai-error').hidden=true;$('ai-save').disabled=false;$('ai-status').textContent='Đã chấp nhận. Nhấn Lưu gợi ý để giữ lại.';});
    $('ai-reject').addEventListener('click',()=>{current=null;accepted=false;$('ai-result').hidden=true;$('ai-status').textContent='Đã bỏ qua. Không lưu gợi ý này.';$('ai-topic').focus();});
    $('ai-edit').addEventListener('click',()=>{accepted=false;current=null;$('ai-result').hidden=true;$('ai-status').textContent='Chọn lại nhu cầu rồi tạo gợi ý mới.';$('ai-topic').focus();});
    $('ai-save').addEventListener('click',async()=>{if(!accepted||!current||busy)return;controls(true);const record={...current,text:$('ai-draft').value.trim()};try{const write=()=>{const user=S.read().users.find(u=>u.id===S.studentId);if(!user||user.status!=='active'||user.role!=='student')throw Error('Tài khoản sinh viên không hoạt động.');const rows=read();const index=rows.findIndex(r=>r.id===record.id&&r.studentId===record.studentId);if(index<0)rows.push(record);else rows[index]=record;localStorage.setItem(KEY,JSON.stringify(rows));};if(navigator.locks)await navigator.locks.request(KEY,write);else write();accepted=false;saved();$('ai-error').hidden=true;$('ai-status').textContent='Đã lưu gợi ý cho tài khoản của bạn.';}catch(err){report(err);$('ai-status').textContent='Chưa lưu được. Nội dung vẫn được giữ để thử lại.';}finally{controls(false);}});
    $('ai-retry').addEventListener('click',load);window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null){try{saved();}catch(err){report(err);}}});load();
  }
  window.SV2AI={init};
})();
