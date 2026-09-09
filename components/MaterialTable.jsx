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
  // This page is the shop index — the 74 materials no shop sells are one toggle away.
  const [shopOnly, setShopOnly] = useState(true);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const L = lo === '' ? 0 : Number(lo);
    const H = hi === '' ? 999 : Number(hi);
    return rows.filter((r) => {
      if (fam && r.family !== fam) return false;
      if (r.rank < L || r.rank > H) return false;
      if (openOnly && !r.buyableNow) return false;
      if (shopOnly && !r.sources.some((x) => x.type === 'shop')) return false;
      if (town && !r.sources.some((s) => s.type === 'shop' && s.town === town)) return false;
      if (term) {
        const towns = r.sources.map((s) => (s.town ? labels.town[s.town]?.label : '') + ' ' + (s.mob || '') + ' ' + (s.where || '') + ' ' + (s.station || '')).join(' ');
        const hay = `${r.name.en} ${r.name.cn} ${r.name.th || ''} ${labels.family[r.family]?.label} ${towns} ${r.note || ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [rows, q, fam, lo, hi, openOnly, shopOnly, town, labels]);

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

  /* One source becomes one line in each of the three source columns. Splitting them into
     real <td>s (rather than one blob per row) is what makes the page read as a table:
     every "Source" pill lines up, every price lines up, and a long mob name can no longer
     shove the price out of alignment. */
  /* Shops only. This is the ร้านค้า page — a Melting Furnace recipe or a monster drop in the
     "sold at" column was noise, and with every row saying ร้านค้า the source column said nothing. */
  const shops = (r) =>
    r.sources
      .filter((s) => s.type === 'shop')
      .map((s) => {
        const t = labels.town[s.town];
        return { where: t?.label || s.town, status: t?.status, price: s.price, re: s.priceProvenance === 're-sheet' };
      });

  const statusLabel = (st) =>
    st === 'open' ? strings.open : st === 'closed' ? strings.closed : st === 'not-in-re' ? strings.notInRe : strings.unverified;

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
        <label className="toggle" data-on={shopOnly ? '1' : '0'}>
          <input type="checkbox" checked={shopOnly} onChange={(e) => setShopOnly(e.target.checked)} />
          {strings.shopOnly}
        </label>
        <label className="toggle" data-on={openOnly ? '1' : '0'} title={strings.openOnlyHelp}>
          <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
          {strings.openOnly}
        </label>
        {(q || fam || town || lo || hi || openOnly || !shopOnly) && (
          <button type="button" className="toggle" onClick={() => { setQ(''); setFam(''); setTown(''); setLo(''); setHi(''); setOpenOnly(false); setShopOnly(true); }}>
            {strings.reset}
          </button>
        )}
        <span className="count">{fmt(strings.showing, filtered.length, rows.length)}</span>
      </div>

      <div className="scroll">
        <table className="t-materials">
          <thead>
            <tr>
              <th className="th-num" style={{ width: 96 }}>{strings.rank}</th>
              <th style={{ width: 360 }}>{strings.item}</th>
              <th style={{ minWidth: 300 }}>{strings.where}</th>
              <th style={{ width: 128, textAlign: 'right' }}>{strings.price}</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((g, i) =>
              g.group ? (
                <tr className="group" key={`g-${i}`}>
                  <td colSpan={4}>{g.group}</td>
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
                    {g.row.note && <div className="mnote">{g.row.note}</div>}
                  </td>
                  <td className="c-where" data-l={strings.where}>
                    {shops(g.row).length === 0 ? (
                      <span className="sl sl-where dim">{strings.noShop}</span>
                    ) : (
                      shops(g.row).map((p, k) => (
                        <span className="sl sl-where" key={k} title={p.where}>
                          {p.where}
                          <span className={`badge ${STATUS_CLASS[p.status] || 'b-unknown'}`} style={{ marginLeft: 7 }}>
                            {statusLabel(p.status)}
                          </span>
                        </span>
                      ))
                    )}
                  </td>
                  <td className="c-price" data-l={strings.price}>
                    {shops(g.row).map((p, k) => (
                      <span className="sl sl-price" key={k} title={p.price == null ? undefined : p.re ? strings.priceRe : strings.priceLegacy}>
                        {p.price == null ? '' : p.re ? `${p.price}g` : <><span>{p.price}g</span><span className="legacy">*</span></>}
                      </span>
                    ))}
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
