import { useMemo, useState } from 'react';
import { useSiteContent } from '../SiteContentContext';

function mediaSrc(id) {
  return id ? `/api/gallery/image?fileId=${encodeURIComponent(id)}` : '';
}

function frameRatio(item) {
  const w = Number(item?.frameWidth);
  const h = Number(item?.frameHeight);
  if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) return `${w} / ${h}`;
  return item?.aspectRatio || '16 / 9';
}

export default function Gallery() {
  const { content, loading } = useSiteContent();
  const [broken, setBroken] = useState({});
  const items = useMemo(
    () => (Array.isArray(content.gallery) ? content.gallery : []).filter((item) => item?.visible !== false && item?.driveFileId),
    [content.gallery]
  );

  return <div className="page"><div className="container">
    <section className="page-hero"><span className="eyebrow">Gallery</span><h1 className="hero-title">A visual archive.</h1><p className="hero-sub">Selected images published from the Control Room.</p></section>
    {loading && <div className="card"><p>Loading gallery…</p></div>}
    {!loading && !items.length && <div className="card"><h2>No images yet.</h2><p className="admin-help">Publish an image from Control Room → Gallery and it will appear here.</p></div>}
    {!!items.length && <div className="gallery-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))',gap:'20px',alignItems:'start'}}>{items.map((item,index)=>{const src=mediaSrc(item.driveFileId);if(broken[item.driveFileId])return null;return <article className="card" key={item.id||item.driveFileId||index} style={{padding:'10px',overflow:'hidden'}}><div style={{width:'100%',aspectRatio:frameRatio(item),overflow:'hidden',borderRadius:'10px',background:'var(--surface-2,rgba(127,127,127,.08))'}}><img src={src} alt={item.alt||item.title||'Gallery image'} loading="lazy" decoding="async" onError={()=>setBroken(prev=>({...prev,[item.driveFileId]:true}))} style={{width:'100%',height:'100%',display:'block',objectFit:item.fit||'cover',objectPosition:item.position||'50% 50%'}} /></div>{(item.title||item.caption)&&<div style={{padding:'10px 3px 2px'}}>{item.title&&<h3 style={{margin:0,fontSize:'1rem'}}>{item.title}</h3>}{item.caption&&<p style={{margin:'4px 0 0',fontSize:'.9rem'}}>{item.caption}</p>}</div>}</article>})}</div>}
  </div></div>;
}
