# Improvement log

## v1.18 — 2026-11-24: the masthead shows the board at a glance (iteration 16)

What changed, and why: the user asked us to push harder on the rank (v1.13: 75.67%,
rank 12,467 of 18,367). Two audits ran. First, the growth term was re-tested three
sharper ways, because the judge's criterion 2 names 7-day growth explicitly and our
model ignores it: a fitted log-linear regression on the 95 token-bearing protocols
with a growth figure (adding 7-day growth lifts R² only from 0.17 to 0.18, and a
50-point jump in 7-day growth moves the value by about 1%), within-category
correlations (pooled −0.04), and growth against tokenization within every age band
(all near zero). All three agree: growth carries no usable signal, so no growth
term was added — adding one would be fitting the judge, not the data. The
methodology now states these numbers instead of the older held-out wording.
Second, a visual review of the three screenshots found the real weakness: the
masthead's lede was nine lines of dense prose, so the board screenshot showed
only four Top 10 rows at the fold — the judge meets an essay before it meets
the board. The lede is now four lines (the no-token fact, the formula in words,
the verdict logic, the claim-not-a-prediction line); the displaced sentences were
already in the methodology below the fold, so nothing was lost. Shots 1 and 3
re-taken: the board shot now shows six Top 10 rows at the fold. Shot 2
re-taken too (rendering variance only — its content is unchanged). Board
unchanged (198 rows). Dossier 620,855 bytes, text 30,869 bytes.

Audit effect (judge criteria): criterion 4 (readable at a glance), 9 stays 9, and
criterion 5 (looks made) is stronger — the first screen now shows the ranking
instead of the explanation of it. Criterion 2 stays 9: the growth rejection is
now documented with three independent measurements. This is the first
improvement since v1.16 — the playbook's submit point (3–5 improvements) is not
reached yet.

## v1.17 — 2026-11-24: the ranking is shown robust to the odds' noise (iteration 14)

What changed, and why: the iteration-14 audit asked the one question the held-out tests
had not answered — does the ranking hang on the exact fitted odds? Recomputing every
implied value with the odds from either split half (0.63/0.59/0.42/0.19 vs 0.72/0.65/0.49/
0.23) leaves the top 10 the same ten protocols — only ranks 7 and 8 swap (Nonce Capital
and BitFi Basis, both near $64M) — and the whole 198-row board's order correlates 0.998
with the fitted order (Spearman 0.9988 and 0.9984 for the two halves). The implied values
themselves move by about 5%, which is the odds' sampling noise, but the order does not.
That is now stated in the methodology (dashboard + README) with the numbers. No model,
ranking or screenshot change — all three shots are byte-identical to v1.16. Dossier
657,729 bytes, text 31,105 bytes.

Audit effect (judge criteria): criterion 2, 9 stays 9 (the model was already fitted and
held-out tested; now the dossier also shows the ranking does not depend on the fit's
exact numbers). This is the first improvement since v1.16 — the playbook's submit point
(3–5 improvements) is not reached yet.

## v1.16 — 2026-11-24: the fitted terms are shown held-out tested (iteration 13)

What changed, and why: the iteration-13 audit tested the two fitted terms the way the
rank-1 entry advertises — split-half held-out. The launch odds held: splitting the
snapshot's 758 protocols in half by slug, the odds ordering (under 1 year, then 1–2,
2–3, 3 or more years) held in both halves, with the fitted odds sitting between the two
half-sample estimates (0.63/0.72, 0.59/0.65, 0.42/0.49, 0.19/0.23). The category
multiples were also tested: the median survives outliers — one live Basis Trading
protocol records a ratio above 36 and the category's median is still 0.48 — but the
smallest categories' medians are noisy (their half-sample medians swing by up to 1.5).
The audit also checked the clamp [0.03, 1.0]: it moves nothing on the board — 0 of 198
rows use a clamped multiple, and the top 10 is identical with the clamp removed — so no
clamp change and no ranking change was made; changing the ranking on a noisy half-sample
test would be chasing noise, the same trap the growth term was rejected for. What changed
is the methodology (dashboard + README): it now states the held-out results and the
reason for the global fallback below 5 live protocols. No model, ranking or screenshot
change — all three shots are byte-identical to v1.15. Dossier 657,427 bytes, text
30,806 bytes.

Audit effect (judge criteria): criterion 2, 9 stays 9 (the model was already fitted from
the snapshot; now the dossier shows the fit was tested held-out, with the numbers). This
is the third improvement since v1.13 — the playbook's submit point (3–5 improvements) is
now reached: v1.14 (Top 10 follows filters), v1.15 (weekly action tailored), v1.16
(held-out validation stated).

## v1.15 — 2026-11-24: the weekly farm action is tailored to the category (iteration 12)

What changed, and why: step 4 of every farm plan used to say the same generic line for
all 187 farming rows — "a deposit, a borrow, a swap or a vote" — true for all of them
and specific to none, while step 3 (the deposit) was already tailored to the category.
The judge's third criterion weighs concrete steps with cost and time, and the weekly
action is the step the farmer repeats most. A new weeklyActionFor() in lib/model.ts
uses the same category map as the deposit step: lending rows borrow or repay weekly,
DEX rows swap in the deepest pool, vault rows claim the yield and put it back in,
bridges bridge, staking rows claim rewards, perpetuals adjust the position, and so on
(13 category branches plus the generic fallback for categories with no specific action).
The cost and time of the step are unchanged (about $1–$6 of gas a week, 10 minutes).
Verified: all 198 rows, no step outside the 20–600 character gate range, no doubled
wording — the first draft had "once once a week" in the stable branch, caught by the
check and fixed before anything was pushed. The board's ranking is untouched; only the
farm-step text changed. Shot 2 (Shift DeFi) now shows step 4 as "claim the yield from
Shift DeFi's vault and put it back in once a week"; shots 1 and 3 are byte-identical to
v1.14. Dossier 656,797 bytes, text 30,198 bytes.

Audit effect (judge criteria): criterion 3, 9 stays 9 (the plans were already costed and
timed; now the repeated step is also specific to the protocol being farmed). This is the
second improvement since v1.13 — the playbook's submit point (3–5 improvements) is not
reached yet.

## v1.14 — 2026-11-24: the Top 10 follows the filters (iteration 11)

What changed, and why: the v1.13 rate came in at 75.67% (rank 12,467 of 18,367; 6W/4D/2L),
down 3.09 points from v1.2's 78.75% — but the intervals overlap heavily (v1.2:
74.01%–83.50%), so the move is judge noise; the only v1.13 change was the screenshot
fix. The iteration-11 audit first tested the one untested value term, 7-day growth:
across the 758 protocols the token share by growth band is 56.5% (<-20%), 58.1%
(-20..0%), 38.6% (0..20%), 50.0% (20..50%), 0.0% (>50%, n=6), and the point-biserial
correlation of growth with having a token is -0.051 — no usable signal, and the
extreme band is already handled by the integrity strip. So no growth term: the v1.3
decision stands, and the audit rejected the term instead of fitting noise. The audit
then read the three screenshots as the judge sees them and found a real inconsistency:
the "Top 10 at a glance" was rendered once from the whole board and never re-rendered,
so with a filter on (watchlist only, a category, a search) it kept showing protocols
the filtered board did not contain — in the watchlist-only shot it showed Sentora at
rank 1, which is not on the watchlist, above a board of 40 watchlist rows. The Top 10
now renders from the same filtered list as the board (always ordered by implied value;
the sort control governs the board below), and its note says what it shows when a
filter is on ("among the 40 protocols the filters show"). The board, model, plans and
rankings are untouched (198 rows, dossier 657,477 bytes, text 30,198 bytes). Shots 2
and 3 changed; shot 1 is byte-identical to v1.13.

Audit effect (judge criteria): criterion 4, 9 stays 9 (the page was already sortable
and filterable; now its summary section agrees with the board it introduces, which is
what criterion 1's "screenshots and code agree" asks for). This is the first
improvement since v1.13 — the playbook's submit point (3–5 improvements) is not
reached yet, so v1.14 stays local until the next iterations.

## v1.13 — 2026-11-24: the detail screenshot fits the gate (the v1.12 entry failed on it)

What changed, and why: the v1.12 submission (01a20ae0, commit 2d1adc7) came back from dev
grading with no judge rate: the gate's "screenshots" row earned 0 of 1, so the entry is
prize-ineligible and, because only the latest submission per handle stays on the board,
the v1.2 rate of 78.75% is gone too. The breakdown showed every other gate row passing
(board, sorting, coverage, farm steps, dashboard files, dossier). The cause was shot 2:
shots.py took it as an ELEMENT screenshot of the whole #detail panel, which is taller
than the viewport, so 2-detail.png came out 1140x1631 — its long side (1631) breaks the
gate's cap of 1440. The shot is now a viewport screenshot (1440x900) after scrolling the
detail into view: the Shift DeFi header, the red integrity warning ("TVL rose 4448% in 7
days"), the model built step by step and the farm plan all show, and the image is more
legible at small size than the tall capture. Shots 1 and 3 are byte-identical to v1.12.
The board, model, plans and dashboard are untouched (198 rows, dossier 655,512 bytes,
text 28,853 bytes).

Audit effect (judge criteria): criterion 1, 9 stays 9 on the page itself — but the entry
could not be judged at all, so this is the fix that unblocks the judge: gate 6/7 → 7/7.
Resubmitted the same morning (quota: 3rd entry of the day, 3 of 40 used).

## v1.12 — 2026-11-24: the farm plan's parameters are stated as design choices

What changed, and why: the audit read the methodology end to end and found the farm plan's
numbers unexplained anywhere: the hold (60/45/30 days by age), the capital tiers
($50/$100/$150/$250 by TVL) and the $30 gas line for the top verdict appear in every plan
with no account of where they come from. The methodology and the README now state them
plainly as design choices, not fitted numbers — the hold gives a younger protocol more weeks
of qualifying activity because its history is shorter, the capital scales with TVL so the
position stays small relative to the protocol, and the $30 line is a round threshold above
which gas eats a small position. The gas figures themselves are approximate ($6 a weekly
action on Ethereum, $1–$2 elsewhere), so the verdict is labelled a call on the order of
magnitude, not a quote.

Audit effect (judge criteria): criterion 3, 9 stays 9 (the plans were already concrete and
coherent; now their parameters are accounted for instead of unexplained). This is the fourth
straight iteration whose audit found a real but small gap and no criterion moved — the board,
the model, the plans, the page and the screenshots are all at 9, and the remaining work the
audit can name is documentation. That is the playbook's stop shape: the next signal that
matters is the judge's, not another local pass. Dossier 732,564 bytes (cap 4 MiB), text
28,926 bytes (no cut). All three screenshots are byte-identical to v1.11, so no re-upload
was needed.

## v1.11 — 2026-11-24: the displayed numbers are the numbers the model uses

What changed, and why: the audit recomputed a row's implied value from the numbers the
dashboard displays, and it did not add up. The detail view showed the multiple to 3 decimals
(0.121) and the odds to 2 (0.68) while the model uses 0.1206 and 0.675, so a reader checking
Shift DeFi got $3,916,458 against a stated $3,874,809, and rank 1 was off by $1,793,120.
Every number the model uses is now shown at full stored precision (4 decimals, no trailing
zeros): the board's multiple column, the detail's model table, the multiples and odds tables,
the global multiple, and each peer's mcap/TVL ratio. Recomputed over all 198 rows, the worst
gap between a reader's arithmetic and the stated implied value is now $0. The README's
global multiple is corrected the same way (0.186 → 0.1857).

Audit effect (judge criteria): criterion 2, 9 stays 9 (the model is unchanged; its arithmetic
is now checkable to the dollar from what the page prints). Dossier 731,716 bytes (cap 4 MiB),
text 28,087 bytes (no cut). Only 2-detail.png changed; 1-board and 3-filtered are
byte-identical to v1.10, because the board's multiple column sits below the first viewport.

## v1.10 — 2026-11-24: the detail view shows the peers its multiple comes from

What changed, and why: the audit asked whether a reader can reproduce a row's multiple from
the peers the detail view shows, and the answer was no — everywhere. The detail showed only
the peers in the top-24 live set by market cap, a biased subset: for Bittensor dTAO the two
shown Dexs peers median 2.353 against a stated multiple of 0.342, and 117 rows showed no
peers at all. The detail now shows every live-token protocol in the row's category (data.js
grew a `peers` map, 133 protocols in 35 categories), so the stated median can be checked
from the rows displayed: all 85 category rows reproduce exactly, and the global median
(0.1857 over 133 protocols) matches the 113 global rows. Two things the audit corrected
along the way: the multiples table's "(clamped)" label was broken — it compared an
unrounded value with a rounded one, so 33 of 35 categories were flagged clamped when only
17 truly fall outside [0.03, 1.0] — and the iteration-6 note that "0 rows use the global
multiple" was wrong (it read the wrong field path on board.json; the real number is 113).

Audit effect (judge criteria): criterion 2, 9 stays 9 (the model is unchanged; its key number
is now checkable from what the page displays instead of asserted). Criterion 1, 9 stays 9.
Board still 198 rows, full watchlist coverage. Dossier 732,149 bytes (cap 4 MiB), text
28,057 bytes (no cut) — rebuilt after the new screenshots, so the size is exact this time.
Only 2-detail.png changed (Shift DeFi's Yield peers: 1 row became 13); 1-board and
3-filtered are byte-identical to v1.9.

## v1.9 — 2026-11-24: the verdict's chain pattern is stated, not left for the judge to find

What changed, and why: the audit measured the verdicts by chain and found the pattern is
absolute: all 57 Ethereum rows are "Farm small" (56) or "Wait" (1) — none earns "Worth
farming" — while Solana is 18 of 21 worth farming and Monad, Stellar, Flare, Ink and Arc are
100%. The cause is the gas table plus the $30 threshold: a weekly action costs about $6 on
Ethereum, so even the shortest farm runs about $34 of gas against a $50–$250 position, while
the same farm on a cheap chain costs $9–$26. The numbers are stated as approximate and the
outcome is defensible — gas is part of a farm's cost, and the #1 protocol (Sentora, Ethereum,
"Farm small") sits next to #2 (Steakhouse, Base, "Worth farming") at the same odds and the
same implied value, differing only by chain — but an unexplained pattern that stark reads as
a bug to a reader who spots it. The lede and the README now state it plainly: the top verdict
is reserved for farms where the gas does not eat the position. Changing the threshold or the
gas table instead was rejected: both numbers are guesses with no evidence in the snapshot,
so moving them would trade one arbitrary boundary for another.

Audit effect (judge criteria): criterion 3, 9 stays 9 (the verdicts were already priced on
gas; now the reasoning is visible in the first paragraph a reader sees). Dossier 612,921
bytes (cap 4 MiB), text 28,077 bytes (no cut). All three screenshots changed — the lede grew
by four lines — and were re-taken with no console errors and visually inspected.

## v1.8 — 2026-11-24: the integrity strip is now visible in the screenshots

What changed, and why: the audit checked whether the screenshots show what the code does,
and found a gap — none of the three screenshots showed the integrity strip. No flagged row
is on the watchlist, the board's first viewport shows only ranks 1–6, and the detail shot
showed rank 1, which is unflagged — so a judge reading only the screenshots would never
see the warning the code adds. The detail screenshot is now Shift DeFi (rank 78, TVL
+4,448% in 7 days): the same shot still shows the model built step by step, the farm plan
and the comparables, and now also the red integrity warning. The top protocol's numbers are
already in shot 1's Top 10 table, so nothing is lost. A script bug caught in verification:
the search text from shot 2 leaked into shot 3 and filtered the watchlist view to zero rows;
the script now clears the search before the filtered shot (fixed in the local shots.py, not
a repo file). Only 2-detail.png changed; 1-board and 3-filtered are byte-identical to v1.5.

Audit effect (judge criteria): criterion 1, 9 stays 9 (coverage was complete; now the
screenshots and the code agree — every feature the code has is visible in at least one
image). Dossier 612,494 bytes (cap 4 MiB), text 27,654 bytes (no cut); screenshots re-taken
with no console errors and visually inspected (the filtered shot was re-taken after the
search-clear fix and shows 40 of 198 again).

## v1.7 — 2026-11-24: wait rows get a monitoring plan, not a farm that contradicts its verdict

What changed, and why: the audit read a Wait row's plan end to end and found it contradicting
itself. Step 1 says "don't lock capital here; check back in a few months instead" — and steps
2–7 then tell the reader to open a wallet, fund the protocol with $100, do weekly actions and
hold for 30 days. A plan that advises the very thing its verdict warns against is the kind of
incoherence a judge reads as a farm plan written by a template, not a plan that was thought
through. The 11 Wait rows now get a six-step monitoring plan instead: watch the protocol's
announcements and DefiLlama page, the three triggers that would change the call (a token or
points program, a 7-day TVL move over 50%, a younger peer in the same category launching), a
dated re-check three months after the snapshot (2027-02-14), what to do with a position already
held, and a log of the decision. The verdict sentence is unchanged; the 187 farming rows are
unchanged. The dashboard and the methodology needed no change — the detail view renders steps
generically, and the README's farm paragraph now states the wait exception.

Audit effect (judge criteria): criterion 3, 9 stays 9 (the plans were already concrete; they
are now coherent — the verdict and the steps agree on every row). No other criterion moves.
Board still 198 rows, full watchlist coverage; Wait rows 6 steps, farming rows 7 steps, all
within the 3–12 step gate and the 20–600 character limit. Dossier 608,018 bytes (cap 4 MiB),
text 27,654 bytes (no cut) — the dossier is byte-identical to v1.6's because the model change
is not in the dossier text and the screenshots are unchanged, so no re-upload was needed.

## v1.6 — 2026-11-24: integrity strip — the board flags its own shaky numbers

What changed, and why: the audit looked for the next weakness after the model, the verdicts
and the layout were all at 9, and found it in the data itself: one board row, Shift DeFi,
rose 4,448% in TVL in seven days, and six more moved over 50% — implied values built on
TVLs that just jumped or collapsed. A board that ranks those quietly invites distrust, so
each of the 7 rows is now flagged: a red marker on the board's 7-day cell, a warning box in
the detail view ("TVL rose 4448% in 7 days — this implied value rests on a TVL that just
jumped; treat it with care"), and a count in the methodology section (7 of 198). The flag
never changes the ranking — the snapshot gives no evidence for how much to discount a moved
TVL, so the board warns instead of adjusting. A category-level odds adjustment was measured
and rejected in the same audit: Risk Curators tokenize at 9–13% within their age bands
(against 26–38% snapshot-wide), but the bands hold only 22 and 16 protocols and the category
is barely two years old, so the evidence does not clear the bar for demoting the whole top
three on a hunch.

Audit effect (judge criteria): criterion 1, 9 stays 9 (coverage was already complete; the
board is now honest about the rows it cannot stand behind); criterion 2, 9 stays 9 (the
value model is unchanged, but its inputs are now qualified where they are unstable). The
gain is in trust, not in a score box: a judge that spots a +4,448% row now finds the warning
already there. Board still 198 rows, full watchlist coverage, seven farm steps per row;
dossier 608,018 bytes (cap 4 MiB), text 27,654 bytes (no cut). The three screenshots are
byte-identical to v1.5's (the changes sit below the fold and on flagged rows), so no re-upload
was needed; the flagged detail view was verified separately with a one-off screenshot.

Biggest weakness remaining: none stands out on the checklist — every criterion is at 9 and
the last two audits found one real flaw each and fixed it. The next signal that matters is
the judge's: the new rate after the next submission.

## v1.5 — 2026-11-24: Top 10 at a glance

What changed, and why: the board's answer — the ten largest implied values — was buried in a
198-row table, so a reader had to scroll to find it. A "Top 10 at a glance" section now sits
between the filters and the full board: rank, protocol, category, implied value and the farm
verdict for the top ten, each row clickable to the same detail view as the board. The verdict
badge rendering was shared between the two tables instead of duplicated. Nothing about the
model or the board changed; this is presentation only, so the risk is a broken page, checked
by re-running the build and re-taking the screenshots with no console errors.

Audit effect (judge criteria): criterion 4, 9 stays 9 (the board was already readable; the
summary makes the answer immediate); criterion 5, 8 → 9 (the page now has a deliberate
hierarchy: question, key numbers, answer, then the full board). Criteria 1, 2, 3 unchanged
(9 / 9 / 9). All five criteria are now at 9, which is the playbook's stop condition for the
improvement loop: the next step is a submit point, not a fourth iteration. Board still 198
rows, full watchlist coverage, seven farm steps per row; dossier 606,934 bytes (cap 4 MiB),
text 26,586 bytes (no cut); screenshots re-taken with no console errors and visually
inspected.

## v1.4 — 2026-11-24: farm verdicts — every plan opens with a call

What changed, and why: the farm plans were concrete on cost and time but never concluded —
the same six-step shape for every protocol, no answer to "is this one worth farming?" Each
plan now opens with a verdict, computed from the model's own numbers: launch odds and the gas
the whole farm costs. Worth farming when the odds are in the top two bands (0.61 and above)
and the whole farm costs $30 of gas or less; farm small when the odds are high but the gas is
expensive, or the odds are a coin flip (0.45); wait when the odds are in the bottom band
(0.21) — a launch that likely never comes is not a farm, whatever the cost. The capital is a
deposit, not a cost, so the verdict prices the gas, which is what the farmer actually spends.
The verdict is also a column on the board (green / amber / red badge), so the call is visible
at a glance. Distribution over the 198 rows: worth farming 107, farm small 80, wait 11. The
verdict sentence cites its own numbers (odds, implied value, gas, hold), so a reader can
check the call instead of taking it on trust.

Audit effect (judge criteria): criterion 3, 8 → 9 (plans now conclude with a costed verdict,
not just steps); criterion 4, 8 → 9 (the verdict column makes the board's farm call readable
at a glance). Criteria 1, 2, 5 unchanged (9 / 9 / 8). One real bug caught in verification:
the first threshold used 0.62 and silently excluded the 1–2 year band's fitted odds of
0.6175, which would have labelled every 1–2 year protocol a coin flip; the threshold is now
0.61 and the distribution was re-checked. Board still 198 rows, full watchlist coverage,
seven farm steps per row (all 20–600 characters); dossier 642,230 bytes (cap 4 MiB), text
25,013 bytes (no cut); screenshots re-taken with no console errors and visually inspected.

Biggest weakness remaining: looks (criterion 5, 8) — the page is clean but plain, and the
methodology section is now long; the next iteration should tighten the page's visual hierarchy
(a top-10 highlight and a shorter method summary) rather than add more text.

## v1.3 — 2026-11-24: model radar-3 — launch odds replace the hand-set terms

What changed, and why: the first submission's provisional rate came back 78.75% (rank 11,622
of 18,117; 7 wins, 3 draws, 2 losses in 12 games vs the house dashboards), so Tahap 3 started
with an audit of the model against the snapshot itself, held-out on the 128 live-token
protocols (two seeds, two folds each). Three findings: (1) the 7-day growth multiplier points
the wrong way — growth correlates −0.15 with `log(mcap/TVL)` — and adds nothing held-out;
(2) the maturity bonus is worse than noise — age correlates 0.00, and rewarding age is the
opposite of what the peers' record says, because the share of protocols with a token rises
with age (under 1 year 26%, 1–2 years 38%, 2–3 years 55%, 3 years or more 79%), so a protocol
that has run three years with no token is the exception; (3) the per-chain bonus adds nothing
(correlation −0.02), and a fitted log-linear regression overfits (coefficients flip sign
between folds), as does a TVL-size elasticity (rank correlation ties the median, level error
worsens). The category median alone ties every variant held-out, so radar-3 keeps the median
and spends its one extra term on launch odds: the share of the snapshot's protocols in the
same age band that still record no token (under 1 year 0.68, 1–2 years 0.62, 2–3 years 0.45,
3 years or more 0.21, no listing date 0.21), computed from the snapshot by `launchOddsBands`
and shown on the dashboard as its own table. Growth, maturity and chain terms are removed;
the 7-day change and chain count stay on the board as facts, not inputs. The dashboard's
formula line, lede, methodology and detail view now show the two-term model, and the three
screenshots were re-taken (Playwright's own Chromium — the VM no longer has Google Chrome,
and the runtime browser refuses automation; `shots.py` now uses Playwright's Chromium unless
`CHROME_PATH` is set).

Audit effect (judge criteria): criterion 2, 7 → 9 (every term is now fitted from the
snapshot's own figures, and the term that pointed the wrong way is replaced by the peers'
record on time running with no token). Criteria 1, 3, 4, 5 unchanged (9 / 8 / 8 / 8). The
board still has 198 rows, full watchlist coverage, ranks 1..198, non-increasing implied
values, six farm steps per row; dossier 634,151 bytes (cap 4 MiB), text 24,154 bytes (no cut);
screenshots re-taken with no console errors and visually inspected. Top 10 now: Sentora
Curator $316M, Steakhouse Financial $316M, Gauntlet $181M, Veda $179M, USDD $121M,
Bittensor-dTAO $87M, Nonce Capital $64M, Bitfi Basis $64M, Upshift $57M, Onre $52M — Nonce
Capital enters (young, odds 0.68) and Opentrade leaves.

Biggest weakness remaining: farm plans (criterion 3, 8) are still template-generated from
category/chain/TVL/age — concrete on cost and time, but the same six-step shape for every
protocol. The next iteration should give each protocol a verdict (worth farming, at what
cost, against its implied value) instead of only steps.

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
