import { consumeReset } from '../_lib/cms.mjs';
import { verifyResetToken } from '../_lib/security.mjs';
export default async function handler(req,res){if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});try{const {token,password}=req.body||{};const payload=verifyResetToken(token);if(!payload)throw new Error('Invalid or expired reset link');await consumeReset(payload.iat,password);res.status(200).json({ok:true,message:'Password reset successfully. You can now log in.'});}catch(error){res.status(400).json({error:error.message||'Could not reset password'});}}
