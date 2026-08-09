import { readCmsFile, writeCmsFile, driveStatus } from './drive.mjs';
import { defaultContent } from './defaultContent.mjs';
import { hashPassword } from './security.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

let memoryCache = null;
let memoryAt = 0;
const CACHE_MS = 15000;
const MAX_BACKUPS = 20;
const MAX_ACTIVITY = 300;
const LOCAL_FILE = path.resolve(process.cwd(), '.local-cms', 'cms.json');

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function localMode() { return process.env.CMS_STORAGE === 'local' || process.env.NODE_ENV === 'development'; }

function mergeContent(value = {}) {
  return {
    ...clone(defaultContent), ...value,
    profile: { ...clone(defaultContent.profile), ...(value.profile || {}) },
    settings: { ...clone(defaultContent.settings), ...(value.settings || {}) },
    homepage: { ...clone(defaultContent.homepage), ...(value.homepage || {}) },
    seo: { ...clone(defaultContent.seo), ...(value.seo || {}) },
    now: { ...clone(defaultContent.now), ...(value.now || {}) },
    analytics: { ...clone(defaultContent.analytics), ...(value.analytics || {}) },
    socials: Array.isArray(value.socials) ? value.socials : clone(defaultContent.socials),
    projects: Array.isArray(value.projects) ? value.projects : clone(defaultContent.projects),
    skills: Array.isArray(value.skills) ? value.skills : clone(defaultContent.skills),
    funFacts: Array.isArray(value.funFacts) ? value.funFacts : clone(defaultContent.funFacts),
    lab: Array.isArray(value.lab) ? value.lab : clone(defaultContent.lab),
    gallery: Array.isArray(value.gallery) ? value.gallery : clone(defaultContent.gallery),
    guestbook: Array.isArray(value.guestbook) ? value.guestbook : clone(defaultContent.guestbook),
    inbox: Array.isArray(value.inbox) ? value.inbox : [],
    revisions: Array.isArray(value.revisions) ? value.revisions : [],
    scheduled: Array.isArray(value.scheduled) ? value.scheduled : [],
  };
}
function freshDocument() {
  const content = mergeContent(defaultContent);
  return { version: 4, published: clone(content), draft: clone(content), backups: [], activity: [], revisions: [], admin: {} };
}
function normalizeDocument(raw) {
  if (!raw || typeof raw !== 'object') return freshDocument();
  if (raw.published && raw.draft) return {
    version: 4, published: mergeContent(raw.published), draft: mergeContent(raw.draft),
    backups: Array.isArray(raw.backups) ? raw.backups.slice(0, MAX_BACKUPS) : [],
    activity: Array.isArray(raw.activity) ? raw.activity.slice(0, MAX_ACTIVITY) : [],
    admin: raw.admin || {},
    revisions: Array.isArray(raw.revisions) ? raw.revisions.slice(0,30) : [],
  };
  const content = mergeContent(raw);
  return { version: 4, published: clone(content), draft: clone(content), backups: [], activity: [], revisions: [], admin: raw.admin || {} };
}

async function readLocal() {
  try { return JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8')); }
  catch { return null; }
}
async function writeLocal(doc) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(doc, null, 2));
}
async function readDocument(force = false) {
  if (!force && memoryCache && Date.now() - memoryAt < CACHE_MS) return memoryCache;
  let remote = null;
  try { remote = localMode() ? await readLocal() : await readCmsFile(); }
  catch (error) { console.error(error); }
  memoryCache = normalizeDocument(remote || memoryCache || freshDocument());
  memoryAt = Date.now();
  if (localMode() && !remote) await writeLocal(memoryCache);
  return memoryCache;
}
async function writeDocument(doc) {
  const normalized = normalizeDocument(doc);
  if (localMode()) await writeLocal(normalized); else await writeCmsFile(normalized);
  memoryCache = normalized; memoryAt = Date.now(); return normalized;
}

export async function getCms(options = {}) { return (await readDocument(options.force)).published; }
export async function getAdminState() {
  const doc = await readDocument(true);
  return { version: doc.version, published: doc.published, draft: doc.draft,
    backups: doc.backups.map(({id,createdAt,label,size}) => ({id,createdAt,label,size})),
    activity: doc.activity, admin: { hasPassword:Boolean(doc.admin?.passwordHash), passwordChangedAt:doc.admin?.passwordChangedAt||null, resetIssuedAt:doc.admin?.resetIssuedAt||null, failedAttempts:Number(doc.admin?.failedAttempts||0), lockedUntil:Number(doc.admin?.lockedUntil||0)||null },
    revisions: (doc.revisions||[]).slice(0,30).map(x=>({id:x.id,at:x.at,label:x.label,content:x.content})),
    analytics: await getAnalytics(),
    storage: localMode() ? 'local' : 'google-drive'
  };
}
function id() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`; }
function audit(doc, action, detail='') { doc.activity.unshift({id:id(),action,detail,at:new Date().toISOString()}); doc.activity=doc.activity.slice(0,MAX_ACTIVITY); }
function makeBackup(content,label) { const snapshot=clone(content); return {id:id(),createdAt:new Date().toISOString(),label,size:JSON.stringify(snapshot).length,content:snapshot}; }

export async function saveDraft(content, detail='Draft saved') { const doc=await readDocument(true); doc.draft=mergeContent(content); doc.revisions.unshift({id:id(),at:new Date().toISOString(),label:'Draft saved',content:clone(doc.draft)}); doc.revisions=doc.revisions.slice(0,30); audit(doc,'SAVE_DRAFT',detail); return writeDocument(doc); }
export async function publishDraft(detail='Draft published') { const doc=await readDocument(true); doc.backups.unshift(makeBackup(doc.published,'Before publish')); doc.backups=doc.backups.slice(0,MAX_BACKUPS); doc.published=clone(doc.draft); doc.scheduled=[]; audit(doc,'PUBLISH',detail); return writeDocument(doc); }
export async function createBackup(label='Manual backup') { const doc=await readDocument(true); doc.backups.unshift(makeBackup(doc.draft,label)); doc.backups=doc.backups.slice(0,MAX_BACKUPS); audit(doc,'BACKUP',label); await writeDocument(doc); return doc.backups[0]; }
export async function restoreBackup(idValue,mode='draft') { const doc=await readDocument(true); const backup=doc.backups.find(x=>x.id===idValue); if(!backup)throw new Error('Backup not found'); if(mode==='published'){doc.backups.unshift(makeBackup(doc.published,'Before live restore'));doc.backups=doc.backups.slice(0,MAX_BACKUPS);doc.published=mergeContent(backup.content)}else doc.draft=mergeContent(backup.content); audit(doc,'RESTORE',`${mode} restored from ${backup.label}`); return writeDocument(doc); }
export async function discardDraft() { const doc=await readDocument(true); doc.draft=clone(doc.published); audit(doc,'DISCARD_DRAFT','Draft reset to published version'); return writeDocument(doc); }
export async function getAdminPasswordHash() { const doc=await readDocument(true); if(doc.admin?.passwordHash)return doc.admin.passwordHash; if(!process.env.ADMIN_INITIAL_PASSWORD)throw new Error('No admin password configured. Set ADMIN_INITIAL_PASSWORD for first login.'); const passwordHash=hashPassword(process.env.ADMIN_INITIAL_PASSWORD); doc.admin={...(doc.admin||{}),passwordHash,passwordChangedAt:new Date().toISOString()}; audit(doc,'BOOTSTRAP_PASSWORD','Initial admin password created'); await writeDocument(doc); return passwordHash; }

const LOCK_THRESHOLD = 5; // failed attempts before first lock
const BASE_LOCK_MS = 5 * 60 * 1000; // 5 minutes
const MAX_LOCK_MS = 60 * 60 * 1000; // cap at 1 hour
export async function getLoginLockState() {
  const doc = await readDocument(true);
  const admin = doc.admin || {};
  const lockedUntil = Number(admin.lockedUntil || 0);
  return { locked: lockedUntil > Date.now(), lockedUntil: lockedUntil || null, failedAttempts: Number(admin.failedAttempts || 0), lockCount: Number(admin.lockCount || 0) };
}
export async function registerLoginFailure() {
  const doc = await readDocument(true);
  const admin = doc.admin || {};
  const failedAttempts = Number(admin.failedAttempts || 0) + 1;
  let lockedUntil = Number(admin.lockedUntil || 0);
  let lockCount = Number(admin.lockCount || 0);
  if (failedAttempts >= LOCK_THRESHOLD) {
    lockCount += 1;
    const lockMs = Math.min(BASE_LOCK_MS * Math.pow(2, lockCount - 1), MAX_LOCK_MS);
    lockedUntil = Date.now() + lockMs;
    audit(doc, 'LOGIN_LOCKED', `Too many failed attempts — locked for ${Math.round(lockMs / 60000)}m`);
  } else {
    audit(doc, 'LOGIN_FAILED', `${failedAttempts}/${LOCK_THRESHOLD} failed attempts`);
  }
  doc.admin = { ...admin, failedAttempts, lockedUntil, lockCount };
  await writeDocument(doc);
  return { locked: lockedUntil > Date.now(), lockedUntil: lockedUntil || null, failedAttempts };
}
export async function registerLoginSuccess() {
  const doc = await readDocument(true);
  doc.admin = { ...(doc.admin || {}), failedAttempts: 0, lockedUntil: 0 };
  await writeDocument(doc);
}
export async function setAdminPassword(password,reason='Password changed') { const doc=await readDocument(true); doc.admin={...(doc.admin||{}),passwordHash:hashPassword(password),passwordChangedAt:new Date().toISOString()}; audit(doc,'PASSWORD_CHANGE',reason); await writeDocument(doc); }
export async function issueReset() { const doc=await readDocument(true); const now=Date.now(); if(doc.admin?.resetIssuedAt&&now-Number(doc.admin.resetIssuedAt)<60000)throw new Error('Please wait before requesting another reset email'); doc.admin={...(doc.admin||{}),resetIssuedAt:now}; audit(doc,'RESET_REQUEST','Password reset email requested'); await writeDocument(doc); return now; }
export async function consumeReset(resetIssuedAt,password) { const doc=await readDocument(true); if(!doc.admin?.resetIssuedAt||Number(doc.admin.resetIssuedAt)!==Number(resetIssuedAt))throw new Error('Reset link is no longer valid'); doc.admin={...(doc.admin||{}),passwordHash:hashPassword(password),passwordChangedAt:new Date().toISOString(),resetIssuedAt:null}; audit(doc,'PASSWORD_RESET','Password reset through email'); await writeDocument(doc); }
export async function addAudit(action,detail=''){const doc=await readDocument(true);audit(doc,action,detail);await writeDocument(doc);}
export async function cmsHealth(){ if(localMode()) return {configured:true,connected:true,fileReady:true,storage:'local',fileId:null,lastLoadedAt:new Date(memoryAt).toISOString()}; const status=await driveStatus();const doc=await readDocument(true);return {...status,fileReady:Boolean(doc),storage:'google-drive',lastLoadedAt:new Date(memoryAt).toISOString()}; }
export async function addGuestbook(entry){const doc=await readDocument(true);doc.published.guestbook=[entry,...(doc.published.guestbook||[])].slice(0,100);doc.draft.guestbook=clone(doc.published.guestbook);audit(doc,'GUESTBOOK_ENTRY',entry.name||'Anonymous');await writeDocument(doc);return entry;}
export async function addInbox(entry){const doc=await readDocument(true);doc.published.inbox=Array.isArray(doc.published.inbox)?doc.published.inbox:[];doc.published.inbox.unshift(entry);doc.published.inbox=doc.published.inbox.slice(0,200);doc.draft.inbox=clone(doc.published.inbox);audit(doc,'CONTACT_MESSAGE',entry.email||'visitor');await writeDocument(doc);return entry;}
export async function recordVisit(pathname){const doc=await readDocument(true);doc.published.analytics=doc.published.analytics||{visits:[]};doc.published.analytics.visits=Array.isArray(doc.published.analytics.visits)?doc.published.analytics.visits:[];doc.published.analytics.visits.unshift({path:pathname,at:new Date().toISOString()});doc.published.analytics.visits=doc.published.analytics.visits.slice(0,2000);doc.draft.analytics=clone(doc.published.analytics);await writeDocument(doc);return true;}
export async function getAnalytics(){const doc=await readDocument(true);const visits=doc.published.analytics?.visits||[];const by={};for(const v of visits)by[v.path]=(by[v.path]||0)+1;const days=[];const now=new Date();for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);days.push(d.toISOString().slice(0,10));}const byDay=Object.fromEntries(days.map(d=>[d,0]));for(const v of visits){const day=String(v.at||'').slice(0,10);if(day in byDay)byDay[day]++;}return {total:visits.length,byPath:by,recent:visits.slice(0,20),last7Days:days.map(d=>({date:d,count:byDay[d]}))};}
export async function scheduleDraft(when,detail='Scheduled publish'){const doc=await readDocument(true);doc.scheduled=[{id:id(),when,detail}];audit(doc,'SCHEDULE_PUBLISH',`${when}`);await writeDocument(doc);return doc.scheduled[0];}
export async function runScheduledPublish(){const doc=await readDocument(true);const due=(doc.scheduled||[]).filter(x=>Date.parse(x.when)<=Date.now());if(!due.length)return false;doc.backups.unshift(makeBackup(doc.published,'Before scheduled publish'));doc.backups=doc.backups.slice(0,MAX_BACKUPS);doc.published=clone(doc.draft);doc.scheduled=[];audit(doc,'SCHEDULED_PUBLISH','Scheduled draft published');await writeDocument(doc);return true;}
export function publicCms(cms){const copy=clone(cms);delete copy.inbox;delete copy.analytics;return copy;}
