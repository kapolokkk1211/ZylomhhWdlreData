import { t } from '@/lib/ui';
import { starRows, optionsFor, labelBundle } from '@/lib/data';
import CompoundTable from '@/components/CompoundTable';
import Legend from '@/components/Legend';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).star.title };
}

export default async function Star({ params }) {
  const { lang } = await params;
  const s = t(lang);
  const rows = starRows();

  return (
    <>
      <div className="page-head">
        <p className="eyebrow">星耀 · ประกายดาว</p>
        <h1>{s.star.title}</h1>
        <p className="lede">{s.star.lede}</p>
        <div className="note"><b>⭐</b> {s.star.pairNote}</div>
      </div>
      <Legend strings={s.common} labels={labelBundle(lang)} />
      <CompoundTable
        mode="star"
        rows={rows}
        labels={labelBundle(lang)}
        options={optionsFor(rows, lang)}
        lang={lang}
        strings={{
          ...s.common,
          verifiedOnly: s.compounds.verifiedOnly,
          random: s.star.random,
          lines: { all: s.star.all, magic: s.star.magic, phys: s.star.phys, mat: s.star.mat },
          bands: s.star.bands,
        }}
      />
    </>
  );
}
