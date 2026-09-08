'use client';
import { useEffect, useMemo, useState } from 'react';
import Combobox from './Combobox';
import { buildIndex, expandOne } from '@/lib/recipe';

/* row indices: 0 id 1 family 2 secondary 3 rank 4 lv 5 slot 6 en 7 cn 8 th 9 statsRaw 10 recipeEn 11 recipeTh 12 conf */

export default function Simulator({ rows, mats, labels, strings, lang }) {
  const idx = useMemo(() => buildIndex(rows, mats), [rows, mats]);
  const [targetId, setTargetId] = useState('');
  // choices: path -> { alt: n, opt: { [ingredientIndex]: n } } ; open: path -> bool
  const [choice, setChoice] = useState({});
  const [open, setOpen] = useState({});

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('item')) setTargetId(p.get('item'));
    } catch {}
  }, []);

  const options = useMemo(
    () =>
      rows
        .filter((r) => r[5] !== 'material' || r[1] === 'Star')
        .map((r) => ({
          key: r[0],
          label: `${lang === 'th' ? r[8] || r[6] : r[6]}  ·  r${r[3]}`,
          alt: `${r[7]} ${r[6]} ${r[8] || ''} ${labels.family[r[1]]?.label || ''} ${labels.slot[r[5]]?.label || ''}`,
        })),
    [rows, lang, labels],
  );

  const rootRow = rows.find((r) => r[0] === targetId);
  const rootNode = rootRow ? { kind: 'item', row: rootRow, family: rootRow[1], rank: rootRow[3], en: rootRow[6], cn: rootRow[7], th: rootRow[8] } : null;

  const name = (n) => (lang === 'th' ? n.th || n.en : n.en) || n.en;
  const fam = (k) => labels.family[k]?.label || k;

  const pickTarget = (id) => { setTargetId(id); setChoice({}); setOpen({ root: true }); };

  /* ---------- tree rendering ---------- */
  const renderNode = (node, path, depth) => {
    if (!node) return null;
    if (node.kind === 'item') return renderItem(node, path, depth);
    if (node.kind === 'family') return renderFamily(node, path, depth);
    if (node.kind === 'material') {
      return (
        <div className="sim-leaf">
          <span className="sim-kind k-mat">{strings.material}</span>
          <b>{name(node.mat.name)}</b> <span className="sim-dim">r{node.rank} · {fam(node.family)}</span>
          {node.mat.src && <div className="sim-src">{node.mat.src}{node.mat.buyableNow ? ` — ${strings.buyableNow}` : ''}</div>}
        </div>
      );
    }
    if (node.kind === 'book') return <div className="sim-leaf"><span className="sim-kind k-book">{strings.book}</span><b>{node.vol ? `Vol.${node.vol}` : strings.anyBook}</b> <span className="sim-dim">{strings.bookNote}</span></div>;
    if (node.kind === 'shop') {
      const nt = node.town.toLowerCase();
      const t = Object.values(labels.town).find((x) => x.label.toLowerCase() === nt || (x.en || '').toLowerCase().startsWith(nt) || x.cn === node.town || nt.startsWith((x.en || '').toLowerCase().split(' ')[0]));
      return <div className="sim-leaf"><span className="sim-kind k-shop">{strings.shop}</span><b>{t ? t.label : node.town}</b>{t && <span className={`badge ${t.status === 'open' ? 'b-open' : 'b-closed'}`} style={{ marginLeft: 6 }}>{t.status === 'open' ? strings.open : strings.closed}</span>}</div>;
    }
    return <div className="sim-leaf"><span className="sim-kind k-text">·</span>{node.en}</div>;
  };

  const renderFamily = (node, path, depth) => {
    const c = choice[path] || {};
    const cands = node.candidates || [];
    const sel = c.cand != null ? cands[c.cand] : null;
    return (
      <div className="sim-leaf">
        <span className="sim-kind k-fam">{strings.anyOf}</span>
        <b>{fam(node.family)} r{node.rank}</b>
        <span className="sim-dim"> — {strings.familyHelp}</span>
        {cands.length > 0 ? (
          <div className="sim-cands">
            {cands.slice(0, 12).map((cn, i) => (
              <button
                key={i}
                type="button"
                className={`chip${sel === cn ? ' on' : ''}`}
                onClick={() => setChoice((s) => ({ ...s, [path]: { ...c, cand: sel === cn ? null : i } }))}
              >
                {cn.kind === 'item' ? name({ en: cn.en, th: cn.th }) : name(cn.mat.name)}
                {cn.kind === 'material' && cn.mat.buyableNow ? ' ✓' : ''}
              </button>
            ))}
            {cands.length > 12 && <span className="sim-dim">+{cands.length - 12}</span>}
          </div>
        ) : (
          <div className="sim-src">{strings.noCandidates}</div>
        )}
        {sel && <div className="sim-sub">{renderNode(sel, `${path}/c`, depth + 1)}</div>}
      </div>
    );
  };

  const renderItem = (node, path, depth) => {
    const isOpen = !!open[path];
    const ex = isOpen ? expandOne(node, idx) : node;
    const c = choice[path] || {};
    const altI = c.alt || 0;
    const alts = ex.alts || [];
    const alt = alts[altI];
    const r = node.row;
    return (
      <div className={`sim-item${depth === 0 ? ' root' : ''}`}>
        <div className="sim-head">
          <button type="button" className="sim-toggle" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [path]: !isOpen }))} disabled={!r[10] || r[10] === '—'}>
            {isOpen ? '▾' : '▸'}
          </button>
          <span className="rank">{r[3]}</span>
          <span className="sim-name">
            <b>{name({ en: r[6], th: r[8] })}</b>
            <span className="nm-alt">{r[7]}{lang === 'th' && r[8] ? ` · ${r[6]}` : ''}</span>
          </span>
          <span className="slot-pill">{labels.slot[r[5]]?.label}</span>
          <span className="fm"><b>{fam(r[1])}</b>{r[2].length ? ' · ' + r[2].map(fam).join(' · ') : ''}</span>
          <span className="st">{r[9]}</span>
          {node.fuzzy && <span className="badge b-legacy" title={node.matchedFrom}>≈</span>}
        </div>
        {isOpen && (
          <div className="sim-body">
            {alts.length === 0 && <div className="sim-src">{r[10] || strings.noRecipe}</div>}
            {alts.length > 1 && (
              <div className="seg sim-alts" role="group">
                {alts.map((_, i) => (
                  <button key={i} type="button" aria-pressed={i === altI} onClick={() => setChoice((s) => ({ ...s, [path]: { ...c, alt: i, opt: {} } }))}>
                    {strings.route} {i + 1}
                  </button>
                ))}
              </div>
            )}
            {alt && (
              <ol className="sim-ings">
                {alt.ingredients.map((ing, ii) => {
                  const oi = (c.opt && c.opt[ii]) || 0;
                  const opt = ing.options[oi] || ing.options[0];
                  const childPath = `${path}/a${altI}/i${ii}/o${oi}`;
                  return (
                    <li key={ii} className="sim-ing">
                      <span className="sim-slot">{ii === 0 ? strings.primarySlot : `${strings.slotN} ${ii + 1}`}</span>
                      {ing.options.length > 1 && (
                        <div className="sim-opts">
                          {ing.options.map((o, k) => (
                            <button key={k} type="button" className={`chip${k === oi ? ' on' : ''}`} onClick={() => setChoice((s) => ({ ...s, [path]: { ...c, opt: { ...(c.opt || {}), [ii]: k } } }))}>
                              {o.text}
                            </button>
                          ))}
                        </div>
                      )}
                      {opt.note && <span className="sim-note">({opt.note})</span>}
                      {renderNode(opt.node, childPath, depth + 1)}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ---------- flattened steps (bottom-up) ---------- */
  const steps = useMemo(() => {
    if (!rootNode) return [];
    const out = [];
    const walk = (node, path) => {
      if (!node) return null;
      if (node.kind === 'family') {
        const c = choice[path] || {};
        const sel = c.cand != null ? (node.candidates || [])[c.cand] : null;
        if (sel) return walk(sel, `${path}/c`);
        return `${fam(node.family)} r${node.rank}`;
      }
      if (node.kind === 'material') return `${name(node.mat.name)} (r${node.rank})`;
      if (node.kind === 'book') return node.vol ? `Vol.${node.vol}` : strings.anyBook;
      if (node.kind === 'shop') return `${strings.shop}: ${node.town}`;
      if (node.kind === 'text') return node.en;
      // item
      const label = `${name({ en: node.en, th: node.th })} (r${node.rank})`;
      if (!open[path]) return label;
      const ex = expandOne(node, idx);
      const c = choice[path] || {};
      const alt = (ex.alts || [])[c.alt || 0];
      if (!alt) return label;
      const parts = alt.ingredients.map((ing, ii) => {
        const oi = (c.opt && c.opt[ii]) || 0;
        const opt = ing.options[oi] || ing.options[0];
        return walk(opt.node, `${path}/a${c.alt || 0}/i${ii}/o${oi}`);
      });
      out.push({ target: label, parts, rank: node.rank });
      return label;
    };
    walk(rootNode, 'root');
    return out;
  }, [rootNode, choice, open, idx, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="controls" style={{ position: 'static' }}>
        <Combobox value={targetId} onChange={pickTarget} options={options} allLabel={strings.pickTarget} width={420} noAll limit={60} />
        {rootNode && <span className="count">{strings.steps}: {steps.length}</span>}
      </div>

      {!rootNode && <div className="empty">{strings.emptyHint}</div>}

      {rootNode && (
        <div className="sim-grid">
          <section className="sim-tree">{renderItem(rootNode, 'root', 0)}</section>
          <aside className="sim-steps">
            <h3>{strings.stepsTitle}</h3>
            <p className="sim-dim" style={{ marginTop: 0 }}>{strings.stepsHelp}</p>
            <ol>
              {steps.map((s, i) => (
                <li key={i}>
                  <div className="sim-step-parts">{s.parts.join(' + ')}</div>
                  <div className="sim-step-arrow">→ <b>{s.target}</b></div>
                </li>
              ))}
            </ol>
            {steps.length === 0 && <div className="sim-dim">{strings.expandHint}</div>}
          </aside>
        </div>
      )}
    </>
  );
}
