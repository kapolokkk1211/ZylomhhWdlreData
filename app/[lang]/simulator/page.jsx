import { t } from '@/lib/ui';
import { compoundRows, materialsCompact, labelBundle } from '@/lib/data';
import Simulator from '@/components/Simulator';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).sim.title };
}

export default async function SimulatorPage({ params }) {
  const { lang } = await params;
  const s = t(lang);
  return (
    <>
      <div className="page-head">
        <p className="eyebrow">合成模擬 · {s.sim.title}</p>
        <h1>{s.sim.title}</h1>
        <p className="lede">{s.sim.lede}</p>
        <div className="note"><b>!</b> {s.sim.caveat}</div>
      </div>
      <Simulator
        rows={compoundRows(lang)}
        mats={materialsCompact(lang)}
        labels={labelBundle(lang)}
        lang={lang}
        strings={{ ...s.common, ...s.sim }}
      />
    </>
  );
}
