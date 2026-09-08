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
   14 line · 15 randomStats · 16 lvAnomaly · 17 note · 18 thConfirmed · 19 band
   20 stats as [[stat, value], …] (parsed, for the stat filters)                     */
const row = (r) => [
  r.id, r.family, r.secondary, r.rank, r.lv, r.slot,
  r.name.en, r.name.cn, r.name.th, r.statsRaw,
  r.recipe.en, r.recipe.th, r.confidence, r.familyCoverage,
  r.line || null, r.randomStats ? 1 : 0, r.lvAnomaly ? 1 : 0, r.note || null,
  r.thConfirmed ? 1 : 0, r.band || null,
  (r.stats || []).map((x) => [x.stat, x.v]),
];

// Every row, Star family included — one table now.
export const compoundRows = () => compounds.map(row);
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
    families: fams.map((k) => ({
      key: k,
      label: nm(FAMILY[k].name, lang),
      alt: [FAMILY[k].name.cn, lang === 'th' ? FAMILY[k].name.en : FAMILY[k].name.th].filter(Boolean).join(' '),
    })),
    slots: slots.map((k) => ({
      key: k,
      label: nm(SLOT[k].name, lang),
      alt: [SLOT[k].name.cn, lang === 'th' ? SLOT[k].name.en : SLOT[k].name.th].filter(Boolean).join(' '),
    })),
    stats: codes.stats.map((st) => ({ key: st.key, label: st.key, alt: nm(st.name, lang) })),
  };
};

/* ---- materials ---- */
export const materialRows = () =>
  materials.map((m) => ({
    id: m.id,
    family: m.family,
    rank: m.rank,
    name: m.name,
    thConfirmed: !!m.thConfirmed,
    sources: m.sources,
    flags: m.flags,
    confidence: m.confidence,
    note: m.note,
    // precomputed so the client doesn't have to know the town table
    buyableNow: m.sources.some((s) => s.type === 'shop' && OPEN_TOWNS.includes(s.town)),
  }));

// Towns that actually sell something, for the material page's shop filter.
export const townOptions = (lang) => {
  const used = new Set();
  materials.forEach((m) => m.sources.forEach((s) => { if (s.type === 'shop') used.add(s.town); }));
  return towns
    .filter((t) => used.has(t.key))
    .map((t) => ({
      key: t.key,
      label: nm(t.name, lang),
      alt: [t.name.cn, lang === 'th' ? t.name.en : t.name.th, t.thStatus].filter(Boolean).join(' '),
      status: t.thStatus,
    }));
};

// Small material rows for the simulator: name + a one-line source summary.
export const materialsCompact = (lang) =>
  materials.map((m) => ({
    id: m.id,
    family: m.family,
    rank: m.rank,
    name: m.name,
    buyableNow: m.sources.some((s) => s.type === 'shop' && OPEN_TOWNS.includes(s.town)),
    src: m.sources
      .map((s) => {
        if (s.type === 'shop') {
          const t = TOWN[s.town];
          return `${nm(t?.name || { en: s.town }, lang)}${s.price != null ? ` ${s.price}g` : ''}${t?.thStatus === 'open' ? ' ✓' : ''}`;
        }
        if (s.type === 'drop') return `${s.mob}${s.lv ? ` Lv${s.lv}` : ''}`;
        if (s.type === 'gather') return s.where;
        if (s.type === 'craft') return s.station;
        return '高級煉金卷(RE)';
      })
      .join(' · '),
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
  stat: Object.fromEntries(codes.stats.map((st) => [st.key, { label: st.key, th: st.name.th }])),
  town: Object.fromEntries(
    towns.map((t) => [t.key, { label: nm(t.name, lang), en: t.name.en, cn: t.name.cn, status: t.thStatus, note: t.note }]),
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
