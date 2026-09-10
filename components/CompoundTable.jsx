'use client';
import { useEffect, useMemo, useState } from 'react';
import Combobox from './Combobox';
import { readBasket, toggleBasket, subscribeBasket } from '@/lib/basket';

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
  const [fam, setFam] = useState('');       // main structural family
  const [fam2, setFam2] = useState('');      // secondary family — its own filter, so 'main only' is possible
  const [slot, setSlot] = useState('');
  const [lo, setLo] = useState('');
  const [hi, setHi] = useState('');
  const [verified, setVerified] = useState(false);
  const [statf, setStatf] = useState({ stat: 'ATK', op: '>', val: '' }); // one stat filter; blank value = off
  const [sort, setSort] = useState({ key: null, dir: 'desc' }); // key: null | 'rank' | 'stat'
  const [openRc, setOpenRc] = useState(null); // recipe cell opened by tap (mobile has no hover)
  const [basket, setBasket] = useState([]);
  useEffect(() => { setBasket(readBasket()); return subscribeBasket(setBasket); }, []);
  const inBasket = useMemo(() => new Set(basket), [basket]);

  // ?family=Star etc. from the old /star URL redirect. Read once on mount.
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('family')) setFam(p.get('family'));
      if (p.get('family2')) setFam2(p.get('family2'));
      if (p.get('slot')) setSlot(p.get('slot'));
      if (p.get('q')) setQ(p.get('q'));
    } catch {}
  }, []);

  const statActive = statf.val !== '' && !Number.isNaN(Number(statf.val));

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const L = lo === '' ? 0 : Number(lo);
    const H = hi === '' ? 999 : Number(hi);
    return rows.filter((r) => {
      if (fam && r[1] !== fam) return false;
      if (fam2 && !(r[2] || []).includes(fam2)) return false;
      if (slot && r[5] !== slot) return false;
      if (r[3] < L || r[3] > H) return false;
      if (verified && !TRUSTED.has(r[12])) return false;
      if (statActive) {
        const hit = r[20].find((s) => s[0] === statf.stat);
        if (!hit) return false;
        if (!cmp[statf.op](hit[1], Number(statf.val))) return false;
      }
      if (term) {
        const hay = `${r[6]} ${r[7]} ${r[8] || ''} ${r[9]} ${r[10] || ''} ${r[11] || ''} ${
          labels.family[r[1]]?.label || ''
        } ${labels.slot[r[5]]?.label || ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [rows, q, fam, fam2, slot, lo, hi, verified, statActive, statf, labels]);

  // One sort key at a time. Sorted views are flat (no family headings).
  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const dir = sort.dir === 'asc' ? 1 : -1;
    const val = (r) => {
      if (sort.key === 'rank') return r[3];
      const hit = r[20].find((s) => s[0] === statf.stat);
      return hit ? hit[1] : null;
    };
    return [...filtered].sort((a, b) => {
      const va = val(a), vb = val(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1; // rows without the stat go last either way
      if (vb == null) return -1;
      return (va - vb) * dir || a[3] - b[3];
    });
  }, [filtered, sort, statf.stat]);

  const grouped = useMemo(() => {
    if (sort.key) return sorted.map((r) => ({ row: r }));
    const out = [];
    let current = null;
    for (const r of sorted) {
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
  }, [sorted, sort.key, labels, strings]);

  const anyFilter = q || fam || fam2 || slot || lo || hi || verified || statActive || sort.key;
  const reset = () => { setQ(''); setFam(''); setFam2(''); setSlot(''); setLo(''); setHi(''); setVerified(false); setStatf({ stat: 'ATK', op: '>', val: '' }); setSort({ key: null, dir: 'desc' }); };
  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }));
  const arrow = (key) => (sort.key === key ? (sort.dir === 'desc' ? ' ▼' : ' ▲') : '');

  const name = (r) => (lang === 'th' ? r[8] || r[6] : r[6]);
  const altName = (r) => [r[7], lang === 'th' ? r[6] : r[8]].filter(Boolean).join(' · ');
  const recipe = (r) => (lang === 'th' ? r[11] || r[10] : r[10]);
  const fullRecipe = (r) => [recipe(r) || '—', r[17]].filter(Boolean).join('\n');
  // Two clamped lines fit roughly 60 characters at this column width; longer rows get the hover panel.
  const isLong = (r) => fullRecipe(r).length > 58;


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
        <Combobox value={fam} onChange={setFam} options={options.families} allLabel={strings.allFamilies} ariaLabel={strings.mainFamily} width={190} />
        <Combobox value={fam2} onChange={setFam2} options={options.secondaries} allLabel={strings.allSecondaries} ariaLabel={strings.secondFamily} width={190} />
        <Combobox value={slot} onChange={setSlot} options={options.slots} allLabel={strings.allSlots} width={170} />

        <span className="rng">
          {strings.rank}
          <input type="number" min="0" max="60" value={lo} onChange={(e) => setLo(e.target.value)} placeholder={strings.rankFrom} aria-label={strings.rankFrom} />
          –
          <input type="number" min="0" max="60" value={hi} onChange={(e) => setHi(e.target.value)} placeholder={strings.rankTo} aria-label={strings.rankTo} />
        </span>

        <span className="statf-row" role="group" aria-label={strings.statFilter}>
          <select value={statf.stat} onChange={(e) => setStatf((f) => ({ ...f, stat: e.target.value }))} aria-label={strings.stat}>
            {options.stats.map((st) => (
              <option key={st.key} value={st.key}>{st.key}</option>
            ))}
          </select>
          <select value={statf.op} onChange={(e) => setStatf((f) => ({ ...f, op: e.target.value }))} aria-label="op">
            {OPS.map((o) => <option key={o} value={o}>{o === '>=' ? '≥' : o === '<=' ? '≤' : o}</option>)}
          </select>
          <input
            type="number"
            value={statf.val}
            onChange={(e) => setStatf((f) => ({ ...f, val: e.target.value }))}
            placeholder={strings.value}
            aria-label={strings.value}
          />
          {statActive && (
            <button type="button" className="rm" aria-label={strings.remove} onClick={() => setStatf((f) => ({ ...f, val: '' }))}>×</button>
          )}
        </span>

        <div className="seg" role="group" aria-label={strings.sort}>
          <button type="button" aria-pressed={!sort.key} onClick={() => setSort({ key: null, dir: 'desc' })}>{strings.sortDefault}</button>
          <button type="button" aria-pressed={sort.key === 'rank'} onClick={() => toggleSort('rank')}>{strings.rank}{arrow('rank')}</button>
          <button type="button" aria-pressed={sort.key === 'stat'} onClick={() => toggleSort('stat')}>{statf.stat}{arrow('stat')}</button>
        </div>

        <label className="toggle" data-on={verified ? '1' : '0'}>
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
          {strings.verifiedOnly}
        </label>

        {anyFilter ? <button type="button" className="toggle" onClick={reset}>{strings.reset}</button> : null}

        <a className={`toggle basket-link${basket.length ? ' has' : ''}`} href={`/${lang}/simulator`} title={strings.basketHelp}>
          ★ {strings.basket} {basket.length ? <b>{basket.length}</b> : null}
        </a>
        <span className="count">{fmt(strings.showing, sorted.length, rows.length)}</span>
      </div>

      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th className="th-num" style={{ width: 96, cursor: 'pointer' }} onClick={() => toggleSort('rank')} title={strings.sort}>{strings.rank}{arrow('rank')}</th>
              <th className="th-num" style={{ width: 48 }}>{strings.lv}</th>
              <th style={{ minWidth: 300 }}>{strings.item}</th>
              <th style={{ width: 92 }}>{strings.slot}</th>
              <th style={{ width: 150 }}>{strings.families}</th>
              <th style={{ width: 160, cursor: 'pointer' }} onClick={() => toggleSort('stat')} title={strings.sort}>{strings.stats}{sort.key === 'stat' ? ` · ${statf.stat}${arrow('stat')}` : ''}</th>
              <th>{strings.recipe}</th>
              <th style={{ width: 120 }}>{strings.basket}</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((g, i) =>
              g.group ? (
                <tr className="group" key={`g-${g.family}-${i}`}>
                  <td colSpan={8}>
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
                  <td className="c-rank"><span className="rank">{g.row[3]}</span></td>
                  <td className="c-lv" data-l={strings.lv}>
                    <span className="lv">{g.row[4] || '—'}</span>
                    {g.row[16] === 1 && <span className="warn-mark" title={strings.lvWarning}> !</span>}
                  </td>
                  <td className="c-name">
                    <span className="nm" title={altName(g.row)}>
                      {name(g.row)}
                      <span
                        className={`dot-th${g.row[18] === 1 ? ' ok' : ''}`}
                        title={g.row[18] === 1 ? strings.confirmedTh : strings.untranslated}
                      />
                      {g.row[14] && g.row[14] !== 'mat' && strings.lines[g.row[14]] && (
                        <span className={`line-pill line-${g.row[14]}`}>{strings.lines[g.row[14]]}</span>
                      )}
                    </span>
                    {/* KK-tested rows carry no badge here — the tag stays in the data and still
                        drives the "verified only" filter, it is just not shown on the row. */}
                    {g.row[12] !== 'RE-reported' && g.row[12] !== 'KK-tested' && (
                      <span className={`badge ${CONF_CLASS[g.row[12]] || 'b-legacy'}`} title={labels.confidence[g.row[12]]?.desc}>
                        {labels.confidence[g.row[12]]?.label}
                      </span>
                    )}
                    {g.row[15] === 1 && <span className="badge b-infer" style={{ marginLeft: 5 }}>{strings.random}</span>}
                  </td>
                  <td className="c-slot"><span className="slot-pill">{labels.slot[g.row[5]]?.label}</span></td>
                  <td className="fm c-fam" data-l={strings.families}>
                    <b className={fam && g.row[1] === fam ? 'fam-hit' : undefined}>{labels.family[g.row[1]]?.label}</b>
                    {g.row[2].map((f) => (
                      <span key={f} className={fam2 && f === fam2 ? 'fam-hit' : undefined}> · {labels.family[f]?.label || f}</span>
                    ))}
                  </td>
                  <td className="st c-st" data-l={strings.stats}>{g.row[9]}</td>
                  <td
                    className={`rc c-rc${openRc === g.row[0] ? ' open' : ''}`}
                    data-l={strings.recipe}
                    data-more={isLong(g.row) ? '1' : '0'}
                    title={isLong(g.row) ? fullRecipe(g.row) : undefined}
                    onClick={() => isLong(g.row) && setOpenRc((v) => (v === g.row[0] ? null : g.row[0]))}
                  >
                    <div className="rc-in">
                      {recipe(g.row) || '—'}
                      {g.row[17] && <div className="rc-note">{g.row[17]}</div>}
                    </div>
                  </td>
                  <td className="c-add">
                    <button
                      type="button"
                      className={`addbtn${inBasket.has(g.row[0]) ? ' on' : ''}`}
                      title={inBasket.has(g.row[0]) ? strings.basketRemove : strings.basketAdd}
                      aria-pressed={inBasket.has(g.row[0])}
                      onClick={() => setBasket(toggleBasket(g.row[0]))}
                    >
                      {inBasket.has(g.row[0]) ? `★ ${strings.inBasket}` : `＋ ${strings.addShort}`}
                    </button>
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
