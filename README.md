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

## The model (radar-3)

```
implied = TVL × multiple(category) × launch odds(age)
```

- **multiple(category)** — the median `mcap_usd / tvl_usd` of the live-token protocols in the
  same category. When a category has fewer than 5 live-token protocols, the median over all
  live-token protocols is used instead (0.186 here). Every multiple is clamped to [0.03, 1.0].
  The same multiple applies to every protocol in a category; no protocol name is special-cased.
- **launch odds(age)** — the share of the snapshot's protocols in the same age band that still
  record no token, fitted from the snapshot itself: under 1 year 0.68 (160 protocols, 108
  without a token), 1–2 years 0.62 (183, 113), 2–3 years 0.45 (139, 63), 3 years or more 0.21
  (163, 34); no listing date takes the oldest band's odds (0.21 — that band's own share is
  0.21 too). A protocol that has run three years with no token belongs to a band where 79% of
  its peers already have one, so its launch is the exception, not the rule.

Implied value is rounded to whole dollars, at least $1, and is a circulating-cap estimate:
`mcap_usd` in the snapshot is circulating market cap, not fully diluted value. A protocol is
"pre-token" when its record carries no token (no market cap, no CoinGecko id, no symbol) — the
record is not proof it has none. Each row carries a farm plan that opens with a verdict
(worth farming, farm small, or wait, from the launch odds and the gas the whole farm costs),
then six steps derived from its category, first chain, TVL and age, with concrete costs and
times. The verdict prices gas, so no Ethereum protocol earns the top verdict: a weekly action
there costs about $6, and even the shortest farm runs about $34 of gas against a $50–$250
position, while the same farm on a cheap chain costs $9–$26. That is the verdict working as
designed — the chain is part of the farm's cost. A wait is not a farm with a different label: the 11 wait rows get a monitoring plan
instead — watch for a token or points program, the three triggers that would change the call,
a dated re-check three months after the snapshot, what to do with a position already held,
and a log of the decision — because a plan that says "don't lock capital here" and then tells
the reader to deposit would contradict its own verdict.

Why the model has only these two terms: every term is fitted from the snapshot, and every
term that was tried and failed is left out. Tested held-out on the 128 live-token protocols
(two seeds, two folds each), the 7-day growth multiplier, the maturity bonus and the per-chain
bonus add nothing to the ranking — growth even correlates −0.15 with `log(mcap/TVL)`, the
wrong sign, age correlates 0.00, chains −0.02 — and a fitted log-linear regression overfits
(its coefficients flip sign between folds). The category median alone ties every variant on
rank correlation, so the model keeps the median and spends its one extra term on the launch
odds, which the median cannot express. The 7-day change and the chain count are still shown
on the board as facts, but they are not model inputs.

The board also flags its own shaky numbers: 7 of the 198 rows moved more than 50% in 7 days
(the largest, Shift DeFi, rose 4,448%), and each is marked on the board and in its detail
view, because an implied value built on a TVL that just jumped or collapsed deserves a
warning, not a quiet number. The flag never changes the ranking: the snapshot gives no
evidence for how much to discount a moved TVL.

## Layout

- `main.ts` — reads the snapshot, writes the board, data, dashboard, screenshots and dossier.
- `lib/model.ts` — the radar-3 model: snapshot parsing, multiples, launch odds, implied values, farm plans.
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
