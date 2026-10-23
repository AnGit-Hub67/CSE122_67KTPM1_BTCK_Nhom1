// Build a disposable QA copy; never merge or modify another contributor's checkout.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.resolve(root,'../sv3-completion-integrated');
if(fs.existsSync(out))throw Error('QA directory already exists. Use the existing copy or select a new empty output directory.');
fs.cpSync(root,out,{recursive:true,filter:file=>!['.git','node_modules'].includes(path.basename(file))});
const ref='origin/feature/sv2-final';
const sha=execFileSync('git',['-C',root,'rev-parse',ref],{encoding:'utf8'}).trim();
const files=execFileSync('git',['-C',root,'ls-tree','-r','--name-only',ref],{encoding:'utf8'}).trim().split('\n').filter(file=>/^(register\.html|assets\/(js\/(sv2[^/]*|register)\.js|css\/(sv2|register)\.css|data\/sv2[^/]*\.json)|pages\/student\/student-[^/]+\.html|pages\/admin\/admin-user-management\.html|tests\/(sv2[^/]*|register-smoke)\.cjs)$/.test(file));
for(const file of files){const p=path.join(out,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,execFileSync('git',['-C',root,'show',`${ref}:${file}`]));}
fs.writeFileSync(path.join(out,'integration-manifest.json'),JSON.stringify({base:'SV3 local changes on 0581926',sv2:{ref,sha,files},note:'Only generated header/footer/sidebar markup is refreshed; SV2 business scripts remain exact.'},null,2));
execFileSync(process.execPath,[path.join(out,'tools/build-layout.cjs')],{stdio:'inherit'});
console.log(out);
