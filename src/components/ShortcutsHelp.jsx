import { useEffect, useState } from 'react';

const SHORTCUTS = [
  ['Ctrl / Cmd + K', 'Open command palette (jump to any page)'],
  ['Ctrl / Cmd + `', 'Open the dev terminal'],
  ['?', 'Show this shortcuts list'],
  ['Esc', 'Close any open overlay'],
];

export default function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
      if (e.key === '?' && !typing) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  return (
    <div className="command-overlay" onMouseDown={() => setOpen(false)}>
      <div className="command-palette" onMouseDown={(e) => e.stopPropagation()}>
        <strong style={{ display: 'block', marginBottom: 12 }}>Keyboard shortcuts</strong>
        <div>
          {SHORTCUTS.map(([keys, desc]) => (
            <div key={keys} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '8px 4px' }}>
              <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85em', opacity: 0.85 }}>{keys}</kbd>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.9em', textAlign: 'right' }}>{desc}</span>
            </div>
          ))}
        </div>
        <small>Press ? again or Esc to close</small>
      </div>
    </div>
  );
}
