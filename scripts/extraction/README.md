# One-time extraction scripts

These built `content/data/*.json` on 2026-09-07 from two sources:

- `extract.mjs` — the **Star Drift Compendium** artifact (761 compendium rows)
- `star.mjs` + `star_data.mjs` — the **Star Family Codex** artifact (92 Star rows)
- `codes.mjs`, `materials.mjs`, `glossary.mjs` — hand-transcribed from the project knowledge base
- `patch_kk.mjs` — promotes rows KK confirmed in the live Thai client to `KK-tested`
- `patch_lv.mjs` — flags rows where the source sheet's equip level contradicts `rank × 2`

**They are history, not a build step.** `extract.mjs` reads an artifact HTML file that only
existed in that session's container, so it will not run again as-is. The JSON in
`content/data/` is now the source of truth — edit it directly.

The one script that IS live tooling is `scripts/verify.mjs`. Run it after every data edit:

```
npm run verify
```

It exits non-zero on any schema error.
