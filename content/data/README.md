# WDL Re: Star Ark — site data (phase 1)

Generated 2026-09-07 from the project knowledge base. These five files are the entire
data layer of the planned website. Everything else the site does is presentation.

| File | Rows | What it is |
|---|---|---|
| `compounds.json` | 853 | Every compound recipe. 761 from the Star Drift Compendium (29 families) + 92 from the Star Family Codex (the Re-exclusive 星耀 / ประกายดาว line, ranks 2–60) |
| `materials.json` | 178 | Family × rank → where to get it: shop + town, monster drop, gathering node, or crafting station |
| `towns.json` | 22 | Every town, with whether its shop is open on the Thai map today |
| `codes.json` | — | 34 material families, 15 slots, 7 stats, 5 confidence tags — each with EN / 中文 / ไทย |
| `glossary.json` | 71 | System terms, Thai client UI strings, stats, jobs, key catalysts |

## The two fields that matter most

**`thConfirmed`** — `true` only where the Thai string was read off KK's live Thai client.
Everything else is a translation and must be treated as a guess until verified in-game.

**`confidence`** — `KK-tested` > `RE-verified` > `RE-reported` > `LEGACY` > `INFER`.
Today almost everything is `RE-reported` (the 苦茶 community sheet, maintained to 2026-05-30).
Each thing KK confirms in-client should be promoted to `KK-tested`.

## Known anomalies, deliberately kept

Two rows have `lvAnomaly: true` — the source sheet's equip level disagrees with `rank × 2`:

- **Star Ring Longsword** r11 listed at lv 54 (expected 22)
- **Copper Blade** r2 listed at lv 2 (expected 4)

Not silently corrected. The site should show them with a caution mark.

## Regenerating

`node extract.mjs && node codes.mjs && node star.mjs && node materials.mjs && node glossary.mjs && node patch_kk.mjs && node patch_lv.mjs && node verify.mjs`

`verify.mjs` exits non-zero on any schema error. Run it after every edit.
