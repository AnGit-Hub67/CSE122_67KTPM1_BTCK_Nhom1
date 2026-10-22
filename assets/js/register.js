(() => {
  'use strict';
  const S=window.SV2Store,$=id=>document.getElementById(id);
  const fields=['name','email','password','confirm-password'];
  let busy=false,created=null;
  function fieldError(id,message){$(id+'-error').textContent=message;$(id).setAttribute('aria-invalid',String(Boolean(message)));}
  function error(err){
    const storage=['QuotaExceededError','SecurityError'].includes(err.name);
    $('register-error').textContent=storage?'Không thể truy cập bộ nhớ trình duyệt. Kiểm tra quyền hoặc dung lượng rồi thử lại.':err instanceof SyntaxError?'Dữ liệu người dùng đã lưu bị lỗi. Dữ liệu được giữ nguyên; hãy kiểm tra trước khi thử lại.':err.message;
    $('register-error').hidden=false;
  }
  function validate(){
    const messages={name:$('name').value.trim().length<2?'Nhập họ tên từ 2 đến 150 ký tự.':'',email:!$('email').value.trim()||$('email').validity.typeMismatch?'Nhập địa chỉ email hợp lệ.':'',password:$('password').value.length<8||$('password').value.length>128||!$('password').value.trim()?'Mật khẩu cần 8–128 ký tự và không chỉ có khoảng trắng.':'','confirm-password':!$('confirm-password').value||$('confirm-password').value!==$('password').value?'Mật khẩu nhập lại chưa khớp.':''};
    if($('name').value.trim().length>150)messages.name='Họ tên tối đa 150 ký tự.';
    if($('email').value.trim().length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim()))messages.email='Nhập địa chỉ email hợp lệ.';
    fields.forEach(id=>fieldError(id,messages[id]));
    const first=fields.find(id=>messages[id]);if(first)$(first).focus();return !first;
  }
  function setBusy(value){busy=value;$('register-form').setAttribute('aria-busy',String(value));$('register-submit').disabled=value;fields.forEach(id=>$(id).readOnly=value);$('show-password').disabled=value;$('register-submit').textContent=value?'Đang tạo tài khoản…':'Tạo tài khoản demo';}
  async function load(){
    $('register-form').hidden=true;$('register-error').hidden=true;$('register-retry').hidden=true;$('register-status').textContent='Đang tải dữ liệu…';
    try{await S.initRegistration();$('register-form').hidden=false;setBusy(false);$('register-status').textContent='Sẵn sàng tạo tài khoản demo.';}catch(err){error(err);$('register-retry').hidden=false;$('register-status').textContent='Chưa tải được dữ liệu.';}
  }
  $('register-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;$('register-error').hidden=true;if(!validate())return;
    setBusy(true);$('register-status').textContent='Đang tạo tài khoản…';
    try{
      created=await S.register({name:$('name').value,email:$('email').value});
      $('password').value='';$('confirm-password').value='';$('register-form').hidden=true;
      $('success-name').textContent=created.name;$('success-email').textContent=created.email;
      $('register-success').hidden=false;$('register-status').textContent='Đã lưu tài khoản sinh viên thành công.';$('register-success').focus();
    }catch(err){error(err);$('register-status').textContent='Chưa tạo được tài khoản.';if(err.field){fieldError(err.field,err.message);$(err.field).focus();}else $('register-error').focus();}
    finally{setBusy(false);}
  });
  fields.forEach(id=>$(id).addEventListener('input',()=>fieldError(id,'')));
  $('show-password').addEventListener('click',()=>{const show=$('password').type==='password';$('password').type=$('confirm-password').type=show?'text':'password';$('show-password').setAttribute('aria-pressed',String(show));$('show-password').textContent=show?'Ẩn mật khẩu':'Hiện mật khẩu';});
  $('register-retry').addEventListener('click',load);
  $('register-another').addEventListener('click',()=>{created=null;$('register-form').reset();fields.forEach(id=>fieldError(id,''));$('password').type=$('confirm-password').type='password';$('show-password').setAttribute('aria-pressed','false');$('show-password').textContent='Hiện mật khẩu';$('register-success').hidden=true;load();});
  $('enter-demo').addEventListener('click',()=>{try{S.enterStudentDemo(created.id);location.href='pages/student/student-dashboard.html';}catch(err){error(err);$('register-error').focus();}});
  load();
})();
