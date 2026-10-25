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
  const context=await browser.newContext(); const admin=await context.newPage(); const visitor=await context.newPage();
  const errors=[];for(const page of [admin,visitor])page.on('pageerror',e=>errors.push(e.message));
  const origin='http://127.0.0.1:'+server.address().port;
  await admin.goto(origin+'/pages/admin/admin-service-management.html');
  await admin.locator('#service-rows tr').first().waitFor();
  await visitor.goto(origin+'/pages/visitor/visitor-service-directory.html');
  await visitor.waitForFunction(()=>document.querySelectorAll('article').length===2);
  await admin.locator('#add-service').click();
  await admin.locator('#service-name').fill('Dịch vụ liên thông');
  await admin.locator('#service-category').selectOption('Workshop');
  await admin.locator('#service-duration').fill('60');
  await admin.locator('#service-description').fill('Dịch vụ giả lập để kiểm thử tích hợp frontend.');
  await admin.locator('#service-counselorId').selectOption('quang-huy');
  await admin.locator('#service-form button[type=submit]').click();
  await admin.locator('#service-dialog').waitFor({state:'hidden'});
  const card=visitor.locator('article').filter({hasText:'Dịch vụ liên thông'});
  await card.waitFor();assert.match(await card.locator('a').getAttribute('href'),/quang-huy/);
  await card.locator('a').click();await visitor.locator('.detail-layout').waitFor();
  assert.equal(await visitor.locator('h1').innerText(),'Trần Quang Huy');
  await visitor.goBack();await card.waitFor();
  await admin.getByRole('button',{name:'Sửa: Dịch vụ liên thông',exact:true}).click();
  await admin.locator('#service-status').selectOption('inactive');
  await admin.locator('#service-form button[type=submit]').click();
  await card.waitFor({state:'detached'});
  await admin.getByRole('button',{name:'Sửa: Dịch vụ liên thông',exact:true}).click();
  await admin.locator('#service-status').selectOption('active');
  await admin.locator('#service-counselorId').selectOption('');
  await admin.locator('#service-form button[type=submit]').click();
  await card.waitFor();assert(await card.getByRole('button',{name:'Chưa phân công chuyên viên'}).isDisabled());
  await admin.getByRole('button',{name:'Lưu trữ: Dịch vụ liên thông',exact:true}).click();
  await admin.locator('#confirm-archive').click();await card.waitFor({state:'detached'});
  await visitor.reload();await visitor.waitForFunction(()=>document.querySelectorAll('article').length===2);
  // Corrupt catalog must show an error instead of stale or archived entries.
  await admin.evaluate(()=>localStorage.setItem('campusmind.admin.services.v1','broken'));
  await visitor.getByRole('button',{name:'Thử lại',exact:true}).waitFor();
  assert(await visitor.locator('#search').isDisabled());
  assert.equal(await visitor.locator('article').count(),0);
  assert.deepEqual(errors,[]);
  console.log('PASS: Admin create/update/inactive/archive -> live Visitor, counselor relation, unassigned disabled, reload, corrupt storage.');
 } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
