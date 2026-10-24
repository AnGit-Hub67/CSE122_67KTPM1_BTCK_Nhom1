const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req,res) => {
 const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file = path.join(root,pathname);
 if (!file.startsWith(root+path.sep)) return res.writeHead(403).end();
 fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)]||'text/plain');res.end(data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 try {
 const context=await browser.newContext();const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:'+server.address().port;const url=base+'/pages/admin/admin-service-management.html';const key='campusmind.admin.services.v1';
 await page.goto(url);await page.locator('#service-rows tr').first().waitFor();assert.equal(await page.locator('#service-rows tr').count(),4);
 for(const width of [1440,768,375]) {
 await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(process.env.ADMIN_SCREENSHOTS){fs.mkdirSync(process.env.ADMIN_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.ADMIN_SCREENSHOTS,`admin-${width}.png`),fullPage:true});}
 }
 await page.locator('#service-search').fill('THAM VAN');assert.equal(await page.locator('#service-rows tr').count(),1);
 await page.locator('#service-search').fill('no result');assert(await page.locator('#empty-state').isVisible());
 await page.locator('#clear-filters').click();await page.locator('#status-filter').selectOption('archived');assert.equal(await page.locator('#service-rows tr').count(),1);assert.equal(await page.locator('#service-rows button').count(),0);
 await page.locator('#clear-filters').click();await page.locator('#add-service').click();await page.locator('#service-form button[type=submit]').click();assert.equal(await page.locator('#service-name').getAttribute('aria-invalid'),'true');
 async function fill(name){await page.locator('#service-name').fill(name);await page.locator('#service-category').selectOption('Workshop');await page.locator('#service-duration').fill('60');await page.locator('#service-description').fill('Nội dung mô tả dịch vụ để kiểm thử.');}
 await fill('Tham vấn cá nhân');await page.locator('#service-form button[type=submit]').click();assert((await page.locator('#name-error').innerText()).includes('đã tồn tại'));
 await fill('Dịch vụ kiểm thử');await page.locator('#service-duration').fill('16');await page.locator('#service-form button[type=submit]').click();assert.equal(await page.locator('#service-duration').getAttribute('aria-invalid'),'true');await page.locator('#service-duration').fill('60');
 await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw new Error('quota');};});
 await page.locator('#service-form button[type=submit]').click();await page.locator('#save-error').waitFor();assert.equal(await page.locator('#service-rows tr').count(),4);
 await page.evaluate(()=>Storage.prototype.setItem=window.originalSet);await page.locator('#service-form button[type=submit]').click();await page.waitForFunction(() => document.querySelectorAll('#service-rows tr').length === 5);
 await page.reload();await page.getByRole('button',{name:'Sửa: Dịch vụ kiểm thử',exact:true}).click();await page.locator('#service-name').fill('Dịch vụ đã sửa');await page.locator('#service-status').selectOption('inactive');await page.locator('#service-form button[type=submit]').click();
 await page.getByRole('button',{name:'Lưu trữ: Dịch vụ đã sửa',exact:true}).click();await page.getByRole('button',{name:'Giữ dịch vụ',exact:true}).click();assert(await page.getByRole('button',{name:'Sửa: Dịch vụ đã sửa',exact:true}).isVisible());
 await page.getByRole('button',{name:'Lưu trữ: Dịch vụ đã sửa',exact:true}).click();await page.keyboard.press('Escape');assert.equal(await page.locator('#archive-dialog').isVisible(),false);
 await page.getByRole('button',{name:'Lưu trữ: Dịch vụ đã sửa',exact:true}).click();await page.locator('#confirm-archive').click();await page.locator('#archive-dialog').waitFor({state:'hidden'});await page.reload();await page.locator('#status-filter').selectOption('archived');assert.equal(await page.locator('#service-rows tr').count(),2);
 await page.locator('#add-service').click();await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'add-service');
 // All navigation and assets resolve under the current relative path.
 for(const ref of await page.locator('a[href],link[href],script[src]').evaluateAll(es=>es.map(e=>e.href||e.src))){const response=await context.request.get(ref);assert.equal(response.status(),200,ref);}
 // A stale open form must never overwrite a newer change from another tab.
 await page.locator('#clear-filters').click();
 await page.getByRole('button',{name:'Sửa: Tham vấn cá nhân',exact:true}).click();
 const second = await context.newPage(); await second.goto(url);
 await second.getByRole('button',{name:'Sửa: Tham vấn cá nhân',exact:true}).click();
 await second.locator('#service-name').fill('Tham vấn đã cập nhật');
 await second.locator('#service-counselorId').selectOption('quang-huy');
 await second.locator('#service-form button[type=submit]').click();
 await second.locator('#service-dialog').waitFor({state:'hidden'});
 await page.locator('#service-name').fill('Thay đổi từ tab cũ');
 await page.locator('#service-form button[type=submit]').click();
 await page.locator('#save-error').waitFor();
 assert.match(await page.locator('#save-error').innerText(), /tab khác/);
 assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k))[0].name,key),'Tham vấn đã cập nhật');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Sửa: Tham vấn đã cập nhật',exact:true}).waitFor();
 await second.close();
 // Stored text is rendered as text, never executable HTML.
 await page.getByRole('button',{name:'Sửa: Tham vấn đã cập nhật',exact:true}).click();
 await page.locator('#service-description').fill('<img src=x onerror="window.injected=true">');
 await page.locator('#service-form button[type=submit]').click();
 await page.locator('#service-dialog').waitFor({state:'hidden'});
 assert.equal(await page.locator('#service-rows img').count(),0);
 assert.equal(await page.evaluate(()=>window.injected),undefined);
 await page.evaluate(k=>localStorage.setItem(k,'[]'),key);await page.reload();await page.locator('#empty-state').waitFor();assert.equal(await page.locator('#active-count').innerText(),'0');
 await page.evaluate(k=>localStorage.setItem(k,'broken json'),key);await page.reload();await page.locator('#load-error').waitFor();assert(await page.locator('#add-service').isDisabled());assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),'broken json');
 await page.evaluate(k=>localStorage.removeItem(k),key);await page.locator('#retry-load').click();await page.locator('#service-rows tr').first().waitFor();
 await page.route('**/assets/data/admin-services.json',r=>r.fulfill({status:503,body:'unavailable'}));await page.reload();await page.locator('#load-error').waitFor();await page.unroute('**/assets/data/admin-services.json');await page.locator('#retry-load').click();await page.locator('#service-rows tr').first().waitFor();
 let release;const gate=new Promise(r=>release=r);await page.route('**/assets/data/admin-services.json',async r=>{await gate;await r.continue();});await page.goto(url,{waitUntil:'domcontentloaded'});assert(await page.locator('#loading-state').isVisible());assert.equal(await page.locator('#service-results').getAttribute('aria-busy'),'true');release();await page.locator('#service-rows tr').first().waitFor();await page.unroute('**/assets/data/admin-services.json');
 const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();await staticPage.goto(url);assert(await staticPage.locator('noscript').isVisible());assert(await staticPage.getByRole('link',{name:'Quản lý dịch vụ',exact:true}).first().isVisible());await nojs.close();
 assert.deepEqual(errors,[]);console.log('PASS: CRUD/persistence, validation, filters, archive cancel/Escape/confirm, storage failure, corrupt/empty/network/loading states, focus, links, no-JS, 1440/768/375px.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
