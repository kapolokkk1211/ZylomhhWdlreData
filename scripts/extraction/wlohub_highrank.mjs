/* Extend every family past the rank-30 ceiling.
 *
 * The Re community sheet (星飄) documents most families only to rank 30, which is why the
 * compound page capped there and showed a "≤ 30" badge. WLOHUB's item database carries the
 * rest of the ladder — up to rank 60 — so this script folds those rows in.
 *
 * What WLOHUB gives: rank, equip level, slot, stats, and the structural material families.
 * What it does NOT give: the recipe. Its compound database is community-submitted and stops
 * well short of these ranks (≈1,950 entries scanned, zero producing a rank-29+ result), so
 * every row added here carries recipe: null rather than an invented one.
 *
 * It also folds in WLOHUB's Manufacture items that have a structural base family. KK asked for
 * manufacture to be reachable from the ช่องสวมใส่ (slot) filter, so they all land on slot
 * "manufacture" regardless of WLOHUB's own subtype.
 *
 * Inputs: scratch/wlohub_highrank.tsv and scratch/wlohub_manufacture.tsv
 *         id|name|level|rank|Type[Subtype]|Base 1 / Base 2 / …|stats
 */
import fs from 'fs';

// WLOHUB base-material names → our family keys. Everything here was checked against rows we
// already hold: Corundum's Emerald/Ruby/Sapphire are our Gem r5, Hard Tissue's Beast Bone is our
// Bone r4, Quartz's Pink Crystal is our Crystal r5, Crystallization's Sugar is our Cluster r1,
// Canine's Beetle Horn is our Shell r2. Same names, same ranks, so the mapping is evidence, not guesswork.
const FAMILY = {
  'Aluminum': 'Alum', 'Coal': 'Coal', 'Copper': 'Copper', 'Corundum': 'Gem',
  'Crystallization': 'Cluster', 'Diamond': 'Diamond', 'Feather': 'Feather', 'Flower': 'Flower',
  'Fur': 'Fur', 'Gold': 'Gold', 'Grass': 'Grass', 'Gum': 'Gum', 'Hard Tissue': 'Bone',
  'Iron': 'Iron', 'Jade': 'Jade', 'Leaf': 'Leaf', 'Leather': 'Leather', 'Magic': 'MagicJade',
  'Nylon': 'Nylon', 'Platinum': 'Platinum', 'Pure Iron': 'PureIron', 'Quartz (Crystal)': 'Crystal',
  'Rock': 'Rock', 'Silicon': 'Silicon', 'Silver': 'Silver', 'Steel': 'Steel', 'Sulfur': 'Sulfur',
  'Tin': 'Tin', 'Titanium': 'Titan', 'Wood': 'Wood', 'Lead': 'Lead', 'Canine': 'Shell',
  'Water (Type 1)': 'Water', 'Water (Type 2)': 'WaterUndrinkable',
};

// WLOHUB subtype → our slot key. "Special" is the accessory ring/necklace/medal slot;
// DiamondSpar items are crafting spars, which we already file as material.
const SLOT = {
  Body: 'armor', Head: 'helm', Arm: 'bracer', Shoes: 'boots', Special: 'accessory',
  Blade: 'blade', Sword: 'sword', Wand: 'staff', Spear: 'spear', Ax: 'axe', Club: 'hammer',
  Claw: 'claw', Bow: 'bow', Fan: 'fan', DiamondSpar: 'material', Item: 'material',
  Decor: 'manufacture',
};

const STAT = {
  atk: 'ATK', def: 'DEF', matk: 'MATK', mdef: 'MDEF', spd: 'SPD',
  maxhp: 'HP', hp: 'HP', maxsp: 'SP', sp: 'SP',
};

const slug = (s) => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const read = (f) => fs.readFileSync(f, 'utf8').trim().split('\n').map((line) => {
  // stats themselves contain " | ", so split off the first five fields and keep the rest
  const p = line.split('|');
  const [id, name, lv, rank, typeSub, base] = p;
  const stats = p.slice(6).join('|').trim();
  return { id, name: name.trim(), lv: +lv, rank: +rank, typeSub, base, stats };
});

const rows = [
  ...read('scratch/wlohub_highrank.tsv'),
  ...read('scratch/wlohub_manufacture.tsv'),
];

const compounds = JSON.parse(fs.readFileSync('content/data/compounds.json', 'utf8'));
// Dedupe against materials.json too: a name that exists there already has a source and a Thai
// name, and the compound table suppresses a material row whose name it also holds.
const materials = JSON.parse(fs.readFileSync('content/data/materials.json', 'utf8'));
const haveName = new Set([...compounds, ...materials].map((r) => r.name.en.toLowerCase()));
const haveId = new Set(compounds.map((r) => r.id));

const added = [];
const skipped = { alreadyHave: [], noFamily: [], noSlot: [] };
const unmodelled = new Set();

for (const r of rows) {
  if (haveName.has(r.name.toLowerCase())) { skipped.alreadyHave.push(r.name); continue; }

  const sub = (r.typeSub.match(/\[([^\]]+)\]/) || [])[1] || '';
  // Manufacture is its own slot, whatever WLOHUB files the subtype as.
  const slot = r.typeSub.startsWith('Manufacture') ? 'manufacture' : SLOT[sub];
  if (!slot) { skipped.noSlot.push(`${r.name} (${r.typeSub})`); continue; }

  // split on " / " only — "White/Yellow Clay" is one base name, not two
  const bases = r.base.split(' / ').map((b) => b.trim()).filter(Boolean);
  const mapped = bases.map((b) => FAMILY[b] || null);
  if (!mapped[0]) { skipped.noFamily.push(`${r.name} (${bases[0]})`); continue; }

  // A base we do not model as a family is recorded in the note rather than dropped silently.
  const missing = bases.filter((b, i) => !mapped[i]);
  missing.forEach((b) => unmodelled.add(b));

  const stats = [];
  for (const m of r.stats.matchAll(/([A-Za-z]+)\s*([+-]\s*\d+)/g)) {
    const key = STAT[m[1].toLowerCase()];
    if (key) stats.push({ stat: key, v: +m[2].replace(/\s+/g, '') });
  }

  let id = `${mapped[0].toLowerCase()}-${slug(r.name)}-r${r.rank}`;
  while (haveId.has(id)) id += '-b';
  haveId.add(id);

  added.push({
    id,
    family: mapped[0],
    secondary: mapped.slice(1).filter(Boolean),
    rank: r.rank,
    lv: r.lv,
    slot,
    name: { en: r.name, cn: null, th: null },
    stats,
    statsNote: null,
    statsRaw: r.stats === 'N/A' ? null : r.stats,
    // WLOHUB's compound database does not reach these ranks. An empty recipe is honest;
    // a guessed one would be worse than the blank.
    recipe: null,
    confidence: 'LEGACY',
    source: 'wlohub',
    sourceUrl: `https://wlohub.com/items/${r.id}`,
    updated: '2026-09-12',
    familyCoverage: 'complete',
    thConfirmed: false,
    note: missing.length
      ? `Also built on ${missing.join(' + ')}, which this site does not model as a structural family yet.`
      : null,
  });
}

// Families that now reach past 30 are no longer "partial to rank 30" — the ≤ 30 badge on the
// family heading keys off this, so it has to say complete, not merely lose the old value.
const extended = new Set(added.map((r) => r.family));
let cleared = 0;
for (const r of compounds) {
  if (extended.has(r.family) && r.familyCoverage !== 'complete') { r.familyCoverage = 'complete'; cleared++; }
}

// Appended, not re-sorted: the table sorts client-side anyway, and reordering 853 existing rows
// would bury this change in a diff nobody can review.
const out = compounds.concat(added);
fs.writeFileSync('content/data/compounds.json', JSON.stringify(out, null, 1) + '\n');

console.log('added', added.length, '| already had', skipped.alreadyHave.length,
  '| no slot', skipped.noSlot.length, '| no family', skipped.noFamily.length);
console.log('families extended:', [...extended].sort().join(', '));
console.log('"partial-to-rank-30" cleared on', cleared, 'existing rows');
if (unmodelled.size) console.log('bases we do not model:', [...unmodelled].join(', '));
if (skipped.noSlot.length) console.log('skipped (slot):', skipped.noSlot.join(' · '));
if (skipped.alreadyHave.length) console.log('skipped (already present):', skipped.alreadyHave.join(' · '));
