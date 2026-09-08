'use client';
import { useMemo, useState } from 'react';
import Combobox from './Combobox';

const fmt = (tpl, v) => Object.entries(v).reduce((s, [k, x]) => s.replace(`{${k}}`, x), String(tpl));

const CONF_CLASS = {
  'KK-tested': 'b-kk',
  'RE-verified': 'b-verified',
  'RE-reported': 'b-reported',
  LEGACY: 'b-legacy',
  INFER: 'b-infer',
};
const RE_CONFIRMED = new Set(['KK-tested', 'RE-verified', 'RE-reported']);

// Three threads on one row would otherwise render as three identical chips.
const numberKinds = (sources) => {
  const total = {};
  sources.forEach((s) => { total[s.kind] = (total[s.kind] || 0) + 1; });
  const seen = {};
  return sources.map((s) => {
    seen[s.kind] = (seen[s.kind] || 0) + 1;
    return total[s.kind] > 1 ? { ...s, n: seen[s.kind] } : s;
  });
};

export default function QuestTable({ rows, labels, strings, options, lang }) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [reOnly, setReOnly] = useState(false);
  const [open, setOpen] = useState(null); // detail cell opened by tap — mobile has no hover

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (type && r.type !== type) return false;
      if (reOnly && !RE_CONFIRMED.has(r.confidence)) return false;
      if (term) {
        const hay = `${r.name} ${r.alt} ${r.region} ${r.regionCn} ${r.npc} ${r.req} ${r.reward} ${r.detail} ${
          labels.questType[r.type]?.label || ''
        }`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [rows, q, type, reOnly, labels]);

  // Grouped by quest type, in the order codes.json declares them — unless a type is selected,
  // in which case one heading over the whole list is noise.
  const grouped = useMemo(() => {
    const out = [];
    let current = null;
    for (const r of filtered) {
      if (!type && r.type !== current) {
        current = r.type;
        out.push({ group: r.type });
      }
      out.push({ row: r });
    }
    return out;
  }, [filtered, type]);

  const reCount = useMemo(() => filtered.filter((r) => RE_CONFIRMED.has(r.confidence)).length, [filtered]);
  const anyFilter = q || type || reOnly;
  const detailOf = (r) => [r.detail, r.note].filter(Boolean).join('\n');
  const isLong = (r) => detailOf(r).length > 58;

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
        <Combobox value={type} onChange={setType} options={options.types} allLabel={strings.allTypes} width={210} />

        <label className="toggle" data-on={reOnly ? '1' : '0'}>
          <input type="checkbox" checked={reOnly} onChange={(e) => setReOnly(e.target.checked)} />
          {strings.reOnly}
        </label>

        {anyFilter ? (
          <button type="button" className="toggle" onClick={() => { setQ(''); setType(''); setReOnly(false); }}>
            {strings.reset}
          </button>
        ) : null}

        <span className="count">{fmt(strings.counts, { n: filtered.length, total: rows.length, re: reCount })}</span>
      </div>

      <div className="scroll">
        <table className="qtable">
          <thead>
            <tr>
              <th style={{ width: 140 }}>{strings.type}</th>
              <th style={{ minWidth: 260 }}>{strings.quest}</th>
              <th style={{ width: 56 }}>{strings.lv}</th>
              <th style={{ width: 170 }}>{strings.where}</th>
              <th style={{ width: 200 }}>{strings.req}</th>
              <th style={{ width: 190 }}>{strings.reward}</th>
              <th>{strings.detail}</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((g, i) =>
              g.group ? (
                <tr className="group" key={`g-${g.group}-${i}`}>
                  <td colSpan={7}>
                    {labels.questType[g.group]?.label} {labels.questType[g.group]?.cn}
                  </td>
                </tr>
              ) : (
                <tr key={g.row.id}>
                  <td className="c-qtype">
                    <span className={`qtype q-${g.row.type}`}>{labels.questType[g.row.type]?.label}</span>
                  </td>
                  <td className="c-name">
                    <span className="nm" title={g.row.alt}>{g.row.name}</span>
                    <span className={`badge ${CONF_CLASS[g.row.confidence] || 'b-legacy'}`} title={labels.confidence[g.row.confidence]?.desc}>
                      {labels.confidence[g.row.confidence]?.label}
                    </span>
                    {g.row.sources.length > 0 && (
                      <span className="srcs" aria-label={strings.source}>
                        {numberKinds(g.row.sources).map((s, k) => (
                          <a
                            key={k}
                            className={`src src-${s.kind}`}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={strings.sourceHelp[s.kind]}
                          >
                            {strings.sourceKinds[s.kind] || s.kind}
                            {s.n ? ` ${s.n}` : ''}
                          </a>
                        ))}
                      </span>
                    )}
                  </td>
                  <td className="c-lv" data-l={strings.lv}>
                    <span className="lv">{g.row.lv || '—'}</span>
                  </td>
                  <td className="fm c-where" data-l={strings.where}>
                    {g.row.region || '—'}
                    {g.row.npc && <div className="qnpc">{g.row.npc}</div>}
                  </td>
                  <td className="st c-req" data-l={strings.req}>{g.row.req || '—'}</td>
                  <td className="st c-reward" data-l={strings.reward}>
                    {g.row.reward || '—'}
                    {g.row.stars > 0 && <span className="stars earn">★ {strings.earn} {g.row.stars}</span>}
                    {g.row.starCost > 0 && <span className="stars spend">★ {strings.spend} {g.row.starCost}</span>}
                  </td>
                  <td
                    className={`rc c-rc${open === g.row.id ? ' open' : ''}`}
                    data-l={strings.detail}
                    data-more={isLong(g.row) ? '1' : '0'}
                    title={isLong(g.row) ? detailOf(g.row) : undefined}
                    onClick={() => isLong(g.row) && setOpen((v) => (v === g.row.id ? null : g.row.id))}
                  >
                    <div className="rc-in">
                      {g.row.detail || '—'}
                      {g.row.note && <div className="rc-note">{g.row.note}</div>}
                    </div>
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
