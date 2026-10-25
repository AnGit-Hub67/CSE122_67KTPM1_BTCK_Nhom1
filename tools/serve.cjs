const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server = http.createServer((req, res) => {
  let route;
  try { route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + route + (route.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(root + path.sep) || path.relative(root, file).split(path.sep).some(part => part.startsWith('.'))) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(req.method === 'HEAD' ? undefined : body);
  });
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(Number(process.argv[2] ?? 8877), '127.0.0.1', () => console.log('CampusMind: http://127.0.0.1:' + server.address().port));
