'use client';
import { useEffect, useMemo, useState } from 'react';
import Combobox from './Combobox';

const fmt = (tpl, n, total) => String(tpl).replace('{n}', n).replace('{total}', total);

const CONF_CLASS = {
  'KK-tested': 'b-kk',
  'RE-verified': 'b-verified',
  'RE-reported': 'b-reported',
  LEGACY: 'b-legacy',
  INFER: 'b-infer',
};
const TRUSTED = new Set(['KK-tested', 'RE-verified']);
const OPS = ['>', '>=', '=', '<=', '<'];
const cmp = { '>': (a, b) => a > b, '>=': (a, b) => a >= b, '=': (a, b) => a === b, '<=': (a, b) => a <= b, '<': (a, b) => a < b };

/*  row indices — see lib/data.js
    0 id 1 family 2 secondary 3 rank 4 lv 5 slot 6 en 7 cn 8 th 9 statsRaw 10 recipeEn 11 recipeTh
    12 confidence 13 coverage 14 line 15 random 16 lvAnomaly 17 note 18 thConfirmed 19 band 20 stats[] */

export default function CompoundTable({ rows, labels, strings, options, lang }) {
  const [q, setQ] = useState('');
  const [fam, setFam] = useState('');
  const [slot, setSlot] = useState('');
  const [lo, setLo] = useState('');
  const [hi, setHi] = useState('');
  const [verified, setVerified] = useState(false);
  const [statf, setStatf] = useState([]); // [{stat, op, val}]

  // ?family=Star etc. from the old /star URL redirect. Read once on mount.
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('family')) setFam(p.get('family'));
      if (p.get('slot')) setSlot(p.get('slot'));
      if (p.get('q')) setQ(p.get('q'));
    } catch {}
  }, []);

  const activeStat = useMemo(
    () => statf.filter((f) => f.stat && f.val !== '' && !Number.isNaN(Number(f.val))),
    [statf],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const L = lo === '' ? 0 : Number(lo);
    const H = hi === '' ? 999 : Number(hi);
    return rows.filter((r) => {
      if (fam && r[1] !== fam) return false;
      if (slot && r[5] !== slot) return false;
      if (r[3] < L || r[3] > H) return false;
      if (verified && !TRUSTED.has(r[12])) return false;
      for (const f of activeStat) {
        const hit = r[20].find((s) => s[0] === f.stat);
        if (!hit) return false;
        if (!cmp[f.op](hit[1], Number(f.val))) return false;
      }
      if (term) {
        const hay = `${r[6]} ${r[7]} ${r[8] || ''} ${r[9]} ${r[10] || ''} ${r[11] || ''} ${
          labels.family[r[1]]?.label || ''
        } ${labels.slot[r[5]]?.label || ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [rows, q, fam, slot, lo, hi, verified, activeStat, labels]);

  const grouped = useMemo(() => {
    const out = [];
    let current = null;
    for (const r of filtered) {
      // Star rows group by rank band (they're one family, 92 deep); others by family.
      const key = r[1] === 'Star' ? `Star:${r[19]}` : r[1];
      if (key !== current) {
        current = key;
        const famLabel = `${labels.family[r[1]]?.label} ${labels.family[r[1]]?.cn}`;
        out.push({
          group: r[1] === 'Star' ? `${famLabel} — ${strings.bands?.[r[19]] || r[19]}` : famLabel,
          coverage: r[13],
          family: r[1],
        });
      }
      out.push({ row: r });
    }
    return out;
  }, [filtered, labels, strings]);

  const anyFilter = q || fam || slot || lo || hi || verified || statf.length;
  const reset = () => { setQ(''); setFam(''); setSlot(''); setLo(''); setHi(''); setVerified(false); setStatf([]); };

  const name = (r) => (lang === 'th' ? r[8] || r[6] : r[6]);
  const altName = (r) => {
    const parts = [r[7]];
    if (lang === 'th' && r[8]) parts.push(r[6]);
    if (lang === 'en' && r[8]) parts.push(r[8]);
    return parts.filter(Boolean).join(' · ');
  };
  const recipe = (r) => (lang === 'th' ? r[11] || r[10] : r[10]);

  const setF = (i, patch) => setStatf((a) => a.map((f, j) => (j === i ? { ...f, ...patch } : f)));

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
        <Combobox value={fam} onChange={setFam} options={options.families} allLabel={strings.allFamilies} width={200} />
        <Combobox value={slot} onChange={setSlot} options={options.slots} allLabel={strings.allSlots} width={170} />

        <span className="rng">
          {strings.rank}
          <input type="number" min="0" max="60" value={lo} onChange={(e) => setLo(e.target.value)} placeholder={strings.rankFrom} aria-label={strings.rankFrom} />
          –
          <input type="number" min="0" max="60" value={hi} onChange={(e) => setHi(e.target.value)} placeholder={strings.rankTo} aria-label={strings.rankTo} />
        </span>

        <div className="statf" role="group" aria-label={strings.statFilter}>
          {statf.map((f, i) => (
            <span className="statf-row" key={i}>
              <select value={f.stat} onChange={(e) => setF(i, { stat: e.target.value })} aria-label={strings.stat}>
                {options.stats.map((s) => (
                  <option key={s.key} value={s.key}>{s.key}</option>
                ))}
              </select>
              <select value={f.op} onChange={(e) => setF(i, { op: e.target.value })} aria-label="op">
                {OPS.map((o) => <option key={o} value={o}>{o === '>=' ? '≥' : o === '<=' ? '≤' : o}</option>)}
              </select>
              <input type="number" value={f.val} onChange={(e) => setF(i, { val: e.target.value })} placeholder="0" aria-label={strings.value} />
              <button type="button" className="rm" aria-label={strings.remove} onClick={() => setStatf((a) => a.filter((_, j) => j !== i))}>×</button>
            </span>
          ))}
          <button type="button" className="statf-add" onClick={() => setStatf((a) => [...a, { stat: 'ATK', op: '>', val: '' }])}>
            + {strings.statFilter}
          </button>
        </div>

        <label className="toggle" data-on={verified ? '1' : '0'}>
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
          {strings.verifiedOnly}
        </label>

        {anyFilter ? <button type="button" className="toggle" onClick={reset}>{strings.reset}</button> : null}

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
                  <td><span className="rank">{g.row[3]}</span></td>
                  <td>
                    <span className="lv">{g.row[4] || '—'}</span>
                    {g.row[16] === 1 && <span className="warn-mark" title={strings.lvWarning}> !</span>}
                  </td>
                  <td>
                    <span className="nm">
                      {name(g.row)}
                      <span
                        className={`dot-th${g.row[18] === 1 ? ' ok' : ''}`}
                        title={g.row[18] === 1 ? strings.confirmedTh : strings.untranslated}
                      />
                      {g.row[14] && g.row[14] !== 'mat' && (
                        <span className={`line-pill line-${g.row[14]}`}>{strings.lines[g.row[14]]}</span>
                      )}
                    </span>
                    <span className="nm-alt">{altName(g.row)}</span>
                    {g.row[12] !== 'RE-reported' && (
                      <span className={`badge ${CONF_CLASS[g.row[12]] || 'b-legacy'}`} title={labels.confidence[g.row[12]]?.desc}>
                        {labels.confidence[g.row[12]]?.label}
                      </span>
                    )}
                    {g.row[15] === 1 && <span className="badge b-infer" style={{ marginLeft: 5 }}>{strings.random}</span>}
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
