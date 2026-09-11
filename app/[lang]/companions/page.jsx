import { t } from '@/lib/ui';
import { companionRows, companionCounts, companionSources } from '@/lib/data';
import CompanionGuide from '@/components/CompanionGuide';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).companions.title };
}

export default async function Companions({ params }) {
  const { lang } = await params;
  const s = t(lang).companions;
  return (
    <>
      <div className="page-head">
        <p className="eyebrow">夥伴轉生 · {s.title}</p>
        <h1>{s.title}</h1>
        <p className="lede">{s.lede}</p>
        <div className="note">{s.dataNote}</div>
      </div>
      <CompanionGuide rows={companionRows(lang)} counts={companionCounts()} sources={companionSources()} strings={s} lang={lang} />
    </>
  );
}
