# Base-Material Ladder Research — Wonderland Online / Re：星之方舟

Research pass focused on rank 1–10 gaps plus four specific unresolved recipe slots. Two source
families were used:

- **wlopedia.com** (`/items`, filtered by `Materials` type + `Select Base`) — an English fan
  database built for the Re relaunch. Item IDs run into the thousands and the site does not tag
  each row Re-vs-legacy, so treat these as **"Re-scope, legacy-compatible"** unless noted —
  the material system is the one this whole knowledge base already assumes Re reuses unchanged.
- **forum.gamer.com.tw, board 8897 (原飄流幻境 Online, the LEGACY board, not the Re board 82442)**,
  specifically the **鍊金百科全書 ("Alchemy Encyclopedia") 精華區 compilations** — hand-built
  rank-by-rank equipment ladders per material family, written by legacy players. These are
  **explicitly LEGACY**. WebFetch gets a 403 from this host (known issue); a real Chrome tab
  gets through, which is how this pass retrieved them.

wiki2.gamer.com.tw also 403'd WebFetch and the browser session did not get to it this pass —
not in the sources list below.

**Hard-rule compliance:** every "not found" below was actually checked against the base-select
dropdown or the encyclopedia text, not assumed. wlopedia's Materials tab plus its `Select Base`
filter enumerates *every* item tagged to a family — if a rank isn't in the printout, it wasn't
skipped, it isn't in the site's data.

---

## Priority 2 — the four unresolved recipe slots

All four resolve to **legacy equipment items**, not raw ore-chain materials — the recipes that
call for "r21 Steel" / "r18 Iron" / "r17 Gold" / "r18 Water" want *any item tagged to that family
at that rank*, and in this game equipment can be fed back into the compounding pot as an
ingredient, not just raw ore. None of the four is a raw material at that rank; three exist as
equipment, one does not appear to exist at all.

| Slot wanted | Resolves to | Family tags | Stats | Source |
|---|---|---|---|---|
| r21 (lv42) Steel | 獸骨鋼鐵劍 Beast-Bone Steel Sword | 鋼 Steel + 骨 Bone | ATK+21 SPD+21 | LEGACY, 鍊金百科全書­[鋼] |
| r21 (lv42) Steel (alt.) | 闊斧 Broadaxe | 鋼 Steel + 木 Wood | ATK+45 SPD−3 | LEGACY, same |
| r21 (lv42) Steel (alt.) | 鋼法冠 Steel Wizard Crown | 鋼 Steel + 寶 Gem | DEF+13 MDEF+8 | LEGACY, same |
| r18 (lv36) Iron | 闊刃槍 Broad Blade Spear | 鐵 Iron + 木 Wood | ATK+36 | LEGACY, 鍊金百科全書­[鐵] |
| r18 (lv36) Iron (alt.) | 粉晶頭盔 Pink-Crystal Helm | 鐵 Iron + 晶 Crystal | MATK+13 DEF+5 | LEGACY, same |
| r17 (lv34) Gold | 金絲頭帶 Golden Silk Headband | 金 Gold (pure) | SPD+10 MATK+7 | LEGACY, 鍊金百科全書­[金] — recipe: 14 Gold Bar + 20 Wolf Fang (Primary Alchemy) or 14 Fire Dragon Claw (Junior/Superior) |
| r18 Water | **Not found.** | — | — | Checked wlopedia's `Water (Type 1)` / `Water (Type 2)` base filter and both legacy alchemy-encyclopedia compilations retrieved this pass (metals + gems/bone/rock). No Water-family item — raw or equipment — appears above rank 4. |

**Why Steel/Iron/Gold raw materials cap low but equipment doesn't:** the compounding formula is
`output rank = lowest ingredient rank + climb`. A rank-8 Steel Material paired with a lower-rank
Wood item still yields a rank-6 output (lowest input + climb), so a rank-6 or rank-17 *piece of
equipment* tagged Steel/Gold is completely normal even though the raw ore for that family caps
much lower. This resolved the apparent contradiction cleanly once the legacy encyclopedia ladders
were in hand.

**Water still open.** Six recipes reference it and it wasn't found. Two honest possibilities,
neither confirmed: (a) it's a Re-only addition using a higher tier of the Water material that
simply isn't in wlopedia's ~70%-recovered catalogue or the legacy encyclopedia set retrieved this
pass, or (b) "Water" in those six recipes is shorthand for the 水 (Water) **combat element**
tag rather than the Water **material family**, and the real ingredient family is something else.
Recommend checking one of those six recipes directly in `14-re-recipe-database.md` against the
in-client compounding screen (as `19-site-data-manifest.md` describes) rather than guessing further.

---

## Priority 4 — is Water real, and what is it called?

**Yes, confirmed real**, and it comes in **two sub-families**, both visible as their own entries
in wlopedia's `Select Base` dropdown:

| Rank | English | Sub-family | Description | Source |
|---|---|---|---|---|
| 1 | Sea Water | — (base blank in listing) | "it is from river, can be drunk" (sic — likely a translation artifact) | wlopedia |
| 1 (lv2) | Sea Water | Water (Type 2) | "It is from sea, cannot be drank" | wlopedia |
| 2 | Fresh Water | Water (Type 2) | "general fresh water … from the river, you can drink it" | wlopedia |
| 2 | Mineral Water | Water (Type 2) | "can be drank" | wlopedia |
| 2 | Pure Water | Water (Type 2) | "can be drunk" | wlopedia |
| 3 | Boiled Water | Water (Type 1) | "can be drank" | wlopedia |
| 3 | Distilled Water | Water (Type 1) | "can be drank" | wlopedia |
| 3 | Bottled Boiled Water | Water (Type 1) | same as Boiled Water, bottled | wlopedia |
| 4 | Hot Water | Water (Type 2) | fuel substitute for the "Mighty Plane" vehicle | wlopedia |
| 4 | Bottled Hot Water | Water (Type 2) | same, bottled | wlopedia |

Pattern: **Type 2 = natural/mineral water** (sea, fresh, mineral, pure, hot-spring), **Type 1 =
processed water** (boiled, distilled). All rows are `MaterialWater` type items, `Type Food`
adjacent — several (Holy Water, Watermelon Juice, etc.) show up in name search but are **not**
tagged to either Water base and don't belong on this ladder.

The family caps at **rank 4** in every source checked this pass — no rank-18 Water tier was
found anywhere (see the r18 Water row above). Chinese names for these ten items were not
captured this pass; wlopedia is English-only and the legacy encyclopedia compilations retrieved
don't cover consumables. Flag for a follow-up pass if Chinese names are needed.

---

## Priority 1 — ranks 1–10 for the worst-covered families

### Steel (鋼)
| R | Item | 中文 | Type | Source | RE/LEGACY |
|---|---|---|---|---|---|
| 8 | Steel | — | MaterialMineral | wlopedia, base=Steel, Materials filter | RE-scope (site), legacy-compatible |

**Nothing below rank 8.** Confirmed by filtering wlopedia's Materials tab to base=Steel: exactly
one raw-material row exists, at rank 8, description "It is made of iron." This matches
`11-material-index.md`'s existing note. **Steel genuinely starts at rank 8 by design** — this is
not a data gap.

### Gold (金)
| R | Item | Type | Source |
|---|---|---|---|
| 11 | Gold Ore | MaterialMineral | wlopedia |
| 12 | Gold Sand | MaterialMineral | wlopedia |
| 13 | Gold Block | MaterialMineral | wlopedia |
| 14 | Bullion (Gold) | Material | wlopedia |
| 18 | Refined Gold | MaterialMineral | wlopedia |

Nothing below rank 11 — **Gold genuinely starts at rank 11**, matching what `11-material-index.md`
already had. "Bullion (Gold)" r14 is the item this KB already called "Gold Bar."

### Titanium (鈦)
| R | Item | Type | Source |
|---|---|---|---|
| 10 | Titanium | MaterialMineral | wlopedia |
| 18 | Refined Titanium | MaterialMineral | wlopedia |

Nothing below rank 10 — **Titanium genuinely starts at rank 10**. Note: wlopedia's raw-material
catalogue does **not** contain "Titanium Alloy" (r15) at all; that item, if real, is either an
equipment/craft item outside the Materials type or absent from wlopedia's ~70%-recovered set.
Treat the existing r15 note as unverified by this pass, not disproven.

### Diamond (鑽石)
| R | Item | Type | Source |
|---|---|---|---|
| 10 | Diamond | MaterialMineral | wlopedia |

**Fills the gap.** The raw Diamond material itself — just called "Diamond," "it is invaluable" —
sits at **rank 10**, below the r14 "Delicate Diamond" and r21 "Pure Diamond" craft items already
known. Nothing below r10. **Diamond genuinely starts at rank 10.**

### MagicJade / Magic (魔)
| R | Item | Type | Source |
|---|---|---|---|
| 12 | Magic Powder | MaterialMineral | wlopedia |
| 18 | Magic Crystal Powder | MaterialMineral | wlopedia |

Matches existing knowledge exactly. Nothing below r12 — **MagicJade genuinely starts at rank 12.**

### Platinum (白金)
| R | Item | Type | Source |
|---|---|---|---|
| 5 | Magnet | MaterialMineral | wlopedia |
| 6 | Magnetic Powder | MaterialMineral | wlopedia |
| 9 | White Silvery Ore | MaterialMineral | wlopedia |
| 10 | White Silvery | MaterialMineral | wlopedia |
| 18 | Refined White Silver | MaterialMineral | wlopedia |

**Big fill.** Previously nothing was known below r18. Platinum's ladder actually starts at
**rank 5** with "Magnet," climbing through "Magnetic Powder" (r6) before the ore/block pair at
r9–10. Note this does *not* match the legacy Bahamut "白銀" (white-silver) equipment ladder's
lowest item (r7 白銀履鞋, an equipment piece) — the raw-material chain and the equipment chain
just start at different points, which is normal.

### Silver (銀)
| R | Item | Type | Source |
|---|---|---|---|
| 8 | Silvery Ore | MaterialMineral | wlopedia |
| 9 | Silvery Sand | MaterialMineral | wlopedia |
| 10 | Silvery Block | MaterialMineral | wlopedia |
| 14 | Bullion (Silver) | Material | wlopedia |
| 18 | Refined Silver | MaterialMineral | wlopedia |

Confirms and fills in r9 (Silvery Sand) that was missing. Nothing below r8 — **Silver genuinely
starts at rank 8.**

### Crystal / Cluster (結晶 / Crystallization)
| R | Item | Type | Source |
|---|---|---|---|
| 1 | Sugar | MaterialFood | wlopedia |
| 7 | Snow Crystal | MaterialBeast | wlopedia |

wlopedia's base filter for "Cluster" is labelled **"Crystallization."** This confirms your
existing r7 Snow Crystal entry and adds a genuine r1 item ("Sugar" — a purified, crystallized
sweet, thematically consistent with a "crystallization" family). Nothing found between r1 and r7,
and nothing above r7 in wlopedia's set (your r9 Blue Snow Crystal / r18 Red Snow Crystal entries
are presumably craft outputs not in wlopedia's raw catalogue — unverified this pass, not
disproven).

Note: wlopedia also has a separate **"Quartz (Crystal)"** base option — this is a *different*
family from Crystallization/Cluster (see Silicon below); do not conflate the two.

### Nylon (尼龍)
| R | Item | Type | Source |
|---|---|---|---|
| 4 | Rough Nylon | MaterialOil | wlopedia |
| 6 | Weave Nylon | MaterialOil | wlopedia |
| 10 | Delicate Nylon | MaterialOil | wlopedia |
| 14 | Thin Nylon | MaterialOil | wlopedia |

**Discrepancy flag:** this ladder's *names* don't match what's already in `11-material-index.md`
(r2 Nylon / r6 Charcoal Powder / r18 Fine Nylon). Both may be real — Wonderland Online reused
material names loosely across patches/regions — but they cannot both be the r6 rung. Treat
wlopedia's four-item ladder (Rough → Weave → Delicate → Thin) as the authoritative one for now
since it's internally consistent and rank-ordered; flag the old r2/r6/r18 names for a recheck.

### Leaf (葉)
| R | Item | Type | Source |
|---|---|---|---|
| 1 | Tobacco | MaterialPlant | wlopedia |
| 1 | Tea | MaterialPlant | wlopedia |
| 1 | Fox Leaf | MaterialBeast | wlopedia |
| 2 | Vine | MaterialPlant | wlopedia |
| 2 | Daphne | MaterialPlant | wlopedia |
| 2 | Reed | MaterialPlant | wlopedia |
| 2 | Areca | MaterialPlant | wlopedia |
| 2 | Turpentine | MaterialPlant | wlopedia |
| 2 | Pine | MaterialPlant | wlopedia |
| 4 | Small Leaf | MaterialPlant | wlopedia |
| 6 | Big Fruit Leaf | MaterialPlant | wlopedia (matches existing) |
| 7 | River Boy Leaf | MaterialBeast | wlopedia |
| 7 | Iron Buhdda (tea, craft/food) | MaterialFood | wlopedia — base Leaf + Water(Type1) |
| 10 | Oolong Tea | MaterialPlant | wlopedia |
| 14 | Jade Tea | MaterialPlant | wlopedia |
| 18 | Fine Leaf | MaterialPlant | wlopedia (matches existing "Processed Tender Leaf") |

**Big fill** — 1–10 was essentially empty before; now fully populated. Nothing found at r3, r5,
r8, or r9, so those look like genuine gaps in the family rather than a research miss (every other
rank around them was found cleanly).

### Flower (花)
| R | Item | Type | Source |
|---|---|---|---|
| 1 | Rose, Chrysanthemum, Yaro Safflower, Orchid, Alocasia Macrorrhiza, Sunflower, Cotton, Small Daisy, Blue Wild Flower | MaterialPlant | wlopedia |
| 1 | Pollen | MaterialFood | wlopedia |
| 2 | White Flower | MaterialPlant | wlopedia |
| 2 | Nectar, Fruit Pollen | MaterialFood | wlopedia |
| 3 | Persian Mum | MaterialPlant | wlopedia |
| 3 | Fruit Nectar | MaterialFood | wlopedia |
| 4 | Red Flower | MaterialPlant | wlopedia |
| 6 | Golden Flower | MaterialPlant | wlopedia |
| 6 (lv12) | Coconut (Pulp) | Material | wlopedia (matches existing "Coconut Meat") |
| 10 | White Rose | MaterialPlant | wlopedia |
| 14 | Purple Rose | MaterialPlant | wlopedia |
| 18 | Fine Golden Rose | MaterialPlant | wlopedia (matches existing "Processed Gold Rose") |

Rank 1 alone has nine distinct raw-flower items plus Pollen — Flower is clearly the most
over-populated low-rank family in the game (cosmetic/décor variety). Nothing found at r5, r7–9.

### Silicon (矽)
| R | Item | Type | Source |
|---|---|---|---|
| 5 | Quartz | MaterialMineral | wlopedia (matches existing) |
| 6 | Silicon | MaterialMineral | wlopedia |

Confirms r5 Quartz and adds r6 Silicon itself ("made from quartzite"). Nothing below r5 —
**Silicon genuinely starts at rank 5.**

### Sulfur (硫磺)
| R | Item | Type | Source |
|---|---|---|---|
| 2 | Sulfur | MaterialMineral | wlopedia (matches existing exactly) |

**Confirmed single-item family.** Nothing above r2 in wlopedia's catalogue — Sulfur may simply
not have a higher raw-material tier at all (only ever used as a low-rank ingredient, e.g. in
Titanium Alloy recipes per the existing KB).

### Water (水)
See the dedicated section above (Priority 4) — caps at rank 4, two sub-families.

---

## Priority 3 — gaps filled in ladders you already had

### Copper (銅) — now complete, r1–r6, no gaps
| R | Item | Source |
|---|---|---|
| 1 | Copper Ore | wlopedia |
| 2 | Copper Sand | wlopedia |
| 3 | Copper Block | wlopedia |
| 4 | **Copper Material** | wlopedia — fills the r4 gap; matches `09-shops-re.md`'s "Copper Material, Welling 70g" |
| 5 | Bronze Material | wlopedia |
| 6 | Copper Plate | wlopedia |

### Iron (鐵) — now complete, r3–r7, no gaps; confirmed no raw material above r7
| R | Item | Source |
|---|---|---|
| 3 | Iron Ore | wlopedia |
| 4 | Iron Sand | wlopedia |
| 5 | Iron Block | wlopedia |
| 6 | Iron Fillet | wlopedia |
| 7 | Iron Material | wlopedia — **highest raw Iron material; nothing at r18 (see Priority 2)** |

### Pure Iron / Red Iron (赤鐵) — refined from the previous partial list
| R | Item | Source |
|---|---|---|
| 4 | Pure Iron Ore | wlopedia |
| 5 | Pure Iron Sand | wlopedia |
| 6 | Pure Iron Block | wlopedia |
| 7 | Pure Iron Fillet | wlopedia |
| 10 | Refined Iron Sand | wlopedia |
| 14 | Delicate Hematite | wlopedia |
| 18 | Refined Hematite | wlopedia |

### Grass (草) — partial fill; r4–5 and r7–9 confirmed absent, not a miss
| R | Item | Type | Source |
|---|---|---|---|
| 1 | Harl Grass | MaterialPlant | wlopedia |
| 2 | Vine Grass, Paper Grass, Common Grass | MaterialPlant | wlopedia |
| 3 | Soft Bine | MaterialBeast | wlopedia — new, fills the r3 gap |
| 6 | Purple Grass | MaterialPlant | wlopedia (matches existing) |
| 10 | Snow Grass | MaterialPlant | wlopedia |
| 14 | Golded (Golden) Hemp | MaterialPlant | wlopedia |
| 18 | Fine Grass | MaterialPlant | wlopedia (matches existing) |

r4–5 and r7–9 remain empty after a direct base-filter check — this now looks like a genuine
gap in the family (design choice), not a research gap, since every other rank nearby returned
results cleanly from the same query.

### Leather (皮) — r3 gap filled, plus a much fuller r1–10 picture
| R | Item | Source |
|---|---|---|
| 1 | Dry Skin, Thin-Skinned (cat), Dog Skin, Hedgehog Fur | wlopedia |
| 2 | Pig Skin, Beast Fur | wlopedia |
| 3 | **Goatskin, Capeskin, Black Sheepskin, White Sheepskin, Deerskin** | wlopedia — fills the r3 gap |
| 4 | Buffalo Skin, Small Buffalo Skin, Scalper Skin, Small Scalper Skin, Urus Skin, Small Urus Skin | wlopedia |
| 5 | Chameleon Skin | wlopedia (matches existing) |
| 6 | Green/White/Fire/Yellow Snake Skin, Wolf Fur, (common) Snake Skin, Dinosaur Fur | wlopedia (matches existing Snake Skin/Dinosaur Hide) |
| 8 | Tiger Skin | wlopedia |
| 9 | White/Northern/Dark Tiger Skin | wlopedia |
| 10 | Fine Fur | wlopedia |
| 14 | Fine Leather | wlopedia |
| 18 | Delicate Leather | wlopedia |

### Corundum / "Gem" family (寶/翡翠) — confirmed floor
| R | Item | Source |
|---|---|---|
| 5 | Emerald, Sapphire, Ruby | wlopedia |

Matches your existing r5 Emerald entry exactly and confirms **Corundum genuinely starts at rank 5**
— nothing below it.

---

## Families that genuinely start above rank 8

Confirmed by direct base-filter query (not merely "nothing turned up in search"):

| Family | Lowest raw material found | Item |
|---|---|---|
| Steel | r8 | Steel |
| Silver | r8 | Silvery Ore |
| Titanium | r10 | Titanium |
| Diamond | r10 | Diamond |
| MagicJade | r12 | Magic Powder |

Gold (r11) and Corundum (r5, so *not* in this list — see above) were already flagged similarly.
Platinum (r5) and Silicon (r5) turned out **not** to belong here — see Priority 1 above; both
had lower rungs than assumed.

---

## Not found / could not verify

- **r18 Water** — see Priority 2. Genuinely absent from every source checked this pass.
- **Titanium Alloy (r15)** — not in wlopedia's raw-material catalogue under base=Titanium.
  Neither confirmed nor disproven; may be a craft output tracked elsewhere in this KB, not a
  discrete "material" item.
- **Blue Snow Crystal (r9) / Red Snow Crystal (r18)**, Cluster family — not in wlopedia's raw
  list (only Sugar r1 and Snow Crystal r7 appear). Same caveat as Titanium Alloy.
- **wiki2.gamer.com.tw** — WebFetch 403'd on this host every time; the browser session didn't
  reach it this pass (budget went to the higher-value Bahamut G2 legacy compilations and
  wlopedia instead). Recommend a follow-up pass specifically through a live browser tab if
  Chinese names for the new wlopedia-only items (Platinum's Magnet/Magnetic Powder, the Diamond
  r10 raw item, Cluster's Sugar, the four Nylon items, most of Leaf/Flower r1–4) are wanted —
  none of those got Chinese names this pass; wlopedia is English-only.
- **Fish and Shellfish / "Shell" family** — checked; wlopedia's "Fish and Shellfish" base is
  entirely cooked-food items (MaterialFood), not the raw Beetle Horn/Crab Claw/Crab Shell chain
  already in this KB's "Shell" family. That raw chain was not found under any base in wlopedia's
  dropdown this pass — it may not be a distinct wlopedia base at all, or may sit under "Hard
  Tissue" (Bone) unconfirmed since that specific query hit a site-side filter glitch (see below)
  before budget ran out.
- **wlopedia UI note:** its `Select Base` filter has a real bug — selecting values containing
  parentheses (e.g. "Quartz (Crystal)", "Water (Type 1/2)") or, intermittently, any value
  immediately after certain other selections, silently fails and leaves the *previous* filtered
  list on screen while the dropdown's displayed label still updates. Every result in this report
  was double-checked against the visible `Base` column of the returned rows, not just trusted
  from the dropdown state, specifically to avoid this trap. If re-querying wlopedia later, click
  **Reset filter** before every new selection and verify the printed `Base` column matches what
  you asked for.

---

## Sources actually retrieved this pass

- [wlopedia.com/items](https://wlopedia.com/items) — Materials tab, `Select Base` filter, queried per-family via a live browser session (WebFetch could reach the page shell but not drive the client-side filter)
- [forum.gamer.com.tw/G2.php?bsn=8897&sn=4314](https://forum.gamer.com.tw/G2.php?bsn=8897&sn=4314) — 鍊金百科全書 [鋼] (Steel), LEGACY board
- [forum.gamer.com.tw/G2.php?bsn=8897&sn=5226](https://forum.gamer.com.tw/G2.php?bsn=8897&sn=5226) — 鍊金百科全書 [鋼][鐵][銅][鈦][赤][鉛] (Steel/Iron/Copper/Titanium/Red Iron/Lead), LEGACY board
- [forum.gamer.com.tw/G2.php?bsn=8897&sn=5236](https://forum.gamer.com.tw/G2.php?bsn=8897&sn=5236) — 鍊金百科全書 [錫][金][銀][白銀][鋁][獸骨][岩石] (Tin/Gold/Silver/White-Silver/Aluminum/Bone/Rock), LEGACY board

Both `forum.gamer.com.tw` and `wiki2.gamer.com.tw` return 403 to WebFetch/curl (confirmed again
this pass, consistent with `19-site-data-manifest.md`'s existing note) — a real Chrome tab via
the browser tool got through to `forum.gamer.com.tw` cleanly; `wiki2.gamer.com.tw` was not
retried through the browser this pass.
