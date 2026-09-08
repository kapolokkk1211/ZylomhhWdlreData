import { t } from '@/lib/ui';
import { materialRows, labelBundle, codes, nm, counts, townOptions } from '@/lib/data';
import MaterialTable from '@/components/MaterialTable';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: t(lang).materials.title };
}

export default async function Materials({ params }) {
  const { lang } = await params;
  const s = t(lang);
  const rows = materialRows();
  const c = counts();

  const present = [...new Set(rows.map((r) => r.family))];
  const order = codes.families.map((f) => f.key);
  const families = present
    .sort((a, b) => order.indexOf(a) - order.indexOf(b))
    .map((k) => {
      const f = codes.families.find((x) => x.key === k);
      return {
        key: k,
        label: nm(f.name, lang),
        alt: [f.name.cn, lang === 'th' ? f.name.en : f.name.th].filter(Boolean).join(' '),
      };
    });
  const towns = townOptions(lang).map((t) => ({
    ...t,
    label: t.status === 'open' ? `${t.label} ✓` : t.label,
  }));

  return (
    <>
      <div className="page-head">
        <p className="eyebrow">材料 · {s.materials.title}</p>
        <h1>{s.materials.title}</h1>
        <p className="lede">{s.materials.lede}</p>
        <div className="note warn">
          <b>{c.buyableNow}/{c.materials}</b> — {s.materials.openOnlyHelp}
        </div>
      </div>
      <MaterialTable
        rows={rows}
        labels={labelBundle(lang)}
        options={{ families, towns }}
        lang={lang}
        strings={{ ...s.common, ...s.materials }}
      />
    </>
  );
}
