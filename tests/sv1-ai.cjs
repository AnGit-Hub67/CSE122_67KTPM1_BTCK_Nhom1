const { chromium } = require('playwright');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
    let route = new URL(req.url, 'http://localhost').pathname;
    if (route.endsWith('/service-config.js')) return res.setHeader('Content-Type', 'application/javascript'), res.end('window.CampusMindServiceConfig={endpoint:""}');
    if (route === '/') route = '/index.html';
    const file = path.join(root, decodeURIComponent(route));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    fs.readFile(file, (e, b) => { if (e) return res.writeHead(404).end(); res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' })[path.extname(file)] || 'text/plain'); res.end(b); });
});

(async () => {
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
    try {
        const context = await browser.newContext();
        await context.route(/^https?:\/\//, r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
        const page = await context.newPage(), base = 'http://127.0.0.1:' + server.address().port, errors = [];
        page.on('pageerror', e => errors.push(e.message));
        const ready = () => page.waitForFunction(() => !document.querySelector('#suggestion-topic').disabled);
        const generate = async () => { await page.getByRole('button', { name: 'Tạo gợi ý', exact: true }).click(); await page.locator('.suggestion-card').waitFor(); };
        for (const [route, key] of [['visitor-service-directory.html', 'campusmind.visitor.savedServices.v1'], ['visitor-resource-library.html', 'campusmind.visitor.savedResources.v1']]) {
            await page.goto(base + '/pages/visitor/' + route); await ready();
            await page.getByRole('button', { name: 'Tạo gợi ý', exact: true }).click(); assert.match(await page.locator('#suggestion-status').innerText(), /Chưa đủ thông tin/);
            await page.locator('#suggestion-topic').selectOption('__unsure__'); await page.getByRole('button', { name: 'Tạo gợi ý', exact: true }).click(); assert.equal(await page.locator('.suggestion-card').count(), 0);
            await page.locator('#suggestion-topic').selectOption({ index: 1 });
            await page.getByRole('button', { name: 'Tạo gợi ý', exact: true }).click(); assert.equal(await page.locator('#suggestion-panel').getAttribute('aria-busy'), 'true'); await page.locator('.suggestion-card').waitFor();
            assert.match(await page.locator('.suggestion-card').innerText(), /Vì sao có gợi ý này/);
            await page.getByRole('button', { name: 'Từ chối', exact: true }).click(); assert.equal(await page.locator('.suggestion-card').count(), 0); assert.equal(await page.evaluate(k => localStorage.getItem(k), key), null);
            await generate(); await page.getByRole('button', { name: 'Chỉnh sửa nhu cầu', exact: true }).click(); assert.equal(await page.locator('.suggestion-card').count(), 0);
            await generate(); await page.getByRole('button', { name: 'Tạo lại', exact: true }).click(); await page.locator('.suggestion-card').waitFor();
            const title = await page.locator('.suggestion-card h3').innerText();
            await page.getByRole('button', { name: 'Chấp nhận và lưu', exact: true }).click(); assert.match(await page.locator('#suggestion-status').innerText(), /Đã chấp nhận và lưu/); assert.equal((await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key)).length, 1);
            assert.equal(await page.locator('#search').inputValue(), title); assert.match(await page.locator('#results').innerText(), new RegExp(title));
            await page.reload(); await ready(); assert.match(await page.locator('.suggestion-saved').innerText(), new RegExp(title));
            if (route.includes('resource')) { await page.locator('#saved-only').check(); assert.equal(await page.locator('#results article').count(), 1); }
            await page.locator('.suggestion-saved').getByRole('button', { name: 'Bỏ lưu', exact: true }).click(); assert.deepEqual(await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key), []);
            await page.locator('#suggestion-topic').selectOption({ index: 1 }); await generate();
            await page.evaluate(() => { window.originalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('Quota', 'QuotaExceededError'); }; });
            await page.getByRole('button', { name: 'Chấp nhận và lưu', exact: true }).click(); assert.match(await page.locator('#suggestion-status').innerText(), /Không thể lưu/); assert.deepEqual(await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key), []);
            await page.evaluate(() => Storage.prototype.setItem = window.originalSetItem);
            for (const theme of ['light', 'dark']) { await page.evaluate(t => document.documentElement.dataset.theme = t, theme); for (const width of [375, 768, 1440]) { await page.setViewportSize({ width, height: 900 }); assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); if (process.env.QA_DIR) { fs.mkdirSync(process.env.QA_DIR, { recursive: true }); await page.screenshot({ path: path.join(process.env.QA_DIR, route + '-' + theme + '-' + width + '.png'), fullPage: true }); } } }
            await page.setViewportSize({ width: 1440, height: 900 });
            await page.getByRole('button', { name: 'Tạo lại', exact: true }).click(); await page.evaluate(() => window.dispatchEvent(new Event('campusmind:catalog-loading'))); await page.waitForTimeout(550); assert.equal(await page.locator('.suggestion-card').count(), 0);
        }
        // A real catalog request failure exposes a retry and recovers the AI panel.
        await context.route('**/assets/data/visitor.json', r => r.fulfill({ status: 500, body: 'failed' }));
        await page.goto(base + '/pages/visitor/visitor-resource-library.html'); await page.waitForFunction(() => document.querySelector('#suggestion-status').textContent.includes('Không tải được'));
        assert(await page.getByRole('button', { name: 'Tạo gợi ý', exact: true }).isDisabled());
        await context.unroute('**/assets/data/visitor.json'); await page.getByRole('button', { name: 'Thử lại', exact: true }).click(); await ready();
        // Catalog strings must remain text, not HTML.
        await page.evaluate(() => window.dispatchEvent(new CustomEvent('campusmind:catalog', { detail: { items: [{ id: 'xss', title: '<img src=x onerror=alert(1)>', description: 'Safe text', category: 'Test', format: 'Bài viết' }] } })));
        await page.locator('#suggestion-topic').selectOption('Test'); await generate(); assert.equal(await page.locator('.suggestion-card img').count(), 0);
        assert.deepEqual(errors, []);
        console.log('PASS: both AI flows, loading, uncertainty, explainability, edit/reject/regenerate, persistent save/apply/reload/unsave, storage failure, catalog failure/retry, stale result cancellation, text safety and responsive themes.');
    } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); server.close(); process.exitCode = 1; });
