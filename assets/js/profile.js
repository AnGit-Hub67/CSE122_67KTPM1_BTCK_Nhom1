(() => {
  'use strict';
  const S=SV3Store,$=id=>document.getElementById(id);let dirty=false,snapshot,id,busy=false;
  const fail=err=>{$('profile-error').hidden=false;$('profile-error').textContent=err.message||'Không đọc được hồ sơ. Dữ liệu gốc được giữ nguyên.';};
  async function load(){
    $('profile-status').textContent='Đang tải hồ sơ…';$('profile-error').hidden=true;$('profile-retry').hidden=true;$('profile-form').hidden=true;$('profile-empty').hidden=true;
    try{await S.init();const user=S.current();if(!user){$('profile-empty').hidden=false;$('profile-status').textContent='Hãy chọn tài khoản demo.';return;}
      snapshot=S.users().raw;id=user.id;$('profile-name').value=user.name;$('profile-email').value=user.email;
      $('profile-role').textContent='Vai trò: '+({student:'Sinh viên',counselor:'Chuyên viên',admin:'Quản trị viên'}[user.role]);
      $('profile-form').hidden=false;$('profile-status').textContent='Hồ sơ đã sẵn sàng.';dirty=false;
    }catch(err){fail(err);$('profile-status').textContent='Chưa tải được hồ sơ.';$('profile-retry').hidden=false;}
  }
  $('profile-form').addEventListener('input',()=>dirty=true);
  $('profile-form').addEventListener('submit',async e=>{e.preventDefault();if(busy)return;busy=true;$('profile-save').disabled=true;$('profile-error').hidden=true;
    $('profile-name').readOnly=true;$('profile-email').readOnly=true;$('profile-reset').disabled=true;$('profile-form').setAttribute('aria-busy','true');
    try{const result=await S.updateProfile(snapshot,id,{name:$('profile-name').value,email:$('profile-email').value});snapshot=result.raw;dirty=false;$('profile-status').textContent='Đã lưu hồ sơ thành công.';}
    catch(err){fail(err);$('profile-error').focus();}finally{busy=false;$('profile-save').disabled=false;$('profile-name').readOnly=false;$('profile-email').readOnly=false;$('profile-reset').disabled=false;$('profile-form').setAttribute('aria-busy','false');}
  });
  $('profile-reset').addEventListener('click',()=>{if(dirty)$('profile-discard').showModal();else load();});
  $('profile-discard').addEventListener('close',()=>{if($('profile-discard').returnValue==='discard'){dirty=false;load().then(()=>$('profile-name').focus());}});
  $('profile-retry').addEventListener('click',load);
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  window.addEventListener('storage',e=>{if(e.key===S.USERS||e.key===null){if(dirty)fail(Error('Dữ liệu đã đổi ở tab khác. Nội dung bạn đang nhập được giữ; hủy thay đổi để tải bản mới.'));else load();}});
  load();
})();
