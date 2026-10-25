/* AI-3 demo extracts sentences from the draft. It never invents clinical advice. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);let revision=0,variant=0;
  function invalidate(message){revision++;$('ai-result').hidden=true;$('ai-status').textContent=message;$('ai-generate').disabled=false;$('ai-panel').setAttribute('aria-busy','false');}
  async function generate(){
    const source=$('note-content').value.trim();
    if(source.length<20){$('ai-status').textContent='Nhập ít nhất 20 ký tự ghi chú để tạo bản nháp.';$('note-content').focus();return;}
    invalidate('Đang tạo bản nháp mô phỏng…');const version=revision;$('ai-generate').disabled=true;$('ai-panel').setAttribute('aria-busy','true');
    try{
      const r=await fetch('../../assets/data/counselor-ai.json',{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();const config=await r.json();
      if(config.version!==1||!Number.isInteger(config.maxSentences)||config.maxSentences<1||config.maxSentences>5)throw Error();
      await new Promise(resolve=>setTimeout(resolve,350));if(version!==revision)return;
      const sentences=source.match(/[^.!?\n]+[.!?]?/g)||[source];const start=variant++%2===0?0:Math.max(0,sentences.length-config.maxSentences);
      $('ai-draft').value=sentences.slice(start,start+config.maxSentences).join(' ').trim().slice(0,3000);
      $('ai-reason').textContent='Bản nháp trích câu từ nội dung bạn nhập, không bổ sung diễn giải hoặc chẩn đoán. Nếu ghi chú ngắn, tạo lại có thể cho cùng kết quả. Hãy đọc và sửa trước khi chấp nhận.';
      $('ai-result').hidden=false;$('ai-status').textContent='Bản nháp đã sẵn sàng để bạn kiểm tra.';$('ai-draft').focus();
    }catch{if(version===revision)$('ai-status').textContent='Không tạo được bản nháp. Nội dung ghi chú được giữ nguyên; chọn Tạo tóm tắt để thử lại.';}
    finally{if(version===revision){$('ai-generate').disabled=false;$('ai-panel').setAttribute('aria-busy','false');}}
  }
  $('ai-generate').addEventListener('click',generate);$('ai-regenerate').addEventListener('click',generate);
  $('ai-reject').addEventListener('click',()=>{invalidate('Đã bỏ bản nháp. Tóm tắt đã chấp nhận trước đó không bị thay đổi.');$('ai-generate').focus();});
  $('ai-accept').addEventListener('click',()=>{
    const value=$('ai-draft').value.trim();if(!value){$('ai-status').textContent='Bản nháp không được để trống.';$('ai-draft').focus();return;}
    $('note-summary').value=value;$('note-summary').dispatchEvent(new Event('input',{bubbles:true}));invalidate('Đã chấp nhận vào ô tóm tắt. Chọn Lưu ghi chú để lưu cùng nội dung buổi gặp.');$('note-summary').focus();
  });
  $('note-content').addEventListener('input',()=>invalidate('Ghi chú đã thay đổi. Tạo lại bản nháp để dùng nội dung mới.'));
  window.addEventListener('campusmind:note-loaded',()=>invalidate('Tóm tắt mô phỏng chỉ được lưu sau khi bạn chấp nhận và lưu ghi chú.'));
})();
