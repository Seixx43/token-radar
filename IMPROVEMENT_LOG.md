# Improvement log

## v1.2 — 2026-11-24: real screenshots of the new dashboard

What changed, and why: the v1/v1.1 screenshots were the starter's three images, which showed a
different dashboard — the judge reads screenshots first, so a mismatch between screenshots
and code fails criterion 1 on its face. Installed Google Chrome (the Playwright CDN download
kept failing; `dl.google.com` worked) and took the three shots with Playwright against the
rendered `out/dashboard/index.html` (`~/workspace/makefun/shots.py`): 1-board.png (board,
1440×900, 151 KB), 2-detail.png (full detail view of rank 1 Steakhouse Financial, 1140×862,
157 KB), 3-filtered.png (watchlist-only filter, 1440×900, 149 KB). All three were inspected
visually: the board shows the header, stats (198 ranked, 40 watchlist, 24 live, 158 below the
floor), formula and the top rows; the detail view shows the protocol, the model built step by
step with exact figures, the six-step farm plan and the comparables note; the filtered view
shows the checked watchlist-only box and "40 of 198 protocols shown (watchlist only)". No
console errors. `main.ts` re-run: dossier rebuilds byte-identical, dossier 633,581 bytes (cap
4 MiB), text 23,616 bytes (no cut), each image under the 512 KiB cap.

Audit effect (judge criteria): criterion 1, 8 → 9 (screenshots now show the real dashboard
and agree with the code); criterion 5, 7 → 8 (the rendered page is confirmed clean and
readable). Criteria 2–4 unchanged (9 / 8 / 8). The entry is now at a submit point: the audit
is clearly up vs. the (unsubmitted) v1, all local checks pass, and the dashboard was verified
from a fresh `out/` run.

Biggest weakness remaining: no dev rating yet — the first submission's provisional rate
against the house dashboards is the only external signal, and this bounty has no local
grade-local run (the scorer is not published in the kit).

## v1.1 — 2026-11-24: wrapped/bridged/staked products off the board

What changed, and why: the v1 board's top 10 was dominated by products that are not launch
candidates at all — WBTC (#3), Base Bridge (#1), Coinbase Bridge (#2), Binance Bitcoin (#6),
USDT0 (#8), Binance Staked ETH (#10) — because `isRankable` only excluded CEX and versioned
names. The snapshot's own README says these are wrapped, staked or bridged products of tokens
that already trade, not protocols waiting on a launch of their own, and the judge's first
criterion is finding protocols whose token does not exist yet. A board that ranks WBTC #3
fails that criterion on its face, however honest the methodology note is.

Fix: `isRankable` now applies the watchlist's own exclusion rule (from the snapshot README)
to every non-watchlist row — Bridge, Canonical Bridge, Liquid Staking, Liquid Restaking,
Restaked BTC and CEX categories; a name carrying a whole word wrapped, staked or staking; a
name beginning with an exchange's name. Watchlist rows are added before the check and pass
the rule already, so the floor is untouched. The board goes from 289 to 198 rows (91 removed,
15 of the old top 30). The dashboard's methodology section and the README now state the rule
instead of the old "priced here only because the board ranks every rankable protocol" line.
Also added `package.json` (`{"type": "module"}`) to silence the ESM reparsing warning, and
corrected the header comment's global median to ~0.186.

Audit effect (judge criteria): criterion 1, 7 → 8 (the board now only ranks genuine launch
candidates; screenshots still placeholder, so it cannot go higher yet); criterion 2, 8 → 9
(the model now follows the snapshot's own definition of a launch candidate, not just its
figures). Criteria 3–5 unchanged (8 / 8 / 7).

Biggest weakness remaining: the screenshots do not show the new dashboard (placeholder),
which caps criteria 1 and 5 until real screenshots are taken.

## v1 — 2026-11-24: first working entry (radar-2)

What was built:

- `lib/model.ts` (radar-2), written new: the board ranks **all 289 rankable** protocols
  (40 watchlist + 249 below the floor), not the starter's 200. Implied value uses a
  **per-category multiple** — the median mcap/TVL of the snapshot's own live-token protocols
  in the same category, falling back to the global median (~0.186) when a category has fewer
  than 5 live protocols, clamped to [0.03, 1.0] — instead of the starter's flat 0.25.
  Adds growth, maturity and a new chain multiplier (1 + 0.03 per extra chain, max 4).
  Farm plans are six steps derived from category, first chain, TVL (capital tier) and age
  (hold length), with weekly and total gas computed from the hold.
- `dashboard/` rewritten with its own design (light paper theme, teal accent, amber watchlist
  badges): header with stats and the model formula, working filters (search, category, chain,
  watchlist-only, sort by implied/TVL/growth/age/name), a 289-row board, a detail view per
  protocol with the model built step by step and live comparables from the same category, a
  methodology section with the full category-multiples table, and a separate live-token table.
- `main.ts` rewritten to the same contract as the starter (reads `--input`, writes
  `board.json`, `data.js`, `dashboard/`, `screenshots/`, `dossier.json` via
  `vendor/makefun-board.ts`; exits 1 when the board fails the gate or fewer than 3
  screenshots are present).
- `vendor/makefun-board.ts` and `LICENSE` copied from the kit as shipped. Screenshots are the
  starter's three images as temporary placeholders; real screenshots of the new dashboard
  still have to be taken (no headless browser is installed on this machine).

Internal audit estimate for v1 (judge criteria, 1–10):

| Criterion | Score | Note |
|---|---|---|
| 1. Working radar (coverage, ranking, screenshots match code) | 7 | Board covers all 289 rankable incl. watchlist; screenshots are still the starter's, so they do not match the new dashboard yet |
| 2. Value model (from snapshot figures, live vs pre-token separated) | 8 | Per-category multiples from the snapshot itself; live set kept apart and shown as market values |
| 3. Farm plans (concrete cost and time) | 8 | Six steps each, capital tiered by TVL, weekly/total gas computed, hold by age |
| 4. Dashboard (sortable/filterable, detail view) | 8 | Filters and sorts work; detail view shows model arithmetic, farm plan and comparables |
| 5. Looks made (own palette, consistent spacing) | 7 | Own palette and spacing; needs real screenshots to judge the rendered page |

Biggest weakness: the screenshots do not show the new dashboard (placeholder), which caps
criterion 1 and 5 until real screenshots are taken.
