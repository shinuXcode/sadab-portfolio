import { getAnalytics } from '../_lib/cms.mjs';
import { requireSession } from '../_lib/security.mjs';
export default async function handler(req,res){try{requireSession(req);if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});return res.status(200).json(await getAnalytics())}catch(e){return res.status(e.message==='Unauthorized'?401:500).json({error:e.message||'Analytics unavailable'})}}
