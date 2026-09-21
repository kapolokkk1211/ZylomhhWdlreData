'use client';
import { useState } from 'react';

/* A player arrives here having already picked an element, or already picked a job, and wants
   the other half. So the job cards lead — six of them, each carrying its own stat order —
   and the element table sits above as the thing you cross-reference against. */
const STAT_KEYS = ['STR', 'CON', 'INT', 'WIS', 'AGI'];

export default function BuildGuide({ data, strings, lang }) {
  const [openJob, setOpenJob] = useState(null);
  const pick = (o) => (o ? (lang === 'th' ? o.th || o.en : o.en || o.th) || '' : '');

  const lines = [
    { key: 'warrior', label: strings.warriorLine },
    { key: 'mage', label: strings.mageLine },
  ];

  return (
    <>
      <section>
        <h2 className="cg-h2">{strings.statsTitle}</h2>
        <p className="cg-dim bg-lede">{strings.statsLede}</p>
        <div className="bg-stats">
          {data.stats.map((s) => (
            <article className="bg-stat" key={s.key}>
              <header>
                <b className="bg-stat-key">{s.key}</b>
                <span className="bg-stat-name">{pick(s.name)}</span>
              </header>
              <p className="bg-gives">{pick(s.gives)}</p>
              <p className="bg-per">{s.perPoint}</p>
              <p className="bg-note">{pick(s.note)}</p>
            </article>
          ))}
        </div>
        <p className="bg-formula">
          <span>{strings.hpFormula}</span> <b>{data.hp.formula}</b>
        </p>
        <p className="cg-dim">{pick(data.hp.note)}</p>
      </section>

      <section>
        <h2 className="cg-h2">{strings.elementsTitle}</h2>
        <p className="cg-dim bg-lede">{strings.elementsLede}</p>
        <div className="scroll">
          <table className="cgtable bg-el">
            <thead>
              <tr>
                <th style={{ minWidth: 110 }}>{strings.element}</th>
                <th className="th-num">ATK</th>
                <th className="th-num">DEF</th>
                <th className="th-num">MATK</th>
                <th className="th-num">MDEF</th>
                <th className="th-num">SPD</th>
                <th style={{ minWidth: 150 }}>{strings.bonus}</th>
              </tr>
            </thead>
            <tbody>
              {data.elements.map((e) => (
                <tr key={e.key}>
                  <td className="c-name"><span className={`el-dot el-${e.key}`} />{pick(e.name)}</td>
                  {['atk', 'def', 'matk', 'mdef', 'spd'].map((k) => (
                    <td key={k} className="c-lv" data-l={k.toUpperCase()}>
                      <span className={`lv${e.growth[k] !== '1.4' && e.growth[k] !== '1.6' && e.growth[k] !== '2.0' ? ' hot' : ''}`}>
                        {e.growth[k]}
                      </span>
                    </td>
                  ))}
                  <td className="fm" data-l={strings.bonus}>{pick(e.bonus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-elnotes">
          {data.elements.map((e) => (
            <p key={e.key}><b className={`el-name el-t-${e.key}`}>{pick(e.name)}</b> — {pick(e.personality)}</p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="cg-h2">{strings.jobsTitle}</h2>
        <p className="cg-dim bg-lede">{strings.jobsLede}</p>
        {lines.map((line) => (
          <div key={line.key}>
            <h3 className="bg-line">{line.label}</h3>
            <div className="bg-jobs">
              {data.jobs.filter((j) => j.line === line.key).map((j) => {
                const open = openJob === j.key;
                return (
                  <article className={`bg-job${open ? ' open' : ''}`} key={j.key}>
                    <header>
                      <h4>{pick(j.name)}</h4>
                      <div className="bg-chips">
                        <span className="bg-chip">{strings.cape} {j.cape}</span>
                        <span className="bg-chip on">{j.passive}</span>
                        {j.extra && <span className="bg-chip">{pick(j.extra)}</span>}
                      </div>
                    </header>

                    <div className="bg-order" aria-label={strings.statOrder}>
                      {j.order.map((k, i) => (
                        <span key={k} className={`bg-pri p${i}`} title={`${strings.statOrder} ${i + 1}`}>{k}</span>
                      ))}
                    </div>

                    <dl className="sk-facts">
                      <dt>{strings.element}</dt>
                      <dd>{pick(j.element)}</dd>
                      <dt>{strings.jobSkill}</dt>
                      <dd><b>{pick(j.skill.name)}</b> — {pick(j.skill.effect)}</dd>
                    </dl>

                    <p className="bg-why">{pick(j.why)}</p>

                    <button type="button" className="bg-more" aria-expanded={open}
                      onClick={() => setOpenJob(open ? null : j.key)}>
                      {open ? '−' : '+'} {strings.whatKillsIt}
                    </button>
                    {open && <p className="bg-fail">{pick(j.failure)}</p>}
                  </article>
                );
              })}
            </div>
          </div>
        ))}
        <p className="cg-dim">{strings.statOrderLegend}</p>
      </section>

      <section>
        <h2 className="cg-h2">{strings.numbersTitle}</h2>
        <div className="bg-two">
          <div>
            <h3 className="bg-sub">{pick(data.spdLadder.title)}</h3>
            <table className="cgtable bg-ladder">
              <tbody>
                {data.spdLadder.rows.map((r) => (
                  <tr key={r.spd}><th className="th-num">{r.spd}</th><td>{pick(r.what)}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="cg-dim">{pick(data.spdLadder.note)}</p>
          </div>
          <div>
            <h3 className="bg-sub">{pick(data.intBands.title)}</h3>
            <table className="cgtable bg-ladder">
              <tbody>
                {data.intBands.rows.map((r) => (
                  <tr key={r.band}><th className="th-num">{r.band}</th><td>{pick(r.what)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="cg-h2">{strings.rulesTitle}</h2>
        <div className="bg-rules">
          {data.rules.map((r) => (
            <article key={r.key}>
              <h3>{pick(r.title)}</h3>
              <p>{pick(r.body)}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="cg-h2">{pick(data.gate.title)}</h2>
        <ol className="cg-list bg-gate">
          {data.gate.points.map((p, i) => <li key={i}>{pick(p)}</li>)}
        </ol>
      </section>

      <section>
        <h2 className="cg-h2">{strings.openTitle}</h2>
        <p className="cg-dim bg-lede">{strings.openLede}</p>
        <ul className="cg-list">
          {data.openQuestions.map((q, i) => <li key={i}>{pick(q)}</li>)}
        </ul>
      </section>
    </>
  );
}
