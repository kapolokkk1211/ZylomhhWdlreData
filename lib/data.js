// Server-side data access. Read the JSON once, project it into compact arrays
// before it crosses to the client — the full compounds file is ~500KB of JSON and
// most of that is key names repeated 853 times.
import compounds from '@/content/data/compounds.json';
import materials from '@/content/data/materials.json';
import codes from '@/content/data/codes.json';
import towns from '@/content/data/towns.json';
import glossary from '@/content/data/glossary.json';
import quests from '@/content/data/quests.json';
import companions from '@/content/data/companions.json';
import sourceLinks from '@/content/data/sources.json';
import skillData from '@/content/data/skills.json';
import builds from '@/content/data/builds.json';
import recycle from '@/content/data/recycle.json';

export const DATA_DATE = '2026-05-30'; // the source sheet's last maintained date
export const OPEN_TOWNS = towns.filter((t) => t.thStatus === 'open').map((t) => t.key);

export { codes, towns, glossary, quests, companions };

const byKey = (arr) => Object.fromEntries(arr.map((x) => [x.key, x]));
export const FAMILY = byKey(codes.families);
export const SLOT = byKey(codes.slots);
export const STAT = byKey(codes.stats);
export const CONFIDENCE = byKey(codes.confidence);
export const QUESTTYPE = byKey(codes.questTypes);
export const TOWN = byKey(towns);

// Display name in a language, always falling back to English.
export const nm = (name, lang) => (lang === 'th' ? name.th || name.en : name.en || name.th) || '';
export const hasTh = (name) => Boolean(name.th);

/* ---- compact row shape shared by the compound + star tables ----
   0 id · 1 family · 2 secondary[] · 3 rank · 4 lv · 5 slot
   6 nameEn · 7 nameCn · 8 nameTh · 9 statsRaw
   10 recipeEn · 11 recipeTh · 12 confidence · 13 familyCoverage
   14 line · 15 randomStats · 16 lvAnomaly · 17 note · 18 thConfirmed · 19 band
   20 stats as [[stat, value], …] (parsed, for the stat filters)                     */
const row = (r) => [
  r.id, r.family, r.secondary, r.rank, r.lv, r.slot,
  r.name.en, null, r.name.th, r.statsRaw,   // slot 7 was 中文 — kept as a hole so indices stay put
  r.recipe?.en || null, r.recipe?.th || null, r.confidence, r.familyCoverage,
  r.line || null, r.randomStats ? 1 : 0, r.lvAnomaly ? 1 : 0, r.note || null,
  r.thConfirmed ? 1 : 0, r.band || null,
  (r.stats || []).map((x) => [x.stat, x.v]),
];

// One-line "where it comes from" for a material, in a language. Some rows are known to
// exist at a rank but not yet known to come from anywhere — say so rather than showing a blank.
const srcSummary = (m, lang) =>
  m.sources.length === 0
    ? (lang === 'th' ? 'ยังไม่ทราบแหล่งที่มา' : 'Source not known yet')
    : m.sources
    .map((s) => {
      if (s.type === 'shop') {
        const t = TOWN[s.town];
        return `${lang === 'th' ? 'ร้านค้า' : 'Buy'} — ${nm(t?.name || { en: s.town }, lang)}${s.price != null ? ` ${s.price}g` : ''}${t?.thStatus === 'open' ? ' ✓' : ''}`;
      }
      if (s.type === 'drop') return `${lang === 'th' ? 'ดรอป' : 'Drop'}: ${s.mob}${s.lv ? ` Lv${s.lv}` : ''}${s.where ? ` · ${s.where}` : ''}`;
      if (s.type === 'gather') return `${lang === 'th' ? 'เก็บ' : 'Gather'}: ${s.where}`;
      if (s.type === 'craft') return `${s.station}${s.recipe ? `: ${s.recipe}` : ''}`;
      return (lang === 'th' ? 'ม้วนคัมภีร์เล่นแร่ขั้นสูง (RE) / 8-12' : 'Superior Alchemy Scroll (RE) / 8-12');
    })
    .join(' · ');

// Material-index rows folded into the same compact shape, so the compound table (and the
// planner) show raw materials and manufactured goods next to the equipment. Rows whose name
// already exists in the compendium are skipped — the compendium row wins.
const matRow = (m, lang) => {
  const first = m.sources[0]?.type || 'unknown';
  return [
    `mat:${m.id}`, m.family, [], m.rank, 0, 'material',
    m.name.en, null, m.name.th, '—',
    srcSummary(m, 'en'), srcSummary(m, 'th'), m.confidence, 'complete',
    `mat-${first}`, 0, 0, m.note || null, m.thConfirmed ? 1 : 0, null, [],
  ];
};
const compoundNames = new Set(compounds.map((r) => r.name.en.toLowerCase()));

// Every row — compendium, Star family, and the material index — one table.
export const compoundRows = (lang = 'en') => [
  ...compounds.map(row),
  ...materials.filter((m) => !compoundNames.has(m.name.en.toLowerCase())).map((m) => matRow(m, lang)),
];
export const allCompounds = () => compounds;

// Families/slots actually present, in the source sheet's order, for the filter menus.
const FAMILY_ORDER = codes.families.map((f) => f.key);
export const optionsFor = (rows, lang) => {
  const fams = [...new Set(rows.map((r) => r[1]))].sort(
    (a, b) => FAMILY_ORDER.indexOf(a) - FAMILY_ORDER.indexOf(b),
  );
  // Families that actually appear as a SECONDARY on some row — a shorter list than the main one.
  const seconds = [...new Set(rows.flatMap((r) => r[2] || []))].sort(
    (a, b) => FAMILY_ORDER.indexOf(a) - FAMILY_ORDER.indexOf(b),
  );
  const slots = [...new Set(rows.map((r) => r[5]))].sort((a, b) =>
    nm(SLOT[a].name, lang).localeCompare(nm(SLOT[b].name, lang)),
  );
  return {
    families: fams.map((k) => ({
      key: k,
      label: nm(FAMILY[k].name, lang),
      alt: (lang === 'th' ? FAMILY[k].name.en : FAMILY[k].name.th) || '',
    })),
    secondaries: seconds.map((k) => ({
      key: k,
      label: nm(FAMILY[k].name, lang),
      alt: (lang === 'th' ? FAMILY[k].name.en : FAMILY[k].name.th) || '',
    })),
    slots: slots.map((k) => ({
      key: k,
      label: nm(SLOT[k].name, lang),
      alt: (lang === 'th' ? SLOT[k].name.en : SLOT[k].name.th) || '',
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
    name: { en: m.name.en, th: m.name.th },
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
      alt: [lang === 'th' ? t.name.en : t.name.th, t.thStatus].filter(Boolean).join(' '),
      status: t.thStatus,
    }));
};

// Small material rows for the simulator: name + a one-line source summary.
export const materialsCompact = (lang) =>
  materials.map((m) => ({
    id: m.id,
    family: m.family,
    rank: m.rank,
    name: { en: m.name.en, th: m.name.th },
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
        return lang === 'th' ? 'ม้วนคัมภีร์เล่นแร่ขั้นสูง (RE)' : 'Superior Alchemy Scroll (RE)';
      })
      .join(' · '),
  }));


/* ---- quests ----
   Resolved into one language server-side; 132 rows is small enough not to need the
   compact-array trick the compound table uses. `alt` keeps 中文 (and the other language)
   for the name tooltip and for search. */
const pick = (o, lang) => (o ? (lang === 'th' ? o.th || o.en : o.en || o.th) || '' : '');
export const questRows = (lang = 'en') =>
  quests.map((r) => ({
    id: r.id,
    type: r.type,
    name: nm(r.name, lang),
    alt: (lang === 'th' ? r.name.en : r.name.th) || '',
    lv: r.lv || null,
    region: r.region ? nm(r.region, lang) : '',
    npc: r.npc ? nm(r.npc, lang) : '',
    req: pick(r.req, lang),
    reward: pick(r.reward, lang),
    stars: r.stars || 0,
    starCost: r.starCost || 0,
    detail: pick(r.detail, lang),
    note: pick(r.note, lang),
    confidence: r.confidence,
    thConfirmed: !!r.thConfirmed,
    sources: r.sources || [],
  }));

// Quest-type filter options, in the order codes.json declares them.
export const questTypeOptions = (lang) =>
  codes.questTypes.map((t) => ({
    key: t.key,
    label: nm(t.name, lang),
    alt: (lang === 'th' ? t.name.en : t.name.th) || '',
  }));

/* ---- companions (ขุนพล) ---- */
/* The gear objects carry both languages plus the slot provenance; flatten to one language
   here so the RSC payload does not ship the other one to every reader. */
const gear = (g, lang) =>
  g
    ? {
        name: g.th || g.en || null,
        stats: g.stats,
        slot: g.slot || null,
        slotConfirmed: !!g.slotConfirmed,
        slotNote: g.slotNote ? pick(g.slotNote, lang) : null,
      }
    : null;

/* Skill names come from the Re compendium and are shown in both languages; the SP / target /
   description that WLOHUB adds are legacy-game numbers, flagged so the panel can say so. */
const skillName = (s, lang) => (lang === 'th' ? s.th || s.en : s.en || s.th) || '';
const skill = (s, lang) => ({
  name: skillName(s, lang),
  max: s.max || null,
  up: s.up ? { name: skillName(s.up, lang), max: s.up.max || null } : null,
  sp: s.sp ?? null,
  way: s.way || null,
  desc: s.desc ? pick(s.desc, lang) : null,
  legacy: !!s.legacy,
  rebirth: !!s.rebirth,
});

/* The spotlight block carries 中文 alongside every name for cross-checking against TW sources.
   That is a research convenience, not something a Thai reader needs, so it is resolved to one
   language here and never reaches the page. */
const extra = (e, lang) =>
  e
    ? {
        element: pick(e.element, lang),
        star: pick(e.star, lang),
        story: pick(e.story, lang),
        base: e.base,
        gear: (e.gear || []).map((g) => ({
          name: (lang === 'th' ? g.th || g.en : g.en || g.th) || '',
          grade: g.grade,
          stats: g.stats,
        })),
      }
    : null;

export const companionRows = (lang = 'en') =>
  companions.map((c) => ({
    id: c.id,
    name: nm(c.name, lang),
    alt: (lang === 'th' ? c.name.en : c.name.th) || '',
    thConfirmed: !!c.thConfirmed,
    type: c.type,
    form: c.form,
    source: c.source,
    pts: c.rebirthPoints,
    exclusive: gear(c.exclusive, lang),
    rebirthExclusive: gear(c.rebirthExclusive, lang),
    rebirthSkillName: c.rebirthSkillTh || null,
    floors: c.floors,
    note: pick(c.note, lang),
    skills: (c.skills || []).map((x) => skill(x, lang)),
    extra: extra(c.extra, lang),
  }));

/* The source links live in one file, not in both language blocks of lib/ui.js — a URL that has to
   be typed twice is a URL that eventually differs between Thai and English. ui.js holds only the
   sentence describing each one, keyed by id. */
export const companionSources = (lang = 'en') =>
  sourceLinks.companions.map((s) => ({ ...s, title: pick(s.title, lang) }));

export const companionCounts = () => ({
  total: companions.length,
  quest: companions.filter((c) => c.source === 'quest').length,
  mall: companions.filter((c) => c.source === 'mall').length,
  floors: companions.filter((c) => c.floors).length,
});

/* ---- สกิล page ----
   One family per tab. Only สกิลวีรชน exists today; the shape is a list so the FS / DS / JS
   skill sets can be added as further tabs without touching the page. */
const pickL = (o, lang) => (o ? (lang === 'th' ? o.th || o.en : o.en || o.th) || '' : '');
export const skillFamilies = (lang) =>
  skillData.families.map((f) => ({
    key: f.key,
    label: pickL(f.name, lang),
    // FS / DS / JS are how KK names these sets, so the tab carries the abbreviation too.
    abbr: f.abbr || null,
    tag: pickL(f.tag, lang),
    tagConfirmed: !!f.tagThConfirmed,
    intro: pickL(f.intro, lang),
    // Most sets are one skill per element; Job Skill is one per rebirth class instead.
    group: f.group || 'element',
    questId: f.questId || null,
    sources: f.sources || [],
    skills: f.skills.map((k) => ({
      id: k.id,
      element: k.element || null,
      job: k.job || null,
      name: pickL(k.name, lang),
      alt: lang === 'th' ? k.name.en : k.name.th,
      flavour: pickL(k.flavour, lang),
      target: pickL(k.target, lang),
      effect: pickL(k.effect, lang),
      sp: k.sp ?? null,
      turns: k.turns ?? null,
      kind: k.kind,
      note: pickL(k.note, lang),
    })),
  }));

/* ---- แนวทางปั้นตัว page ----
   Both languages ship: the page is short, and the client component picks per field so a
   future third language does not need a second projection. */
export const buildData = () => builds;

/* ---- รีไซเคิล page: a running memo, both languages ship. ---- */
export const recycleData = () => recycle;

/* ---- label bundles handed to client components ---- */
export const labelBundle = (lang) => ({
  family: Object.fromEntries(
    codes.families.map((f) => [f.key, { label: nm(f.name, lang), confirmed: f.thConfirmed }]),
  ),
  slot: Object.fromEntries(
    codes.slots.map((s) => [s.key, { label: nm(s.name, lang), confirmed: s.thConfirmed }]),
  ),
  confidence: Object.fromEntries(
    codes.confidence.map((c) => [c.key, { label: nm(c.name, lang), desc: c.desc }]),
  ),
  stat: Object.fromEntries(codes.stats.map((st) => [st.key, { label: st.key, th: st.name.th }])),
  questType: Object.fromEntries(
    codes.questTypes.map((t) => [t.key, { label: nm(t.name, lang) }]),
  ),
  town: Object.fromEntries(
    towns.map((t) => [t.key, { label: nm(t.name, lang), en: t.name.en, status: t.thStatus, note: t.note }]),
  ),
});

export const counts = () => ({
  compounds: compounds.length,
  star: compounds.filter((r) => r.family === 'Star').length,
  materials: materials.length,
  families: codes.families.length,
  glossary: Object.values(glossary).flat().length,
  quests: quests.length,
  questsRe: quests.filter((q) => q.confidence.startsWith('RE-') || q.confidence === 'KK-tested').length,
  buyableNow: materials.filter((m) =>
    m.sources.some((s) => s.type === 'shop' && OPEN_TOWNS.includes(s.town)),
  ).length,
  towns: towns.length,
});
