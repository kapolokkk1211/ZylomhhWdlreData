import { t } from '@/lib/ui';
import { questRows, questTypeOptions, labelBundle, counts } from '@/lib/data';
import QuestTable from '@/components/QuestTable';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).quests.title };
}

export default async function Quests({ params }) {
  const { lang } = await params;
  const s = t(lang);
  const rows = questRows(lang);
  const c = counts();

  return (
    <>
      <div className="page-head">
        <h1>{s.quests.title}</h1>
        <p className="lede">{s.quests.lede}</p>
        <div className="note warn">
          <b>{c.questsRe}/{c.quests}</b> — {s.quests.gap}
        </div>
      </div>
      <QuestTable
        rows={rows}
        labels={labelBundle(lang)}
        options={{ types: questTypeOptions(lang) }}
        lang={lang}
        strings={{ ...s.common, ...s.quests }}
      />
    </>
  );
}
