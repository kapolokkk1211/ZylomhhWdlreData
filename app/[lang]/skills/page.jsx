import { t } from '@/lib/ui';
import { skillFamilies, questRows } from '@/lib/data';
import SkillBook from '@/components/SkillBook';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).skills.title };
}

export default async function Skills({ params }) {
  const { lang } = await params;
  const s = t(lang);
  const families = skillFamilies(lang);
  // The quest that teaches each family, looked up once so the page can link it inline.
  const quests = questRows(lang);
  const questFor = Object.fromEntries(
    families.filter((f) => f.questId).map((f) => {
      const q = quests.find((x) => x.id === f.questId);
      return [f.key, q ? { name: q.name, req: q.req, reward: q.reward, detail: q.detail } : null];
    }),
  );

  return (
    <>
      <div className="page-head">
        <h1>{s.skills.title}</h1>
        <p className="lede">{s.skills.lede}</p>
      </div>
      <SkillBook
        families={families}
        questFor={questFor}
        strings={{ ...s.common, ...s.skills }}
      />
    </>
  );
}
