import crypto from 'node:crypto';
const SESSION_TTL=1000*60*60*2, RESET_TTL=1000*60*20;
function secret(){if(!process.env.ADMIN_SESSION_SECRET)throw new Error('ADMIN_SESSION_SECRET is not configured');return process.env.ADMIN_SESSION_SECRET}
function b64url(input){return Buffer.from(input).toString('base64url')}
function signPayload(payload){const body=b64url(JSON.stringify(payload));const sig=crypto.createHmac('sha256',secret()).update(body).digest('base64url');return `${body}.${sig}`}
function readPayload(token){if(!token||typeof token!=='string')return null;const [body,sig]=token.split('.');if(!body||!sig)return null;const expected=crypto.createHmac('sha256',secret()).update(body).digest('base64url');if(sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;try{const payload=JSON.parse(Buffer.from(body,'base64url').toString('utf8'));return payload.exp&&Date.now()<=payload.exp?payload:null}catch{return null}}
export function createSession(){return signPayload({typ:'session',iat:Date.now(),exp:Date.now()+SESSION_TTL})}
export function createResetToken(issuedAt){return signPayload({typ:'reset',iat:issuedAt,exp:issuedAt+RESET_TTL})}
export function verifyResetToken(token){const payload=readPayload(token);return payload?.typ==='reset'?payload:null}
export function requireSession(req){const cookie=req.headers.cookie||'';const match=cookie.match(/(?:^|;\s*)sadab_admin=([^;]+)/);const payload=readPayload(match?.[1]);if(payload?.typ!=='session')throw new Error('Unauthorized');return payload}
export function sessionCookie(token){const secure=process.env.NODE_ENV==='production'?' Secure;':'';return `sadab_admin=${token}; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=${SESSION_TTL/1000}`}
export function clearSessionCookie(){const secure=process.env.NODE_ENV==='production'?' Secure;':'';return `sadab_admin=; Path=/; HttpOnly;${secure} SameSite=Lax; Max-Age=0`}
export function hashPassword(password){if(!password||password.length<10)throw new Error('Password must be at least 10 characters');const salt=crypto.randomBytes(16),N=8192,r=8,p=1;const derived=crypto.scryptSync(password,salt,64,{N,r,p,maxmem:32*1024*1024});return `scrypt$${N}$${r}$${p}$${salt.toString('base64url')}$${derived.toString('base64url')}`}
export function verifyPassword(password,encoded){try{const [scheme,n,r,p,salt64,digest64]=String(encoded).split('$');if(scheme!=='scrypt')return false;const salt=Buffer.from(salt64,'base64url'),expected=Buffer.from(digest64,'base64url');const actual=crypto.scryptSync(password,salt,expected.length,{N:Number(n),r:Number(r),p:Number(p),maxmem:32*1024*1024});return actual.length===expected.length&&crypto.timingSafeEqual(actual,expected)}catch{return false}}
export function sessionExpiryMs(){return SESSION_TTL}
