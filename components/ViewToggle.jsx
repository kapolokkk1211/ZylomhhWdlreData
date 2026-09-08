'use client';
import { useEffect, useState } from 'react';

// View mode: 'auto' (by screen width) | 'mobile' | 'desktop'. Sets data-view on <html>;
// every mobile rule in globals.css keys off html[data-view="mobile"], so auto and forced
// modes share one set of styles. Persisted per browser.
const KEY = 'stardrift.view';
const BP = 720;

export function applyView(mode) {
  const w = Math.min(window.innerWidth, (window.screen && window.screen.width) || Infinity);
  const m = mode === 'mobile' || (mode !== 'desktop' && w <= BP) ? 'mobile' : 'desktop';
  document.documentElement.setAttribute('data-view', m);
  document.documentElement.setAttribute('data-view-mode', mode);
}

export default function ViewToggle({ labels }) {
  const [mode, setMode] = useState('auto');

  useEffect(() => {
    let m = 'auto';
    try { m = localStorage.getItem(KEY) || 'auto'; } catch {}
    setMode(m);
    applyView(m);
    const onResize = () => applyView(m);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const cycle = () => {
    const next = mode === 'auto' ? 'mobile' : mode === 'mobile' ? 'desktop' : 'auto';
    setMode(next);
    try { localStorage.setItem(KEY, next); } catch {}
    applyView(next);
  };

  const icon = mode === 'mobile' ? '📱' : mode === 'desktop' ? '🖥' : '↔';
  return (
    <button type="button" className="view-toggle" onClick={cycle} title={labels.viewHelp} aria-label={labels.viewHelp}>
      <span aria-hidden>{icon}</span> {labels[mode]}
    </button>
  );
}
