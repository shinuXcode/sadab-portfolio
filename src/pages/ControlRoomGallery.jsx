import { useEffect, useMemo, useState } from 'react';

const emptyGallery = () => ({
  id: `gallery-${crypto?.randomUUID?.() || Date.now()}`,
  title: 'New gallery image', caption: '', alt: '', driveFileId: '', visible: true,
  fit: 'cover', position: '50% 50%', frameWidth: 16, frameHeight: 9,
});

const driveId = (value = '') => {
  const match = String(value).match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{10,})/);
  return match ? match[1] : String(value).trim();
};

function frameRatio(item) {
  const w = Number(item.frameWidth) || 16;
  const h = Number(item.frameHeight) || 9;
  return `${w} / ${h}`;
}

export default function ControlRoomGallery() {
  const [draft, setDraft] = useState(null);
  const [published, setPublished] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    const r = await fetch('/api/admin/content', { headers: { Accept: 'application/json' }, cache: 'no-store' });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || `Unable to load CMS (${r.status})`);
    setDraft(d.state?.draft || {});
    setPublished(d.state?.published || {});
  };

  useEffect(() => { load().catch(e => setError(e.message)); }, []);

  const items = useMemo(() => Array.isArray(draft?.gallery) ? draft.gallery : [], [draft]);
  const setItems = next => setDraft(prev => ({ ...(prev || {}), gallery: next }));
  const update = (index, key, value) => setItems(items.map((x, i) => i === index ? { ...x, [key]: value } : x));

  const save = async () => {
    setBusy(true); setMessage(''); setError('');
    try {
      const r = await fetch('/api/admin/content', { method: 'PUT', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ content: draft, detail: 'Gallery draft saved' }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `Save failed (${r.status})`);
      setDraft(d.state.draft); setPublished(d.state.published); setMessage('Draft saved.');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const publish = async () => {
    setBusy(true); setMessage(''); setError('');
    try {
      const r = await fetch('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ action: 'publish', detail: 'Gallery published' }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `Publish failed (${r.status})`);
      setDraft(d.state.draft); setPublished(d.state.published); setMessage('Published live.');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  if (!draft) return <div className="page"><div className="container narrow-admin"><h1 className="hero-title">Gallery editor.</h1><p>{error || 'Loading…'}</p></div></div>;

  return <div className="page"><div className="container narrow-admin">
    <span className="eyebrow">Control room / Gallery</span>
    <div className="admin-section-title"><div><h1 className="hero-title admin-login-title">Gallery editor.</h1><p className="hero-sub">Separate public Gallery editor. Uses the existing CMS Save / Publish API and Google Drive storage.</p></div></div>
    <div className="btn-row" style={{position:'sticky',top:12,zIndex:5,background:'var(--bg,inherit)',padding:'10px 0'}}><button className="btn btn-primary" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save draft'}</button><button className="btn btn-ghost" disabled={busy} onClick={publish}>Publish live</button><button className="btn btn-ghost" disabled={busy} onClick={()=>load().catch(e=>setError(e.message))}>Reload</button></div>
    {message && <p className="admin-message">{message}</p>}{error && <p className="admin-message" style={{color:'var(--danger,#c44)'}}>{error}</p>}

    <div className="admin-section-title" style={{marginTop:20}}><div><h2>Public Gallery</h2><p className="admin-help">Each image has its own frame size. The live site uses exactly these dimensions.</p></div><button className="btn btn-primary" onClick={()=>setItems([...items, emptyGallery()])}>+ Add image</button></div>

    <div className="admin-list">{items.map((g,i)=>{
      const src = g.driveFileId ? `/api/gallery/image?fileId=${encodeURIComponent(g.driveFileId)}` : '';
      const w = Number(g.frameWidth) || 16, h = Number(g.frameHeight) || 9;
      const x = Number.parseFloat(String(g.position || '50% 50%').split(' ')[0]) || 50;
      const y = Number.parseFloat(String(g.position || '50% 50%').split(' ')[1]) || 50;
      return <div className="admin-item" key={g.id || i}>
        <div className="admin-item-head"><strong>{g.title || `Image ${i+1}`}</strong><button className="danger-btn" onClick={()=>setItems(items.filter((_,n)=>n!==i))}>Delete</button></div>
        <div className="admin-form-grid">
          <label className="field"><span>Title</span><input value={g.title || ''} onChange={e=>update(i,'title',e.target.value)}/></label>
          <label className="field"><span>Google Drive URL / file ID</span><input value={g.driveFileId || ''} onChange={e=>update(i,'driveFileId',driveId(e.target.value))}/></label>
          <label className="field"><span>Alt text</span><input value={g.alt || ''} onChange={e=>update(i,'alt',e.target.value)}/></label>
          <label className="field"><span>Caption</span><textarea value={g.caption || ''} onChange={e=>update(i,'caption',e.target.value)}/></label>
          <label className="field"><span>Frame width</span><input type="number" min="1" max="100" value={w} onChange={e=>update(i,'frameWidth',Math.max(1,Number(e.target.value)||1))}/></label>
          <label className="field"><span>Frame height</span><input type="number" min="1" max="100" value={h} onChange={e=>update(i,'frameHeight',Math.max(1,Number(e.target.value)||1))}/></label>
          <label className="field"><span>Preset</span><select value={`${w}/${h}`} onChange={e=>{const [nw,nh]=e.target.value.split('/').map(Number);if(nw&&nh){update(i,'frameWidth',nw);update(i,'frameHeight',nh)}}}><option value="16/9">16:9</option><option value="4/3">4:3</option><option value="1/1">1:1</option><option value="4/5">4:5</option><option value="9/16">9:16</option><option value="custom">Custom</option></select></label>
          <label className="field"><span>Fit</span><select value={g.fit || 'cover'} onChange={e=>update(i,'fit',e.target.value)}><option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Stretch</option></select></label>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'minmax(180px,420px) 1fr',gap:18,alignItems:'start',marginTop:14}}>
          <div><div style={{width:'100%',aspectRatio:frameRatio(g),overflow:'hidden',borderRadius:12,background:'rgba(127,127,127,.08)',border:'1px solid rgba(127,127,127,.18)'}}>{src?<img src={src} alt={g.alt||g.title||'Gallery preview'} style={{width:'100%',height:'100%',display:'block',objectFit:g.fit||'cover',objectPosition:g.position||'50% 50%'}} onError={e=>{e.currentTarget.style.opacity='.35'}}/>:<div style={{height:'100%',display:'grid',placeItems:'center',padding:18,textAlign:'center'}}><span className="admin-help">Paste a Google Drive image URL or ID.</span></div>}</div><div className="admin-help" style={{marginTop:6}}>Live preview: {w}:{h}</div></div>
          <div>
            <label className="field"><span>Horizontal position: {Math.round(x)}%</span><input type="range" min="0" max="100" value={x} onChange={e=>update(i,'position',`${e.target.value}% ${y}%`)}/></label>
            <label className="field"><span>Vertical position: {Math.round(y)}%</span><input type="range" min="0" max="100" value={y} onChange={e=>update(i,'position',`${x}% ${e.target.value}%`)}/></label>
            <button type="button" className="btn btn-ghost" onClick={()=>update(i,'position','50% 50%')}>Center image</button>
          </div>
        </div>
        <label className="check-field" style={{marginTop:10}}><input type="checkbox" checked={g.visible !== false} onChange={e=>update(i,'visible',e.target.checked)}/>Show publicly</label>
      </div>;
    })}</div>
  </div></div>;
}
