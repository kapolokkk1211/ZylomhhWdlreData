// One-time cleanup: the material index carried a Re-sheet town attribution and a
// legacy WLO price as two separate shop entries for the same town, which rendered
// as two duplicate rows. Merge them into one shop source that keeps both provenances.
import fs from 'fs';
const p = 'content/data/materials.json';
const rows = JSON.parse(fs.readFileSync(p, 'utf8'));
let merged = 0;
for (const r of rows) {
  const shops = new Map();
  const rest = [];
  for (const s of r.sources) {
    if (s.type !== 'shop') { rest.push(s); continue; }
    const prev = shops.get(s.town);
    if (!prev) {
      shops.set(s.town, {
        type: 'shop',
        town: s.town,
        price: s.price ?? null,
        priceProvenance: s.price != null ? s.provenance : null,
        provenance: s.provenance,
      });
      continue;
    }
    merged++;
    if (prev.price == null && s.price != null) {
      prev.price = s.price;
      prev.priceProvenance = s.provenance;
    } else if (s.provenance === 're-sheet' && s.price != null) {
      prev.price = s.price;
      prev.priceProvenance = 're-sheet';
    }
    if (s.provenance === 're-sheet') prev.provenance = 're-sheet';
  }
  r.sources = [...shops.values(), ...rest];
}
fs.writeFileSync(p, JSON.stringify(rows, null, 1));
console.log('duplicate shop entries merged:', merged);
console.log('rows with >1 shop for the same town remaining:',
  rows.filter(r => new Set(r.sources.filter(s=>s.type==='shop').map(s=>s.town)).size
    !== r.sources.filter(s=>s.type==='shop').length).length);
