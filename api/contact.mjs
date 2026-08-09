import { addInbox } from './_lib/cms.mjs';
function clean(v,n=500){return String(v||'').trim().slice(0,n)}

// Lightweight in-memory per-IP rate limit. Serverless instances are ephemeral,
// so this is a best-effort throttle (resets on cold start) layered on top of
// the honeypot field below — not a substitute for a real WAF, but it stops
// casual flooding for free.
const hits = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear(); // basic memory guard
  return arr.length > MAX_PER_WINDOW;
}

export default async function handler(req,res){
  try{
    if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
    const ip = String(req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || 'unknown').split(',')[0].trim();
    if (rateLimited(ip)) return res.status(429).json({error:'Too many messages sent. Please wait a minute and try again.'});
    const b=req.body||{};
    if(b.website)return res.status(200).json({ok:true});
    const name=clean(b.name,80),email=clean(b.email,120),message=clean(b.message,2000);
    if(!name||!email||!message)return res.status(400).json({error:'Please complete all fields'});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:'Please enter a valid email address'});
    await addInbox({id:`m-${Date.now()}`,name,email,message,at:new Date().toISOString(),read:false});
    return res.status(201).json({ok:true,message:'Message saved. Thanks.'});
  }catch(e){return res.status(500).json({error:e.message||'Contact service unavailable'});}
}
