'use client';
import { useMemo, useState } from 'react';

/* A running record, not a guide. The one question a player has each day is "which Core does
   this demon want", so the demon table leads and everything unknown says so out loud rather
   than being left blank and hopeful. */
export default function RecycleMemo({ data, strings, lang }) {
  const [q, setQ] = useState('');
  const pick = (o) => (o ? (lang === 'th' ? o.th || o.en : o.en || o.th) || '' : '');
  const coreOf = (k) => data.cores.find((c) => c.key === k);
  const known = data.demons.filter((d) => d.core).length;

  /* Searching the Core as well as the demon makes the table work backwards too: you craft a
     Core first, so "I have a แกนลม, what does it clear" is the other half of the question. */
  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return data.demons;
    return data.demons.filter((d) => {
      const core = coreOf(d.core);
      return [d.name.th, d.name.en, core?.name.th, core?.name.en, core?.key]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [q, data]);

  return (
    <>
      <p className="rc-quest">
        <span className="rc-qlabel">{strings.questName}</span>
        <b>{pick(data.quest.name)}</b>
      </p>
      <p className="cg-dim rc-intro">{pick(data.intro)}</p>

      <ul className="cg-list rc-facts">
        {data.facts.map((f, i) => <li key={i}>{pick(f)}</li>)}
      </ul>

      <h2 className="cg-h2">{strings.demonsTitle}</h2>
      <div className="controls rc-controls">
        <input
          type="search"
          id="rc-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={strings.searchDemon}
          aria-label={strings.searchDemon}
        />
        <span className="count">
          {q.trim()
            ? strings.showing.replace('{n}', shown.length).replace('{total}', data.demons.length)
            : strings.demonsLede.replace('{known}', known).replace('{total}', data.demons.length)}
        </span>
      </div>
      <div className="scroll">
        <table className="cgtable rc-table">
          <thead>
            <tr>
              <th style={{ minWidth: 230 }}>{strings.demon}</th>
              <th style={{ width: 150 }}>{strings.core}</th>
              <th style={{ width: 110 }}>{strings.icon}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((d) => {
              const core = coreOf(d.core);
              return (
                <tr key={d.id}>
                  <td className="c-name">
                    <span className="nm">{pick(d.name)}</span>
                    <span className={`dot-th${d.thConfirmed ? ' ok' : ''}`} title={strings.confirmedTh} />
                  </td>
                  <td className="fm rc-core" data-l={strings.core}>
                    {core
                      ? <span className={`rc-chip el-t-${core.key}`}><i className={`el-dot el-${core.key}`} />{pick(core.name)}</span>
                      : <span className="rc-unknown">{strings.notYetKnown}</span>}
                  </td>
                  <td className="fm" data-l={strings.icon}>
                    <span className={`rc-icon rc-icon-${d.icon}`} />
                    <span className="cg-dim rc-iconname">{strings.icons[d.icon]}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && <div className="empty">{strings.noResults}</div>}

      <h2 className="cg-h2">{strings.coresTitle}</h2>
      <div className="rc-cores">
        {data.cores.map((c) => (
          <span key={c.key} className={`rc-corechip${c.seen ? ' seen' : ''}`}>
            <i className={`el-dot el-${c.key}`} />
            {pick(c.name)}
            {!c.seen && <em>{strings.unseen}</em>}
          </span>
        ))}
      </div>

      {data.patterns?.length > 0 && (
        <>
          <h2 className="cg-h2">{strings.patternsTitle}</h2>
          <div className="rc-patterns">
            {data.patterns.map((pt, i) => (
              <article key={i}>
                <h3>{pick(pt.title)}</h3>
                <p>{pick(pt.body)}</p>
              </article>
            ))}
          </div>
        </>
      )}

      <h2 className="cg-h2">{strings.openTitle}</h2>
      <ul className="cg-list">
        {data.open.map((o, i) => <li key={i}>{pick(o)}</li>)}
      </ul>
    </>
  );
}
