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
  compounds.json         853 rows: 761 compendium + 92 Star family. The compound TABLE also
                         folds in materials.json rows (ids mat:*) that aren't already in it — 939 rows on screen
  materials.json         178 rows: family × rank → where to get it
  towns.json             22 towns + whether each shop is open on the Thai map
  codes.json             families / slots / stats / confidence tags, all in EN·中文·ไทย
  glossary.json          71 terms (no page any more; kept as reference data)
  quests.json            132 quests in 5 categories keyed to the Thai client's tabs:
                         main เควสหลัก · side เควสรอง · companion เควสขุนพล · star เควสดวงดาว · skill เควสสกิล.
                         Only 11 rows are Re-era; the rest are legacy WLO, tagged LEGACY on purpose
lib/ui.js              ← every interface string, in both languages
lib/data.js            ← loads the JSON, projects compact rows for the client
lib/recipe.js          ← recipe-string parser + resolver used by the planner's ⇣ button
lib/basket.js          ← the shortlist: ids starred on the compound page, consumed on the planner (localStorage)
app/[lang]/compounds   ← the front page (/, /th, /en all redirect here)
app/[lang]/materials   ← material index with shop filter
app/[lang]/simulator   ← the planner: a free-form tree (target on top, ≤20 deep) the player
                         builds by hand; ⇣ loads a recipe as a starting point; PNG export via canvas;
                         autosaved to localStorage
app/[lang]/quests      ← quest lists by category, one filter + a hover-to-read steps column
app/[lang]/about       ← the old home page: rules, trust tags, sources
components/            ← CompoundTable, MaterialTable, QuestTable, Simulator, Combobox, Nav, Legend
scripts/verify.mjs     ← schema + spot-check validator. Run it after every data edit.
scripts/extraction/    ← one-time builders. th_names.mjs translates item names; th_recipes.mjs then
                         rewrites every recipe.th from the parsed English recipe using those names.
                         Re-run both (in that order) after adding rows or fixing a name.
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
off the running game. Every item now HAS a Thai name — 851 of them are compositional translations
from `scripts/extraction/th_names.mjs` (head noun first, modifiers after, nearest-first:
"White Feather Earrings" → ต่างหูขนนกขาว, which is what the client prints). Only 2 compounds and
1 material are confirmed. The grey dot means translation; green means confirmed. When KK confirms
a name in-client, set `name.th` to the exact client string and `thConfirmed: true`. Getting this wrong
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

**Mobile layout is one set of rules keyed off `html[data-view="mobile"]`.** The attribute is set by an
inline script in `app/layout.jsx` before first paint and by `components/ViewToggle.jsx` (auto / mobile /
desktop, persisted in localStorage). Auto uses `min(innerWidth, screen.width)` so a phone zooming out
to fit overflowing content can't flip the page to desktop mid-load. Do not add `@media` queries for
layout — add `html[data-view="mobile"]` rules, so the forced toggle keeps working.

**Long free text is clamped, not wrapped.** The recipe cell on the compound page and the steps
cell on the quest page share `.rc` / `.rc-in`: two lines, fixed height, the rest in a floating panel
on hover (tap on mobile, which sets `.open`). This is deliberate — letting one long row stretch made
every row a different height and the table unreadable. Keep new long-text columns on the same pattern.

**Quest rows say where they come from.** `quests.json` is mostly LEGACY. That is honest, not a bug:
the Taiwan board that holds Re's current quest lists blocks automated reading. Never promote a row to
`RE-verified` without a Re-era source, and never to `KK-tested` without KK reading it in the client.

**Fonts load by stylesheet link, not `next/font`.** Deliberate: `next/font` fetches from Google
at build time, which fails in a sandbox without network. Do not "fix" this back.

## Things known to be incomplete

- **Thai item names are translations**, consistent but unverified. Confirming them in-client is
  the rolling job. Bad ones: fix in `OVERRIDES` inside `th_names.mjs`, or edit the JSON directly.
- **Recipe strings are free text.** `lib/recipe.js` parses them (alternatives on `; · ,`,
  ingredients on `+`, options on `/`, `rNN Family` placeholders, `Vol.N`/`book`, `Buy — Town`).
  ~230 ingredient tokens resolve to plain text (sources like "Stone monster drop"); that's expected.
  Unknown short forms go in `ALIASES` there.
- **476 compound rows belong to families the source only covers to rank 30** — marked `≤ 30`
  on the family heading. Do not imply completeness.
- No guides section yet (build, leveling, economy, life skills, combo). Planned; the source
  material is in the project knowledge base.
- **Quest data is thin where it matters most.** Re's own main-quest and side-quest master lists are
  not published anywhere reachable — `forum.gamer.com.tw` (bsn=82442) has them and returns 403 to
  automated fetching. 121 of the 132 rows are legacy WLO, kept because the region + story beat
  usually still match. Quest names have no Thai confirmation at all yet. The research pass and its
  gaps are written up in the project KB as `wonderland/20-quest-categories-th.md`.

## Commands

```
npm run dev       local dev server
npm run build     production build — must pass before pushing
npm run verify    data validation — must print EXIT PASS
```
