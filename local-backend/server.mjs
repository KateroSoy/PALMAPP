import http from 'node:http';
import {createStore} from './store.mjs';
import {resolve} from 'node:path';
import {readFileSync,existsSync} from 'node:fs';
import {randomBytes,timingSafeEqual,scryptSync} from 'node:crypto';
const port=Number(process.env.PORT??3001);
const store=createStore(resolve(process.env.PALM_DB??'./data/palmapp.sqlite'));
const keyFile=resolve(process.env.PALM_AUTH_FILE??'./data/auth.json');
let auth=existsSync(keyFile)?JSON.parse(readFileSync(keyFile,'utf8')):null;
const sessions=new Map();
const send=(res,status,data,headers={})=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(data))};
const safeEq=(a,b)=>{const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb)};
const readBody=async req=>{let parts=[],size=0;for await(const chunk of req){size+=chunk.length;if(size>1_000_000)throw Object.assign(new Error('Body terlalu besar'),{status:413});parts.push(chunk)}try{return JSON.parse(Buffer.concat(parts).toString()||'{}')}catch{throw Object.assign(new Error('JSON tidak valid'),{status:400})}};
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url??'/',`http://localhost:${port}`),path=url.pathname,method=req.method;
 if(path==='/api/local/health'&&method==='GET')return send(res,200,{ok:true,mode:'local',timestamp:new Date().toISOString()});
 if(path==='/api/local/auth/setup-status')return send(res,200,{configured:!!auth});
 if(path==='/api/local/auth/setup'&&method==='POST'){
  if(auth)return send(res,409,{error:'Setup sudah selesai'});
  const b=await readBody(req);if(typeof b.password!=='string'||b.password.length<12) return send(res,400,{error:'Password minimal 12 karakter'});
  const salt=randomBytes(16).toString('hex'); const hash=scryptSync(b.password,salt,64).toString('hex');
  const {mkdirSync,writeFileSync}=await import('node:fs');mkdirSync(resolve(keyFile,'..'),{recursive:true});writeFileSync(keyFile,JSON.stringify({salt,hash}),{mode:0o600,flag:'wx'});auth={salt,hash};return send(res,201,{ok:true});
 }
 if(path==='/api/local/auth/login'&&method==='POST'){
  const b=await readBody(req);if(!auth||typeof b.password!=='string'||!safeEq(scryptSync(b.password,auth.salt,64).toString('hex'),auth.hash))return send(res,401,{error:'Kredensial salah'});
  const token=randomBytes(32).toString('hex');sessions.set(token,Date.now()+8*60*60_000);return send(res,200,{ok:true},{'Set-Cookie':`palm_session=${token}; HttpOnly; SameSite=Strict; Path=/api/local; Max-Age=28800`});
 }
 if(!auth)return send(res,503,{error:'Setup password lokal diperlukan'});
 const token=(req.headers.cookie??'').split(';').map(x=>x.trim()).find(x=>x.startsWith('palm_session='))?.slice(13);
 if(!token||!sessions.has(token)||sessions.get(token)<Date.now())return send(res,401,{error:'Login diperlukan'});
 const origin=req.headers.origin;if(origin&&new URL(origin).host!==req.headers.host)return send(res,403,{error:'Origin tidak diizinkan'});
 if(path==='/api/local/auth/logout'&&method==='POST'){sessions.delete(token);return send(res,200,{ok:true},{'Set-Cookie':'palm_session=; HttpOnly; SameSite=Strict; Path=/api/local; Max-Age=0'})}
 if(path==='/api/local/snapshot'&&method==='GET'){const result={};for(const m of ['suppliers','farmers','vehicles','drivers','mills','employees','purchases','shipments','expenses'])result[m]=store.list(m);return send(res,200,result)}
 if(path==='/api/local/inventory'&&method==='GET')return send(res,200,store.inventory());
 if(path==='/api/local/audit'&&method==='GET')return send(res,200,store.history(Number(url.searchParams.get('limit')??100)));
 if(path==='/api/local/backup'&&method==='GET')return send(res,200,{version:1,exportedAt:new Date().toISOString(),data:Object.fromEntries(['suppliers','farmers','vehicles','drivers','mills','employees','purchases','shipments','expenses'].map(m=>[m,store.list(m)]))},{'Content-Disposition':'attachment; filename="palmapp-backup.json"'});
 const pay=path.match(/^\/api\/local\/purchases\/([^/]+)\/pay$/);if(pay&&method==='POST'){const b=await readBody(req);return send(res,200,store.pay(decodeURIComponent(pay[1]),b.status))}
 const cancel=path.match(/^\/api\/local\/purchases\/([^/]+)\/cancel$/);if(cancel&&method==='POST'){const b=await readBody(req);return send(res,200,store.cancelPurchase(decodeURIComponent(cancel[1]),b.reason))}
 const route=path.match(/^\/api\/local\/(suppliers|farmers|vehicles|drivers|mills|employees|purchases|shipments|expenses)(?:\/([^/]+))?$/);
 if(route){const [,m,id]=route;if(method==='GET')return send(res,200,id?store.get(m,decodeURIComponent(id)):store.list(m));if(method==='POST'&&!id)return send(res,201,store.save(m,await readBody(req)));if(method==='PATCH'&&id)return send(res,200,store.patch(m,decodeURIComponent(id),await readBody(req)));if(method==='DELETE'&&id)return send(res,200,store.remove(m,decodeURIComponent(id)))}
 return send(res,404,{error:'Route tidak ditemukan'});
 }catch(e){send(res,e.status??500,{error:e.status?e.message:'Kesalahan server'});if(!e.status)console.error(e)}});
server.listen(port,'127.0.0.1',()=>console.log(`PALMAPP local API http://127.0.0.1:${port}`));
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>{server.close();store.close();process.exit(0)});
