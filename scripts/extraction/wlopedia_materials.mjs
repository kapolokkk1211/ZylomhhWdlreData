/* One-time ingest: base materials recovered from wlopedia.com's item database
   (a Re-relaunch English fan DB) plus the legacy Bahamut alchemy encyclopedia.
   Research + caveats: project KB `22-base-material-ladder-research.md`.

   These rows carry NO source (shop/drop/gather) — wlopedia lists the item and its
   rank but not where it comes from. `sources: []` is deliberate and honest; the
   material page hides them behind its "sold in shops" filter, and the compound
   page shows them with "source unknown". Fill a source in when one is found.

   Run:  node scripts/extraction/wlopedia_materials.mjs
   Then: node scripts/extraction/th_names.mjs && node scripts/extraction/th_recipes.mjs
*/
import fs from 'fs';

const P = 'content/data/materials.json';
const mats = JSON.parse(fs.readFileSync(P, 'utf8'));
const comps = JSON.parse(fs.readFileSync('content/data/compounds.json', 'utf8'));

const taken = new Set([...mats, ...comps].map((r) => r.name.en.toLowerCase()));
const ids = new Set(mats.map((r) => r.id));

// family -> [[rank, ...English names]]
const LADDER = {
  Water: [[1, 'Sea Water'], [2, 'Fresh Water', 'Mineral Water', 'Pure Water'],
          [3, 'Boiled Water', 'Distilled Water', 'Bottled Boiled Water'],
          [4, 'Hot Water', 'Bottled Hot Water']],
  Platinum: [[5, 'Magnet'], [6, 'Magnetic Powder'], [9, 'White Silvery Ore'], [10, 'White Silvery']],
  Silver: [[9, 'Silvery Sand'], [14, 'Bullion (Silver)']],
  Diamond: [[10, 'Diamond']],
  Cluster: [[1, 'Sugar']],
  Silicon: [[6, 'Silicon']],
  Nylon: [[4, 'Rough Nylon'], [6, 'Weave Nylon'], [10, 'Delicate Nylon'], [14, 'Thin Nylon']],
  Iron: [[4, 'Iron Sand']],
  PureIron: [[7, 'Pure Iron Fillet'], [10, 'Refined Iron Sand'], [14, 'Delicate Hematite']],
  Grass: [[3, 'Soft Bine'], [10, 'Snow Grass']],
  Gem: [[5, 'Sapphire', 'Ruby']],
  Leaf: [[1, 'Tobacco', 'Tea', 'Fox Leaf'],
         [2, 'Vine', 'Daphne', 'Reed', 'Areca', 'Turpentine', 'Pine'],
         [4, 'Small Leaf'], [7, 'River Boy Leaf'], [10, 'Oolong Tea'], [14, 'Jade Tea']],
  Flower: [[1, 'Rose', 'Chrysanthemum', 'Yaro Safflower', 'Orchid', 'Alocasia Macrorrhiza',
            'Sunflower', 'Small Daisy', 'Blue Wild Flower', 'Pollen'],
           [2, 'White Flower', 'Nectar', 'Fruit Pollen'],
           [3, 'Persian Mum', 'Fruit Nectar'], [4, 'Red Flower'], [6, 'Golden Flower'],
           [10, 'White Rose'], [14, 'Purple Rose']],
  Leather: [[1, 'Dry Skin', 'Dog Skin', 'Hedgehog Fur'],
            [2, 'Pig Skin'],
            [3, 'Goatskin', 'Capeskin', 'Black Sheepskin', 'White Sheepskin', 'Deerskin'],
            [4, 'Buffalo Skin', 'Small Buffalo Skin', 'Scalper Skin', 'Small Scalper Skin',
                'Urus Skin', 'Small Urus Skin'],
            [6, 'Green Snake Skin', 'White Snake Skin', 'Fire Snake Skin', 'Yellow Snake Skin',
                'Wolf Fur', 'Dinosaur Fur'],
            [8, 'Tiger Skin'], [9, 'White Tiger Skin', 'Northern Tiger Skin', 'Dark Tiger Skin'],
            [10, 'Fine Fur'], [14, 'Fine Leather'], [18, 'Delicate Leather']],
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const added = [];
const skipped = [];

for (const [family, rungs] of Object.entries(LADDER)) {
  for (const [rank, ...names] of rungs) {
    for (const en of names) {
      if (taken.has(en.toLowerCase())) { skipped.push(`${family} r${rank} ${en}`); continue; }
      let id = `${slug(family)}-r${rank}-${slug(en)}`;
      while (ids.has(id)) id += '-2';
      ids.add(id);
      taken.add(en.toLowerCase());
      added.push({
        id,
        family,
        rank,
        name: { en, cn: null, th: null },
        sources: [],
        flags: { cheapestOfFamily: false, highestBuyable: false, keyMaterial: false, priceConfirmedRe: false },
        confidence: 'RE-reported',
        note: null,
        updated: '2026-09-09',
      });
    }
  }
}

const out = [...mats, ...added].sort((a, b) => a.family.localeCompare(b.family) || a.rank - b.rank);
fs.writeFileSync(P, JSON.stringify(out, null, 1) + '\n');
console.log(`added ${added.length} materials, skipped ${skipped.length} already present`);
console.log('now', out.length, 'materials');
if (skipped.length) console.log('skipped:', skipped.join(' · '));
