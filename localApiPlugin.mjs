import fs from 'node:fs/promises';
import path from 'node:path';
import { loadEnv } from 'vite';

const routes = {
  '/api/content': './api/content.mjs',
  '/api/admin/login': './api/admin/login.mjs', '/api/admin/me': './api/admin/me.mjs', '/api/admin/content': './api/admin/content.mjs',
  '/api/admin/status': './api/admin/status.mjs', '/api/admin/logout': './api/admin/logout.mjs', '/api/admin/forgot': './api/admin/forgot.mjs',
  '/api/admin/reset': './api/admin/reset.mjs', '/api/admin/change-password': './api/admin/change-password.mjs',
  '/api/gallery/image': './api/gallery/image.mjs', '/api/guestbook': './api/guestbook.mjs', '/api/contact': './api/contact.mjs',
  '/api/analytics/visit': './api/analytics/visit.mjs', '/api/analytics/stats': './api/analytics/stats.mjs', '/api/cron/publish': './api/cron/publish.mjs',
  '/api/feed': './api/feed.mjs'
};
function responseObject() {
  const headers = {}; let status = 200; let sent = false;
  return { setHeader:(k,v)=>headers[k]=v, statusCode:200, status:(code)=>{status=code;return this}, json:(data)=>{sent=true;return {status,headers,data}}, send:(data)=>{sent=true;return {status,headers,data}}, _get:()=>({status,headers,sent}) };
}
export default function localApiPlugin() {
  return { name:'sadab-local-api', async configResolved(config){ const env=loadEnv(config.mode, process.cwd(), ''); for(const [k,v] of Object.entries(env)){if(process.env[k]===undefined)process.env[k]=v} process.env.NODE_ENV='development'; process.env.CMS_STORAGE='local'; }, configureServer(server){ server.middlewares.use(async (req,res,next)=>{
      const base=req.url?.split('?')[0]; const modulePath=routes[base]; if(!modulePath)return next();
      try {
        const url=new URL(req.url,'http://localhost'); let body={}; if(['POST','PUT','PATCH'].includes(req.method)){let raw='';for await(const chunk of req)raw+=chunk;try{body=raw?JSON.parse(raw):{}}catch{body={}}}
        const headers={...req.headers}; const query=Object.fromEntries(url.searchParams.entries());
        const out={headers:{},statusCode:200,body:null}; const apiRes={setHeader:(k,v)=>out.headers[k]=v,status(code){out.statusCode=code;return this},json(data){out.body=JSON.stringify(data);finish()},send(data){out.body=data;finish()}};
        let finished=false; function finish(){if(finished)return;finished=true;for(const [k,v] of Object.entries(out.headers))res.setHeader(k,v);res.statusCode=out.statusCode;if(Buffer.isBuffer(out.body))res.end(out.body);else res.end(out.body??'');}
        const mod=await import(path.resolve(process.cwd(),modulePath)); await mod.default({method:req.method,headers,body,query,url:req.url},apiRes); if(!finished)finish();
      } catch(error){ console.error(error); res.statusCode=500;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:error.message||'Local API error'})); }
    }); }};
}
