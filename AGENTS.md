# AGENTS.md — how to work on this repo

Read this before changing anything. It is written for a future Claude session that has
no memory of building this site, and for KK, who edits this site by asking in chat.

## What this is

A static bilingual (Thai / English) reference site for **Wonderland Online Re: Star Ark**,
built from Taiwan-server community research. Next.js 15, App Router, no database, no API,
no auth. Deployed on Vercel from `main` — every push to `main` goes live in about a minute.

**The data is the product.** The code is a thin viewer over five JSON files.

## Layout

```
content/data/          ← the entire data layer. Edit these, not the components.
  compounds.json         853 rows: 761 compendium + 92 Star family
  materials.json         178 rows: family × rank → where to get it
  towns.json             22 towns + whether each shop is open on the Thai map
  codes.json             families / slots / stats / confidence tags, all in EN·中文·ไทย
  glossary.json          71 terms
lib/ui.js              ← every interface string, in both languages
lib/data.js            ← loads the JSON, projects compact rows for the client
app/[lang]/            ← /th and /en routes; both are generated from the same data
components/            ← the three tables plus nav and legend
scripts/verify.mjs     ← schema + spot-check validator. Run it after every data edit.
scripts/extraction/    ← the one-time scripts that built the JSON. History, not a build step.
```

## The correction protocol

KK reports a correction in chat. The steps, in order:

1. **Find the row** in `content/data/*.json` by `id`, or by English name + rank.
2. **Edit the fields that are wrong.** Recipes live in `recipe.en` / `recipe.th`; stats in
   both `stats` (parsed) and `statsRaw` (displayed) — keep them consistent.
3. **Set `confidence: "KK-tested"`** if KK confirmed it in the live Thai client. That is the
   highest tier and it is the whole point of this site. Add a `note` saying what was observed.
4. **Set `name.th` and `thConfirmed: true`** only when KK read the Thai name off the client.
   A translated Thai name must leave `thConfirmed` unset.
5. **Bump `updated`** to today's date.
6. **Run `npm run verify`.** It must print `EXIT PASS`. It exits non-zero on any bad code,
   town, or duplicate id.
7. **Run `npm run build`.** It must succeed before you push.
8. **Mirror the correction into the project knowledge base** — the same fact in
   `wonderland/*.md`. The site and the KB must never disagree. Do both in one turn, or neither.
9. **Commit and push to `main`.** Vercel deploys automatically.

Commit message style — say what changed in the data, not "update files":

```
data: Blue Crystal Mage Staff needs Vol.2, confirmed in client

KK tested it on the Thai server. confidence RE-reported → KK-tested.
```

## Rules that matter

**Never invent a Thai name and mark it confirmed.** `thConfirmed: true` means a human read it
off the running game. Everything else is a translation and the site says so. Getting this wrong
is worse than leaving a row in English — a player who cannot find your Thai name in their client
loses trust in every other row.

**Never silently fix a contradiction in the source.** Two rows have `lvAnomaly: true` because
the source sheet's equip level disagrees with `rank × 2`. Flag; do not correct. If KK verifies
one in-client, then correct it and set `confidence: "KK-tested"`.

**Codes, not strings.** `family`, `slot`, `stat` and `confidence` are keys defined once in
`codes.json`. Never write display text into a data row. Adding a new family means adding it to
`codes.json` with all three languages first, or `verify.mjs` will fail.

**Both languages, always.** Every key added to `lib/ui.js` must exist under both `en` and `th`.
A missing Thai string renders as `undefined`, not as a fallback.

**Do not pass functions into client components.** They are React Server Components; strings with
`{n}` placeholders are formatted client-side. This has bitten this repo once already.

**Fonts load by stylesheet link, not `next/font`.** Deliberate: `next/font` fetches from Google
at build time, which fails in a sandbox without network. Do not "fix" this back.

## Things known to be incomplete

- **852 of 853 item names have no Thai.** The UI falls back to English + 中文 with a grey dot.
  This is the rolling job: translate in batches, and never mark a batch confirmed.
- **Glossary `note` fields are English only**, on both language versions.
- **476 compound rows belong to families the source only covers to rank 30** — marked `≤ 30`
  on the family heading. Do not imply completeness.
- No guides section yet (build, leveling, economy, life skills, combo). Planned; the source
  material is in the project knowledge base.

## Commands

```
npm run dev       local dev server
npm run build     production build — must pass before pushing
npm run verify    data validation — must print EXIT PASS
```
