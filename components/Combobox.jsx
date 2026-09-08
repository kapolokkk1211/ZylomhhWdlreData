'use client';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

/**
 * Typeable dropdown. Options: [{ key, label, alt? }]. `alt` is extra searchable text
 * (Chinese, English) that isn't shown as the label. Empty value = "all".
 * Behaves like a select when you click the arrow, like a search box when you type.
 */
export default function Combobox({ value, onChange, options, placeholder, allLabel, ariaLabel, width = 220, limit = 80, noAll = false }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const listId = useId();

  const selected = options.find((o) => o.key === value) || null;

  // What the input shows when not being edited
  useEffect(() => {
    if (!open) setText(selected ? selected.label : '');
  }, [selected, open]);

  const matches = useMemo(() => {
    const t = text.trim().toLowerCase();
    const all = noAll ? options : [{ key: '', label: allLabel, alt: '' }, ...options];
    if (!t || (selected && text === selected.label)) return all.slice(0, limit);
    return all.filter((o) => `${o.label} ${o.alt || ''}`.toLowerCase().includes(t)).slice(0, limit);
  }, [text, options, allLabel, selected, limit, noAll]);

  useEffect(() => {
    const onDoc = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (o) => {
    onChange(o.key);
    setText(o.key ? o.label : '');
    setOpen(false);
  };

  const onKey = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) { setOpen(true); setActive(0); return; }
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, matches.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (matches[active]) pick(matches[active]); }
    else if (e.key === 'Escape') { setOpen(false); setText(selected ? selected.label : ''); }
  };

  return (
    <div className={`cbx${value ? ' has' : ''}`} ref={root} style={{ width }}>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel || placeholder}
        placeholder={allLabel}
        value={text}
        onChange={(e) => { setText(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => { setOpen(true); setActive(0); }}
        onKeyDown={onKey}
        autoComplete="off"
        spellCheck={false}
      />
      {value ? (
        <button type="button" className="cbx-x" aria-label="clear" onMouseDown={(e) => e.preventDefault()} onClick={() => pick({ key: '', label: allLabel })}>×</button>
      ) : (
        <span className="cbx-arrow" aria-hidden onMouseDown={(e) => { e.preventDefault(); setOpen((o) => !o); }}>▾</span>
      )}
      {open && (
        <ul className="cbx-list" id={listId} role="listbox">
          {matches.length === 0 && <li className="cbx-empty">—</li>}
          {matches.map((o, i) => (
            <li
              key={o.key || '__all'}
              role="option"
              aria-selected={o.key === value}
              className={`cbx-opt${i === active ? ' act' : ''}${o.key === value ? ' sel' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(o)}
            >
              {o.label}
              {o.alt && <span className="cbx-alt">{o.alt}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
