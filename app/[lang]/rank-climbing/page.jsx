import { t } from '@/lib/ui';
import { rankClimbData, labelBundle } from '@/lib/data';
import RankClimb from '@/components/RankClimb';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).rankclimb.title };
}

export default async function RankClimbing({ params }) {
  const { lang } = await params;
  const s = t(lang);
  return (
    <>
      <div className="page-head">
        <h1>{s.rankclimb.title}</h1>
        <p className="lede">{s.rankclimb.lede}</p>
      </div>
      <RankClimb
        data={rankClimbData()}
        strings={{ ...s.common, ...s.rankclimb }}
        families={labelBundle(lang).family}
        lang={lang}
      />
    </>
  );
}
