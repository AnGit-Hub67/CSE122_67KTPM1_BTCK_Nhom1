const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 let route=new URL(req.url,'http://localhost').pathname;
 if(route.endsWith('/service-config.js'))return res.setHeader('Content-Type','application/javascript'),res.end('window.CampusMindServiceConfig={endpoint:""}');
 if(route==='/')route='/index.html';
 const file=path.join(root,decodeURIComponent(route));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[path.extname(file)]||'text/plain');res.end(b);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
 const ctx=await browser.newContext();await ctx.route(/^https?:\/\//,r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await ctx.route('**/public-schedule.js',r=>r.fulfill({contentType:'application/javascript',body:'window.CampusMindPublicSchedule={read:async()=>[{counselorId:"minh-anh",date:"2099-12-01",start:"09:00",end:"09:50"}]}'}));
 const page=await ctx.newPage(),base='http://127.0.0.1:'+server.address().port,errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/pages/visitor/visitor-counselor-detail.html');await page.locator('#results article').last().waitFor();assert.equal(await page.locator('#results article').count(),6);
 await page.getByRole('button',{name:'Đặt lịch với chuyên viên',exact:true}).first().click();await page.getByRole('dialog').waitFor();assert.match(await page.locator('#dialog-title').innerText(),/đăng nhập/);await page.getByRole('button',{name:'Đăng nhập',exact:true}).waitFor();await page.locator('#dialog-body').getByText(/chưa được tích hợp/).waitFor();assert(await page.getByRole('button',{name:'Đăng nhập',exact:true}).isDisabled());await page.keyboard.press('Escape');
 await ctx.route('**/sv2-login.html**',r=>r.fulfill({contentType:'text/html',body:'<h1>Đăng nhập</h1>'}));
 await page.getByRole('button',{name:'Đặt lịch với chuyên viên',exact:true}).first().click();await page.waitForFunction(()=>[...document.querySelectorAll('#dialog-body button')].some(b=>!b.disabled));await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await page.waitForURL(/sv2-login.html\?role=student/);
 await page.goto(base+'/pages/visitor/visitor-counselor-detail.html?id=minh-anh');await page.locator('.detail-layout').waitFor();
 await page.evaluate(()=>localStorage.setItem('campusmind.sv2.users.v1',JSON.stringify([{id:'minh-anh',role:'counselor',status:'active',name:'Chuyên viên thử nghiệm',email:'public@example.test',phone:'PRIVATE-PHONE',counselorProfile:{bio:'Tiểu sử đã cập nhật <img src=x onerror=alert(1)>',qualification:'ThS.',organization:'Đơn vị thử nghiệm',specialties:'Học tập;Giấc ngủ',experience:'8 năm',privateNotes:'PRIVATE-NOTE'}}])));
 await page.reload();await page.locator('.detail-layout').waitFor();const text=await page.locator('#results').innerText();assert.match(text,/Tiểu sử đã cập nhật/);assert.match(text,/public@example.test/);assert.doesNotMatch(text,/PRIVATE-PHONE|PRIVATE-NOTE/);assert.equal(await page.locator('#results img').count(),0);
 await page.goto(base+'/index.html');await page.locator('#home-people article').first().waitFor();assert.match(await page.locator('#home-people').innerText(),/Chuyên viên thử nghiệm/);assert.equal(await page.locator('[data-counter]').count(),3);
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('#home-people article').first().waitFor();assert.equal(await page.locator('[data-counter="5000"]').innerText(),'5000+');
 for(const theme of ['light','dark']) {
   await page.evaluate(t=>localStorage.setItem('campusmind.theme.v1',t),theme);
   for(const width of [375,768,1440]) {
     await page.setViewportSize({width,height:900});
     await page.goto(base+'/pages/admin/index.html');
     const colors=await page.locator('.sidebar').evaluate(e=>[getComputedStyle(e).backgroundColor,getComputedStyle(e).color]);
     const navigate=async(name)=>{if(await page.locator('.sidebar [data-nav-toggle]').isVisible() && await page.locator('#role-navigation').isHidden())await page.locator('.sidebar [data-nav-toggle]').click();await page.locator('#role-navigation').getByRole('link',{name,exact:true}).click();};
     await navigate('Quản lý dịch vụ');
     assert.deepEqual(await page.locator('.sidebar').evaluate(e=>[getComputedStyle(e).backgroundColor,getComputedStyle(e).color]),colors);
     await navigate('Khám phá dịch vụ');await page.waitForURL('**/visitor-service-directory.html?from=admin');await page.locator('.sidebar').waitFor();
     assert(await page.locator('.sidebar').isVisible());
     assert.deepEqual(await page.locator('.sidebar').evaluate(e=>[getComputedStyle(e).backgroundColor,getComputedStyle(e).color]),colors);
     assert.equal(await page.locator('#role-navigation [aria-current]').textContent(),'Khám phá dịch vụ');
     await page.reload();assert(await page.locator('.sidebar').isVisible());
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
     await navigate('Tổng quan');await page.waitForURL('**/pages/admin/index.html');
   }
 }
 await page.goto(base+'/pages/visitor/visitor-service-directory.html');assert.equal(await page.locator('.sidebar').count(),0);
 const routes=['index.html','pages/visitor/index.html','pages/visitor/visitor-service-directory.html','pages/visitor/visitor-resource-library.html','pages/visitor/visitor-counselor-detail.html','pages/admin/admin-service-management.html'];
 for(const route of routes){for(const theme of ['light','dark']){await page.evaluate(t=>localStorage.setItem('campusmind.theme.v1',t),theme);await page.goto(base+'/'+route);if(await page.locator('#results').count())await page.waitForFunction(()=>document.querySelector('#results').getAttribute('aria-busy')==='false');if(route.includes('admin-service'))await page.locator('#service-rows tr').first().waitFor();assert(await page.locator('.crisis-line').isVisible());assert.match(await page.locator('footer').innerText(),/Thông tin minh họa cho mục đích học tập/);for(const width of [375,768,1440]){await page.setViewportSize({width,height:900});await page.waitForTimeout(50);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' '+theme+' '+width);}}}
 assert.deepEqual(errors,[]);console.log('PASS: six profiles, login dialog/fallback, public profile updates and privacy, homepage, reduced motion, six SV1 pages in both themes at three widths.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

