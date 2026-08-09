import crypto from 'node:crypto';
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive';
const TOKEN_URL='https://oauth2.googleapis.com/token';
const DRIVE_BASE='https://www.googleapis.com/drive/v3';
const UPLOAD_BASE='https://www.googleapis.com/upload/drive/v3';
function env(name){const value=process.env[name];if(!value)throw new Error(`${name} is not configured`);return value;}
function b64url(value){return Buffer.from(value).toString('base64url');}
async function accessToken(){const email=env('GOOGLE_SERVICE_ACCOUNT_EMAIL');const privateKey=env('GOOGLE_PRIVATE_KEY').replace(/\\n/g,'\n');const now=Math.floor(Date.now()/1000);const header=b64url(JSON.stringify({alg:'RS256',typ:'JWT'}));const payload=b64url(JSON.stringify({iss:email,scope:DRIVE_SCOPE,aud:TOKEN_URL,iat:now,exp:now+3600}));const unsigned=`${header}.${payload}`;const signer=crypto.createSign('RSA-SHA256');signer.update(unsigned);signer.end();const assertion=`${unsigned}.${signer.sign(privateKey,'base64url')}`;const response=await fetch(TOKEN_URL,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})});if(!response.ok)throw new Error(`Google auth failed: ${await response.text()}`);return(await response.json()).access_token;}
async function driveFetch(path,options={}){const token=await accessToken();const response=await fetch(`${DRIVE_BASE}${path}`,{...options,headers:{Authorization:`Bearer ${token}`,...(options.headers||{})}});if(!response.ok)throw new Error(`Google Drive error ${response.status}: ${await response.text()}`);return response;}
export async function resolveFileId(){if(process.env.GOOGLE_DRIVE_FILE_ID)return process.env.GOOGLE_DRIVE_FILE_ID;const folder=process.env.GOOGLE_DRIVE_FOLDER_ID;const q=["name = 'sadab-portfolio-cms.json'","trashed = false","mimeType = 'application/json'",...(folder?[`'${folder}' in parents`]:[])].join(' and ');const response=await driveFetch(`/files?q=${encodeURIComponent(q)}&pageSize=1&fields=files(id,name,modifiedTime,size)`);return(await response.json()).files?.[0]?.id||null;}
export async function readCmsFile(){const fileId=await resolveFileId();if(!fileId)return null;const response=await driveFetch(`/files/${encodeURIComponent(fileId)}?alt=media`);return response.json();}
export async function writeCmsFile(data){const token=await accessToken();const body=JSON.stringify(data,null,2);const fileId=await resolveFileId();if(!fileId){const metadata={name:'sadab-portfolio-cms.json',mimeType:'application/json',...(process.env.GOOGLE_DRIVE_FOLDER_ID?{parents:[process.env.GOOGLE_DRIVE_FOLDER_ID]}:{})};const boundary=`sadab_${crypto.randomBytes(12).toString('hex')}`;const multipart=[`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,`--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n`,`--${boundary}--`].join('');const response=await fetch(`${UPLOAD_BASE}/files?uploadType=multipart`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':`multipart/related; boundary=${boundary}`},body:multipart});if(!response.ok)throw new Error(`Google Drive create failed: ${await response.text()}`);return(await response.json()).id;}const response=await fetch(`${UPLOAD_BASE}/files/${encodeURIComponent(fileId)}?uploadType=media`,{method:'PATCH',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body});if(!response.ok)throw new Error(`Google Drive update failed: ${await response.text()}`);return fileId;}
export async function driveStatus(){try{const fileId=await resolveFileId();return {configured:true,connected:true,fileId:fileId||null,fileName:fileId?'sadab-portfolio-cms.json':null};}catch(error){return {configured:Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL&&process.env.GOOGLE_PRIVATE_KEY&&(process.env.GOOGLE_DRIVE_FOLDER_ID||process.env.GOOGLE_DRIVE_FILE_ID)),connected:false,fileId:null,fileName:null,error:error.message};}}

export async function readDriveImage(fileId) {
  if (!fileId) throw new Error('Missing Drive file id');
  const token = await accessToken();
  const metaResponse = await fetch(`${DRIVE_BASE}/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size,trashed`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!metaResponse.ok) throw new Error(`Google Drive metadata error ${metaResponse.status}`);
  const meta = await metaResponse.json();
  if (meta.trashed || !String(meta.mimeType || '').startsWith('image/')) throw new Error('Drive file is not an available image');
  const imageResponse = await fetch(`${DRIVE_BASE}/files/${encodeURIComponent(fileId)}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!imageResponse.ok) throw new Error(`Google Drive image error ${imageResponse.status}`);
  return { meta, response: imageResponse };
}
