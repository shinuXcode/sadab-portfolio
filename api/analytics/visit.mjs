import { recordVisit } from '../_lib/cms.mjs';
export default async function handler(req,res){try{if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});const path=String(req.body?.path||'/').slice(0,120);await recordVisit(path);return res.status(204).send('')}catch(e){return res.status(204).send('')}}
