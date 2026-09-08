# Star Drift — Wonderland Re: Star Ark data

A bilingual (ไทย / English) reference for **Wonderland Online Re: Star Ark**, built from a year
of Taiwan-server community research and cross-checked against the Thai client.

**What's in it**

- **853 compounding recipes** — 761 from the 「星飄」 community sheet plus 92 from the Re-exclusive
  Star (星耀 / ประกายดาว) family, which reaches rank 60 and does not exist in the original game
- **178 materials** with every known source: shop and town, monster drop, gathering node, station
- **A Thai-map availability filter** — only 20 of those 178 are actually buyable on the Thai
  server today, and no other resource tells you which
- **A 71-term glossary** bridging 中文 → English → ไทย, since all the research is in Chinese and
  the client is in Thai

Every row carries a confidence tag. Rows confirmed in the live Thai client are marked
**KK-tested**; unbadged rows come from the community sheet; Thai names are translations unless
explicitly marked confirmed.

Data as of **2026-05-30** (the source sheet's last maintained date).

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run verify   # data validation — must print EXIT PASS
npm run build    # production build
```

Contributors and agents: read **AGENTS.md** first. The data lives in `content/data/` and is the
product; the code is a viewer over it.
