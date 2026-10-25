const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),port=Number(process.env.PORT||8080);
http.createServer((req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep)&&file!==root)return res.writeHead(403).end();
    if(pathname.split('/').some(part=>part.startsWith('.')))return res.writeHead(403).end();
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end('Not found');res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data);});
  }catch{res.writeHead(400).end();}
}).listen(port,'127.0.0.1',()=>console.log(`CampusMind: http://127.0.0.1:${port}`));
