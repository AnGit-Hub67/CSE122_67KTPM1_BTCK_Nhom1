const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/demo-sync.js'), 'utf8');

async function check(hostname, overrideStatus, expected) {
  const requests = [];
  const context = {
    URL, AbortSignal, location: { hostname },
    document: { currentScript: { src: `https://${hostname}/project/assets/js/demo-sync.js` } },
    window: { dispatchEvent() {} }, CustomEvent: class {},
    fetch: async url => {
      requests.push(url.pathname);
      const status = url.pathname.endsWith('/config.json') ? overrideStatus : 200;
      return { status, ok: status === 200, json: async () => ({ enableDemoRemoteSync: false }) };
    }
  };
  vm.runInNewContext(source, context);
  await context.window.CampusDemoSync.hydrate();
  await context.window.CampusDemoSync.hydrate();
  assert.deepEqual(requests, expected, hostname);
}

(async () => {
  await check('angit-hub67.github.io', 404, ['/project/assets/data/config.public.json']);
  await check('localhost', 200, ['/project/assets/data/config.json']);
  await check('127.0.0.1', 404, ['/project/assets/data/config.json', '/project/assets/data/config.public.json']);
  await check('[::1]', 404, ['/project/assets/data/config.json', '/project/assets/data/config.public.json']);
  console.log('PASS deployed subpath, local override, fallback, cached config and disabled remote sync');
})().catch(error => { console.error(error); process.exitCode = 1; });
