const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = process.env.CAMPUSMIND_ROOT || path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  fs.readFile(file, (err, data) => { if (err) return res.writeHead(404).end(); res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' })[path.extname(file)] || 'text/plain'); res.end(data); });
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext(); const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const base = 'http://127.0.0.1:' + server.address().port;
    await page.goto(base + '/login.html'); await page.locator('#login-form:not([hidden])').waitFor();
    assert.equal(await page.locator('#account option[value="sv-demo-02"]').count(), 0);
    await page.locator('#account').selectOption('sv-demo-01'); await page.getByRole('button', { name: 'Vào CampusMind' }).click();
    await page.locator('#login-success:not([hidden])').waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('campusmind.sv2.student.session.v1')), 'sv-demo-01');
    await page.locator('#logout').click(); await page.locator('#login-form:not([hidden])').waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('campusmind.session.v1')), null);
    await page.evaluate(() => localStorage.setItem('campusmind.sv2.users.v1', 'broken')); await page.reload();
    await page.locator('#login-retry:not([hidden])').waitFor(); assert.match(await page.locator('#login-error').innerText(), /Dữ liệu/);
    assert.equal(await page.evaluate(() => localStorage.getItem('campusmind.sv2.users.v1')), 'broken');
    await page.evaluate(() => localStorage.clear()); await page.locator('#login-retry').click(); await page.locator('#login-form:not([hidden])').waitFor();
    // New registered account is read from SV2's exact shared key.
    await page.evaluate(() => localStorage.setItem('campusmind.sv2.users.v1', JSON.stringify([{ id: 'new-student', name: 'Sinh viên mới', email: 'new@example.test', role: 'student', status: 'active' }])));
    await page.reload(); await page.locator('#account option[value="new-student"]').waitFor({ state: 'attached' });
    await page.locator('#account').selectOption('new-student'); await page.getByRole('button', { name: 'Vào CampusMind' }).click(); await page.locator('#login-success:not([hidden])').waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('campusmind.sv2.student.session.v1')), 'new-student');
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    for (const kind of ['service-directory', 'resource-library']) {
      await page.goto(base + '/pages/visitor/visitor-' + kind + '.html'); await page.locator('#suggestion-topic option').nth(1).waitFor({ state: 'attached' });
      await page.getByRole('button', { name: 'Tạo gợi ý', exact: true }).click(); assert.match(await page.locator('.suggestion-panel').innerText(), /Vui lòng chọn/);
      await page.locator('#suggestion-topic').selectOption({ index: 1 }); await page.getByRole('button', { name: 'Tạo gợi ý', exact: true }).click();
      await page.locator('#suggestion-result h3').waitFor(); const title = await page.locator('#suggestion-result h3').innerText();
      await page.getByRole('button', { name: 'Chấp nhận và xem' }).click(); assert.equal(await page.locator('#search').inputValue(), title);
      if (kind === 'resource-library') {
        await page.getByRole('button', { name: 'Lưu gợi ý', exact: true }).click(); await page.waitForFunction(() => JSON.parse(localStorage.getItem('campusmind.visitor.savedResources.v1') || '[]').length === 1);
        await page.locator('#saved-only').check(); assert.equal(await page.locator('#results article').count(), 1);
      }
      await page.getByRole('button', { name: 'Tạo lại', exact: true }).click(); await page.locator('#suggestion-result h3').waitFor();
      await page.getByRole('button', { name: 'Bỏ qua gợi ý' }).click(); assert.equal(await page.locator('#suggestion-result h3').count(), 0);
    }
    // In-flight recommendations are invalidated when the catalog changes in another tab.
    await page.goto(base + '/pages/visitor/visitor-service-directory.html'); await page.locator('#suggestion-topic option').nth(1).waitFor({ state: 'attached' });
    await page.locator('#suggestion-topic').selectOption({ index: 1 }); await page.getByRole('button', { name: 'Tạo gợi ý', exact: true }).click();
    const other = await context.newPage(); await other.goto(base + '/index.html'); await other.evaluate(() => localStorage.setItem('campusmind.admin.services.v1', '[]'));
    await page.waitForFunction(() => document.querySelector('.suggestion-panel').textContent.includes('Chưa có nội dung'));
    assert.equal(await page.locator('#suggestion-result h3').count(), 0); await other.evaluate(() => localStorage.clear()); await other.close();
    // Storage denial must not report a successful login.
    await page.goto(base + '/login.html'); await page.locator('#login-form:not([hidden])').waitFor(); await page.locator('#account').selectOption('sv-demo-01');
    await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage blocked', 'SecurityError'); }; });
    await page.getByRole('button', { name: 'Vào CampusMind' }).click(); await page.waitForFunction(() => document.querySelector('#login-error').textContent.length > 0);
    assert(await page.locator('#login-success').isHidden());
    for (const width of [375, 768, 1440]) {
      for (const route of ['login.html', 'pages/visitor/visitor-service-directory.html', 'pages/visitor/visitor-resource-library.html']) {
        await page.setViewportSize({ width, height: 900 }); await page.goto(base + '/' + route);
        if (route === 'login.html') await page.locator('#login-form:not([hidden])').waitFor(); else await page.locator('#results article').first().waitFor();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflows at ${width}`);
        const output = process.env.QA_DIR; if (output) { fs.mkdirSync(output, { recursive: true }); await page.screenshot({ path: path.join(output, `${path.basename(route)}-${width}.png`), fullPage: true }); }
      }
    }
    if (fs.existsSync(path.join(root, 'pages/student/student-booking.html'))) {
      await page.goto(base + '/pages/visitor/visitor-counselor-detail.html?id=quang-huy'); await page.getByRole('button', { name: 'Đặt lịch với chuyên viên' }).click();
      await page.waitForURL('**/student-booking.html?counselor=quang-huy'); await page.waitForFunction(() => document.querySelector('#counselor')?.value === 'quang-huy');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: demo login/logout, registered/disabled users, corrupt/denied storage, AI validation/accept/regenerate/reject/save, catalog invalidation, 9 responsive views, integrated booking when present.');
  } finally { await browser.close(); server.close(); }
})().catch(err => { console.error(err); process.exitCode = 1; server.close(); });
