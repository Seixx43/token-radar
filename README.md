# token-radar

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/Seixx43/token-radar/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/Seixx43/token-radar/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

Token Radar ranks pre-token protocols by implied launch value, with a farm plan for each.
It reads a frozen DefiLlama snapshot (758 protocols as of 2026-11-14), ranks the 198 rankable
pre-token protocols by implied value, and renders a static dashboard a reader can sort,
filter and open per protocol.

## Run it

```sh
mkdir -p out
node main.ts --input <path to snapshot.json or its directory>
# or: MAKEFUN_OUTPUT_DIR=out node main.ts --input ../input/snapshot.json
```

Requires Node 22 (the entry runs on Node 22.18+; no dependencies, standard library only).

This writes `out/board.json` (198 rows), `out/data.js`, `out/dashboard/`, `out/screenshots/`
and `out/dossier.json`. It exits 1 with a message when the board fails the gate's checks or
fewer than 3 screenshots are present. Open `out/dashboard/index.html` in a browser (it loads
`../data.js`; no network).

---

<sub>Entered on [make.fun](https://make.fun/?ref=8t6jg5et&utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>

## The model (radar-2)

```
implied = TVL × multiple(category) × growth × maturity × chain
```

- **multiple(category)** — the median `mcap_usd / tvl_usd` of the live-token protocols in the
  same category. When a category has fewer than 5 live-token protocols, the median over all
  live-token protocols is used instead (0.186 here). Every multiple is clamped to [0.03, 1.0].
  The same multiple applies to every protocol in a category; no protocol name is special-cased.
- **growth** — `1 + clamp(change_7d, -60, 120) / 100 × 0.5`; unreported change counts as 0.
- **maturity** — `0.6 + min(age_days, 1095) / 1095 × 0.4`; unknown age counts as 365 days.
- **chain** — `1 + 0.03 × min(max(chains - 1, 0), 4)`.

Implied value is rounded to whole dollars, at least $1, and is a circulating-cap estimate:
`mcap_usd` in the snapshot is circulating market cap, not fully diluted value. A protocol is
"pre-token" when its record carries no token (no market cap, no CoinGecko id, no symbol) — the
record is not proof it has none. Each row carries a six-step farm plan derived from its
category, first chain, TVL and age, with concrete costs and times.

## Layout

- `main.ts` — reads the snapshot, writes the board, data, dashboard, screenshots and dossier.
- `lib/model.ts` — the radar-2 model: snapshot parsing, multiples, implied values, farm plans.
- `vendor/makefun-board.ts` — make.fun's dossier library, vendored as shipped.
- `dashboard/` — the static page: `index.html`, `app.css`, `app.js`.
- `screenshots/` — three screenshots of the dashboard (board, detail, filtered).

## Assumptions

- The snapshot is fixed and read-only; the model never fetches anything.
- "Records no token" is used throughout, never "has no token".
- Wrapped, staked and bridged products of tokens that already trade are not launch candidates
  and are left off the board (Bridge, Canonical Bridge, Liquid Staking, Liquid Restaking,
  Restaked BTC and CEX categories; a name carrying wrapped, staked or staking; a name beginning
  with an exchange's name). The watchlist passes that rule already, so the floor is untouched.
