import Link from 'next/link';
import { t } from '@/lib/ui';
import { counts, codes, nm, DATA_DATE } from '@/lib/data';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).nav.about };
}

export default async function Home({ params }) {
  const { lang } = await params;
  const s = t(lang);
  const c = counts();

  const stats = [
    [c.compounds.toLocaleString(), lang === 'th' ? 'สูตรรวมไอเทม' : 'compound recipes'],
    [c.star, lang === 'th' ? 'ไอเทมตระกูลประกายดาว' : 'Star-family items'],
    [c.materials, lang === 'th' ? 'วัตถุดิบพร้อมแหล่งที่มา' : 'materials with sources'],
    [c.families, lang === 'th' ? 'ตระกูลวัสดุ' : 'material families'],
    [`${c.buyableNow}/${c.materials}`, lang === 'th' ? 'ซื้อได้บนแมพไทยตอนนี้' : 'buyable on the TH map now'],
  ];

  return (
    <>
      <section className="hero">
        <p className="eyebrow">{s.home.eyebrow}</p>
        <h1>{s.home.h1}</h1>
        <p className="lede">{s.home.lede}</p>
        <Link href={`/${lang}/compounds`} className="cta">
          {s.home.cta} →
        </Link>

        <div className="stat-row">
          {stats.map(([n, l]) => (
            <div className="stat" key={l}>
              <div className="n">{n}</div>
              <div className="l">{l}</div>
            </div>
          ))}
        </div>

        <div className="note warn">
          <b>{s.home.warnTitle}</b> — {s.home.warnBody}
        </div>
      </section>

      <h2>{s.home.rulesTitle}</h2>
      <div className="rules">
        {s.home.rules.map(([title, body]) => (
          <div className="rule" key={title}>
            <div>
              <b>{title}</b>
              <span>{body}</span>
            </div>
          </div>
        ))}
      </div>

      <h2>{s.home.trustTitle}</h2>
      <p className="prose">{s.home.trustLede}</p>
      <div className="trust">
        {codes.confidence.map((cf) => (
          <div className="trust-row" key={cf.key}>
            <div>
              <span
                className={`badge ${
                  { 'KK-tested': 'b-kk', 'RE-verified': 'b-verified', 'RE-reported': 'b-reported', LEGACY: 'b-legacy', INFER: 'b-infer' }[cf.key]
                }`}
              >
                {nm(cf.name, lang)}
              </span>
            </div>
            <p>{cf.desc}</p>
          </div>
        ))}
      </div>

      <h2>{s.home.sourceTitle}</h2>
      <div className="prose">
        <p>{s.home.sourceBody}</p>
        <p>
          {s.footer.updated} <strong>{DATA_DATE}</strong>.
        </p>
      </div>
    </>
  );
}
