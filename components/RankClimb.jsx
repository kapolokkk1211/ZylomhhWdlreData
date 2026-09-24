/* A translated guide, not a database. Everything here is one Taiwanese player's thread, so
   the source link sits at the top rather than buried in a footnote — a reader should be able
   to check the original before spending an Encyclopedia volume on our summary of it. */
export default function RankClimb({ data, strings, families, lang }) {
  const pick = (o) => (o ? (lang === 'th' ? o.th || o.en : o.en || o.th) || '' : '');
  const fam = (k) => (k && families[k] ? families[k].label : null);

  return (
    <>
      <p className="rk-source">
        <span className="rk-slabel">{strings.sourceLabel}</span>
        <a href={data.source.url} target="_blank" rel="noopener noreferrer">
          {pick(data.source.title)}
        </a>
        <span className="cg-dim rk-board">{pick(data.source.board)}</span>
      </p>

      <p className="rk-intro">{pick(data.intro)}</p>

      <div className="rk-cards">
        {data.concepts.map((c, i) => (
          <article key={i}>
            <h3>{pick(c.title)}</h3>
            <p>{pick(c.body)}</p>
          </article>
        ))}
      </div>

      <h2 className="cg-h2">{pick(data.rule.title)}</h2>
      <p>{pick(data.rule.body)}</p>
      <p className="rk-shortcut">{pick(data.rule.shortcut)}</p>

      <h2 className="cg-h2">{pick(data.climb.title)}</h2>
      <div className="scroll">
        <table className="cgtable rk-table">
          <thead>
            <tr>
              <th style={{ width: 210 }}>{strings.mode}</th>
              <th>{strings.effect}</th>
            </tr>
          </thead>
          <tbody>
            {data.climb.rows.map((r, i) => (
              <tr key={i}>
                <td className="c-name"><span className="nm">{pick(r.k)}</span></td>
                <td className="fm" data-l={strings.effect}>{pick(r.v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="cg-h2">{pick(data.worked.title)}</h2>
      <ol className="rk-steps">
        {data.worked.steps.map((s, i) => <li key={i}>{pick(s)}</li>)}
      </ol>

      <h2 className="cg-h2">{pick(data.fillers.food.title)}</h2>
      <p className="cg-dim">{pick(data.fillers.food.note)}</p>
      <div className="scroll">
        <table className="cgtable rk-table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>{strings.rank}</th>
              <th style={{ width: 190 }}>{strings.filler}</th>
              <th>{strings.why}</th>
            </tr>
          </thead>
          <tbody>
            {data.fillers.food.rows.map((r, i) => (
              <tr key={i}>
                <td className="rk-rank">{r.rank}</td>
                <td className="c-name"><span className="nm">{pick(r.name)}</span></td>
                <td className="fm" data-l={strings.why}>{pick(r.why)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="cg-h2">{pick(data.fillers.gear.title)}</h2>
      <p className="cg-dim">{pick(data.fillers.gear.note)}</p>
      <div className="scroll">
        <table className="cgtable rk-table">
          <thead>
            <tr>
              <th style={{ width: 90 }}>{strings.rank}</th>
              <th>{strings.filler}</th>
            </tr>
          </thead>
          <tbody>
            {data.fillers.gear.rows.map((r, i) => (
              <tr key={i}>
                <td className="rk-rank">{r.rank}</td>
                <td className="fm" data-l={strings.filler}>
                  <span className="rk-items">
                    {r.items.map((it, j) => (
                      <span key={j} className="rk-item">
                        {lang === 'th' ? it.th || it.en : it.en || it.th}
                        {fam(it.fam) && <em>{fam(it.fam)}</em>}
                      </span>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="cg-h2">{strings.highlightsTitle}</h2>
      <div className="rk-cards">
        {data.highlights.map((h, i) => (
          <article key={i}>
            <h3>{pick(h.title)}</h3>
            <p>{pick(h.body)}</p>
          </article>
        ))}
      </div>

      <p className="rk-tldr"><b>{strings.tldr}</b> {pick(data.tldr)}</p>

      <p className="rk-credit">
        {strings.credit}{' '}
        <a href={data.source.url} target="_blank" rel="noopener noreferrer">{data.source.url}</a>
      </p>
    </>
  );
}
