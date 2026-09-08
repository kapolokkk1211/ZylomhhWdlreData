'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Combobox from './Combobox';
import { buildIndex, parseRecipe, resolve } from '@/lib/recipe';
import { readBasket, writeBasket, subscribeBasket } from '@/lib/basket';

/* compact row indices: 0 id 1 family 2 secondary 3 rank 4 lv 5 slot 6 en 7 cn 8 th 9 statsRaw */

const MAX_DEPTH = 20;
const NODE_W = 176, NODE_H = 96, GAP_X = 16, GAP_Y = 44; // on-screen slot
const BOX_H = 60; // drawn box height in the PNG
const ZMIN = 0.3, ZMAX = 2.5;
const STORE = 'stardrift.plan.v1';

let seq = 1;
const nid = () => `n${Date.now().toString(36)}${(seq++).toString(36)}`;

export default function Simulator({ rows, mats, labels, strings, lang }) {
  const idx = useMemo(() => buildIndex(rows, mats), [rows, mats]);
  const byId = useMemo(() => new Map(rows.map((r) => [r[0], r])), [rows]);
  const [tree, setTree] = useState(null); // { id, itemId?, text?, note, children[] }
  const [adding, setAdding] = useState(null); // node id currently getting a child
  const [addText, setAddText] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [editNote, setEditNote] = useState(null);
  const [selected, setSelected] = useState(null); // node id the shortlist adds under
  const [basket, setBasket] = useState([]);
  useEffect(() => { setBasket(readBasket()); return subscribeBasket(setBasket); }, []);
  const viewRef = useRef(null);

  // restore
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (p.get('item') && byId.has(p.get('item'))) { setTree(mkItem(p.get('item'))); setHydrated(true); return; }
      const raw = localStorage.getItem(STORE);
      if (raw) setTree(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, [byId]);
  useEffect(() => {
    if (!hydrated) return;
    try { tree ? localStorage.setItem(STORE, JSON.stringify(tree)) : localStorage.removeItem(STORE); } catch {}
  }, [tree, hydrated]);

  // Wheel = zoom around the cursor. Non-passive so we can stop the page from scrolling.
  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left + el.scrollLeft, my = e.clientY - rect.top + el.scrollTop;
      setZoom((z) => {
        const nz = Math.min(ZMAX, Math.max(ZMIN, z * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
        const k = nz / z;
        requestAnimationFrame(() => { el.scrollLeft = mx * k - (e.clientX - rect.left); el.scrollTop = my * k - (e.clientY - rect.top); });
        return nz;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [tree]);

  const fitZoom = () => {
    const el = viewRef.current; if (!el || !layout) return;
    const z = Math.min(ZMAX, Math.max(ZMIN, Math.min((el.clientWidth - 40) / layout.w, (el.clientHeight - 40) / layout.h)));
    setZoom(z); el.scrollLeft = 0; el.scrollTop = 0;
  };

  const options = useMemo(
    () =>
      rows.map((r) => ({
        key: r[0],
        label: `${lang === 'th' ? r[8] || r[6] : r[6]}  ·  r${r[3]}`,
        alt: `${r[7]} ${r[6]} ${r[8] || ''} ${labels.family[r[1]]?.label || ''} ${labels.slot[r[5]]?.label || ''}`,
      })),
    [rows, lang, labels],
  );
  const allOptions = options; // rows already include the material index
  const matById = useMemo(() => new Map(mats.map((m) => [m.id, m])), [mats]);

  function mkItem(itemId) { return { id: nid(), itemId, note: '', children: [] }; }
  function mkMat(matId) { return { id: nid(), matId, note: '', children: [] }; }
  function mkText(text) { return { id: nid(), text, note: '', children: [] }; }

  const info = (n) => {
    if (n.itemId) {
      const r = byId.get(n.itemId);
      if (r) return { name: lang === 'th' ? r[8] || r[6] : r[6], alt: [r[7], lang === 'th' ? r[6] : r[8]].filter(Boolean).join(' · '), rank: r[3], stats: r[9] && r[9] !== '—' ? r[9] : (lang === 'th' ? r[11] : r[10]) || '', family: labels.family[r[1]]?.label, kind: r[0].startsWith('mat:') ? 'mat' : 'item' };
    }
    if (n.matId) {
      const m = matById.get(n.matId);
      if (m) return { name: lang === 'th' ? m.name.th || m.name.en : m.name.en, alt: m.name.cn, rank: m.rank, stats: m.src || '', family: labels.family[m.family]?.label, kind: 'mat', buyable: m.buyableNow };
    }
    return { name: n.text || '?', alt: '', rank: null, stats: '', family: '', kind: 'text' };
  };

  /* ---- tree ops (immutable) ---- */
  const update = (id, fn) => {
    const walk = (n) => (n.id === id ? fn(n) : { ...n, children: n.children.map(walk) });
    setTree((t) => (t ? walk(t) : t));
  };
  const remove = (id) => {
    if (selected === id) setSelected(null);
    if (tree && tree.id === id) { setTree(null); return; }
    const walk = (n) => ({ ...n, children: n.children.filter((c) => c.id !== id).map(walk) });
    setTree((t) => (t ? walk(t) : t));
  };
  const depthOf = (id) => {
    const find = (n, d) => (n.id === id ? d : n.children.map((c) => find(c, d + 1)).find((x) => x != null));
    return tree ? find(tree, 0) : 0;
  };
  const addChild = (parentId, child) => {
    if (depthOf(parentId) >= MAX_DEPTH - 1) return;
    update(parentId, (n) => ({ ...n, children: [...n.children, child] }));
    setAdding(null); setAddText('');
  };
  const startTree = (itemId) => { const n = mkItem(itemId); setTree(n); setSelected(n.id); };
  const findNode = (id) => { const f = (n) => (n.id === id ? n : n.children.map(f).find(Boolean)); return tree ? f(tree) : null; };
  const selectedNode = selected ? findNode(selected) : null;
  const loadRecipe = (n) => {
    const r = byId.get(n.itemId); if (!r) return;
    const alts = parseRecipe(r[10]); if (!alts.length) return;
    const kids = alts[0].ingredients.map((ing) => {
      const opt = ing.options[0]; const node = resolve(opt.text, idx);
      if (node.kind === 'item') return mkItem(node.row[0]);
      if (node.kind === 'material') return byId.has(`mat:${node.mat.id}`) ? mkItem(`mat:${node.mat.id}`) : mkMat(node.mat.id);
      if (node.kind === 'book') return mkText(node.vol ? `${strings.book} Vol.${node.vol}` : strings.anyBook);
      if (node.kind === 'shop') return mkText(`${strings.shop}: ${node.town}`);
      return mkText(node.kind === 'family' ? `${labels.family[node.family]?.label || node.family} r${node.rank}` : node.en || opt.text);
    });
    if (depthOf(n.id) >= MAX_DEPTH - 1) return;
    update(n.id, (x) => ({ ...x, children: [...x.children, ...kids] }));
  };

  /* ---- layout: leaf-slot tidy tree, root on top ---- */
  const layout = useMemo(() => {
    if (!tree) return null;
    const nodes = [];
    let leafCursor = 0;
    const place = (n, depth) => {
      let x;
      if (!n.children.length) { x = leafCursor * (NODE_W + GAP_X); leafCursor++; }
      else {
        const xs = n.children.map((c) => place(c, depth + 1));
        x = (Math.min(...xs) + Math.max(...xs)) / 2;
      }
      nodes.push({ n, x, y: depth * (NODE_H + GAP_Y), depth });
      return x;
    };
    place(tree, 0);
    const w = Math.max(...nodes.map((p) => p.x)) + NODE_W;
    const h = Math.max(...nodes.map((p) => p.y)) + NODE_H;
    const pos = new Map(nodes.map((p) => [p.n.id, p]));
    const edges = [];
    nodes.forEach((p) => p.n.children.forEach((c) => edges.push([p, pos.get(c.id)])));
    return { nodes, edges, w, h, depth: Math.max(...nodes.map((p) => p.depth)) + 1 };
  }, [tree]);

  /* ---- steps, bottom-up ---- */
  const steps = useMemo(() => {
    if (!tree) return [];
    const out = [];
    const walk = (n) => {
      n.children.forEach(walk);
      if (n.children.length) {
        const i = info(n);
        out.push({ target: `${i.name}${i.rank != null ? ` (r${i.rank})` : ''}`, parts: n.children.map((c) => { const ci = info(c); return `${ci.name}${ci.rank != null ? ` (r${ci.rank})` : ''}${c.note ? ` [${c.note}]` : ''}`; }), note: n.note });
      }
    };
    walk(tree);
    return out;
  }, [tree, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- PNG export ---- */
  const exportPng = async () => {
    if (!layout) return;
    try { await document.fonts.ready; } catch {}
    const pad = 32, lineH = 22;
    const stepsH = 40 + steps.length * lineH * 2 + 10;
    const treeH = layout.h * 0.8; const W = layout.w + pad * 2, H = treeH + pad * 2 + stepsH + 30;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cv = document.createElement('canvas');
    cv.width = W * dpr; cv.height = H * dpr;
    const c = cv.getContext('2d'); c.scale(dpr, dpr);
    const F = "'IBM Plex Sans Thai', 'Public Sans', system-ui, sans-serif";
    const M = "'IBM Plex Mono', ui-monospace, monospace";
    c.fillStyle = '#f3f8f3'; c.fillRect(0, 0, W, H);
    // title
    c.fillStyle = '#12231a'; c.font = `700 18px ${F}`;
    c.fillText(`${strings.title} — ${info(tree).name}`, pad, 22);
    c.font = `12px ${M}`; c.fillStyle = '#64796b';
    c.fillText(`zylomhh-wdlre-data.vercel.app · ${new Date().toISOString().slice(0, 10)}`, pad, 40);
    const oy = 56;
    // edges
    c.strokeStyle = '#8fb59c'; c.lineWidth = 1.5;
    layout.edges.forEach(([a, b]) => {
      const x1 = pad + a.x + NODE_W / 2, y1 = oy + pad + a.y * 0.8 + BOX_H, x2 = pad + b.x + NODE_W / 2, y2 = oy + pad + b.y * 0.8;
      c.beginPath(); c.moveTo(x1, y1); c.bezierCurveTo(x1, y1 + GAP_Y / 2, x2, y2 - GAP_Y / 2, x2, y2); c.stroke();
    });
    // nodes
    layout.nodes.forEach((p) => {
      const i = info(p.n); const x = pad + p.x, y = oy + pad + p.y * 0.8;
      c.fillStyle = '#ffffff'; c.strokeStyle = p.depth === 0 ? '#1f7a43' : '#c9dfcf'; c.lineWidth = p.depth === 0 ? 2 : 1;
      rr(c, x, y, NODE_W, BOX_H, 9); c.fill(); c.stroke();
      c.fillStyle = '#12231a'; c.font = `600 13px ${F}`; ellipsis(c, i.name, x + 10, y + 21, NODE_W - 20);
      c.fillStyle = '#3a5243'; c.font = `11px ${M}`; ellipsis(c, `${i.rank != null ? `r${i.rank}` : ''}${i.rank != null && i.family ? ' · ' : ''}${i.family || ''}`, x + 10, y + 38, NODE_W - 20);
      if (p.n.note) { c.fillStyle = '#a8461f'; c.font = `italic 11px ${F}`; ellipsis(c, p.n.note, x + 10, y + 53, NODE_W - 20); }
    });
    // steps
    let sy = oy + pad + treeH + 34;
    c.fillStyle = '#12231a'; c.font = `700 14px ${F}`; c.fillText(strings.stepsTitle, pad, sy); sy += 8;
    steps.forEach((s, k) => {
      sy += lineH; c.fillStyle = '#3a5243'; c.font = `12px ${M}`; c.fillText(`${k + 1}.  ${s.parts.join('  +  ')}`, pad, sy);
      sy += lineH - 4; c.fillStyle = '#12231a'; c.font = `600 13px ${F}`; c.fillText(`      → ${s.target}${s.note ? `   (${s.note})` : ''}`, pad, sy);
    });
    const a = document.createElement('a');
    a.download = `stardrift-${(info(tree).name || 'plan').replace(/[^\p{L}\p{N}]+/gu, '-')}.png`;
    a.href = cv.toDataURL('image/png');
    a.click();
  };

  /* ---- shortlist panel ---- */
  const basketRows = basket.map((id) => byId.get(id)).filter(Boolean);
  const basketPanel = (
    <div className="sim-basket">
      <h3>★ {strings.basketTitle} <span className="sim-dim">({basketRows.length})</span></h3>
      <p className="sim-dim" style={{ marginTop: 0 }}>{strings.basketHelp}</p>
      {tree && (
        <div className="sim-selinfo">
          {strings.selected}: {selectedNode ? <b>{info(selectedNode).name}</b> : <span className="sim-dim">{strings.basketNoSel}</span>}
        </div>
      )}
      {basketRows.length === 0 && <div className="sim-dim">{strings.basketEmpty}</div>}
      <ul className="sim-basket-list">
        {basketRows.map((r) => (
          <li key={r[0]}>
            <div className="sim-basket-name">
              <b>{lang === 'th' ? r[8] || r[6] : r[6]}</b>
              <span className="sim-dim"> r{r[3]} · {labels.family[r[1]]?.label}</span>
            </div>
            <div className="sim-basket-actions">
              {!tree ? (
                <button type="button" className="chip on" onClick={() => startTree(r[0])}>{strings.basketAsRoot}</button>
              ) : (
                <button type="button" className="chip on" disabled={!selectedNode} title={selectedNode ? `${strings.basketAddUnder} ${info(selectedNode).name}` : strings.basketNoSel} onClick={() => selectedNode && addChild(selectedNode.id, mkItem(r[0]))}>
                  ＋ {strings.basketAddUnder}
                </button>
              )}
              <button type="button" className="chip" title={strings.remove} onClick={() => writeBasket(basket.filter((x) => x !== r[0]))}>✕</button>
            </div>
          </li>
        ))}
      </ul>
      {basketRows.length > 0 && <button type="button" className="chip" style={{ marginTop: 8 }} onClick={() => writeBasket([])}>{strings.basketClear}</button>}
    </div>
  );

  /* ---- render ---- */
  const renderAdd = (n) => (
    <div className="sim-add" onMouseDown={(e) => e.stopPropagation()}>
      <Combobox value="" onChange={(k) => { if (!k) return; k.startsWith('m:') ? addChild(n.id, mkMat(k.slice(2))) : addChild(n.id, mkItem(k)); }} options={allOptions} allLabel={strings.pickAny} width={260} noAll limit={40} />
      <span className="sim-dim">{strings.or}</span>
      <input type="text" className="sim-free" value={addText} placeholder={strings.freeText} onChange={(e) => setAddText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && addText.trim()) addChild(n.id, mkText(addText.trim())); if (e.key === 'Escape') setAdding(null); }} />
      <button type="button" className="chip" onClick={() => addText.trim() && addChild(n.id, mkText(addText.trim()))}>＋</button>
      <button type="button" className="chip" onClick={() => setAdding(null)}>✕</button>
    </div>
  );

  return (
    <>
      <div className="controls" style={{ position: 'static' }}>
        {!tree ? (
          <Combobox value="" onChange={(k) => k && startTree(k)} options={options} allLabel={strings.pickTarget} width={420} noAll limit={60} />
        ) : (
          <>
            <button type="button" className="toggle" data-on="1" onClick={exportPng}>⤓ {strings.savePng}</button>
            <button type="button" className="toggle" onClick={() => { if (confirm(strings.confirmNew)) setTree(null); }}>{strings.newPlan}</button>
            <span className="count">{strings.steps}: {steps.length} · {strings.depth}: {layout?.depth}/{MAX_DEPTH}</span>
          </>
        )}
      </div>

      {!tree && (
        <div className="sim-grid">
          <div className="empty">{strings.emptyHint}</div>
          {basketPanel}
        </div>
      )}

      {tree && layout && (
        <div className="sim-grid">
          <section className="sim-view-wrap">
            <div className="sim-zoom">
              <button type="button" onClick={() => setZoom((z) => Math.max(ZMIN, z / 1.2))} aria-label="−">−</button>
              <button type="button" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
              <button type="button" onClick={() => setZoom((z) => Math.min(ZMAX, z * 1.2))} aria-label="+">+</button>
              <button type="button" onClick={fitZoom}>{strings.fit}</button>
              <span className="sim-dim">{strings.zoomHint}</span>
            </div>
            <div className="sim-view" ref={viewRef}>
              <div style={{ width: layout.w * zoom + 48, height: layout.h * zoom + 48 }}>
                <div className="sim-canvas" style={{ width: layout.w, height: layout.h, transform: `scale(${zoom})`, transformOrigin: '0 0', margin: 24 }}>
                  <svg className="sim-edges" width={layout.w} height={layout.h} aria-hidden>
                    {layout.edges.map(([a, b], i) => {
                      const x1 = a.x + NODE_W / 2, y1 = a.y + NODE_H, x2 = b.x + NODE_W / 2, y2 = b.y;
                      return <path key={i} d={`M${x1},${y1} C${x1},${y1 + GAP_Y / 2} ${x2},${y2 - GAP_Y / 2} ${x2},${y2}`} />;
                    })}
                  </svg>
                  {layout.nodes.map((p) => {
                    const i = info(p.n);
                    return (
                      <div key={p.n.id} className={`sim-node k-${i.kind}${p.depth === 0 ? ' root' : ''}${selected === p.n.id ? ' sel' : ''}`} style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H }} onClick={() => setSelected(p.n.id)}>
                        <div className="sim-node-name" title={`${i.alt}${i.stats ? ` · ${i.stats}` : ''}`}>{i.name}</div>
                        <div className="sim-node-meta">{i.rank != null ? `r${i.rank}` : ''}{i.rank != null && i.family ? ' · ' : ''}{i.family}</div>
                        {editNote === p.n.id ? (
                          <input className="sim-node-note" autoFocus value={p.n.note} placeholder={strings.notePh} onChange={(e) => update(p.n.id, (x) => ({ ...x, note: e.target.value }))} onBlur={() => setEditNote(null)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditNote(null); }} />
                        ) : (
                          p.n.note ? <div className="sim-node-notetext" onClick={() => setEditNote(p.n.id)}>{p.n.note}</div> : null
                        )}
                        <div className="sim-node-actions">
                          <button type="button" title={strings.addChild} onClick={() => { setAdding(adding === p.n.id ? null : p.n.id); setAddText(''); }} disabled={p.depth >= MAX_DEPTH - 1}>＋</button>
                          {i.kind === 'item' && <button type="button" title={strings.loadRecipe} onClick={() => loadRecipe(p.n)}>⇣</button>}
                          <button type="button" title={strings.notePh} onClick={() => setEditNote(editNote === p.n.id ? null : p.n.id)}>✎</button>
                          <button type="button" title={strings.remove} onClick={() => remove(p.n.id)}>✕</button>
                        </div>
                        {adding === p.n.id && renderAdd(p.n)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <aside className="sim-side">
          {basketPanel}
          <div className="sim-steps">
            <h3>{strings.stepsTitle}</h3>
            <p className="sim-dim" style={{ marginTop: 0 }}>{strings.stepsHelp}</p>
            <ol>
              {steps.map((s, i) => (
                <li key={i}>
                  <div className="sim-step-parts">{s.parts.join(' + ')}</div>
                  <div className="sim-step-arrow">→ <b>{s.target}</b>{s.note ? <span className="sim-dim"> ({s.note})</span> : null}</div>
                </li>
              ))}
            </ol>
            {steps.length === 0 && <div className="sim-dim">{strings.expandHint}</div>}
          </div>
          </aside>
        </div>
      )}

    </>
  );
}

function rr(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function ellipsis(c, text, x, y, maxW) {
  let t = String(text || '');
  if (c.measureText(t).width <= maxW) { c.fillText(t, x, y); return; }
  while (t.length > 1 && c.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  c.fillText(t + '…', x, y);
}
