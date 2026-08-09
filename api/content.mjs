import { getCms, publicCms } from './_lib/cms.mjs';
export default async function handler(req,res){try{const cms=await getCms();res.setHeader('Cache-Control','public, s-maxage=60, stale-while-revalidate=300');res.status(200).json(publicCms(cms));}catch(error){console.error(error);res.status(503).json({error:'Content service unavailable'});}}
