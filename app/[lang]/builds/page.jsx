import { t } from '@/lib/ui';
import { buildData, advancementData } from '@/lib/data';
import BuildGuide from '@/components/BuildGuide';
import Advancement from '@/components/Advancement';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).builds.title };
}

export default async function Builds({ params }) {
  const { lang } = await params;
  const s = t(lang);
  return (
    <>
      <div className="page-head">
        <h1>{s.builds.title}</h1>
        <p className="lede">{s.builds.lede}</p>
      </div>
      <BuildGuide data={buildData()} strings={{ ...s.common, ...s.builds }} lang={lang} />
      <Advancement
        data={advancementData()}
        jobs={buildData().jobs}
        strings={{ ...s.common, ...s.builds, ...s.advancement }}
        lang={lang}
      />
    </>
  );
}
