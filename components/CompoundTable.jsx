'use client';
import { useMemo, useState } from 'react';

const fmt = (tpl, n, total) => String(tpl).replace('{n}', n).replace('{total}', total);

const CONF_CLASS = {
  'KK-tested': 'b-kk',
  'RE-verified': 'b-verified',
  'RE-reported': 'b-reported',
  LEGACY: 'b-legacy',
  INFER: 'b-infer',
};
const TRUSTED = new Set(['KK-tested', 'RE-verified']);

export default function CompoundTable({
  rows,
  labels,
  strings,
  options,
  lang,
  mode = 'compound',
}) {
  const [q, setQ] = useState('');
  const [fam, setFam] = useState('');
  const [slot, setSlot] = useState('');
  const [lo, setLo] = useState('');
  const [hi, setHi] = useState('');
  const [verified, setVerified] = useState(false);
  const [line, setLine] = useState('all');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const L = lo === '' ? 0 : Number(lo);
    const H = hi === '' ? 999 : Number(hi);
    return rows.filter((r) => {
      if (fam && r[1] !== fam) return false;
      if (slot && r[5] !== slot) return false;
      if (r[3] < L || r[3] > H) return false;
      if (verified && !TRUSTED.has(r[12])) return false;
      if (mode === 'star' && line !== 'all' && r[14] !== line) return false;
      if (term) {
        const hay = `${r[6]} ${r[7]} ${r[8] || ''} ${r[9]} ${r[10] || ''} ${r[11] || ''} ${
          labels.family[r[1]]?.label || ''
        }`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [rows, q, fam, slot, lo, hi, verified, line, mode, labels]);

  const grouped = useMemo(() => {
    const out = [];
    let current = null;
    for (const r of filtered) {
      const key = mode === 'star' ? r[19] : r[1];
      if (key && key !== current) {
        current = key;
        out.push({
          group: mode === 'star' ? (strings.bands?.[r[19]] || r[19]) : `${labels.family[r[1]]?.label} ${labels.family[r[1]]?.cn}`,
          coverage: mode === 'star' ? 'complete' : r[13],
          family: r[1],
        });
      }
      out.push({ row: r });
    }
    return out;
  }, [filtered, labels, mode, strings]);

  const reset = () => {
    setQ(''); setFam(''); setSlot(''); setLo(''); setHi(''); setVerified(false); setLine('all');
  };

  const name = (r) => (lang === 'th' ? r[8] || r[6] : r[6]);
  const altName = (r) => {
    const parts = [r[7]];
    if (lang === 'th' && r[8]) parts.push(r[6]);
    if (lang === 'en' && r[8]) parts.push(r[8]);
    return parts.filter(Boolean).join(' · ');
  };
  const recipe = (r) => (lang === 'th' ? r[11] || r[10] : r[10]);

  return (
    <>
      <div className="controls">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={strings.search}
          aria-label={strings.search}
        />

        {mode === 'star' ? (
          <div className="seg" role="group">
            {['all', 'magic', 'phys', 'mat'].map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={line === k}
                onClick={() => setLine(k)}
              >
                {strings.lines[k]}
              </button>
            ))}
          </div>
        ) : (
          <select value={fam} onChange={(e) => setFam(e.target.value)} aria-label={strings.allFamilies}>
            <option value="">{strings.allFamilies}</option>
            {options.families.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
        )}

        <select value={slot} onChange={(e) => setSlot(e.target.value)} aria-label={strings.allSlots}>
          <option value="">{strings.allSlots}</option>
          {options.slots.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>

        <span className="rng">
          {strings.rank}
          <input type="number" min="0" max="60" value={lo} onChange={(e) => setLo(e.target.value)} placeholder={strings.rankFrom} aria-label={strings.rankFrom} />
          –
          <input type="number" min="0" max="60" value={hi} onChange={(e) => setHi(e.target.value)} placeholder={strings.rankTo} aria-label={strings.rankTo} />
        </span>

        <label className="toggle" data-on={verified ? '1' : '0'}>
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
          {strings.verifiedOnly}
        </label>

        {(q || fam || slot || lo || hi || verified || line !== 'all') && (
          <button type="button" className="toggle" onClick={reset}>{strings.reset}</button>
        )}

        <span className="count">{fmt(strings.showing, filtered.length, rows.length)}</span>
      </div>

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th style={{ width: 66 }}>{strings.rank}</th>
              <th style={{ width: 48 }}>{strings.lv}</th>
              <th>{strings.item}</th>
              <th style={{ width: 92 }}>{strings.slot}</th>
              <th style={{ width: 150 }}>{strings.families}</th>
              <th style={{ width: 160 }}>{strings.stats}</th>
              <th>{strings.recipe}</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((g, i) =>
              g.group ? (
                <tr className="group" key={`g-${g.family}-${i}`}>
                  <td colSpan={7}>
                    {g.group}
                    {g.coverage !== 'complete' && (
                      <span className="badge b-legacy" style={{ marginLeft: 9 }} title={strings.partialFamily}>
                        ≤ 30
                      </span>
                    )}
                  </td>
                </tr>
              ) : (
                <tr key={g.row[0]}>
                  <td>
                    <span className="rank">{g.row[3]}</span>
                  </td>
                  <td>
                    <span className="lv">{g.row[4] || '—'}</span>
                    {g.row[16] === 1 && (
                      <span className="warn-mark" title={strings.lvWarning}> !</span>
                    )}
                  </td>
                  <td>
                    <span className="nm">
                      {name(g.row)}
                      <span
                        className={`dot-th${g.row[18] === 1 ? ' ok' : ''}`}
                        title={g.row[18] === 1 ? strings.confirmedTh : strings.untranslated}
                      />
                    </span>
                    <span className="nm-alt">{altName(g.row)}</span>
                    {g.row[12] !== 'RE-reported' && (
                      <span className={`badge ${CONF_CLASS[g.row[12]] || 'b-legacy'}`} title={labels.confidence[g.row[12]]?.desc}>
                        {labels.confidence[g.row[12]]?.label}
                      </span>
                    )}
                    {g.row[15] === 1 && (
                      <span className="badge b-infer" style={{ marginLeft: 5 }}>{strings.random}</span>
                    )}
                  </td>
                  <td><span className="slot-pill">{labels.slot[g.row[5]]?.label}</span></td>
                  <td className="fm">
                    <b>{labels.family[g.row[1]]?.label}</b>
                    {g.row[2].length > 0 && ' · ' + g.row[2].map((f) => labels.family[f]?.label || f).join(' · ')}
                  </td>
                  <td className="st">{g.row[9]}</td>
                  <td className="rc">
                    {recipe(g.row) || '—'}
                    {g.row[17] && <div style={{ marginTop: 4, opacity: 0.75 }}>{g.row[17]}</div>}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty">{strings.noResults}</div>}
      </div>
    </>
  );
}
