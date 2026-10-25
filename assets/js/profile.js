(() => {
  'use strict';
  const S=SV3Store,$=id=>document.getElementById(id);let dirty=false,snapshot,id,busy=false;
  const fail=err=>{$('profile-error').hidden=false;$('profile-error').textContent=err.message||'Không đọc được hồ sơ. Dữ liệu gốc được giữ nguyên.';};
  const professional=document.createElement('section');professional.id='professional-profile';professional.hidden=true;
  const heading=document.createElement('h2');heading.textContent='Hồ sơ chuyên viên';professional.append(heading);
  const help=document.createElement('p');help.textContent='Cập nhật thông tin chuyên môn để sinh viên tìm hiểu trước khi đặt lịch. Trạng thái xác minh do đơn vị vận hành quản lý.';professional.append(help);
  const fields=[['qualification','Học vị / chức danh',150],['organization','Đơn vị công tác',150],['specialties','Lĩnh vực đồng hành',300],['experience','Kinh nghiệm',500],['bio','Giới thiệu và phương pháp làm việc',1500],['credentials','Học vị và chứng chỉ: năm cấp, nơi cấp',1500],['format','Hình thức tư vấn',150],['duration','Thời lượng mỗi buổi',50]];
  for(const [key,label,max] of fields){const wrap=document.createElement('label');wrap.textContent=label;const input=document.createElement(max>300?'textarea':'input');input.id='professional-'+key;input.maxLength=max;wrap.append(input);professional.append(wrap);}
  const preview=document.createElement('button');preview.type='button';preview.textContent='Xem trước hồ sơ chuyên viên';professional.append(preview);
  const card=document.createElement('article');card.className='panel';card.id='professional-preview';card.hidden=true;professional.append(card);
  preview.onclick=()=>{card.replaceChildren();card.hidden=false;const name=document.createElement('h3');name.textContent=$('profile-name').value;card.append(name);for(const [key,label] of fields){const p=document.createElement('p');p.textContent=label+': '+($('professional-'+key).value.trim()||'Chưa bổ sung');card.append(p);}const note=document.createElement('small');note.textContent='Hồ sơ minh họa · Chưa xác minh chuyên môn · Xem trước trên trình duyệt';card.append(note);};
  $('profile-form').insertBefore(professional,$('profile-save').parentElement);
  const make=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e;};
  fetch(new URL('register.html',S.root),{method:'HEAD',signal:AbortSignal.timeout(5000)}).then(r=>{
    const button=$('profile-register');if(!button)return;
    if(r.ok){button.disabled=false;button.onclick=()=>{location.href=new URL('register.html',S.root);};}
    else $('registration-status').textContent='Trang tạo tài khoản chưa được tích hợp trong bản này.';
  }).catch(()=>{if($('registration-status'))$('registration-status').textContent='Chưa kiểm tra được trang tạo tài khoản. Vui lòng thử lại sau.';});
  const summary=make('section','');summary.className='profile-card';summary.id='profile-summary';$('profile-form').prepend(summary);
  const settings=make('section','');settings.className='profile-card';settings.id='profile-settings';settings.append(make('h2','Thông tin cá nhân và cài đặt'));
  for(const [id,label,type,max]of [['phone','Số điện thoại (chỉ hiển thị nội bộ)','tel',30],['organization','Đơn vị công tác','text',150]]){
    const wrap=make('label',label),input=document.createElement('input');input.id='settings-'+id;input.type=type;input.maxLength=max;wrap.append(input);settings.append(wrap);
  }
  const privacyLabel=make('label','Quyền riêng tư'),privacy=document.createElement('select');privacy.id='settings-privacy';privacy.append(new Option('Chỉ chia sẻ biệt danh','alias'),new Option('Cho phép chuyên viên xem hồ sơ đầy đủ','full'));privacyLabel.append(privacy);settings.append(privacyLabel);
  settings.append(make('h3','Cài đặt thông báo'));
  const notificationFields=[['newAppointment','Lịch hẹn mới','counselor'],['reminder','Nhắc trước buổi tư vấn','counselor'],['newReview','Đánh giá mới','counselor'],['overdue','Lịch hẹn chờ xác nhận quá hạn','admin'],['lowRating','Đánh giá 1–2 sao mới','admin'],['weeklyReport','Báo cáo tổng hợp hằng tuần','admin']];
  for(const [id,label,role]of notificationFields){const wrap=make('label',label);wrap.className='check';wrap.dataset.settingRole=role;const input=document.createElement('input');input.type='checkbox';input.id='notify-'+id;wrap.prepend(input);settings.append(wrap);}
  $('profile-form').insertBefore(settings,$('profile-save').parentElement);
  const security=make('section','');security.className='profile-card';security.append(make('h2','Bảo mật'));
  const password=make('button','Đổi mật khẩu');password.type='button';const passwordStatus=make('p','');passwordStatus.setAttribute('role','status');
  password.onclick=async()=>{password.disabled=true;try{const url=new URL('sv2-login.html',S.root);const r=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error();passwordStatus.textContent='Mở trang đăng nhập và chọn Quên mật khẩu để nhận hướng dẫn.';const a=make('a','Mở trang đăng nhập');a.href=url.href;passwordStatus.append(document.createTextNode(' '),a);}catch{passwordStatus.textContent='Đổi mật khẩu cần trang đăng nhập và dịch vụ xác thực được tích hợp. Chế độ tài khoản cục bộ không lưu mật khẩu.';}finally{password.disabled=false;}};
  const logout=make('button','Đăng xuất');logout.type='button';logout.dataset.logout='';security.append(password,logout,passwordStatus);$('profile-form').after(security);
  function renderSettings(user){
    const cfg=user.profileSettings||{};
    $('settings-phone').value=cfg.phone||'';$('settings-organization').value=cfg.organization||'';privacy.value=cfg.privacy||'alias';privacyLabel.hidden=user.role!=='student';
    $('settings-organization').parentElement.hidden=user.role==='counselor';
    notificationFields.forEach(([id,,role])=>{$('notify-'+id).checked=cfg.notifications?.[id]===true;$('notify-'+id).parentElement.hidden=user.role!==role;});
    settings.querySelector('h3').hidden=user.role==='student';
    summary.replaceChildren();const avatar=make('span',user.name.trim().split(/\s+/).slice(-2).map(s=>s[0]).join(''));avatar.className='avatar';avatar.setAttribute('aria-hidden','true');
    summary.append(avatar,make('h2',user.name),make('p',user.role==='admin'?'Quản trị toàn hệ thống':user.role==='counselor'?(user.counselorProfile?.qualification||'Chuyên viên'):'Sinh viên'));
    if(user.role==='counselor'){
      summary.append(make('p',user.counselorProfile?.organization||'Chưa bổ sung đơn vị'),make('p',user.approval==='approved'?'Đã xác minh':'Chờ xác minh'));
      let reviews=[];try{reviews=JSON.parse(localStorage.getItem('campusmind.reviews.v1')||'[]');}catch{}
      const visible=Array.isArray(reviews)?reviews.filter(r=>r?.counselorId===user.id&&r.status==='Published'&&Number.isInteger(r.rating)&&r.rating>=1&&r.rating<=5):[];
      summary.append(make('p',visible.length?(visible.reduce((sum,r)=>sum+r.rating,0)/visible.length).toFixed(1)+' / 5 · '+visible.length+' đánh giá':'Chưa có đánh giá được tải trên thiết bị này.'));
    }
    security.hidden=false;document.querySelector('h1').textContent=user.role==='counselor'?'Hồ sơ chuyên viên':user.role==='admin'?'Hồ sơ':'Hồ sơ cá nhân';
    document.querySelector('.lead').textContent=user.role==='counselor'?'Thông tin này hiển thị với sinh viên khi họ chọn chuyên viên và đặt lịch.':user.role==='admin'?'Thông tin tài khoản quản trị viên của bạn.':'Thông tin cá nhân và lựa chọn quyền riêng tư của bạn.';
  }
  async function load(){
    $('profile-status').textContent='Đang tải hồ sơ…';$('profile-error').hidden=true;$('profile-retry').hidden=true;$('profile-form').hidden=true;$('profile-empty').hidden=true;
    security.hidden=true;
    try{await S.init();const user=S.current();if(!user){$('profile-empty').hidden=false;$('profile-status').textContent='Bạn đang xem với tư cách khách.';return;}
      snapshot=S.users().raw;id=user.id;$('profile-name').value=user.name;$('profile-email').value=user.email;
      professional.hidden=user.role!=='counselor';card.hidden=true;for(const [key] of fields)$('professional-'+key).value=typeof user.counselorProfile?.[key]==='string'?user.counselorProfile[key]:'';
      $('profile-role').textContent='Vai trò: '+({student:'Sinh viên',counselor:'Chuyên viên',admin:'Quản trị viên'}[user.role]);
      renderSettings(user);
      $('profile-form').hidden=false;$('profile-status').textContent='Hồ sơ đã sẵn sàng.';dirty=false;
    }catch(err){fail(err);$('profile-status').textContent='Chưa tải được hồ sơ.';$('profile-retry').hidden=false;}
  }
  $('profile-form').addEventListener('input',()=>dirty=true);
  $('profile-form').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;$('profile-save').disabled=true;$('profile-error').hidden=true;
    $('profile-name').readOnly=true;$('profile-email').readOnly=true;$('profile-reset').disabled=true;$('profile-form').setAttribute('aria-busy','true');
    const extras=professional.hidden?{}:{counselorProfile:Object.fromEntries(fields.map(([key])=>[key,$('professional-'+key).value]))};
    extras.profileSettings={phone:$('settings-phone').value,organization:$('settings-organization').value,privacy:privacy.value,notifications:Object.fromEntries(notificationFields.map(([key])=>[key,$('notify-'+key).checked]))};
    settings.querySelectorAll('input,select').forEach(e=>e.disabled=true);
    fields.forEach(([key])=>$('professional-'+key).readOnly=true);
    try{const result=await S.updateProfile(snapshot,id,{name:$('profile-name').value,email:$('profile-email').value,...extras});snapshot=result.raw;dirty=false;renderSettings(result.items.find(u=>u.id===id));$('profile-status').textContent='Đã lưu hồ sơ thành công.';}
    catch(err){fail(err);$('profile-error').focus();}finally{busy=false;settings.querySelectorAll('input,select').forEach(e=>e.disabled=false);fields.forEach(([key])=>$('professional-'+key).readOnly=false);$('profile-save').disabled=false;$('profile-name').readOnly=false;$('profile-email').readOnly=false;$('profile-reset').disabled=false;$('profile-form').setAttribute('aria-busy','false');}
  });
  $('profile-reset').addEventListener('click',()=>{if(dirty)$('profile-discard').showModal();else load();});
  $('profile-discard').addEventListener('close',()=>{if($('profile-discard').returnValue==='discard'){dirty=false;load().then(()=>$('profile-name').focus());}});
  $('profile-retry').addEventListener('click',load);
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  window.addEventListener('storage',e=>{if(e.key===S.USERS||e.key===null){if(dirty)fail(Error('Dữ liệu đã đổi ở tab khác. Nội dung bạn đang nhập được giữ; hủy thay đổi để tải bản mới.'));else load();}});
  load();
})();
