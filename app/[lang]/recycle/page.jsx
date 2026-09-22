import { t } from '@/lib/ui';
import { recycleData } from '@/lib/data';
import RecycleMemo from '@/components/RecycleMemo';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).recycle.title };
}

export default async function Recycle({ params }) {
  const { lang } = await params;
  const s = t(lang);
  return (
    <>
      <div className="page-head">
        <h1>{s.recycle.title}</h1>
        <p className="lede">{s.recycle.lede}</p>
      </div>
      <RecycleMemo data={recycleData()} strings={{ ...s.common, ...s.recycle }} lang={lang} />
    </>
  );
}
