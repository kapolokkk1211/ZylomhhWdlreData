'use client';
import { useState } from 'react';

/* Each set is one skill per element — you have exactly one of them and want to find your own —
   so a skill is a card led by its element, not a row in a table. Job Skill is the exception:
   it keys off your rebirth class instead, and `group` on the family says which. */
const ELEMENT_ORDER = ['earth', 'water', 'fire', 'wind'];
const JOB_ORDER = ['killer', 'warrior', 'knight', 'wit', 'priest', 'seer'];

export default function SkillBook({ families, questFor, strings }) {
  const [tab, setTab] = useState(families[0]?.key);
  const fam = families.find((f) => f.key === tab) || families[0];
  const quest = questFor[fam.key];

  const byJob = fam.group === 'job';
  const order = byJob ? JOB_ORDER : ELEMENT_ORDER;
  const slotOf = (k) => (byJob ? k.job : k.element);
  const slotLabel = (k) =>
    (byJob ? strings.jobs?.[k.job] : strings.elements?.[k.element]) || slotOf(k);

  const sorted = [...fam.skills].sort(
    (a, b) => order.indexOf(slotOf(a)) - order.indexOf(slotOf(b)),
  );

  return (
    <>
      <div className="skill-tabs" role="tablist">
        {families.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={f.key === tab}
            className={`skill-tab${f.key === tab ? ' on' : ''}`}
            onClick={() => setTab(f.key)}
          >
            {f.label}
            {f.abbr && <span className="skill-tab-abbr">{f.abbr}</span>}
          </button>
        ))}
      </div>

      <div className="cg-prose">
        <p className="sk-tagline">
          <span className="sk-tag">{fam.tag}</span>
          {fam.tagConfirmed && <span className="dot-th ok" title={strings.confirmedTh} />}
        </p>
        <p>{fam.intro}</p>
      </div>

      {quest && (
        <div className="sk-quest">
          <h2 className="cg-h2">{strings.howToGet}</h2>
          <p className="sk-questname">{quest.name}</p>
          {quest.req && <p><b>{strings.cost}</b> — {quest.req}</p>}
          {quest.reward && <p><b>{strings.reward}</b> — {quest.reward}</p>}
          {quest.detail && <p className="cg-dim">{quest.detail}</p>}
        </div>
      )}

      <h2 className="cg-h2">{byJob ? strings.theJobSkills : strings.theSkills}</h2>
      <div className="sk-grid">
        {sorted.map((k) => (
          <article className={`sk-card ${byJob ? `job-${k.job}` : `el-${k.element}`}`} key={k.id}>
            <header>
              <span className="sk-el">{slotLabel(k)}</span>
              <h3>{k.name}</h3>
              {k.alt && <p className="sk-alt">{k.alt}</p>}
            </header>
            {k.flavour && <p className="sk-flavour">{k.flavour}</p>}
            <dl className="sk-facts">
              <dt>{strings.target}</dt>
              <dd>{k.target}</dd>
              <dt>{strings.effect}</dt>
              <dd>
                {k.effect}
                {k.turns ? <span className="sk-turns">{strings.turns.replace('{n}', k.turns)}</span> : null}
              </dd>
              {k.sp != null && (
                <>
                  <dt>{strings.sp}</dt>
                  <dd>{k.sp}</dd>
                </>
              )}
            </dl>
            {k.note && <p className="sk-note">{k.note}</p>}
          </article>
        ))}
      </div>

      {fam.sources?.length > 0 && (
        <p className="cg-dim sk-src">
          {strings.source}:{' '}
          {fam.sources.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className={`srclink srclink-${s.kind}`}>
              {s.kind} {i + 1}
            </a>
          ))}
        </p>
      )}
    </>
  );
}
