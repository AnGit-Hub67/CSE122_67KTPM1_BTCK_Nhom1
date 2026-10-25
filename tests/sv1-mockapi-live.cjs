// Explicit opt-in: performs one PUT of unchanged catalog data against the configured API.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
if(process.env.SV1_LIVE_API!=='1'){console.log('SKIP: set SV1_LIVE_API=1 to verify the live catalog.');process.exit(0);}
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[path.extname(file)]||'text/plain');res.end(data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});
 try{
  const context=await browser.newContext(),page=await context.newPage(),origin='http://127.0.0.1:'+server.address().port;
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/pages/admin/admin-service-management.html');await page.locator('#service-rows tr').first().waitFor();
  const catalog=await page.evaluate(()=>CampusMindServices.read());assert.equal(catalog.mode,'remote');assert(catalog.items.length>0);
  const outcome=await page.evaluate(async()=>{const s=CampusMindServices,c=await s.read();await s.write(c.items,c.snapshot);return s.saveNotice();});
  assert.match(outcome,/Đã lưu vào nguồn trực tuyến/);
  const after=await page.evaluate(()=>CampusMindServices.read());assert.deepEqual(after.items,catalog.items);
  // A separate browser storage context must obtain the same live catalog.
  const independent=await browser.newContext(),visitor=await independent.newPage();
  await visitor.goto(origin+'/pages/visitor/visitor-service-directory.html');await visitor.locator('article').first().waitFor();
  assert.equal(await visitor.locator('article').count(),catalog.items.filter(s=>s.status==='active').length);
  assert.equal((await visitor.evaluate(()=>CampusMindServices.read())).mode,'remote');
  await context.route('https://**.mockapi.io/**',r=>r.abort());
  const offline=await page.evaluate(()=>CampusMindServices.read());assert.equal(offline.mode,'offline');assert.deepEqual(offline.items,catalog.items);
  await context.unroute('https://**.mockapi.io/**');assert.equal((await page.evaluate(()=>CampusMindServices.read())).mode,'remote');
  assert.deepEqual(errors,[]);
  console.log('PASS: live browser CORS GET/PUT (unchanged data), independent Visitor context, active-only filtering, cached offline fallback and reconnect. No schedules requests.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
