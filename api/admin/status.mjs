import { requireSession } from '../_lib/security.mjs';
import { cmsHealth } from '../_lib/cms.mjs';
export default async function handler(req,res){try{requireSession(req);if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});res.status(200).json(await cmsHealth());}catch(error){res.status(error.message==='Unauthorized'?401:500).json({error:error.message||'Status unavailable'});}}
