import { clearSessionCookie, requireSession } from '../_lib/security.mjs';
import { addAudit } from '../_lib/cms.mjs';
export default async function handler(req,res){if(req.method!=='POST'&&req.method!=='GET')return res.status(405).json({error:'Method not allowed'});try{requireSession(req);await addAudit('LOGOUT','Control Room logout');}catch{}res.setHeader('Set-Cookie',clearSessionCookie());res.status(200).json({ok:true});}
