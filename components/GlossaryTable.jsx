'use client';
import { useMemo, useState } from 'react';

const fmt = (tpl, n, total) => String(tpl).replace('{n}', n).replace('{total}', total);

export default function GlossaryTable({ data, lang, strings }) {
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();

  const sections = useMemo(
    () =>
      Object.entries(data)
        .map(([key, rows]) => [
          key,
          rows.filter((r) =>
            !term
              ? true
              : `${r.name.en} ${r.name.cn || ''} ${r.name.th || ''} ${r.note || ''}`
                  .toLowerCase()
                  .includes(term),
          ),
        ])
        .filter(([, rows]) => rows.length > 0),
    [data, term],
  );

  const total = Object.values(data).flat().length;
  const shown = sections.reduce((n, [, rows]) => n + rows.length, 0);

  return (
    <>
      <div className="controls">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={strings.search} aria-label={strings.search} />
        {q && <button type="button" className="toggle" onClick={() => setQ('')}>{strings.reset}</button>}
        <span className="count">{fmt(strings.showing, shown, total)}</span>
      </div>

      {sections.length === 0 && <div className="empty">{strings.noResults}</div>}

      {sections.map(([key, rows]) => (
        <section className="gl-section" key={key}>
          <h2>{strings.sections[key] || key}</h2>
          <div className="scroll" style={{ borderTop: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
            <table className="gl-table">
              <thead>
                <tr>
                  <th style={{ width: 150 }}>中文</th>
                  <th style={{ width: 210 }}>English</th>
                  <th style={{ width: 210 }}>ไทย</th>
                  <th>{strings.note}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={key + i}>
                    <td className="fm">{r.name.cn || '—'}</td>
                    <td>
                      <span className="nm">{r.name.en}</span>
                      {r.enTag === 'EN-LIT' && <span className="badge b-legacy">EN-LIT</span>}
                    </td>
                    <td>
                      {r.name.th || <span style={{ color: 'var(--ink-faint)' }}>—</span>}
                      {r.thConfirmed && (
                        <span className="badge b-kk" style={{ marginLeft: 6 }} title={strings.confirmedNote}>✓</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{r.note || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
