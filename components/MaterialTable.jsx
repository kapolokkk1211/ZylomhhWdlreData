'use client';
import { useMemo, useState } from 'react';
import Combobox from './Combobox';

const fmt = (tpl, n, total) => String(tpl).replace('{n}', n).replace('{total}', total);

const STATUS_CLASS = { open: 'b-open', closed: 'b-closed', unverified: 'b-unknown', 'not-in-re': 'b-closed' };

export default function MaterialTable({ rows, labels, strings, options, lang }) {
  const [q, setQ] = useState('');
  const [fam, setFam] = useState('');
  const [lo, setLo] = useState('');
  const [hi, setHi] = useState('');
  const [openOnly, setOpenOnly] = useState(false);
  const [town, setTown] = useState('');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const L = lo === '' ? 0 : Number(lo);
    const H = hi === '' ? 999 : Number(hi);
    return rows.filter((r) => {
      if (fam && r.family !== fam) return false;
      if (r.rank < L || r.rank > H) return false;
      if (openOnly && !r.buyableNow) return false;
      if (town && !r.sources.some((s) => s.type === 'shop' && s.town === town)) return false;
      if (term) {
        const towns = r.sources.map((s) => (s.town ? labels.town[s.town]?.label : '') + ' ' + (s.mob || '') + ' ' + (s.where || '') + ' ' + (s.station || '')).join(' ');
        const hay = `${r.name.en} ${r.name.cn} ${r.name.th || ''} ${labels.family[r.family]?.label} ${towns} ${r.note || ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [rows, q, fam, lo, hi, openOnly, town, labels]);

  const grouped = useMemo(() => {
    const out = [];
    let cur = null;
    for (const r of filtered) {
      if (r.family !== cur) {
        cur = r.family;
        out.push({ group: `${labels.family[r.family]?.label} ${labels.family[r.family]?.cn}` });
      }
      out.push({ row: r });
    }
    return out;
  }, [filtered, labels]);

  const name = (r) => (lang === 'th' ? r.name.th || r.name.en : r.name.en);
  const alt = (r) => [r.name.cn, lang === 'th' ? r.name.en : r.name.th].filter(Boolean).join(' · ');

  const srcLine = (s, i) => {
    if (s.type === 'shop') {
      const town = labels.town[s.town];
      return (
        <div className="src-item" key={i}>
          <span className="src-type shop">{strings.shop}</span>
          <span>{town?.label}</span>
          <span className={`badge ${STATUS_CLASS[town?.status] || 'b-unknown'}`}>
            {town?.status === 'open' ? strings.open : town?.status === 'closed' ? strings.closed : town?.status === 'not-in-re' ? strings.notInRe : strings.unverified}
          </span>
          {s.price != null && (
            <span className="price" title={s.priceProvenance === 're-sheet' ? strings.priceRe : strings.priceLegacy}>
              {s.price}g{s.priceProvenance === 're-sheet' ? ' ✓' : '*'}
            </span>
          )}
        </div>
      );
    }
    if (s.type === 'drop') {
      return (
        <div className="src-item" key={i}>
          <span className="src-type drop">{strings.drop}</span>
          <span>{s.mob}{s.lv ? ` · Lv ${s.lv}` : ''}{s.where ? ` · ${s.where}` : ''}</span>
        </div>
      );
    }
    if (s.type === 'gather') {
      return (
        <div className="src-item" key={i}>
          <span className="src-type gather">{strings.gather}</span>
          <span>{s.where}</span>
        </div>
      );
    }
    if (s.type === 'craft') {
      return (
        <div className="src-item" key={i}>
          <span className="src-type craft">{strings.craft}</span>
          <span>{s.station}{s.recipe ? ` — ${s.recipe}` : ''}</span>
        </div>
      );
    }
    return (
      <div className="src-item" key={i}>
        <span className="src-type scroll">{strings.scroll}</span>
        <span>{s.note}</span>
      </div>
    );
  };

  return (
    <>
      <div className="controls">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={strings.search} aria-label={strings.search} />
        <Combobox value={fam} onChange={setFam} options={options.families} allLabel={strings.allFamilies} width={200} />
        <Combobox value={town} onChange={setTown} options={options.towns} allLabel={strings.allShops} width={190} />
        <span className="rng">
          {strings.rank}
          <input type="number" min="0" max="30" value={lo} onChange={(e) => setLo(e.target.value)} placeholder={strings.rankFrom} aria-label={strings.rankFrom} />
          –
          <input type="number" min="0" max="30" value={hi} onChange={(e) => setHi(e.target.value)} placeholder={strings.rankTo} aria-label={strings.rankTo} />
        </span>
        <label className="toggle" data-on={openOnly ? '1' : '0'} title={strings.openOnlyHelp}>
          <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
          {strings.openOnly}
        </label>
        {(q || fam || town || lo || hi || openOnly) && (
          <button type="button" className="toggle" onClick={() => { setQ(''); setFam(''); setTown(''); setLo(''); setHi(''); setOpenOnly(false); }}>
            {strings.reset}
          </button>
        )}
        <span className="count">{fmt(strings.showing, filtered.length, rows.length)}</span>
      </div>

      <div className="scroll">
        <table className="t-materials">
          <thead>
            <tr>
              <th style={{ width: 66 }}>{strings.rank}</th>
              <th style={{ width: 260 }}>{strings.item}</th>
              <th>{strings.source}</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((g, i) =>
              g.group ? (
                <tr className="group" key={`g-${i}`}>
                  <td colSpan={3}>{g.group}</td>
                </tr>
              ) : (
                <tr key={g.row.id}>
                  <td className="c-rank"><span className="rank">{g.row.rank}</span></td>
                  <td className="c-name">
                    <span className="nm" title={alt(g.row)}>
                      {name(g.row)}
                      <span className={`dot-th${g.row.thConfirmed ? ' ok' : ''}`} title={g.row.thConfirmed ? strings.confirmedTh : strings.untranslated} />
                    </span>
                    {g.row.flags.cheapestOfFamily && <span className="badge b-kk">{strings.cheapest}</span>}
                    {g.row.flags.highestBuyable && <span className="badge b-verified" style={{ marginLeft: 5 }}>{strings.highest}</span>}
                    {g.row.flags.keyMaterial && <span className="badge b-reported" style={{ marginLeft: 5 }}>{strings.key}</span>}
                  </td>
                  <td className="c-rc" data-l={strings.source}>
                    <div className="src">{g.row.sources.map(srcLine)}</div>
                    {g.row.note && <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--ink-soft)' }}>{g.row.note}</div>}
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
