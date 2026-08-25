import { useMemo, useState } from 'react';
import { useSiteContent } from '../SiteContentContext';

function imageSrc(id) {
  return id ? `/api/gallery/image?fileId=${encodeURIComponent(id)}` : '';
}

export default function Gallery() {
  const { content, loading } = useSiteContent();
  const [broken, setBroken] = useState({});
  const items = useMemo(
    () => (Array.isArray(content.gallery) ? content.gallery : []).filter((item) => item?.visible !== false && item?.driveFileId),
    [content.gallery]
  );

  return (
    <div className="page">
      <div className="container">
        <section className="page-hero">
          <span className="eyebrow">Gallery</span>
          <h1 className="hero-title">A visual archive.</h1>
          <p className="hero-sub">Selected images published from the Control Room.</p>
        </section>

        {loading && <div className="card"><p>Loading gallery…</p></div>}

        {!loading && !items.length && (
          <div className="card">
            <h2>No images yet.</h2>
            <p className="admin-help">Publish an image from Control Room → Gallery and it will appear here.</p>
          </div>
        )}

        {!!items.length && (
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            {items.map((item, index) => {
              const src = imageSrc(item.driveFileId);
              if (broken[item.driveFileId]) return null;
              return (
                <article className="card" key={item.id || item.driveFileId || index} style={{ padding: 12, overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 12, background: 'var(--surface-2, rgba(127,127,127,.08))' }}>
                    <img
                      src={src}
                      alt={item.alt || item.title || 'Gallery image'}
                      loading="lazy"
                      onError={() => setBroken((prev) => ({ ...prev, [item.driveFileId]: true }))}
                      style={{ width: '100%', height: '100%', display: 'block', objectFit: item.fit || 'cover', objectPosition: item.position || 'center' }}
                    />
                  </div>
                  {(item.title || item.caption) && (
                    <div style={{ padding: '12px 4px 2px' }}>
                      {item.title && <h3 style={{ margin: 0 }}>{item.title}</h3>}
                      {item.caption && <p style={{ margin: '6px 0 0' }}>{item.caption}</p>}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
