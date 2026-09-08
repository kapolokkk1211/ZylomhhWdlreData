import { t } from '@/lib/ui';
import { glossary } from '@/lib/data';
import GlossaryTable from '@/components/GlossaryTable';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).glossary.title };
}

export default async function Glossary({ params }) {
  const { lang } = await params;
  const s = t(lang);
  return (
    <>
      <div className="page-head">
        <p className="eyebrow">名詞對照 · {s.glossary.title}</p>
        <h1>{s.glossary.title}</h1>
        <p className="lede">{s.glossary.lede}</p>
      </div>
      <GlossaryTable
        data={glossary}
        lang={lang}
        strings={{ ...s.common, ...s.glossary }}
      />
    </>
  );
}
