// Fill recipe.th for every compound by re-rendering the parsed English recipe with Thai
// names: item/material tokens → their name.th, "r21 Wood" → "ไม้ r21", books, shops, and
// plain text left as is. Re-run after th_names.mjs.
import fs from 'fs';
import { parseRecipe, buildIndex, resolve } from '../../lib/recipe.js';

const comp = JSON.parse(fs.readFileSync('content/data/compounds.json', 'utf8'));
const mats = JSON.parse(fs.readFileSync('content/data/materials.json', 'utf8'));
const codes = JSON.parse(fs.readFileSync('content/data/codes.json', 'utf8'));
const towns = JSON.parse(fs.readFileSync('content/data/towns.json', 'utf8'));
const famTh = Object.fromEntries(codes.families.map((f) => [f.key, f.name.th || f.name.en]));

const rows = comp.map((r) => [r.id, r.family, r.secondary, r.rank, r.lv, r.slot, r.name.en, r.name.cn, r.name.th, r.statsRaw, r.recipe.en, r.recipe.th, r.confidence, r.familyCoverage, r.line || null, 0, 0, null, 0, r.band || null, []]);
const matsC = mats.map((m) => ({ id: m.id, family: m.family, rank: m.rank, name: m.name }));
const idx = buildIndex(rows, matsC);

const townTh = (t) => {
  const k = t.toLowerCase();
  const hit = towns.find((x) => x.name.en.toLowerCase().startsWith(k) || k.startsWith(x.name.en.toLowerCase().split(' ')[0]) || x.name.cn === t);
  return hit ? hit.name.th || hit.name.en : t;
};

function thToken(text) {
  const n = resolve(text, idx);
  if (n.kind === 'item') return n.th || n.en;
  if (n.kind === 'material') return n.mat.name.th || n.mat.name.en;
  if (n.kind === 'family') return `${famTh[n.family] || n.family} r${n.rank}`;
  if (n.kind === 'book') return n.vol ? `หนังสือเล่ม ${n.vol}` : 'หนังสือเล่นแร่';
  if (n.kind === 'shop') return `ซื้อ — ${townTh(n.town)}`;
  return text;
}
const TEXT_TH = {
  'Same-rank pairing': 'จับคู่เลเวลเดียวกัน', 'Stone monster drop': 'ดรอปจากมอนสเตอร์หิน', 'Hot Kiln': 'เตาเผาร้อน',
  'Melting Furnace': 'เตาหลอม', 'Crystal Furnace': 'เตาคริสตัล', 'Gathering': 'เก็บเอง', 'gathering': 'เก็บเอง',
  'Mining / gathering': 'ขุด / เก็บเอง', 'misc': 'อื่น ๆ', 'Advanced Alchemy Scroll (RE)': 'สกรอลล์เล่นแร่ขั้นสูง (RE)',
  'buy 8-12': 'ซื้อที่ 8-12', 'Low-tier wood pairing': 'จับคู่ไม้เลเวลต่ำ', 'Wood pairing': 'จับคู่ไม้', 'Flower-type pairing': 'จับคู่ประเภทดอกไม้',
  'Kelan trial quest reward': 'รางวัลเควสทดสอบเคลัน', 'Volcano event reward': 'รางวัลอีเวนต์ภูเขาไฟ', 'Iceberg gathering': 'เก็บที่ภูเขาน้ำแข็ง',
  'Lead Ore pairing': 'จับคู่แร่ตะกั่ว', 'Rope Saw': 'เลื่อยเชือก', 'Anvil': 'ทั่ง', 'Iron Bar': 'แท่งเหล็ก', 'Pure Iron Bar': 'แท่งเหล็กแดง',
  'scales with equip rank': 'เพิ่มตามเลเวลไอเทม', 'Stardust set': 'เซ็ตฝุ่นดาว', 'Starmark set': 'เซ็ตรอยดาว', 'Starshadow set': 'เซ็ตเงาดาว',
  'no secondary': 'ไม่มีวัสดุรอง', 'Whale Island monster drops': 'ดรอปจากมอนสเตอร์เกาะวาฬยักษ์',
};

let done = 0;
for (const r of comp) {
  const alts = parseRecipe(r.recipe.en);
  if (!alts.length) { r.recipe.th = r.recipe.en; continue; }
  r.recipe.th = alts
    .map((a) => a.ingredients.map((ing) => ing.options.map((o) => {
      const t = TEXT_TH[o.text] || thToken(o.text);
      return o.note ? `${t} (${o.note})` : t;
    }).join(' / ')).join(' + '))
    .join(' · ');
  done++;
}
fs.writeFileSync('content/data/compounds.json', JSON.stringify(comp, null, 1));
console.log('recipes translated:', done);
console.log('sample:', comp.filter((r) => r.recipe.th).slice(30, 36).map((r) => `${r.name.th}: ${r.recipe.th}`).join('\n  '));
