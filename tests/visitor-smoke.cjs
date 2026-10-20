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
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.VISITOR_BROWSER
      ? { executablePath: process.env.VISITOR_BROWSER }
      : {}),
  });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const base = `http://127.0.0.1:${server.address().port}/pages/visitor/`;
    const visit = async (slug, suffix = "") => {
      await page.goto(`${base}visitor-${slug}.html${suffix}`);
      await page.waitForSelector('#results[aria-busy="false"]');
    };
    await visit("service-directory");
    assert.equal(await page.locator("article").count(), 2);
    await page.locator("#search").fill("tham van");
    assert.equal(await page.locator("article").count(), 1);
    await page.locator("#category").selectOption("Đồng hành");
    assert.equal(await page.locator("article").count(), 0);
    await page
      .getByRole("button", { name: "Xóa bộ lọc", exact: true })
      .last()
      .click();
    assert.equal(await page.locator("article").count(), 2);
    const serviceLinks = await page
      .locator("article a")
      .evaluateAll((nodes) => nodes.map((node) => node.href));
    for (const href of serviceLinks) {
      await page.goto(href);
      await page.waitForSelector('#results[aria-busy="false"]');
      assert.equal(await page.locator(".detail-layout").count(), 1);
    }
    await visit("resource-library");
    await page.locator("#search").fill("hoc tap");
    await page.locator("#category").selectOption("Học tập");
    assert.equal(await page.locator("article").count(), 1);
    await page.locator("#category").selectOption("Kết nối");
    assert.equal(await page.locator("article").count(), 0);
    await page.locator("#reset").click();
    assert.equal(await page.locator("article").count(), 4);
    await page.locator("[data-save]").first().click();
    await page.reload();
    await page.waitForSelector('#results[aria-busy="false"]');
    assert.equal(await page.locator('[aria-pressed="true"]').count(), 1);
    const otherTab = await context.newPage();
    await otherTab.goto(`${base}visitor-resource-library.html`);
    await otherTab.waitForSelector('#results[aria-busy="false"]');
    await otherTab.locator("[data-save]").nth(1).click();
    await page.waitForFunction(
      () => document.querySelectorAll('[aria-pressed="true"]').length === 2,
    );
    await otherTab.locator("[data-save]").nth(1).click();
    await page.waitForFunction(
      () => document.querySelectorAll('[aria-pressed="true"]').length === 1,
    );
    await otherTab.close();
    await page.locator('#clear-saved').click();
    await page.getByRole('button', {name:'Giữ danh sách',exact:true}).click();
    assert.equal(await page.locator('[aria-pressed="true"]').count(),1);
    await page.locator('#clear-saved').click();
    await page.locator('#confirm-clear-saved').click();
    assert.equal(await page.locator('[aria-pressed="true"]').count(),0);
    assert(await page.locator('#clear-saved').isDisabled());
    await page.locator('[data-save]').first().click();
    await page.locator("#saved-only").check();
    assert.equal(await page.locator("article").count(), 1);
    await page.getByRole("button", { name: "Đọc tài nguyên" }).click();
    assert.equal(
      await page.locator("#content-dialog").evaluate((node) => node.open),
      true,
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await page.locator("#content-dialog").evaluate((node) => node.open),
      false,
    );
    await page.locator("[data-save]").click();
    assert.equal(await page.locator("article").count(), 0);
    assert.equal(
      await page
        .locator("#saved-only")
        .evaluate((node) => node === document.activeElement),
      true,
    );
    await page.locator("#saved-only").uncheck();
    await page.evaluate(() =>
      localStorage.setItem("campusmind.visitor.savedResources.v1", "{bad json"),
    );
    await page.reload();
    await page.waitForSelector('#results[aria-busy="false"]');
    assert.match(await page.locator("#feedback").innerText(), /Không thể đọc/);
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new Error("blocked");
      };
    });
    await page.locator("[data-save]").first().click();
    assert.match(
      await page.locator("#feedback").innerText(),
      /Thay đổi chưa được lưu/,
    );
    assert.equal(await page.locator('[aria-pressed="true"]').count(), 0);
    await visit("counselor-detail", "?id=thu-ha");
    assert.equal(
      await page
        .getByRole("button", { name: "Chưa có lịch trống" })
        .isDisabled(),
      true,
    );
    await visit("counselor-detail", "?id=missing");
    assert.match(
      await page.locator("#results").innerText(),
      /Không tìm thấy chuyên viên/,
    );
    await visit("counselor-detail");
    await page.getByRole("button", { name: "Tìm hiểu cách đặt lịch" }).click();
    assert.match(await page.locator("#content-dialog").innerText(), /chưa gửi yêu cầu/);
    await page.keyboard.press("Escape");
    await page.route("**/assets/data/visitor.json", (route) =>
      route.fulfill({ status: 500 }),
    );
    await visit("service-directory");
    assert.match(
      await page.locator("#results").innerText(),
      /Nội dung chưa tải được/,
    );
    assert.equal(await page.locator("#search").isDisabled(), true);
    await page.unroute("**/assets/data/visitor.json");
    await page.getByRole("button", { name: "Thử lại" }).click();
    await page.waitForSelector("article");
    assert.equal(await page.locator("article").count(), 2);
    await page.route("**/assets/data/visitor.json", (route) =>
      route.fulfill({ json: { services: [{}] } }),
    );
    await visit("resource-library");
    assert.match(
      await page.locator("#results").innerText(),
      /Nội dung chưa tải được/,
    );
    await page.unroute("**/assets/data/visitor.json");
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    await page.route("**/assets/data/visitor.json", async (route) => {
      await gate;
      await route.continue();
    });
    await page.goto(`${base}visitor-service-directory.html`, {
      waitUntil: "domcontentloaded",
    });
    assert.equal(
      await page.locator("#results").getAttribute("aria-busy"),
      "true",
    );
    assert.equal(await page.locator("#search").isDisabled(), true);
    release();
    await page.waitForSelector("article");
    await page.unroute("**/assets/data/visitor.json");
    await page.evaluate(() => localStorage.removeItem('campusmind.visitor.savedResources.v1'));
    const screenshots = process.env.VISITOR_SCREENSHOTS;
    if (screenshots) fs.mkdirSync(screenshots, { recursive: true });
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const slug of [
        "service-directory",
        "resource-library",
        "counselor-detail",
      ]) {
        await visit(slug);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          `${slug} overflow at ${width}`,
        );
        assert.equal(await page.locator("h1").count(), 1);
        assert.equal(
          await page.locator('nav [aria-current="page"]').count(),
          1,
        );
        for (const href of await page
          .locator("a[href]")
          .evaluateAll((nodes) => nodes.map((node) => node.href))) {
          assert.equal((await context.request.get(href)).ok(), true, href);
        }
        if (screenshots)
          await page.screenshot({
            path: path.join(screenshots, `${slug}-${width}.png`),
            fullPage: true,
          });
      }
    }
    await visit("service-directory");
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
    assert.deepEqual(errors, []);
    console.log(
      "PASS: search/filter, persistence, storage failures, dialogs, counselor routes, loading/error/retry, navigation, keyboard and 9 responsive views.",
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
