'use client';
import { useMemo, useState } from 'react';

const fmt = (tpl, v) => Object.entries(v).reduce((s, [k, x]) => s.replace(`{${k}}`, x), String(tpl));
const STATS = ['STR', 'CON', 'INT', 'WIS', 'AGI'];

export default function CompanionGuide({ rows, counts, strings, lang }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null); // the spotlight row, opened by clicking a name

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      `${r.name} ${r.alt} ${r.rebirthSkill || ''} ${r.rebirthSkillName || ''} ${r.exclusive?.name || ''} ${
        r.exclusive?.cn || ''
      } ${r.rebirthExclusive?.name || ''} ${r.rebirthExclusive?.cn || ''} ${
        strings.slots[r.exclusive?.slot] || ''
      } ${strings.slots[r.rebirthExclusive?.slot] || ''}`
        .toLowerCase()
        .includes(term),
    );
  }, [rows, q, strings]);

  const floors = rows.filter((r) => r.floors);
  const group = (src) => filtered.filter((r) => r.source === src);

  const typeLabel = (r) =>
    `${strings.types[r.type] || r.type} / ${strings.forms[r.form] || r.form}`;

  /* Slot is the thing KK asked for: which equipment slot the exclusive item goes in.
     28 of the 49 items have a slot stated by a source; the other 21 are inferred from the
     compendium's convention that an untagged exclusive is a weapon, so they say so out loud
     rather than pretending to the same certainty. */
  const gearCell = (g) => {
    if (!g) return '—';
    const slot = g.slot ? strings.slots[g.slot] || g.slot : null;
    return (
      <>
        <b className="gear-name">{g.name}</b>
        {g.name !== g.cn && <span className="cn"> {g.cn}</span>}
        <span className="gear-stats">{g.stats}</span>
        {slot && (
          <span className="gear-slot" title={g.slotConfirmed ? strings.slotConfirmedHelp : strings.slotInferredHelp}>
            {slot}
            {!g.slotConfirmed && <i className="slot-inf">{strings.slotInferred}</i>}
          </span>
        )}
        {g.slotNote && (
          <span className="gear-note" title={g.slotNote}>
            ⚠ {strings.slotConflict}
          </span>
        )}
      </>
    );
  };

  const table = (src, heading) => {
    const list = group(src);
    if (!list.length) return null;
    return (
      <>
        <h2 className="cg-h2">{heading}</h2>
        <div className="scroll">
          <table className="cgtable">
            <thead>
              <tr>
                <th style={{ minWidth: 190 }}>{strings.companion}</th>
                <th style={{ width: 130 }}>{strings.kind}</th>
                <th className="th-num" style={{ width: 78 }}>{strings.pts}</th>
                <th style={{ minWidth: 190 }}>{strings.exclusive}</th>
                <th style={{ minWidth: 200 }}>{strings.rebirthExclusive}</th>
                <th style={{ width: 168 }}>{strings.rebirthSkill}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td className="c-name">
                    <button
                      type="button"
                      className={`cg-name${r.extra ? ' has-more' : ''}`}
                      onClick={() => r.extra && setOpen(open === r.id ? null : r.id)}
                      title={r.alt}
                    >
                      <span className="nm">{r.name}</span>
                      <span className={`dot-th${r.thConfirmed ? ' ok' : ''}`} />
                      <span className="cn"> {r.cn}</span>
                      {r.extra && <span className="cg-more">{open === r.id ? '−' : '+'}</span>}
                    </button>
                    {r.note && <div className="mnote">{r.note}</div>}
                  </td>
                  <td className="fm c-kind" data-l={strings.kind}>{typeLabel(r)}</td>
                  <td className="c-lv c-pts" data-l={strings.pts}><span className="lv">{r.pts ?? '—'}</span></td>
                  <td className="gear c-gear" data-l={strings.exclusive}>{gearCell(r.exclusive)}</td>
                  <td className="gear reborn c-gear" data-l={strings.rebirthExclusive}>{gearCell(r.rebirthExclusive)}</td>
                  <td className="fm c-skill" data-l={strings.rebirthSkill}>
                    {r.rebirthSkillName ? (
                      <>
                        <b className="gear-name">{r.rebirthSkillName}</b>
                        <span className="cn"> {r.rebirthSkill}</span>
                      </>
                    ) : (
                      <span className="cn">{r.rebirthSkill || '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.filter((r) => r.extra && open === r.id).map((r) => (
          <div className="cg-spot" key={`s-${r.id}`}>
            <h3>{strings.spotlight} · {r.name} <span className="cn">{r.cn}</span></h3>
            <p className="cg-meta">
              {r.extra.element[lang] || r.extra.element.en} <span className="cn">{r.extra.element.cn}</span>
              {' · '}{r.extra.star.cn} — {r.extra.star[lang] || r.extra.star.en}
            </p>
            <p>{r.extra.story[lang] || r.extra.story.en}</p>
            <p className="cg-base">Lv1 — {r.extra.base}</p>
            <h4>{strings.skills}</h4>
            <ul className="cg-list">
              {r.extra.skills.map((k) => (
                <li key={k.cn}>
                  <b>{k[lang] || k.en}</b> <span className="cn">{k.cn}</span>
                  <span className="cg-dim"> · {strings.maxLv} {k.max}</span>
                  <div className="cg-dim">{k.eff[lang] || k.eff.en}</div>
                </li>
              ))}
            </ul>
            <h4>{strings.otherGear}</h4>
            <ul className="cg-list">
              {r.extra.gear.map((g) => (
                <li key={g.cn}>
                  <b>{g[lang] || g.en}</b> <span className="cn">{g.cn}</span>
                  <span className="cg-dim"> · {g.stats}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </>
    );
  };

  return (
    <>
      <div className="controls">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={strings.companion} aria-label={strings.companion} />
        <span className="count">{fmt(strings.counts, { n: counts.total, quest: counts.quest, mall: counts.mall })}</span>
      </div>

      <div className="cg-prose">
        <h2 className="cg-h2">{strings.howTitle}</h2>
        <ol className="cg-list">{strings.howReq.map((x, i) => <li key={i}>{x}</li>)}</ol>
        <p>{strings.howPill}</p>
        <div className="note warn">{strings.howUnknown}</div>

        <h2 className="cg-h2">{strings.gainTitle}</h2>
        <ul className="cg-list">{strings.gain.map((x, i) => <li key={i}>{x}</li>)}</ul>

        <h2 className="cg-h2 danger">⚠ {strings.floorTitle}</h2>
        <p>{strings.floorIntro}</p>
        <p className="cg-rule up">{strings.floorRuleUp}</p>
        <p className="cg-rule down">{strings.floorRuleDown}</p>
        <p>{strings.floorExample}</p>
        <ul className="cg-list">{strings.floorSafe.map((x, i) => <li key={i}>{x}</li>)}</ul>

        <h3>{strings.floorsHead}</h3>
        <div className="scroll">
          <table className="cgtable floors">
            <thead>
              <tr>
                <th style={{ minWidth: 170 }}>{strings.companion}</th>
                {STATS.map((k) => <th key={k} className="th-num" style={{ width: 72 }}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {floors.map((r) => (
                <tr key={r.id}>
                  <td className="c-name"><span className="nm">{r.name}</span> <span className="cn">{r.cn}</span></td>
                  {STATS.map((k) => (
                    <td key={k} className="c-lv c-floor" data-l={k}><span className="lv">{r.floors[k] ?? '—'}</span></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="cg-dim">{strings.floorPills}</p>

        <h2 className="cg-h2">{strings.gradeTitle}</h2>
        <ul className="cg-list">
          {strings.grades.map(([g, src, note], i) => (
            <li key={i}><b>{g}</b> — {src}{note && note !== '—' ? ` · ${note}` : ''}</li>
          ))}
        </ul>
        <p className="cg-dim">{strings.terminology}</p>
      </div>

      {table('quest', strings.questGroup)}
      {table('mall', strings.mallGroup)}
      <p className="cg-dim">{strings.pattern}</p>
      <p className="cg-dim">{strings.slotLegend}</p>

      <div className="cg-prose">
        <h2 className="cg-h2">{strings.thTitle}</h2>
        <ul className="cg-list">{strings.thStatus.map((x, i) => <li key={i}>{x}</li>)}</ul>
      </div>
    </>
  );
}
