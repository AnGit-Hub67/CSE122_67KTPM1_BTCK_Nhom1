const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
  // Regression suites must never mutate the configured live catalog.
  if (new URL(req.url, 'http://localhost').pathname.endsWith('/service-config.js')) {
    res.setHeader('Content-Type', 'application/javascript');
    return res.end('window.CampusMindServiceConfig = Object.freeze({endpoint: ""});');
  }

 const file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[path.extname(file)]||'text/plain');res.end(data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
 const context=await browser.newContext(),page=await context.newPage(),other=await context.newPage();
 const origin='http://127.0.0.1:'+server.address().port,route='/pages/visitor/visitor-service-directory.html';
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let records=JSON.parse(fs.readFileSync(path.join(root,'assets/data/admin-services.json'))),offline=false,puts=0,malformed=false;
 // Reserved .test host is intercepted; no request leaves this browser context.
 await context.route('https://catalog.test/record',async r=>{
   if(offline)return r.abort();
   if(r.request().method()==='PUT'){puts++;records=r.request().postDataJSON().items;}
   return r.fulfill({json:malformed?{items:'invalid'}:{items:records}});
 });
 await page.goto(origin+route);await page.locator('article').first().waitFor();
 await other.goto(origin+route);await other.locator('article').first().waitFor();
 await page.getByRole('button',{name:'Chuyển sang tối',exact:true}).click();
 await other.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
 await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.evaluate(()=>{window.CampusMindServiceConfig={endpoint:'https://catalog.test/record'};});
 const initial=await page.evaluate(()=>CampusMindServices.read());assert.equal(initial.mode,'remote');
 const saved=await page.evaluate(async()=>{const s=CampusMindServices,c=await s.read();c.items[0].name='Danh mục trực tuyến';return s.write(c.items,c.snapshot);});
 assert.equal(puts,1);assert.equal(records[0].name,'Danh mục trực tuyến');
 await other.getByRole('heading',{name:'Danh mục trực tuyến',exact:true}).waitFor();
 // A remote change must reject stale writes without silently overwriting it.
 records[0].name='Thay đổi từ thiết bị khác';
 assert.match(await page.evaluate(async snapshot=>{try{await CampusMindServices.write(JSON.parse(snapshot),snapshot);}catch(e){return e.message;}},saved),/tab khác/);
 const fresh=await page.evaluate(()=>CampusMindServices.read());assert.equal(fresh.items[0].name,'Thay đổi từ thiết bị khác');
 malformed=true;assert.equal((await page.evaluate(()=>CampusMindServices.read())).mode,'offline');malformed=false;
 offline=true;
 assert.equal((await page.evaluate(()=>CampusMindServices.read())).mode,'offline');
 await page.evaluate(async()=>{const s=CampusMindServices,c=await s.read();c.items[0].name='Thay đổi khi mất mạng';await s.write(c.items,c.snapshot);});
 assert.match(await page.evaluate(()=>CampusMindServices.saveNotice()),/chỉ lưu trên thiết bị/);
 offline=false;const pending=await page.evaluate(()=>CampusMindServices.read());assert.equal(pending.mode,'offline');assert.equal(pending.items[0].name,'Thay đổi khi mất mạng');assert.equal(puts,1);
 await page.evaluate(()=>localStorage.setItem(CampusMindServices.key,'broken'));
 assert.equal(await page.evaluate(async()=>{try{await CampusMindServices.read();return false;}catch{return true;}}),true);
 assert.equal(await page.evaluate(()=>localStorage.getItem(CampusMindServices.key)),'broken');
 await context.close();
 const visual=await browser.newContext();const view=await visual.newPage();
 for(const width of [375,768,1440])for(const theme of ['light','dark']){
  await view.setViewportSize({width,height:1000});
  for(const url of ['/',route,'/pages/visitor/visitor-resource-library.html','/pages/visitor/visitor-counselor-detail.html','/pages/admin/admin-service-management.html']){
   await view.goto(origin+url.replace(/^\/$/,'/index.html'));
   await view.evaluate(value=>{localStorage.setItem('campusmind.theme.v1',value);window.dispatchEvent(new StorageEvent('storage',{key:'campusmind.theme.v1',newValue:value}));},theme);
   if(url.includes('directory')||url.includes('library'))await view.locator('article').first().waitFor();
   if(url.includes('management'))await view.locator('#service-rows tr').first().waitFor();
   assert(await view.locator('.brand-logo').evaluate(img=>img.complete&&img.naturalWidth>0));
   assert(await view.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),url+' overflow '+width);
   assert.doesNotMatch(await view.locator('body').innerText(),/\bdemo\b/i);
   if(process.env.SV1_SCREENSHOTS&&((width===375&&theme==='dark')||(width===1440&&theme==='light'))){fs.mkdirSync(process.env.SV1_SCREENSHOTS,{recursive:true});await view.screenshot({path:path.join(process.env.SV1_SCREENSHOTS,`${path.basename(url)||'home'}-${width}-${theme}.png`),fullPage:true});}
  }
 }
 // Loading must contain an actual skeleton, and retry must recover after a failed read.
 await view.route('**/assets/data/visitor.json',r=>r.abort());await view.goto(origin+route);await view.getByRole('button',{name:'Thử lại',exact:true}).waitFor();
 await view.unroute('**/assets/data/visitor.json');await view.getByRole('button',{name:'Thử lại',exact:true}).click();await view.locator('article').first().waitFor();
 await view.route('**/assets/data/visitor.json',async r=>{await new Promise(resolve=>setTimeout(resolve,350));await r.continue();});
 await view.goto(origin+route,{waitUntil:'domcontentloaded'});await view.locator('.loading-skeleton').first().waitFor();await view.locator('article').first().waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS: remote GET/PUT, cross-tab propagation, stale conflict, invalid payload, offline pending/no replay, corrupt cache preservation, theme sync/persistence, 30 responsive/theme views, logo, no demo, retry and skeleton.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
