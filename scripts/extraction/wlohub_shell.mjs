/* The กระดอง (Shell / 硬殼) family was nearly empty: six compound rows and not one raw material.
 * KK noticed หนวดมด (Ant Antennae) was missing, which turned out to be one of twenty.
 *
 * WLOHUB files this family as base "Canine" — verified, not assumed: its Beetle Horn is our
 * Shell r2 and its Crab Shell our Shell r6, same names at the same ranks.
 *
 * Drop data comes from each item's "Where To Find" tab. Items WLOHUB marks "Unobtainable via
 * Standard Methods" get sources: [] and render as ยังไม่ทราบแหล่งที่มา — the honest blank the
 * rest of the material index already uses.
 */
import fs from 'fs';

const M = (mob, lv, where) => ({ type: 'drop', mob, lv, where: where || null, provenance: 'legacy-wlohub' });

// [wlohubId, English, rank, Thai, sources]
const ROWS = [
  [500,  'Beak',                1, 'จะงอยปาก',            [M('Green Bat', 64, 'Bangkok / Cairo / Lion Island / Philippines'), M('Turquoise Bat', 82, null)]],
  [333,  'Deep-Sea Fish Scale',  1, 'เกล็ดปลาทะเลลึก',      []],
  [855,  'Fresh Fish Scale',     1, 'เกล็ดปลาสด',          []],
  [310,  'Jelly Fish',           1, 'แมงกะพรุน',           [M('Cute Jellyfish', 14, 'North Island'), M('Easy Jellyfish', 15, null)]],
  [854,  'Pest Tentacles',       1, 'หนวดแมลงศัตรูพืช',     [M('Butterfly', 51, 'Inca')]],
  [3149, 'Sea Fish Scale',       1, 'เกล็ดปลาทะเล',        []],
  [332,  'Shell',                1, 'เปลือกหอย',           []],
  [346,  'Starfish Tentacles',   1, 'หนวดปลาดาว',          [M('Flattened Starfish', 51, 'Inca')]],
  [3139, 'Anemones Tentacles',   2, 'หนวดดอกไม้ทะเล',      [M('Neritic Seaflower', 5, 'North Island'), M('River Seaflower', 3, null)]],
  [2,    'Ant Antennae',         2, 'หนวดมด',              [M('Ant', 21, 'Subway'), M('Blue Pangolin', 122, null)]],
  [3135, 'Ant Tooth',            2, 'ฟันมด',               [M('Fire Pangolin', 123, 'Rome'), M('Green Pangolin', 125, null)]],
  [3087, 'Conch Roes',           2, 'ไข่หอยสังข์',          []],
  [3136, 'Conch Shell',          2, 'เปลือกหอยสังข์',       []],
  [3137, 'Grume of Snail',       2, 'เมือกหอยทาก',         [M('Hard Shell Snail', 8, 'North Island'), M('Lazy Snail', 2, null)]],
  [3060, 'Hard Shell',           2, 'เปลือกแข็ง',          [M('Water Mantis', 69, 'Cairo / Egypt'), M('Swift Snail', 9, null)]],
  [3121, 'Rhinoceros Skin',      4, 'หนังแรด',             []],
  [3118, 'Lion Claw',            5, 'กรงเล็บสิงโต',        [M('Lion (Quest)', 86, 'African Villages')]],
  [3138, 'Red Coral',            5, 'ปะการังแดง',          [M('Old Seaflower', 51, 'Oslya / Philippines')]],
  [1669, 'Raptor Tooth',         9, 'ฟันแรปเตอร์',         []],
];

const slug = (s) => s.toLowerCase().replace(/['’()]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const mats = JSON.parse(fs.readFileSync('content/data/materials.json', 'utf8'));
const comps = JSON.parse(fs.readFileSync('content/data/compounds.json', 'utf8'));
const have = new Set([...mats, ...comps].map((r) => r.name.en.toLowerCase()));

const added = [];
for (const [wid, en, rank, th, sources] of ROWS) {
  if (have.has(en.toLowerCase())) { console.log('skip (already present):', en); continue; }
  added.push({
    id: `shell-r${rank}-${slug(en)}`,
    family: 'Shell',
    rank,
    name: { en, cn: null, th },
    sources,
    flags: { cheapestOfFamily: false, highestBuyable: false, keyMaterial: false, priceConfirmedRe: false },
    confidence: 'LEGACY',
    note: null,
    updated: '2026-09-13',
    thConfirmed: false,
    sourceUrl: `https://wlohub.com/items/${wid}`,
  });
}

// Keep the file grouped by family: slot the new rows in after the last existing Shell row,
// or after the last row of the family that precedes it in the file.
const lastShell = mats.reduce((acc, r, i) => (r.family === 'Shell' ? i : acc), -1);
if (lastShell >= 0) mats.splice(lastShell + 1, 0, ...added);
else mats.push(...added);

fs.writeFileSync('content/data/materials.json', JSON.stringify(mats, null, 1) + '\n');
const withSrc = added.filter((r) => r.sources.length).length;
console.log(`added ${added.length} กระดอง materials · ${withSrc} with a drop source · ${added.length - withSrc} source unknown`);
