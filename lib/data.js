// Server-side data access. Read the JSON once, project it into compact arrays
// before it crosses to the client — the full compounds file is ~500KB of JSON and
// most of that is key names repeated 853 times.
import compounds from '@/content/data/compounds.json';
import materials from '@/content/data/materials.json';
import codes from '@/content/data/codes.json';
import towns from '@/content/data/towns.json';
import glossary from '@/content/data/glossary.json';

export const DATA_DATE = '2026-05-30'; // the source sheet's last maintained date
export const OPEN_TOWNS = towns.filter((t) => t.thStatus === 'open').map((t) => t.key);

export { codes, towns, glossary };

const byKey = (arr) => Object.fromEntries(arr.map((x) => [x.key, x]));
export const FAMILY = byKey(codes.families);
export const SLOT = byKey(codes.slots);
export const STAT = byKey(codes.stats);
export const CONFIDENCE = byKey(codes.confidence);
export const TOWN = byKey(towns);

// Display name in a language, always falling back to English.
export const nm = (name, lang) => (lang === 'th' ? name.th || name.en : name.en) || name.cn || '';
export const hasTh = (name) => Boolean(name.th);

/* ---- compact row shape shared by the compound + star tables ----
   0 id · 1 family · 2 secondary[] · 3 rank · 4 lv · 5 slot
   6 nameEn · 7 nameCn · 8 nameTh · 9 statsRaw
   10 recipeEn · 11 recipeTh · 12 confidence · 13 familyCoverage
   14 line · 15 randomStats · 16 lvAnomaly · 17 note · 18 thConfirmed · 19 band  */
const row = (r) => [
  r.id, r.family, r.secondary, r.rank, r.lv, r.slot,
  r.name.en, r.name.cn, r.name.th, r.statsRaw,
  r.recipe.en, r.recipe.th, r.confidence, r.familyCoverage,
  r.line || null, r.randomStats ? 1 : 0, r.lvAnomaly ? 1 : 0, r.note || null,
  r.thConfirmed ? 1 : 0, r.band || null,
];

export const compoundRows = () => compounds.filter((r) => r.family !== 'Star').map(row);
export const starRows = () => compounds.filter((r) => r.family === 'Star').map(row);
export const allCompounds = () => compounds;

// Families/slots actually present, in the source sheet's order, for the filter menus.
const FAMILY_ORDER = codes.families.map((f) => f.key);
export const optionsFor = (rows, lang) => {
  const fams = [...new Set(rows.map((r) => r[1]))].sort(
    (a, b) => FAMILY_ORDER.indexOf(a) - FAMILY_ORDER.indexOf(b),
  );
  const slots = [...new Set(rows.map((r) => r[5]))].sort((a, b) =>
    nm(SLOT[a].name, lang).localeCompare(nm(SLOT[b].name, lang)),
  );
  return {
    families: fams.map((k) => ({ key: k, label: `${nm(FAMILY[k].name, lang)} ${FAMILY[k].name.cn}` })),
    slots: slots.map((k) => ({ key: k, label: nm(SLOT[k].name, lang) })),
  };
};

/* ---- materials ---- */
export const materialRows = () =>
  materials.map((m) => ({
    id: m.id,
    family: m.family,
    rank: m.rank,
    name: m.name,
    sources: m.sources,
    flags: m.flags,
    confidence: m.confidence,
    note: m.note,
    // precomputed so the client doesn't have to know the town table
    buyableNow: m.sources.some((s) => s.type === 'shop' && OPEN_TOWNS.includes(s.town)),
  }));

/* ---- label bundles handed to client components ---- */
export const labelBundle = (lang) => ({
  family: Object.fromEntries(
    codes.families.map((f) => [f.key, { label: nm(f.name, lang), cn: f.name.cn, confirmed: f.thConfirmed }]),
  ),
  slot: Object.fromEntries(
    codes.slots.map((s) => [s.key, { label: nm(s.name, lang), cn: s.name.cn, confirmed: s.thConfirmed }]),
  ),
  confidence: Object.fromEntries(
    codes.confidence.map((c) => [c.key, { label: nm(c.name, lang), desc: c.desc }]),
  ),
  town: Object.fromEntries(
    towns.map((t) => [t.key, { label: nm(t.name, lang), cn: t.name.cn, status: t.thStatus, note: t.note }]),
  ),
});

export const counts = () => ({
  compounds: compounds.length,
  star: compounds.filter((r) => r.family === 'Star').length,
  materials: materials.length,
  families: codes.families.length,
  glossary: Object.values(glossary).flat().length,
  buyableNow: materials.filter((m) =>
    m.sources.some((s) => s.type === 'shop' && OPEN_TOWNS.includes(s.town)),
  ).length,
  towns: towns.length,
});
