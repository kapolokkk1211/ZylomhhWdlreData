import { t } from '@/lib/ui';
import feedback from '@/content/data/feedback.json';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).feedback.title };
}

export default async function Feedback({ params }) {
  const { lang } = await params;
  const s = t(lang).feedback;
  // The form is filled in on the page itself — no hop to another site, no account,
  // no extra click. The link below is only a fallback if the embed is blocked.
  const embed = feedback.embedUrl || '';
  const link = feedback.formUrl || '';

  return (
    <>
      <div className="page-head">
        <p className="eyebrow">回報 · {s.title}</p>
        <h1>{s.title}</h1>
        <p className="lede">{s.lede}</p>
      </div>

      <ul className="fb-how">
        {s.how.map((h, i) => (
          <li key={i}>{h}</li>
        ))}
      </ul>

      {embed ? (
        <>
          <div className="fb-embed">
            <iframe src={embed} title={s.title} loading="lazy">…</iframe>
          </div>
          {link && (
            <p className="fb-fallback">
              <a href={link} target="_blank" rel="noopener noreferrer">{s.openNew} ↗</a>
            </p>
          )}
        </>
      ) : (
        <div className="note warn">{s.notReady}</div>
      )}

      <p className="fb-after">{s.after}</p>
    </>
  );
}
