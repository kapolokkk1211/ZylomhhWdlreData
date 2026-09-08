// Recipe-string parser and resolver for the simulator. Pure JS, runs in the browser.
//
// A recipe string from the community sheet looks like one of:
//   "Bone Steel Sword + r21 Wood + book"
//   "Iron Hemp Shoes + Black Jade, Tough Leather + Purple Jade"      (two alternatives)
//   "Refined Steel Shoes / Steel Spear / Full-Moon Claws + Adv. Thorn Club"  (options for slot 1)
//   "5★+5 Iron+Vol.2 · 7★+7 Iron · 9★+9 Iron (Australia)"
//   "Buy — Egypt"   "Stone monster drop"   "Same-rank pairing + book"
//
// parseRecipe → [{ ingredients: [{ options: [{ text, note }] }] }]   (one entry per alternative)
// resolve(text, index) → node

const FAMILY_WORDS = {
  steel: 'Steel', iron: 'Iron', copper: 'Copper', 'pure iron': 'PureIron', 'red iron': 'PureIron',
  alum: 'Alum', aluminium: 'Alum', aluminum: 'Alum', titan: 'Titan', titanium: 'Titan',
  gold: 'Gold', silver: 'Silver', platinum: 'Platinum', tin: 'Tin', lead: 'Lead', rock: 'Rock',
  wood: 'Wood', grass: 'Grass', flower: 'Flower', leaf: 'Leaf', nylon: 'Nylon',
  leather: 'Leather', fur: 'Fur', feather: 'Feather', bone: 'Bone', shell: 'Shell',
  crystal: 'Crystal', gem: 'Gem', diamond: 'Diamond', jade: 'Jade', 'magic jade': 'MagicJade',
  cluster: 'Cluster', gum: 'Gum', star: 'Star', water: 'Water', meat: 'Meat', misc: null,
};
const CN_FAMILY = {
  鋼: 'Steel', 鐵: 'Iron', 銅: 'Copper', 錫: 'Tin', 鋁: 'Alum', 鈦: 'Titan', 鉛: 'Lead', 金: 'Gold', 銀: 'Silver',
  白: 'Platinum', 赤: 'PureIron', 皮: 'Leather', 毛: 'Fur', 花: 'Flower', 草: 'Grass', 葉: 'Leaf', 木: 'Wood',
  晶: 'Crystal', 寶: 'Gem', 鑽: 'Diamond', 魔: 'MagicJade', 玉: 'Jade', 石: 'Rock', 骨: 'Bone', 結: 'Cluster',
  尼: 'Nylon', 羽: 'Feather', 殼: 'Shell', 星: 'Star', 膠: 'Gum', '★': 'Star',
};

// Short forms the sheet uses for well-known items.
const ALIASES = {
  'cypress': 'Cypress Wood',
  'steel mat.': 'Steel Material', 'steel mat': 'Steel Material',
  'bronze mat.': 'Bronze Material', 'bronze mat': 'Bronze Material',
  'copper mat.': 'Copper Material', 'copper mat': 'Copper Material',
  'wood mat.': 'Ordinary Wood',
  'copper crown': 'Copper Mage Crown',
  'forest staff': 'Forest Spirit Staff',
  'adv. thorn club': 'Advanced Thorn Iron Club', 'adv thorn club': 'Advanced Thorn Iron Club',
  'thorn club': 'Thorn Iron Club',
  'sea blue scale': 'Sea Blue Scale Armor', 'sea blue armor': 'Sea Blue Scale Armor',
  'mithril': 'Mithril Armor',
  'elf staff': 'Elf Mage Staff', 'demon staff': 'Demon Mage Staff',
  'evil dragon blade': 'Evil Dragon Venom Blade',
  'yaksha blade': 'Yaksha Demon Blade',
  'steel plate': 'Steel Plate Armor',
  "knight's boots": "Knight's Long Boots",
  'wolf fang rod': 'Wolf Fang Iron Rod',
  'indian sabre': 'Indian Curved Blade',
  'katana': 'Samurai Blade',
  'immaculate ruby': 'Flawless Ruby', 'immaculate sapphire': 'Flawless Sapphire',
  'full-moon claws': 'Full-Moon Twin Claws',
  'strong guard': 'Strong Guard War Armor',
  'sky war boots': 'Sky War Boots',
  'spiked bracers': 'Steel Thorn Bracers',
  'grey steel guards': 'Grey Steel Guards',
  'blue crystal staff': 'Blue Crystal Mage Staff',
  'twin claws': 'Full-Moon Twin Claws',
  'star dust': 'Star Dust · Sky',
};

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const words = (s) => norm(s).replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);

export function parseRecipe(str) {
  if (!str || str === '—') return [];
  // alternatives: ; · , — but never split inside parentheses
  const alts = splitTop(str, /\s*[;·,]\s*/);
  return alts
    .map((alt) => {
      const ings = splitTop(alt, /\s*\+\s*/).map((ing) => {
        const options = splitTop(ing, /\s*\/\s*/).map((opt) => {
          const m = opt.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
          return m ? { text: m[1].trim(), note: m[2].trim() } : { text: opt.trim(), note: null };
        });
        return { options: options.filter((o) => o.text) };
      });
      return { ingredients: ings.filter((i) => i.options.length) };
    })
    .filter((a) => a.ingredients.length);
}

function splitTop(s, re) {
  // Split on `re` only at parenthesis depth 0. Separators inside (...) are protected.
  const out = [];
  let depth = 0;
  let cur = '';
  const flush = () => { if (cur.trim()) out.push(cur.trim()); cur = ''; };
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if (depth === 0) {
      const m = s.slice(i).match(re);
      if (m && m.index === 0 && m[0].length > 0) {
        flush();
        i += m[0].length;
        continue;
      }
    }
    cur += ch;
    i++;
  }
  flush();
  return out;
}

/** Build lookup indexes once. rows = compact compound rows, mats = compact materials. */
export function buildIndex(rows, mats) {
  const byName = new Map();
  const byFamRank = new Map();
  const add = (key, node) => { if (!byName.has(key)) byName.set(key, node); };
  const famKey = (f, r) => `${f}:${r}`;

  for (const r of rows) {
    const node = { kind: 'item', row: r, family: r[1], rank: r[3], en: r[6], cn: r[7], th: r[8] };
    add(norm(r[6]), node);
    add(norm(r[7]), node);
    const k = famKey(r[1], r[3]);
    if (!byFamRank.has(k)) byFamRank.set(k, []);
    byFamRank.get(k).push(node);
  }
  for (const m of mats) {
    const node = { kind: 'material', mat: m, family: m.family, rank: m.rank, en: m.name.en, cn: m.name.cn, th: m.name.th };
    // materials may share a name with a compound row (e.g. shop items); compound wins on exact
    // name, but material rows are still listed under family+rank.
    if (!byName.has(norm(m.name.en))) byName.set(norm(m.name.en), node);
    if (m.name.cn && !byName.has(norm(m.name.cn))) byName.set(norm(m.name.cn), node);
    const k = famKey(m.family, m.rank);
    if (!byFamRank.has(k)) byFamRank.set(k, []);
    byFamRank.get(k).push(node);
  }
  const wordIndex = [...byName.entries()].map(([k, n]) => ({ k, w: words(k), n }));
  return { byName, byFamRank, wordIndex, mats };
}

/** Resolve one ingredient text to a node. */
export function resolve(text, idx) {
  const t = text.trim();
  const n = norm(t);

  // encyclopedia
  if (/^book$/.test(n) || /^\+?\s*book$/.test(n)) return { kind: 'book', vol: null, en: 'Alchemy Encyclopedia (any volume)' };
  const vol = n.match(/^vol\.?\s*(\d)$/);
  if (vol) return { kind: 'book', vol: Number(vol[1]), en: `Alchemy Encyclopedia Vol.${vol[1]}` };

  // shop
  const buy = t.match(/^buy\s*(?:—|-)?\s*(.+)$/i);
  if (buy) return { kind: 'shop', town: buy[1].trim(), en: `Buy — ${buy[1].trim()}` };

  // "rNN Family", "NN Family", "NN★", "25赤"
  const fr = t.match(/^r?(\d{1,2})\s*(★|[一-鿿]|[A-Za-z][A-Za-z .]*?)$/);
  if (fr) {
    const rank = Number(fr[1]);
    const famRaw = fr[2].trim();
    const family = CN_FAMILY[famRaw] || FAMILY_WORDS[norm(famRaw)] || FAMILY_WORDS[norm(famRaw).replace(/\.$/, '')] || null;
    if (family || famRaw === '★') {
      const cands = idx.byFamRank.get(`${family}:${rank}`) || [];
      return { kind: 'family', family, rank, en: `${rank} ${family}`, candidates: cands };
    }
  }

  // exact / alias
  const alias = ALIASES[n];
  const hit = idx.byName.get(alias ? norm(alias) : n);
  if (hit) return hit;

  // fuzzy: all words of the token appear in a name, prefer shortest name
  const tw = words(t).filter((w) => !['mat', 'material', 'adv', 'advanced'].includes(w));
  if (tw.length) {
    let best = null;
    for (const e of idx.wordIndex) {
      if (!tw.every((w) => e.w.includes(w))) continue;
      if (!best || e.w.length < best.w.length) best = e;
    }
    if (best) return { ...best.n, fuzzy: true, matchedFrom: t };
  }

  return { kind: 'text', en: t };
}

/** One level: parse this item's recipe and resolve each ingredient option. */
export function expandOne(node, idx) {
  if (!node || node.kind !== 'item' || node.alts) return node;
  const recipeText = node.row[10];
  const alts = parseRecipe(recipeText).map((alt) => ({
    ingredients: alt.ingredients.map((ing) => ({
      options: ing.options.map((opt) => ({ ...opt, node: resolve(opt.text, idx) })),
    })),
  }));
  return { ...node, recipe: recipeText, alts };
}
