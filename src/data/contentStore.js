import { default as localContent } from './content';
export async function fetchSiteContent(bustCache=false){
  try{const url=bustCache?`/api/content?v=${Date.now()}`:'/api/content';const response=await fetch(url,{headers:{Accept:'application/json'},cache:bustCache?'no-store':'default'});if(!response.ok)throw new Error('Content API unavailable');return await response.json();}catch{return localContent;}}
