import React, { useMemo } from 'react';

const emptyItem = () => ({
  id: `lab-gallery-${crypto?.randomUUID?.() || Date.now()}`,
  title: 'New lab image',
  caption: '',
  alt: '',
  driveFileId: '',
  visible: true,
  fit: 'cover',
  position: '50% 50%',
  frameWidth: 16,
  frameHeight: 9,
});

const driveId = (value = '') => {
  const match = String(value).match(/(?:\/d\/|[?&]id=)([A-Za-z0-9_-]{10,})/);
  return match ? match[1] : String(value).trim();
};

export function createLabGalleryItem() {
  return emptyItem();
}

export default function LabGalleryManager({ items = [], setItems }) {
  const update = (index, key, value) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const normalized = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  return (
    <div>
      <div className="admin-section-title">
        <div>
          <h2>Lab Gallery</h2>
          <p className="admin-help">Separate from the public Gallery. Images added here belong only to Lab.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setItems([...normalized, emptyItem()])}>+ Add lab image</button>
      </div>

      <div className="admin-list">
        {normalized.map((item, index) => {
          const src = item.driveFileId
            ? `/api/gallery/image?fileId=${encodeURIComponent(item.driveFileId)}`
            : '';
          const width = Number(item.frameWidth) || 16;
          const height = Number(item.frameHeight) || 9;

          return (
            <div className="admin-item" key={item.id || index}>
              <div className="admin-item-head">
                <strong>{item.title || `Lab image ${index + 1}`}</strong>
                <button className="danger-btn" onClick={() => setItems(normalized.filter((_, i) => i !== index))}>Delete</button>
              </div>

              <div className="admin-form-grid">
                <label className="field"><span>Title</span><input value={item.title || ''} onChange={e => update(index, 'title', e.target.value)} /></label>
                <label className="field"><span>Google Drive URL / file ID</span><input value={item.driveFileId || ''} onChange={e => update(index, 'driveFileId', driveId(e.target.value))} /></label>
                <label className="field"><span>Alt text</span><input value={item.alt || ''} onChange={e => update(index, 'alt', e.target.value)} /></label>
                <label className="field"><span>Caption</span><textarea value={item.caption || ''} onChange={e => update(index, 'caption', e.target.value)} /></label>
                <label className="field"><span>Frame width</span><input type="number" min="1" max="100" value={width} onChange={e => update(index, 'frameWidth', Number(e.target.value) || 1)} /></label>
                <label className="field"><span>Frame height</span><input type="number" min="1" max="100" value={height} onChange={e => update(index, 'frameHeight', Number(e.target.value) || 1)} /></label>
                <label className="field"><span>Fit</span><select value={item.fit || 'cover'} onChange={e => update(index, 'fit', e.target.value)}><option value="cover">Cover</option><option value="contain">Contain</option><option value="fill">Stretch</option></select></label>
                <label className="field"><span>Horizontal position</span><input type="range" min="0" max="100" value={parseFloat(String(item.position || '50% 50%').split(' ')[0]) || 50} onChange={e => update(index, 'position', `${e.target.value}% ${String(item.position || '50% 50%').split(' ')[1] || '50%'}`)} /></label>
                <label className="field"><span>Vertical position</span><input type="range" min="0" max="100" value={parseFloat(String(item.position || '50% 50%').split(' ')[1]) || 50} onChange={e => update(index, 'position', `${String(item.position || '50% 50%').split(' ')[0] || '50%'} ${e.target.value}%`)} /></label>
              </div>

              <div style={{ marginTop: 16, maxWidth: 520 }}>
                <div style={{ aspectRatio: `${width} / ${height}`, overflow: 'hidden', borderRadius: 12, background: 'rgba(127,127,127,.08)', border: '1px solid rgba(127,127,127,.18)' }}>
                  {src ? <img src={src} alt={item.alt || item.title || 'Lab preview'} style={{ width: '100%', height: '100%', display: 'block', objectFit: item.fit || 'cover', objectPosition: item.position || '50% 50%' }} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}><span className="admin-help">Paste a Drive image to preview.</span></div>}
                </div>
              </div>

              <label className="check-field" style={{ marginTop: 12 }}><input type="checkbox" checked={item.visible !== false} onChange={e => update(index, 'visible', e.target.checked)} />Show in Lab</label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
