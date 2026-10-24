(() => {
  'use strict';
  const S=SV3Store,$=id=>document.getElementById(id);let dirty=false,snapshot,id,busy=false;
  const fail=err=>{$('profile-error').hidden=false;$('profile-error').textContent=err.message||'Không đọc được hồ sơ. Dữ liệu gốc được giữ nguyên.';};
  const professional=document.createElement('section');professional.id='professional-profile';professional.hidden=true;
  const heading=document.createElement('h2');heading.textContent='Hồ sơ chuyên viên';professional.append(heading);
  const help=document.createElement('p');help.textContent='Giới thiệu chuyên môn bằng dữ liệu minh họa. Thông tin tự khai chưa được xác minh; không nhập chứng chỉ hay thông tin cá nhân thật.';professional.append(help);
  const fields=[['qualification','Học vị / chức danh',150],['organization','Đơn vị công tác',150],['specialties','Lĩnh vực đồng hành',300],['experience','Kinh nghiệm',500],['bio','Giới thiệu và phương pháp làm việc',1500]];
  for(const [key,label,max] of fields){const wrap=document.createElement('label');wrap.textContent=label;const input=document.createElement(max>300?'textarea':'input');input.id='professional-'+key;input.maxLength=max;wrap.append(input);professional.append(wrap);}
  const preview=document.createElement('button');preview.type='button';preview.textContent='Xem trước hồ sơ chuyên viên';professional.append(preview);
  const card=document.createElement('article');card.className='panel';card.id='professional-preview';card.hidden=true;professional.append(card);
  preview.onclick=()=>{card.replaceChildren();card.hidden=false;const name=document.createElement('h3');name.textContent=$('profile-name').value;card.append(name);for(const [key,label] of fields){const p=document.createElement('p');p.textContent=label+': '+($('professional-'+key).value.trim()||'Chưa bổ sung');card.append(p);}const note=document.createElement('small');note.textContent='Hồ sơ minh họa · Chưa xác minh chuyên môn · Xem trước trên trình duyệt';card.append(note);};
  $('profile-form').insertBefore(professional,$('profile-save').parentElement);
  async function load(){
    $('profile-status').textContent='Đang tải hồ sơ…';$('profile-error').hidden=true;$('profile-retry').hidden=true;$('profile-form').hidden=true;$('profile-empty').hidden=true;
    try{await S.init();const user=S.current();if(!user){$('profile-empty').hidden=false;$('profile-status').textContent='Hãy chọn tài khoản demo.';return;}
      snapshot=S.users().raw;id=user.id;$('profile-name').value=user.name;$('profile-email').value=user.email;
      professional.hidden=user.role!=='counselor';card.hidden=true;for(const [key] of fields)$('professional-'+key).value=typeof user.counselorProfile?.[key]==='string'?user.counselorProfile[key]:'';
      $('profile-role').textContent='Vai trò: '+({student:'Sinh viên',counselor:'Chuyên viên',admin:'Quản trị viên'}[user.role]);
      $('profile-form').hidden=false;$('profile-status').textContent='Hồ sơ đã sẵn sàng.';dirty=false;
    }catch(err){fail(err);$('profile-status').textContent='Chưa tải được hồ sơ.';$('profile-retry').hidden=false;}
  }
  $('profile-form').addEventListener('input',()=>dirty=true);
  $('profile-form').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;$('profile-save').disabled=true;$('profile-error').hidden=true;
    $('profile-name').readOnly=true;$('profile-email').readOnly=true;$('profile-reset').disabled=true;$('profile-form').setAttribute('aria-busy','true');
    const extras=professional.hidden?{}:{counselorProfile:Object.fromEntries(fields.map(([key])=>[key,$('professional-'+key).value]))};
    fields.forEach(([key])=>$('professional-'+key).readOnly=true);
    try{const result=await S.updateProfile(snapshot,id,{name:$('profile-name').value,email:$('profile-email').value,...extras});snapshot=result.raw;dirty=false;$('profile-status').textContent='Đã lưu hồ sơ thành công.';}
    catch(err){fail(err);$('profile-error').focus();}finally{busy=false;fields.forEach(([key])=>$('professional-'+key).readOnly=false);$('profile-save').disabled=false;$('profile-name').readOnly=false;$('profile-email').readOnly=false;$('profile-reset').disabled=false;$('profile-form').setAttribute('aria-busy','false');}
  });
  $('profile-reset').addEventListener('click',()=>{if(dirty)$('profile-discard').showModal();else load();});
  $('profile-discard').addEventListener('close',()=>{if($('profile-discard').returnValue==='discard'){dirty=false;load().then(()=>$('profile-name').focus());}});
  $('profile-retry').addEventListener('click',load);
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  window.addEventListener('storage',e=>{if(e.key===S.USERS||e.key===null){if(dirty)fail(Error('Dữ liệu đã đổi ở tab khác. Nội dung bạn đang nhập được giữ; hủy thay đổi để tải bản mới.'));else load();}});
  load();
})();
