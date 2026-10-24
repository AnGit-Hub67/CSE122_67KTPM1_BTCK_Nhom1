/* Synthetic, anonymized review display for SV3 only. No student input workflow. */
(() => {
  'use strict';
  const S=SV3Store,KEY='campusmind.reviews.v1',role=document.body.dataset.role,admin=role==='admin';
  const $=id=>document.getElementById(id),el=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
  let rows=[],active,request=0;
  const root=$('review-root');
  const loading=el('p','Đang tải đánh giá…');loading.id='work-status';loading.setAttribute('role','status');
  const error=el('p','','notice error');error.id='work-error';error.hidden=true;error.setAttribute('role','alert');
  const retry=el('button','Thử lại');retry.type='button';retry.id='retry';retry.hidden=true;retry.onclick=load;
  const content=el('div','');content.id='work-content';content.hidden=true;root.append(loading,error,retry,content);
  const filters=el('section','','review-filters');filters.setAttribute('aria-label','Bộ lọc đánh giá');content.append(filters);
  function select(id,label,options){const wrap=el('label',label),field=el('select','');field.id=id;for(const [value,text] of options){const o=el('option',text);o.value=value;field.append(o);}wrap.append(field);filters.append(wrap);field.onchange=render;return field;}
  const period=select('reviews-period','Khoảng thời gian',[['all','Toàn bộ'],['7','7 ngày'],['30','30 ngày'],['90','90 ngày']]);
  const rating=select('reviews-rating','Số sao',[['all','Tất cả'],...[1,2,3,4,5].map(n=>[String(n),n+' sao'])]);
  const sort=select('reviews-sort','Sắp xếp',[['new','Mới nhất'],['old','Cũ nhất']]);
  const limit=select('reviews-limit','Mức hiển thị',[['3','Ít · 3 bình luận'],['6','Vừa · 6 bình luận'],['all','Tất cả']]);if(!admin)limit.value='all';
  const clear=el('button','Xóa bộ lọc');clear.type='button';clear.onclick=()=>{period.value='all';rating.value='all';render();};filters.append(clear);
  const refresh=el('button','Cập nhật đánh giá');refresh.type='button';refresh.onclick=load;filters.append(refresh);
  const metrics=el('section','','review-metrics');metrics.id='review-metrics';metrics.setAttribute('aria-label','Số liệu theo bộ lọc');content.append(metrics);
  const chartPanel=el('section','','panel');chartPanel.append(el('h2','Điểm đánh giá'));
  const summary=el('p','');summary.id='reviews-summary';summary.setAttribute('role','status');chartPanel.append(summary);
  const chart=el('div','','review-chart '+(admin?'vertical':'horizontal'));chart.id='reviews-chart';chart.setAttribute('role','group');chart.setAttribute('aria-label','Lọc đánh giá theo số sao');chartPanel.append(chart);content.append(chartPanel);
  const commentsPanel=el('section','','panel');commentsPanel.append(el('h2','Bình luận của sinh viên'));
  const shown=el('p','');shown.id='reviews-shown';shown.setAttribute('role','status');const comments=el('div','');comments.id='review-comments';commentsPanel.append(shown,comments);content.append(commentsPanel);
  const demo=el('p','Đánh giá và bình luận giả lập cho mục đích học tập. Không phải nhận xét của bệnh nhân thật.','meta');content.append(demo);
  function validate(data){
    if(!Array.isArray(data)||data.length>5000||new Set(data.map(x=>x?.id)).size!==data.length||!data.every(x=>x&&typeof x.id==='string'&&x.id.length<=100&&typeof x.counselorId==='string'&&x.counselorId.length<=100&&typeof x.alias==='string'&&/^Sinh viên K\d{2}$/.test(x.alias)&&Number.isInteger(x.rating)&&x.rating>=1&&x.rating<=5&&typeof x.comment==='string'&&x.comment.length>0&&x.comment.length<=1500&&Number.isFinite(Date.parse(x.createdAt))&&['Published','Pending','Cancelled'].includes(x.status)))throw Error('Dữ liệu đánh giá không hợp lệ. Dữ liệu gốc được giữ nguyên.');
    return data;
  }
  async function read(){
    const raw=localStorage.getItem(KEY);if(raw!==null)return validate(JSON.parse(raw));
    const response=await fetch(new URL('assets/data/reviews.json',S.root),{signal:AbortSignal.timeout(5000)});if(!response.ok)throw Error('Không tải được đánh giá mẫu.');const data=await response.json();
    if(data.version!==1||!Array.isArray(data.reviews)||!data.reviews.every(x=>Number.isInteger(x.daysAgo)&&x.daysAgo>=0&&x.daysAgo<=90))throw Error('Cấu hình đánh giá không hợp lệ.');
    const seed=validate(data.reviews.map(({daysAgo,...x})=>({...x,status:'Published',createdAt:new Date(Date.now()-daysAgo*86400000).toISOString()})));
    return S.lock(()=>{const now=localStorage.getItem(KEY);if(now!==null)return validate(JSON.parse(now));localStorage.setItem(KEY,JSON.stringify(seed));return seed;});
  }
  function completedThisWeek(){
    const raw=localStorage.getItem(S.KEY);if(raw===null)return 0;const data=JSON.parse(raw);if(!Array.isArray(data.appointments))throw Error('Dữ liệu lịch không hợp lệ.');
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),monday=new Date(today+'T00:00:00Z');monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7);const end=new Date(monday);end.setUTCDate(end.getUTCDate()+7);
    return data.appointments.filter(a=>a.status==='Completed'&&(admin||S.counselorOf(a)===active.id)&&Date.parse(a.date+'T00:00:00Z')>=monday.getTime()&&Date.parse(a.date+'T00:00:00Z')<end.getTime()).length;
  }
  function render(){
    try{
      if(S.current()?.id!==active?.id||S.current()?.role!==role)throw Error('Phiên làm việc đã thay đổi. Đăng nhập lại đúng vai trò.');
      const base=rows.filter(r=>(admin||r.counselorId===active.id)&&(period.value==='all'||Date.parse(r.createdAt)>=Date.now()-Number(period.value)*86400000));
      const published=base.filter(r=>r.status==='Published'),counts=[1,2,3,4,5].map(n=>published.filter(r=>r.rating===n).length);
      [...rating.options].forEach(o=>{o.textContent=o.value==='all'?`Tất cả (${published.length})`:`${o.value} sao (${counts[Number(o.value)-1]})`;});
      const filtered=published.filter(r=>rating.value==='all'||r.rating===Number(rating.value));
      const avg=filtered.length?filtered.reduce((sum,r)=>sum+r.rating,0)/filtered.length:0,positive=filtered.length?Math.round(filtered.filter(r=>r.rating>=4).length*100/filtered.length):0;
      metrics.replaceChildren();for(const [label,value] of [['Lượt đánh giá',filtered.length],['Điểm trung bình',filtered.length?avg.toFixed(1)+' / 5':'Chưa có'],['Từ 4 sao trở lên',positive+'%'],['Buổi hoàn thành trong tuần',completedThisWeek()]]){const card=el('article','','panel');card.append(el('h3',label),el('strong',String(value)));metrics.append(card);}
      summary.textContent=filtered.length?`${avg.toFixed(1)} / 5 · ${filtered.length} lượt đánh giá · ${'★'.repeat(Math.round(avg))}${'☆'.repeat(5-Math.round(avg))}`:'Chưa có đánh giá phù hợp. Mở rộng thời gian hoặc xóa bộ lọc.';
      chart.replaceChildren();const max=Math.max(1,...counts);for(const n of admin?[1,2,3,4,5]:[5,4,3,2,1]){
        const b=el('button','');b.type='button';b.dataset.rating=String(n);b.setAttribute('aria-label',`${n} sao: ${counts[n-1]} đánh giá`);b.setAttribute('aria-pressed',String(rating.value===String(n)));
        const bar=el('span','','bar');bar.setAttribute('aria-hidden','true');bar.style[admin?'height':'width']=(admin?Math.round(counts[n-1]/max*140)+'px':Math.round(counts[n-1]/max*100)+'%');
        if(admin)b.append(el('span',String(counts[n-1])),bar,el('span',n+' sao'));else b.append(el('span',n+' sao'),bar,el('span',String(counts[n-1])));
        b.onclick=()=>{rating.value=rating.value===String(n)?'all':String(n);render();chart.querySelector(`[data-rating="${n}"]`)?.focus();};chart.append(b);
      }
      const ordered=[...filtered].sort((a,b)=>(sort.value==='new'?-1:1)*(Date.parse(a.createdAt)-Date.parse(b.createdAt))||a.id.localeCompare(b.id)),visible=limit.value==='all'?ordered:ordered.slice(0,Number(limit.value));
      shown.textContent=`Đang hiển thị ${visible.length}/${filtered.length} bình luận`;comments.replaceChildren();
      if(!filtered.length)comments.append(el('p','Không có bình luận phù hợp. Hãy chọn Tất cả hoặc mở rộng khoảng thời gian.','empty'));
      for(const r of visible){const card=el('article','','review-comment');card.dataset.review=r.id;const stars=el('p','★'.repeat(r.rating)+'☆'.repeat(5-r.rating),'review-stars');stars.setAttribute('aria-label',r.rating+' trên 5 sao');
        const days=Math.max(0,Math.floor((Date.now()-Date.parse(r.createdAt))/86400000)),date=el('time',days===0?'Hôm nay':days+' ngày trước');date.dateTime=r.createdAt;date.title=new Date(r.createdAt).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});card.append(el('h3',r.alias),stars,date,el('p',r.comment));comments.append(card);}
      const pending=base.filter(r=>r.status==='Pending').length,cancelled=base.filter(r=>r.status==='Cancelled').length;
      if(pending||cancelled)comments.append(el('p',`${pending} đánh giá chờ duyệt · ${cancelled} đánh giá đã hủy (không tính vào điểm).`,'badge'));
      error.hidden=true;content.hidden=false;retry.hidden=true;
    }catch(e){error.textContent=e.message;error.hidden=false;retry.hidden=false;content.hidden=true;}
  }
  async function load(){const version=++request;content.hidden=true;error.hidden=true;retry.hidden=true;loading.textContent='Đang tải đánh giá…';
    try{await S.init();const user=S.current();if(user?.role!==role||!['admin','counselor'].includes(role))throw Error('Cần đăng nhập đúng vai trò để xem đánh giá.');const data=await read();if(version!==request)return;active=user;rows=data;render();loading.textContent=error.hidden?'Đã cập nhật đánh giá từ dữ liệu demo.':'Chưa thể hiển thị đánh giá.';}
    catch(e){if(version!==request)return;error.textContent=e.message;error.hidden=false;retry.hidden=false;loading.textContent='Tải đánh giá thất bại.';}
  }
  window.addEventListener('storage',e=>{if([KEY,S.KEY,S.USERS].includes(e.key)||e.key===null)load();});
  load();
})();
