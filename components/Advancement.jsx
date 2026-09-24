/* The two advancements, read as one ladder. จุติ 1 is settled and confirmed in the Thai client;
   จุติ 2 is Taiwan-only and still being rebalanced, so it carries its source at the top and the
   Bard carries its own warning. Branches are grouped under the จุติ 1 job they come from,
   because the choice a player actually faces is between two branches of one job, never twelve. */
export default function Advancement({ data, jobs, strings, lang }) {
  const pick = (o) => (o ? (lang === 'th' ? o.th || o.en : o.en || o.th) || '' : '');
  const jobName = (k) => {
    const j = jobs.find((x) => x.key === k);
    return j ? pick(j.name) : k;
  };
  /* Most costs are SP, but the Asura branch pays in HP, so a cost that already names its own
     currency prints as written rather than collecting a second unit. */
  const cost = (sp) => {
    if (sp === null || sp === undefined) return strings.passive;
    return typeof sp === 'string' && /HP/.test(sp) ? sp : `${sp} SP`;
  };

  const Skill = ({ s }) => (
    <li className={`ad-skill${s.kind === 'upgrade' ? ' up' : ''}${s.kind === 'passive' ? ' pas' : ''}`}>
      <div className="ad-sk-head">
        <b>{pick(s.name)}</b>
        <span className="ad-sp">{cost(s.sp)}</span>
        {s.kind === 'upgrade' && <span className="ad-tag">{strings.upgradeTag}</span>}
      </div>
      <div className="cg-dim ad-target">{pick(s.target)}</div>
      <p>{pick(s.effect)}</p>
    </li>
  );

  return (
    <>
      <h2 className="cg-h2" id="adv-1">{pick(data.one.title)}</h2>
      <p>{pick(data.one.intro)}</p>
      <div className="scroll">
        <table className="cgtable ad-table">
          <thead>
            <tr>
              <th style={{ width: 150 }}>{strings.job}</th>
              <th style={{ width: 200 }}>{strings.specialSkill}</th>
              <th style={{ width: 170 }}>{strings.target}</th>
              <th>{strings.effectCol}</th>
            </tr>
          </thead>
          <tbody>
            {data.one.jobs.map((j) => (
              <tr key={j.key}>
                <td className="c-name"><span className="nm">{jobName(j.key)}</span></td>
                <td className="fm" data-l={strings.specialSkill}>
                  <b>{pick(j.special.name)}</b>
                  <span className="ad-sp">{cost(j.special.sp)}</span>
                </td>
                <td className="fm" data-l={strings.target}>{pick(j.special.target)}</td>
                <td className="fm" data-l={strings.effectCol}>{pick(j.special.effect)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cg-dim">{pick(data.one.note)}</p>

      <h2 className="cg-h2" id="adv-2">{pick(data.two.title)}</h2>
      <p className="rk-source">
        <span className="rk-slabel">{strings.sourceLabel}</span>
        <a href={data.source.url} target="_blank" rel="noopener noreferrer">{pick(data.source.title)}</a>
        <span className="cg-dim rk-board">{pick(data.source.board)} · {pick(data.source.note)}</span>
      </p>
      <ul className="cg-list">
        {data.two.gate.map((g, i) => <li key={i}>{pick(g)}</li>)}
      </ul>
      <p className="cg-dim">{pick(data.two.starVein)}</p>

      {data.one.jobs.map((base) => {
        const branches = data.two.branches.filter((b) => b.parent === base.key);
        if (!branches.length) return null;
        return (
          <section key={base.key} className="ad-line">
            <h3 className="ad-lineh">
              {jobName(base.key)}
              <span className="cg-dim">{strings.splitsInto}</span>
            </h3>
            <div className="ad-branches">
              {branches.map((b) => (
                <article key={b.key} className="ad-branch">
                  <h4>{pick(b.name)}</h4>
                  <div className="ad-traits">
                    {b.traits.map((tr, i) => <span key={i} className="ad-trait">{pick(tr)}</span>)}
                  </div>
                  <ul className="ad-skills">
                    {b.skills.map((s, i) => <Skill key={i} s={s} />)}
                  </ul>
                  {b.warning && <p className="ad-warn">{pick(b.warning)}</p>}
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <p className="rk-credit">
        {strings.credit}{' '}
        <a href={data.source.url} target="_blank" rel="noopener noreferrer">{data.source.url}</a>
      </p>
    </>
  );
}
