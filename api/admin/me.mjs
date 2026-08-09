import { requireSession, sessionExpiryMs } from '../_lib/security.mjs';
export default function handler(req,res){try{const session=requireSession(req);res.status(200).json({authenticated:true,expiresAt:session.iat+sessionExpiryMs()});}catch{res.status(401).json({authenticated:false});}}
