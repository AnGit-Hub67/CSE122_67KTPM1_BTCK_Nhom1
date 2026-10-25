// No installation needed: node tools/sv2-serve.cjs
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=http.createServer((req,res)=>{
 let file;
 try{const url=new URL(req.url,'http://localhost');file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/pages/student/student-dashboard.html':url.pathname));}catch{res.writeHead(400).end();return;}
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(data);});
});
server.listen(Number(process.env.PORT)||8080,'127.0.0.1',()=>console.log('CampusMind SV2: http://127.0.0.1:'+server.address().port));
server.on('error',err=>{console.error(err.message);process.exitCode=1;});
