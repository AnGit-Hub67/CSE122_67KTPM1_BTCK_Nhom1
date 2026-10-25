// Run with Node.js and Playwright installed; no application build is required.
const { chromium } = require("playwright");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const server = http.createServer((req, res) => {
  const file = path.join(
    root,
    decodeURIComponent(new URL(req.url, "http://localhost").pathname),
  );
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html; charset=utf-8",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
      }[path.extname(file)] || "application/octet-stream",
    );
    res.end(data);
  });
});
(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const base = "http://127.0.0.1:" + server.address().port + "/";
    const pages = [
      "index.html",
      "pages/visitor/index.html",
      "pages/student/index.html",
      "pages/counselor/index.html",
      "pages/admin/index.html",
      "pages/ui-kit.html",
    ];
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const file of pages) {
        await page.goto(base + file);
        assert.equal(await page.locator("h1").count(), 1);
        assert.equal(await page.locator("main").count(), 1);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          file + " overflow " + width,
        );
        for (const href of await page
          .locator("a[href]")
          .evaluateAll((nodes) => nodes.map((node) => node.href))) {
          assert.equal((await context.request.get(href)).ok(), true, href);
          const url = new URL(href);
          if (url.hash) {
            const html = await (await context.request.get(href)).text();
            assert.ok(html.includes('id="' + url.hash.slice(1) + '"'), href);
          }
        }
        for (const src of await page
          .locator("script[src],link[rel=stylesheet]")
          .evaluateAll((nodes) => nodes.map((node) => node.src || node.href)))
          assert.equal((await context.request.get(src)).ok(), true, src);
        if (width === 375) {
          const toggle = page.locator('[aria-controls="primary-navigation"]');
          assert.equal(
            await page.locator("#primary-navigation").isVisible(),
            false,
          );
          await toggle.click();
          assert.equal(await toggle.getAttribute("aria-expanded"), "true");
          await page.locator("#primary-navigation a").first().focus();
          await page.keyboard.press("Escape");
          assert.equal(
            await page.locator("#primary-navigation").isVisible(),
            false,
          );
          assert.equal(
            await toggle.evaluate((node) => node === document.activeElement),
            true,
          );
          if (await page.locator(".sidebar").count()) {
            await page.locator('[aria-controls="role-navigation"]').click();
            assert.equal(
              await page.locator("#role-navigation").isVisible(),
              true,
            );
            await page.locator("#role-navigation a").first().focus();
            await page.keyboard.press("Escape");
            assert.equal(
              await page.locator("#role-navigation").isVisible(),
              false,
            );
          }
        }
        if (process.env.LAYOUT_SCREENSHOTS) {
          fs.mkdirSync(process.env.LAYOUT_SCREENSHOTS, { recursive: true });
          await page.screenshot({
            path: path.join(
              process.env.LAYOUT_SCREENSHOTS,
              file.replaceAll("/", "-") + "-" + width + ".png",
            ),
            fullPage: true,
          });
        }
      }
    }
    await page.goto(base + "pages/ui-kit.html");
    await page.getByRole("button", { name: "Mở hộp thoại" }).click();
    assert.equal(
      await page.locator("dialog").evaluate((node) => node.open),
      true,
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await page
        .getByRole("button", { name: "Mở hộp thoại" })
        .evaluate((node) => node === document.activeElement),
      true,
    );
    await page.setViewportSize({ width: 375, height: 800 });
    await page.locator('[aria-controls="primary-navigation"]').click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.waitForFunction(
      () =>
        document.querySelector('[aria-controls="primary-navigation"]').hidden,
    );
    assert.equal(await page.locator("#primary-navigation").isVisible(), true);
    assert.equal(
      await page.locator('[aria-controls="primary-navigation"]').isVisible(),
      false,
    );
    await page.goto(base + "index.html");
    await page.keyboard.press("Tab");
    assert.equal(
      await page
        .locator(".skip-link")
        .evaluate((node) => node === document.activeElement),
      true,
    );
    await page.keyboard.press("Enter");
    assert.equal(
      await page
        .locator("main")
        .evaluate((node) => node === document.activeElement),
      true,
    );
    const noJs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 375, height: 800 },
    });
    const fallback = await noJs.newPage();
    await fallback.goto(base + "pages/admin/index.html");
    assert.equal(
      await fallback.locator("#primary-navigation").isVisible(),
      true,
    );
    assert.equal(await fallback.locator("#role-navigation").isVisible(), true);
    assert.equal(
      await fallback.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await noJs.close();
    assert.deepEqual(errors, []);
    console.log(
      "PASS: 18 responsive views, routes/assets, menu/sidebar keyboard and resize, dialog focus, skip link, no-JS navigation.",
    );
  } finally {
    await browser.close();
  }
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => server.close());
