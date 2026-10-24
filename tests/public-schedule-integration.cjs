const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(process.env.SV1_TEST_ROOT||path.join(__dirname,'..'));
const server=http.createServer((req,res)=>{
  const file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
  fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.json':'application/json','.css':'text/css'})[path.extname(file)]||'text/plain');res.end(data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const context=await browser.newContext(),page=await context.newPage(),other=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const origin='http://127.0.0.1:'+server.address().port,url=origin+'/pages/visitor/visitor-counselor-detail.html?id=minh-anh';
 await page.goto(url);await page.locator('.slots li').first().waitFor();
 const count=await page.locator('.slots li').count();
 assert.equal(await page.evaluate(async()=>{const s=await SV2Store.init();return s.schedule.slots.filter(x=>SV2Store.counselorOf(x)==='minh-anh'&&SV2Store.available(s,x)).length;}),count);
 const booking=await page.getByRole('link',{name:'Đặt lịch với chuyên viên',exact:true}).getAttribute('href');assert.match(booking,/counselor=minh-anh/);
 assert((await context.request.get(new URL(booking,url).href)).ok());
 await other.goto(url);await other.locator('.slots li').first().waitFor();
 // Actual Student store books and cancels; the open Visitor tab must react.
 const booked=await other.evaluate(async()=>{const S=SV2Store;await S.init();S.enterStudentDemo(S.config.studentId);const state=S.read(),slot=state.schedule.slots.find(s=>S.counselorOf(s)==='minh-anh'&&S.available(state,s));const next=await S.book(state,slot.id,null,'Nội dung kiểm thử không có dữ liệu thật');return next.schedule.appointments[0].id;});
 await page.waitForFunction(n=>document.querySelectorAll('.slots li').length===n,count-1);
 assert.doesNotMatch(await page.locator('#results').innerText(),/Nội dung kiểm thử|student01|sv-demo/);
 await other.evaluate(async id=>{await SV2Store.cancel(SV2Store.read(),id);},booked);
 await page.waitForFunction(n=>document.querySelectorAll('.slots li').length===n,count);
 // Counselor availability changes, legacy counselor ids, empty/corrupt state and retry.
 await other.evaluate(()=>{const S=SV2Store,state=S.read();state.schedule.slots.forEach(s=>{if(S.counselorOf(s)==='minh-anh')s.available=false;});localStorage.setItem(S.KEY,JSON.stringify(state.schedule));});
 await page.getByRole('button',{name:'Chưa có lịch trống',exact:true}).waitFor();
 assert(await page.getByRole('link',{name:/Xem lịch còn trống: Trần Quang Huy/}).isVisible());
 await other.evaluate(()=>localStorage.setItem(SV2Store.KEY,'broken'));
 await page.getByRole('button',{name:'Tải lại lịch',exact:true}).waitFor();assert.equal(await page.locator('.slots li').count(),0);
 assert.equal(await page.evaluate(()=>localStorage.getItem(SV2Store.KEY)),'broken');
 await other.evaluate(()=>localStorage.removeItem(SV2Store.KEY));await page.locator('.slots li').first().waitFor();
 await other.evaluate(()=>{const S=SV2Store,state=S.read();state.users.find(u=>u.id==='minh-anh').status='disabled';localStorage.setItem(S.USERS,JSON.stringify(state.users));});
 await page.getByRole('button',{name:'Chưa có lịch trống',exact:true}).waitFor();
 await other.evaluate(()=>localStorage.removeItem(SV2Store.USERS));await page.locator('.slots li').first().waitFor();
 await other.close();
 const admin=await context.newPage();
 await admin.goto(origin+'/pages/admin/admin-service-management.html');
 await admin.waitForFunction(()=>window.CampusSession?.ready);
 await admin.evaluate(()=>CampusSession.ready);
 assert(await admin.locator('main').isHidden());
 await admin.evaluate(()=>sessionStorage.setItem('campusmind.session.v1',JSON.stringify({id:'admin-demo-01',role:'admin'})));
 await admin.reload();await admin.locator('#service-rows tr').first().waitFor();
 await admin.getByRole('button',{name:'Sửa: Tham vấn cá nhân',exact:true}).click();
 await admin.evaluate(()=>sessionStorage.removeItem('campusmind.session.v1'));
 await admin.locator('#service-form button[type=submit]').click();
 await admin.locator('#save-error').waitFor();assert.match(await admin.locator('#save-error').innerText(),/Phiên quản trị/);
 assert.equal(await admin.evaluate(()=>localStorage.getItem('campusmind.admin.services.v1')),null);
 await admin.close();
 for(const width of [375,768,1440]){
  await page.setViewportSize({width,height:1000});
  await page.goto(url);await page.locator('.slots li').first().waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.doesNotMatch(await page.locator('body').innerText(), /\bdemo\b/i);
  if(process.env.SV1_SCREENSHOTS){fs.mkdirSync(process.env.SV1_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.SV1_SCREENSHOTS,`schedule-${width}.png`),fullPage:true});}
 }
 assert.deepEqual(errors,[]);console.log('PASS: shared predicate, real Student booking/cancel, live Counselor availability, disabled user, corruption/retry, no private fields, booking route, 375/768/1440px.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
