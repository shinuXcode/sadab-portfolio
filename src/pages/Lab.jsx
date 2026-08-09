import { useState } from 'react';
import { useSiteContent } from '../SiteContentContext';
import { useSEO } from '../hooks/useSEO';

function driveImage(item) {
  if (item.driveFileId) return `/api/gallery/image?fileId=${encodeURIComponent(item.driveFileId)}`;
  return item.imageUrl || '';
}

export default function Lab() {
  const { content } = useSiteContent();
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  useSEO({ title: 'Lab — Sadab.dev', description: 'Unfinished experiments, prototypes and weird ideas from Sadab.', path: '/lab' });
  const items = content.lab || [];
  const gallery = content.gallery || [];
  const filters = ['All', ...new Set(items.flatMap((x) => x.tags || []))];
  const visible = filter === 'All' ? items : items.filter((x) => (x.tags || []).includes(filter));

  return <div className="page"><div className="container">
    <span className="eyebrow">Lab / experiments</span>
    <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)' }}>Half-built. Still interesting.</h1>
    <p className="hero-sub">A place for prototypes, abandoned ideas, experiments and projects that are not ready to pretend they're finished.</p>
    <div className="filter-row">{filters.map((f) => <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>)}</div>
    {visible.length ? <div className="grid-cards lab-grid">{visible.map((item, i) => <article className="card lab-card" key={item.id || item.title || i}>
      <div className="lab-status">{item.status || 'IN PROGRESS'}</div>{item.imageUrl && <img className="lab-thumb" src={item.imageUrl} alt="" loading="lazy" decoding="async" />}
      <div className="card-icon">{item.icon || '🧪'}</div><h3>{item.title}</h3><p>{item.desc}</p>
      <div className="tag-row">{(item.tags || []).map((t) => <span className="tag" key={t}>{t}</span>)}</div>
      {item.link && item.link !== '#' && <a className="btn btn-ghost lab-link" href={item.link} target="_blank" rel="noreferrer">Open experiment ↗</a>}
    </article>)}</div> : <div className="empty-state"><div className="card-icon">🧪</div><h3>The lab is empty.</h3><p>Add unfinished projects from the private Control Room.</p></div>}

    {gallery.length > 0 && <section className="section lab-gallery-section">
      <div className="section-head"><div><span className="eyebrow">Visual log</span><h2 className="section-title">Lab gallery</h2></div><span className="mono-label">// drive hosted</span></div>
      <p className="hero-sub gallery-intro">Screenshots, builds and experiments pulled securely from your Google Drive.</p>
      <div className="gallery-grid">{gallery.filter(x => x.visible !== false).map((item, i) => {
        const src = driveImage(item);
        return <button className="gallery-card" key={item.id || item.driveFileId || i} onClick={() => setLightbox(item)} aria-label={`Open ${item.title || 'gallery image'}`}>
          <img src={src} alt={item.alt || item.title || 'Lab image'} loading="lazy" decoding="async" />
          <span className="gallery-overlay"><strong>{item.title || 'Untitled experiment'}</strong>{item.caption && <small>{item.caption}</small>}</span>
        </button>;
      })}</div>
    </section>}
  </div>
  {lightbox && <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}><div className="lightbox-inner" onClick={e => e.stopPropagation()}><button className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">×</button><img src={driveImage(lightbox)} alt={lightbox.alt || lightbox.title || 'Lab image'} /><div className="lightbox-caption"><strong>{lightbox.title}</strong>{lightbox.caption && <p>{lightbox.caption}</p>}</div></div></div>}
  </div>;
}
