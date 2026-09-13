'use client';
import { useState } from 'react';

/* The four Hero Battle Arts are one per element, and the element is the thing you scan for —
   a player has exactly one of them and wants to find their own. So each skill is a card led by
   its element, not a row in a table. */
const ELEMENT_ORDER = ['earth', 'water', 'fire', 'wind'];

export default function SkillBook({ families, questFor, strings }) {
  const [tab, setTab] = useState(families[0]?.key);
  const fam = families.find((f) => f.key === tab) || families[0];
  const quest = questFor[fam.key];

  return (
    <>
      {/* One tab today. The bar is here so FS / DS / JS slot in beside it later. */}
      <div className="skill-tabs" role="tablist">
        {families.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={f.key === tab}
            className={`skill-tab${f.key === tab ? ' on' : ''}`}
            onClick={() => setTab(f.key)}
          >
            {f.label} <span className="cn">{f.cn}</span>
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

      <h2 className="cg-h2">{strings.theSkills}</h2>
      <div className="sk-grid">
        {[...fam.skills]
          .sort((a, b) => ELEMENT_ORDER.indexOf(a.element) - ELEMENT_ORDER.indexOf(b.element))
          .map((k) => (
            <article className={`sk-card el-${k.element}`} key={k.id}>
              <header>
                <span className="sk-el">{strings.elements[k.element] || k.element}</span>
                <h3>
                  {k.name} <span className="cn">{k.cn}</span>
                </h3>
                {k.alt && <p className="sk-alt">{k.alt}</p>}
              </header>
              <p className="sk-flavour">{k.flavour}</p>
              <dl className="sk-facts">
                <dt>{strings.target}</dt>
                <dd>{k.target}</dd>
                <dt>{strings.effect}</dt>
                <dd>
                  {k.effect}
                  {k.turns ? <span className="sk-turns">{strings.turns.replace('{n}', k.turns)}</span> : null}
                </dd>
              </dl>
              {k.note && <p className="sk-note">{k.note}</p>}
            </article>
          ))}
      </div>

      {fam.sources?.length > 0 && (
        <p className="cg-dim sk-src">
          {strings.source}:{' '}
          {fam.sources.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="srclink srclink-baha">
              {s.kind} {i + 1}
            </a>
          ))}
        </p>
      )}
    </>
  );
}
