import { getAdminPasswordHash, addAudit, getLoginLockState, registerLoginFailure, registerLoginSuccess } from '../cms.mjs';
import { createSession, sessionCookie, verifyPassword, sessionExpiryMs } from '../security.mjs';
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const lock = await getLoginLockState();
    if (lock.locked) {
      const mins = Math.max(1, Math.ceil((lock.lockedUntil - Date.now()) / 60000));
      return res.status(429).json({ error: `Too many failed attempts. Try again in ${mins} minute${mins===1?'':'s'}.` });
    }
    const {password}=req.body||{}; const hash=await getAdminPasswordHash();
    if(!password||!verifyPassword(password,hash)){
      const state = await registerLoginFailure();
      if (state.locked) {
        const mins = Math.max(1, Math.ceil((state.lockedUntil - Date.now()) / 60000));
        return res.status(429).json({ error: `Too many failed attempts. Locked for ${mins} minute${mins===1?'':'s'}.` });
      }
      const remaining = Math.max(0, 5 - state.failedAttempts);
      return res.status(401).json({error: remaining>0 ? `Invalid password. ${remaining} attempt${remaining===1?'':'s'} left before lockout.` : 'Invalid password'});
    }
    await registerLoginSuccess();
    const issuedAt=Date.now(); const token=createSession();
    res.setHeader('Set-Cookie',sessionCookie(token));
    await addAudit('LOGIN','Successful Control Room login');
    res.status(200).json({ok:true,expiresAt:issuedAt+sessionExpiryMs()});
  }catch(error){console.error(error);res.status(500).json({error:error.message||'Login is not configured'});}
}
