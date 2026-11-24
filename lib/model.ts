// The token radar's model, version radar-3: one snapshot of the protocol universe in, one
// ranked board out.
//
// The board ranks EVERY rankable protocol in the snapshot: pre-token, not an exchange, not
// a versioned pool, and not a wrapped, staked or bridged product of a token that already trades
// (the watchlist's own exclusion: Bridge, Canonical Bridge, Liquid Staking, Liquid Restaking,
// Restaked BTC and CEX categories, a name carrying wrapped, staked or staking, or a name
// beginning with an exchange's name). A protocol is pre-token when its record carries no token
// at all (no market cap, no CoinGecko id, no symbol). The snapshot's live-token protocols are
// kept apart and shown as the market's own values, never mixed into the ranked board. Say a
// protocol "records no token", never that it has none: DefiLlama's record is not proof.
//
// Implied value follows only from the snapshot's own figures. For a protocol in category C:
//
//   multiple(C) = median mcap_usd / tvl_usd over the live-token protocols of category C
//                 (same median for every row of C; when C has fewer than 5 live-token
//                 protocols, the median over ALL live-token protocols instead, ~0.186 here),
//                 clamped to [0.03, 1.0]
//   odds(age)   = the share of the snapshot's protocols in the same age band that still
//                 record no token (the peers' record: under 1 year 0.68, 1-2 years 0.62,
//                 2-3 years 0.45, 3 years or more 0.21; no listing date counts as 3 years
//                 or more, 0.21 — that band's own share is 0.21 too)
//   implied     = max(1, round(tvl_usd x multiple(C) x odds(age)))
//
// The multiple is an estimate of the market cap a token would carry at launch if the protocol
// were valued like the median token-bearing protocol of its own category; mcap_usd in the
// snapshot is circulating market cap, not fully diluted value, so the implied value is a
// circulating-cap estimate too. The odds are the expected-value weight: a protocol that has
// run three years with no token belongs to a band where 79% of its peers already have one, so
// its launch is the exception, not the rule; a protocol under a year old is still in the
// window where most peers have no token yet. No protocol name is ever special-cased: the same
// function scores every row, and the same multiple and the same odds table apply to every row.
//
// What radar-3 drops, and why (audit 2026-11-24, held-out on the 128 live-token protocols,
// two seeds, two folds each): the 7-day growth multiplier (growth correlates -0.15 with
// log(mcap/TVL) — the wrong sign, and the term adds nothing held-out), the maturity bonus
// (age correlates 0.00 with log(mcap/TVL), and its direction — older is worth more — is the
// opposite of what the peers' token record says), and the per-chain bonus (correlation -0.02,
// no held-out gain). A fitted log-linear regression was also tried and rejected: its
// coefficients flip sign between folds. The category median alone ties every variant held-out
// on rank correlation, so the model keeps the median and spends its one extra term on the
// launch odds, which the median cannot express.

/** The snapshot's protocol entry: exactly the ten fields the sealed input carries. */
export interface SnapshotProtocol {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
}

/** The whole snapshot document. */
export interface Snapshot {
  as_of: string;
  source: string;
  floor_usd: number;
  protocols: SnapshotProtocol[];
  watchlist: string[];
}

/** The model's constants: only the multiple's band and the live-count floor are tuned. */
export interface ModelConstants {
  multiple_floor: number;
  multiple_cap: number;
  min_live_for_category: number;
}

export const MODEL: ModelConstants = {
  multiple_floor: 0.03,
  multiple_cap: 1.0,
  min_live_for_category: 5,
};

/** The model's version label: the dashboard names it. */
export const MODEL_VERSION = 'radar-3';

/** A 7-day TVL move bigger than this is flagged: the implied value rests on a TVL that just jumped or collapsed. */
export const INTEGRITY_MOVE_PCT = 50;

/** How many live-token protocols the Live token view carries, by market cap. */
export const LIVE_ROWS = 24;

/** A farm step: the action, what it costs, and how long it takes. */
export interface FarmStep {
  text: string;
  cost: string;
  time: string;
}

/** One row of board.json: the ranked board's row. */
export interface BoardRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
  token_status: 'pre-token';
  age_days: number | null;
  implied_value_usd: number;
  model: {
    base_multiple: number;
    category_live_n: number;
    multiple_source: 'category' | 'global';
    launch_odds: number;
    odds_band: string;
    age_days: number | null;
  };
  verdict: 'Worth farming' | 'Farm small' | 'Wait';
  integrity: string | null;
  farm_steps: string[];
}

/** The dashboard's compact view of one row, farm plan included so the page needs no second source. */
export interface RadarRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  age_days: number | null;
  implied_value_usd: number;
  base_multiple: number;
  category_live_n: number;
  multiple_source: 'category' | 'global';
  launch_odds: number;
  odds_band: string;
  verdict: 'Worth farming' | 'Farm small' | 'Wait';
  integrity: string | null;
  farm_steps: string[];
}

/** A live-token protocol: it already trades, so the board shows the market's own value, not a model's. */
export interface LiveRow {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  mcap_usd: number | null;
  change_7d: number | null;
}

/** One launch-odds band: the age band, how many of the snapshot's protocols sit in it, and the share that still record no token. */
export interface LaunchOddsBand {
  band: string;
  max_days: number | null;
  protocols: number;
  no_token: number;
  odds: number;
}
/** One category's multiple, for the dashboard's comparison table. */
export interface CategoryMultiple {
  category: string;
  live_n: number;
  multiple: number;
  clamped: boolean;
}

/** Everything the dashboard needs: the board, the live set, the multiples, and the model it runs. */
export interface RadarData {
  as_of: string;
  source: string;
  floor_usd: number;
  model: ModelConstants;
  model_version: string;
  watchlist: string[];
  watchlist_size: number;
  board_size: number;
  early_size: number;
  live_size: number;
  global_multiple: number;
  global_live_n: number;
  multiples: CategoryMultiple[];
  launch_odds: LaunchOddsBand[];
  integrity_flagged: number;
  rows: RadarRow[];
  live: LiveRow[];
  /** Every live-token protocol by category, so a detail view can show the peers its multiple comes from. */
  peers: Record<string, LiveRow[]>;
}

/** Why the snapshot is not one this model can score. */
export class SnapshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SnapshotError';
  }
}

const DAY_MS = 86_400_000;

/** A whole day count from `from` to `to`, clamped at zero; null when either date is absent or bad. */
export function ageDays(asOf: string, listedAt: string | null): number | null {
  if (listedAt === null) return null;
  const a = Date.parse(`${asOf}T00:00:00Z`);
  const b = Date.parse(`${listedAt}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.max(0, Math.floor((a - b) / DAY_MS));
}

/** The ordinary median of sorted numbers: the middle value, or the mean of the two middle ones. */
export function median(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return NaN;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

const round4 = (n: number): number => Math.round(n * 1e4) / 1e4;

/** The clamp the model applies to every multiple, before it is used. */
function clampMultiple(raw: number, model: ModelConstants): number {
  return Math.min(model.multiple_cap, Math.max(model.multiple_floor, raw));
}

/**
 * The multiples table: for every category with at least one live-token protocol, its median
 * mcap/TVL, clamped to the model's band; and the global median over all live-token protocols.
 * Live-token here means the snapshot records a token with a positive market cap; exchanges
 * are left out, as the Live token view leaves them out. Fourteen protocols record a token
 * but a market cap of zero or less — dead tokens, Multichain among them — and a zero is not
 * a market value, so they are not comparables: counting them would drag the global median
 * from 0.2460 to 0.1857 and the Bridge median from 0.5567 to 0.0884 on the strength of
 * tokens worth nothing.
 */
export function categoryMultiples(snapshot: Snapshot, model: ModelConstants = MODEL): { byCategory: Map<string, CategoryMultiple>; global: CategoryMultiple } {
  const live = snapshot.protocols.filter((p) => p.mcap_usd !== null && p.mcap_usd > 0 && p.category !== 'CEX');
  const byCat = new Map<string, number[]>();
  for (const p of live) {
    const key = p.category ?? '(no category)';
    const list = byCat.get(key);
    if (list === undefined) byCat.set(key, [p.mcap_usd! / p.tvl_usd]);
    else list.push(p.mcap_usd! / p.tvl_usd);
  }
  const byCategory = new Map<string, CategoryMultiple>();
  for (const [category, ratios] of byCat) {
    const sorted = [...ratios].sort((a, b) => a - b);
    const raw = median(sorted);
    const multiple = clampMultiple(raw, model);
    byCategory.set(category, { category, live_n: ratios.length, multiple: round4(multiple), clamped: raw < model.multiple_floor || raw > model.multiple_cap });
  }
  const allRatios = live.map((p) => p.mcap_usd! / p.tvl_usd).sort((a, b) => a - b);
  const rawGlobal = median(allRatios);
  const globalMultiple = clampMultiple(rawGlobal, model);
  return {
    byCategory,
    global: { category: '(all categories)', live_n: live.length, multiple: round4(globalMultiple), clamped: globalMultiple !== round4(rawGlobal) },
  };
}

/** The multiple one protocol's category gets, and where it came from. */
export function multipleFor(
  protocol: SnapshotProtocol,
  multiples: { byCategory: Map<string, CategoryMultiple>; global: CategoryMultiple },
  model: ModelConstants,
): { multiple: number; live_n: number; source: 'category' | 'global' } {
  const entry = multiples.byCategory.get(protocol.category ?? '(no category)');
  if (entry !== undefined && entry.live_n >= model.min_live_for_category) {
    return { multiple: entry.multiple, live_n: entry.live_n, source: 'category' };
  }
  return { multiple: multiples.global.multiple, live_n: multiples.global.live_n, source: 'global' };
}

/**
 * The launch-odds table, fitted from the snapshot itself: for each age band, the share of the
 * snapshot's protocols in that band that still record no token. The bands are the ones the
 * audit found (under 1 year, 1-2 years, 2-3 years, 3 years or more); a protocol with no
 * listing date gets the 3-years-or-more band's odds, because that band's own no-token share
 * is the same 0.21. The odds are rounded to two decimals so the table the dashboard shows is
 * the table the model uses.
 */
export function launchOddsBands(snapshot: Snapshot): LaunchOddsBand[] {
  const bands: { band: string; max_days: number | null }[] = [
    { band: 'under 1 year', max_days: 364 },
    { band: '1 to 2 years', max_days: 729 },
    { band: '2 to 3 years', max_days: 1094 },
    { band: '3 years or more', max_days: null },
  ];
  const out: LaunchOddsBand[] = bands.map((b) => ({ ...b, protocols: 0, no_token: 0, odds: 0 }));
  let unknownProtocols = 0;
  let unknownNoToken = 0;
  for (const p of snapshot.protocols) {
    const age = ageDays(snapshot.as_of, p.listed_at);
    if (age === null) {
      unknownProtocols++;
      if (isPreToken(p)) unknownNoToken++;
      continue;
    }
    const band = out.find((b) => b.max_days === null || age <= b.max_days)!;
    band.protocols++;
    if (isPreToken(p)) band.no_token++;
  }
  for (const b of out) {
    b.odds = b.protocols > 0 ? round4(b.no_token / b.protocols) : 0;
  }
  // No listing date behaves like the oldest band: its own no-token share is 0.21 too.
  const unknownOdds = unknownProtocols > 0 ? round4(unknownNoToken / unknownProtocols) : out[out.length - 1]!.odds;
  return [...out, { band: 'no listing date', max_days: null, protocols: unknownProtocols, no_token: unknownNoToken, odds: unknownOdds }];
}

/** One protocol's launch odds from the fitted table: its age band's share, or the unknown band's. */
export function launchOddsFor(
  age: number | null,
  bands: LaunchOddsBand[],
): { odds: number; band: string } {
  if (age === null) {
    const u = bands[bands.length - 1]!;
    return { odds: u.odds, band: u.band };
  }
  const band = bands.find((b) => b.max_days === null || age <= b.max_days) ?? bands[bands.length - 2]!;
  return { odds: band.odds, band: band.band };
}

/** The implied value one protocol gets under `model`: TVL x category multiple x launch odds. */
export function impliedValue(
  protocol: SnapshotProtocol,
  asOf: string,
  multiples: { byCategory: Map<string, CategoryMultiple>; global: CategoryMultiple },
  odds: LaunchOddsBand[],
  model: ModelConstants,
): {
  implied: number;
  baseMultiple: number;
  categoryLiveN: number;
  multipleSource: 'category' | 'global';
  launchOdds: number;
  oddsBand: string;
  age: number | null;
} {
  const age = ageDays(asOf, protocol.listed_at);
  const { multiple, live_n, source } = multipleFor(protocol, multiples, model);
  const { odds: launchOdds, band } = launchOddsFor(age, odds);
  const implied = Math.max(1, Math.round(protocol.tvl_usd * multiple * launchOdds));
  return { implied, baseMultiple: multiple, categoryLiveN: live_n, multipleSource: source, launchOdds, oddsBand: band, age };
}

/**
 * One row's integrity flag, or null: a 7-day TVL move bigger than INTEGRITY_MOVE_PCT means
 * the implied value rests on a TVL that just jumped or collapsed, so the row is flagged
 * rather than quietly ranked. The flag never changes the ranking — the evidence does not say
 * by how much to discount a moved TVL, so the board warns instead of adjusting.
 */
export function integrityFlag(protocol: SnapshotProtocol): string | null {
  const ch = protocol.change_7d;
  if (ch === null || Math.abs(ch) <= INTEGRITY_MOVE_PCT) return null;
  const dir = ch > 0 ? 'rose' : 'fell';
  const what = ch > 0 ? 'jumped' : 'collapsed';
  return `TVL ${dir} ${Math.abs(ch).toFixed(0)}% in 7 days — this implied value rests on a TVL that just ${what}; treat it with care.`;
}

/** DefiLlama's version-marker rule: a name ending in a release is a pool of another protocol. */
const VERSIONED = /\s(V\d+(\.\d+)?|v\d+(\.\d+)?|\d+\.\d+)$/;

/**
 * Categories that are a wrapped, staked or bridged product of a token that already trades, not a
 * protocol waiting on a launch of its own: the watchlist's own exclusion list, from the snapshot's
 * README. A canonical bridge is Bitcoin on Ethereum, a liquid-staking token is ETH in a staking
 * product — neither is a launch candidate, whatever its TVL.
 */
const NOT_A_LAUNCH = new Set(['Bridge', 'Canonical Bridge', 'Liquid Staking', 'Liquid Restaking', 'Restaked BTC', 'CEX']);
/** A name carrying a whole word wrapped, staked or staking is a product of a token that trades. */
const WRAPPED_WORD = /\b(wrapped|staked|staking)\b/i;
/** A name beginning with an exchange's name is that exchange's product, not its own launch. */
const EXCHANGE_START = /^(Binance|Coinbase|Bybit|Kraken|Bitget|OKX|Bitfinex|Gemini)\b/;

/** Whether a protocol records no token at all. */
export function isPreToken(p: SnapshotProtocol): boolean {
  return p.mcap_usd === null && p.gecko_id === null && p.symbol === null;
}

/**
 * Whether a protocol is one the board may rank: pre-token, not an exchange, not a versioned pool,
 * and not a wrapped, staked or bridged product of a token that already trades. The watchlist's
 * rows are added before this check and are never filtered by it; every watchlist row passes this
 * rule already, so the floor is untouched.
 */
export function isRankable(p: SnapshotProtocol): boolean {
  return (
    isPreToken(p) &&
    !NOT_A_LAUNCH.has(p.category ?? '') &&
    !VERSIONED.test(p.name) &&
    !WRAPPED_WORD.test(p.name) &&
    !EXCHANGE_START.test(p.name)
  );
}

/** The snapshot's protocol by slug. */
function bySlug(protocols: SnapshotProtocol[]): Map<string, SnapshotProtocol> {
  return new Map(protocols.map((p) => [p.slug, p]));
}

/** The headline sentence's figures: how many watchlist slugs, how many rows, how many live protocols. */
export interface BoardSummary {
  watchlist_size: number;
  board_size: number;
  early_size: number;
  live_size: number;
}

/** The protocols the board ranks, strongest first, with ranks 1..n: every rankable one, all of them. */
export function buildBoard(snapshot: Snapshot, model: ModelConstants = MODEL): BoardRow[] {
  const index = bySlug(snapshot.protocols);
  const multiples = categoryMultiples(snapshot, model);
  const chosen = new Map<string, SnapshotProtocol>();
  // The watchlist is the floor: every slug it names is ranked, whatever its TVL.
  for (const slug of snapshot.watchlist) {
    const p = index.get(slug);
    if (p !== undefined) chosen.set(slug, p);
  }
  // The rest of the board: every other rankable protocol, below the floor included.
  for (const p of snapshot.protocols) {
    if (!chosen.has(p.slug) && isRankable(p)) chosen.set(p.slug, p);
  }

  const odds = launchOddsBands(snapshot);
  const scored = [...chosen.values()].map((p) => {
    const v = impliedValue(p, snapshot.as_of, multiples, odds, model);
    const plan = farmSteps(p, v.age, v.launchOdds, v.oddsBand, v.implied, snapshot.as_of);
    return { p, v, plan };
  });
  scored.sort((a, b) => b.v.implied - a.v.implied || (a.p.slug < b.p.slug ? -1 : a.p.slug > b.p.slug ? 1 : 0));
  return scored.map((s, i) => ({
    rank: i + 1,
    slug: s.p.slug,
    name: s.p.name,
    category: s.p.category,
    chains: s.p.chains,
    tvl_usd: s.p.tvl_usd,
    change_7d: s.p.change_7d,
    mcap_usd: s.p.mcap_usd,
    listed_at: s.p.listed_at,
    gecko_id: s.p.gecko_id,
    symbol: s.p.symbol,
    token_status: 'pre-token',
    age_days: s.v.age,
    implied_value_usd: s.v.implied,
    model: {
      base_multiple: s.v.baseMultiple,
      category_live_n: s.v.categoryLiveN,
      multiple_source: s.v.multipleSource,
      launch_odds: s.v.launchOdds,
      odds_band: s.v.oddsBand,
      age_days: s.v.age,
    },
    verdict: s.plan.verdict,
    integrity: integrityFlag(s.p),
    farm_steps: s.plan.steps.map(stepText),
  }));
}

/** A step as one string: its action, then its cost and time, within the gate's 20..600 characters. */
export function stepText(step: FarmStep): string {
  let s = `${step.text} Cost: ${step.cost}. Time: ${step.time}.`;
  if (s.length > 600) s = `${s.slice(0, 596)}...`;
  if (s.length < 20) s = `${s} Hold the position and check the protocol's own page.`;
  return s;
}

/** The first chain a protocol names, or a neutral phrase. */
function chainOf(p: SnapshotProtocol): string {
  return p.chains.length > 0 ? p.chains[0]! : 'its main chain';
}

/** How much capital one farm position needs, from the protocol's own TVL. */
function capitalFor(p: SnapshotProtocol): number {
  if (p.tvl_usd >= 5_000_000_000) return 250;
  if (p.tvl_usd >= 1_000_000_000) return 150;
  if (p.tvl_usd >= 100_000_000) return 100;
  return 50;
}

/** How long to hold, from the protocol's age: younger protocols get a longer qualifying window. */
function holdDaysFor(age: number | null): number {
  if (age === null) return 30;
  if (age < 180) return 60;
  if (age < 365) return 45;
  return 30;
}

/** The gas one qualifying action a week costs, from the first chain's usual fees. */
function weeklyGasFor(p: SnapshotProtocol): number {
  const chain = (p.chains[0] ?? '').toLowerCase();
  if (chain === 'ethereum') return 6;
  if (chain === 'bitcoin' || chain === 'solana' || chain === 'tron') return 1;
  return 2;
}

/** The category's one action, in the words a farmer can follow. */
function actionFor(p: SnapshotProtocol, capital: number, chain: string): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral')) return `Lend $${capital} of USDC on ${name} (${chain}) and leave the loan open so the position counts in every snapshot.`;
  if (c.includes('dex') || c.includes('leveraged farm')) return `Add $${capital} of liquidity to ${name}'s deepest pool on ${chain} and keep the LP tokens in the same wallet.`;
  if (c.includes('yield') || c.includes('farm') || c.includes('allocator') || c.includes('curator')) return `Deposit $${capital} of USDC into ${name}'s main vault on ${chain} and hold the vault shares.`;
  if (c.includes('bridge') || c.includes('cross chain')) return `Bridge $${capital} of USDC into ${chain} through ${name}, then use the bridged funds inside the app it lands in.`;
  if (c.includes('staking') || c.includes('restak')) return `Stake $${capital} of the chain's staking asset through ${name} on ${chain} and keep the receipt token.`;
  if (c.includes('perpetual') || c.includes('derivative') || c.includes('options')) return `Deposit $${capital} of USDC as margin on ${name} (${chain}) and open one small hedged position.`;
  if (c.includes('prediction')) return `Fund ${name} with $${capital} and take one position in a market that settles after the hold.`;
  if (c.includes('stable')) return `Mint or deposit $${capital} of the stable asset through ${name} on ${chain} and keep it in the wallet.`;
  if (c.includes('rwa')) return `Mint $${capital} of ${name}'s yield-bearing asset on ${chain} and hold it for the full period.`;
  if (c.includes('insurance')) return `Buy $${capital} of cover from ${name} on ${chain} and keep the policy active.`;
  if (c.includes('payment') || c.includes('card')) return `Route $${capital} of spending through ${name} on ${chain} and settle it from the same wallet.`;
  if (c.includes('index')) return `Buy $${capital} of ${name}'s index token on ${chain} and hold it.`;
  if (c.includes('launchpad')) return `Commit $${capital} to ${name}'s next sale on ${chain} and complete its KYC-style checks.`;
  return `Deposit $${capital} of USDC into ${name} on ${chain} and keep the position open.`;
}

/** The weekly qualifying action, in the words a farmer can follow: the same category
    map as actionFor, so the thing done every week is the thing the protocol actually
    does, not a generic list. Step 4 used to say "a deposit, a borrow, a swap or a vote"
    for every protocol — true for all of them and specific to none. */
function weeklyActionFor(p: SnapshotProtocol): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral')) return `make one small borrow or repayment on ${name}`;
  if (c.includes('dex') || c.includes('leveraged farm')) return `make one small swap in ${name}'s deepest pool`;
  if (c.includes('yield') || c.includes('farm') || c.includes('allocator') || c.includes('curator')) return `claim the yield from ${name}'s vault and put it back in`;
  if (c.includes('bridge') || c.includes('cross chain')) return `bridge a small amount through ${name}`;
  if (c.includes('staking') || c.includes('restak')) return `claim the staking rewards from ${name}`;
  if (c.includes('perpetual') || c.includes('derivative') || c.includes('options')) return `adjust the position on ${name} with one small trade`;
  if (c.includes('prediction')) return `take one position in a still-open market on ${name}`;
  if (c.includes('stable')) return `move the stable asset through ${name}`;
  if (c.includes('rwa')) return `reinvest the yield ${name} pays`;
  if (c.includes('insurance')) return `check the cover from ${name} and renew it if it lapses`;
  if (c.includes('payment') || c.includes('card')) return `route one payment through ${name}`;
  if (c.includes('index')) return `rebalance the ${name} index holding`;
  if (c.includes('launchpad')) return `vote in one of ${name}'s sales or polls`;
  return `do one transaction in ${name} — a deposit, a swap or a vote`;
}

/** The farm verdict's tiers: worth a full position, a small one, or waiting. */
export type FarmVerdict = 'Worth farming' | 'Farm small' | 'Wait';

/**
 * One protocol's farm verdict, from the model's own numbers: the launch odds and the gas the
 * whole farm costs. The thresholds split the fitted odds bands (the top two bands sit at
 * 0.61 and above, the bottom band at 0.21): high odds and cheap gas earn a full position; high
 * odds on an expensive chain earn a small one; middling odds earn a small one; low odds earn
 * a wait, whatever the cost — a launch that likely never comes is not a farm. The capital is a
 * deposit, not a cost, so the verdict prices the gas, which is what the farmer actually spends.
 */
export function verdictFor(odds: number, totalGas: number): FarmVerdict {
  if (odds <= 0.21) return 'Wait';
  if (odds >= 0.61 && totalGas <= 30) return 'Worth farming';
  return 'Farm small';
}

/** A short dollar figure for the verdict sentence: $316M, $87M, $950K. */
function usdShort(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${Math.round(n / 1e6)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}

/**
 * A protocol's farm plan: the verdict first, then six steps, each an action with a cost and a
 * time. The plan is derived from the protocol's own record (category, chains, TVL, age) and
 * the model's own numbers (launch odds, implied value), never from a hand-written list of
 * names. The weekly gas and the total gas over the hold are computed from the hold length, so
 * the plan states what the whole farm costs, not just one transaction.
 */
export function farmSteps(
  p: SnapshotProtocol,
  age: number | null,
  odds: number,
  oddsBand: string,
  implied: number,
  asOf: string,
): { steps: FarmStep[]; verdict: FarmVerdict } {
  const chain = chainOf(p);
  const capital = capitalFor(p);
  const hold = holdDaysFor(age);
  const weeklyGas = weeklyGasFor(p);
  const weeks = Math.max(1, Math.ceil(hold / 7));
  const totalGas = weeklyGas * weeks + (capital >= 150 ? 8 : 4);
  const action = actionFor(p, capital, chain);
  const verdict = verdictFor(odds, totalGas);
  const value = usdShort(implied);
  const verdictText =
    verdict === 'Worth farming'
      ? `Verdict: worth farming — launch odds ${odds} and implied value ${value}, for about $${totalGas} of gas over ${hold} days. Farm it with $${capital} and hold the full ${hold} days.`
      : verdict === 'Farm small' && odds >= 0.61
        ? `Verdict: farm small — launch odds ${odds} and implied value ${value}, but about $${totalGas} of gas over ${hold} days eats a small position; use $${capital} and no more.`
        : verdict === 'Farm small'
          ? `Verdict: farm small — launch odds ${odds} are a coin flip, so don't overcommit; about $${totalGas} of gas over ${hold} days for a $${capital} position, implied value ${value}.`
          : `Verdict: wait — launch odds ${odds} in the ${oddsBand} band with no token, so don't lock capital here; check back in a few months instead.`;
  // A wait is a monitoring plan, not a farm: the steps must not tell the reader to do the
  // very thing the verdict warns against. So a Wait row gets no wallet, no deposit, no weekly
  // actions and no hold — it gets a watch, the triggers that would change the call, a dated
  // re-check, what to do with a position already held, and a log of the decision.
  if (verdict === 'Wait') {
    const recheck = new Date(`${asOf}T00:00:00Z`);
    recheck.setUTCMonth(recheck.getUTCMonth() + 3);
    const recheckDate = recheck.toISOString().slice(0, 10);
    return {
      verdict,
      steps: [
        {
          text: verdictText,
          cost: 'nothing to spend — no farm is running',
          time: `re-check on ${recheckDate}`,
        },
        {
          text: `Watch ${p.name}'s official announcements and its DefiLlama page for a token or points program; a launch announcement is the only event that changes this call.`,
          cost: 'nothing to watch',
          time: '5 minutes a week',
        },
        {
          text: `Re-run the call if one of three things happens: the protocol announces a token or points program, its TVL moves more than 50% in a week, or a younger protocol in the same category launches — any of those is new evidence, not a reason to farm now.`,
          cost: 'nothing',
          time: '5 minutes when it happens',
        },
        {
          text: `Set a reminder for ${recheckDate}, three months after the snapshot, to re-check the launch odds and the board; if the odds band has moved, the verdict moves with it.`,
          cost: 'nothing to set',
          time: '5 minutes to set',
        },
        {
          text: `If you already hold a position in ${p.name}, do not add to it on this call; keep what you have, note the entry date, and unwind it on the re-check date if nothing has changed.`,
          cost: 'nothing to add',
          time: '10 minutes to review',
        },
        {
          text: `Log the decision — the odds, the band and today's date — in a farm log, so the re-check in three months compares like with like instead of starting from memory.`,
          cost: 'nothing but the log',
          time: '5 minutes',
        },
      ],
    };
  }
  return {
    verdict,
    steps: [
      {
        text: verdictText,
        cost: `about $${totalGas} of gas for the whole farm`,
        time: `${hold} days`,
      },
      {
        text: `Open a fresh wallet that holds only the funds you plan to farm, and write its seed phrase on paper, never in a screenshot.`,
        cost: 'under $3 of gas for the first transaction',
        time: '5 minutes',
      },
      {
        text: action,
        cost: `$${capital} of capital and about $${capital >= 150 ? 8 : 4} of gas`,
        time: '15 minutes to set up',
      },
      {
        text: `While you hold, ${weeklyActionFor(p)} once a week.`,
        cost: `about $${weeklyGas} of gas a week, about $${totalGas} of gas for the whole ${hold}-day farm`,
        time: '10 minutes a week',
      },
      {
        text: `Hold the position for at least ${hold} days, through ${weeks} weekly snapshots, before you touch it.`,
        cost: `the $${capital} stays in the position`,
        time: `${hold} days`,
      },
      {
        text: `Before you withdraw, open ${p.name}'s own points or rewards page from its official site and claim only from the link it publishes.`,
        cost: 'no fee to check, and never pay anyone to claim',
        time: '10 minutes',
      },
      {
        text: `Log the wallet, the dates and every transaction hash in a farm log, so you can repeat the position or unwind it later.`,
        cost: 'nothing but the log',
        time: '5 minutes',
      },
    ],
  };
}

/** Every live-token protocol grouped by category, by market cap: the peers a detail view shows, so the median it states can be checked from the rows it displays. Live-token here means the snapshot records a market cap — the same filter the multiples use, since a token with no recorded cap has no ratio to show; a cap of zero or less is not a cap, so dead tokens are left out of the peers too. */
export function categoryPeers(snapshot: Snapshot): Record<string, LiveRow[]> {
  const out: Record<string, LiveRow[]> = {};
  for (const p of snapshot.protocols
    .filter((p) => p.mcap_usd !== null && p.mcap_usd > 0 && p.category !== 'CEX')
    .sort((a, b) => (b.mcap_usd ?? 0) - (a.mcap_usd ?? 0) || b.tvl_usd - a.tvl_usd)) {
    const key = p.category ?? '(no category)';
    (out[key] = out[key] ?? []).push({
      slug: p.slug,
      name: p.name,
      category: p.category,
      chains: p.chains,
      tvl_usd: p.tvl_usd,
      mcap_usd: p.mcap_usd,
      change_7d: p.change_7d,
    });
  }
  return out;
}

/** The live-token protocols, by market cap, for the dashboard's Live token view. */
export function liveRows(snapshot: Snapshot): LiveRow[] {
  return snapshot.protocols
    .filter((p) => !isPreToken(p) && p.category !== 'CEX')
    .sort((a, b) => (b.mcap_usd ?? 0) - (a.mcap_usd ?? 0) || b.tvl_usd - a.tvl_usd)
    .slice(0, LIVE_ROWS)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      chains: p.chains,
      tvl_usd: p.tvl_usd,
      mcap_usd: p.mcap_usd,
      change_7d: p.change_7d,
    }));
}

/** A board row's compact form for data.js, with the farm plan included. */
export function radarRow(row: BoardRow): RadarRow {
  return {
    rank: row.rank,
    slug: row.slug,
    name: row.name,
    category: row.category,
    chains: row.chains,
    tvl_usd: row.tvl_usd,
    change_7d: row.change_7d,
    mcap_usd: row.mcap_usd,
    listed_at: row.listed_at,
    age_days: row.age_days,
    implied_value_usd: row.implied_value_usd,
    base_multiple: row.model.base_multiple,
    category_live_n: row.model.category_live_n,
    multiple_source: row.model.multiple_source,
    launch_odds: row.model.launch_odds,
    odds_band: row.model.odds_band,
    verdict: row.verdict,
    integrity: row.integrity,
    farm_steps: row.farm_steps,
  };
}

/** Everything the dashboard renders, from the snapshot. */
export function buildRadar(snapshot: Snapshot, model: ModelConstants = MODEL): { board: BoardRow[]; radar: RadarData } {
  const board = buildBoard(snapshot, model);
  const live = liveRows(snapshot);
  const multiples = categoryMultiples(snapshot, model);
  const early = board.filter((r) => !snapshot.watchlist.includes(r.slug)).length;
  const multiplesTable = [...multiples.byCategory.values()].sort((a, b) => (a.category < b.category ? -1 : a.category > b.category ? 1 : 0));
  const radar: RadarData = {
    as_of: snapshot.as_of,
    source: snapshot.source,
    floor_usd: snapshot.floor_usd,
    model,
    model_version: MODEL_VERSION,
    watchlist: snapshot.watchlist,
    watchlist_size: snapshot.watchlist.length,
    board_size: board.length,
    early_size: early,
    live_size: live.length,
    global_multiple: multiples.global.multiple,
    global_live_n: multiples.global.live_n,
    multiples: multiplesTable,
    launch_odds: launchOddsBands(snapshot),
    integrity_flagged: board.filter((r) => r.integrity !== null).length,
    rows: board.map(radarRow),
    live,
    peers: categoryPeers(snapshot),
  };
  return { board, radar };
}

/** The snapshot out of a file's text, refused unless it is the shape the model scores. */
export function parseSnapshot(text: string): Snapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SnapshotError('snapshot.json is not JSON');
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new SnapshotError('snapshot.json is not a JSON object');
  const o = raw as Record<string, unknown>;
  if (typeof o.as_of !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.as_of)) throw new SnapshotError('snapshot.json has no as_of date');
  if (typeof o.source !== 'string') throw new SnapshotError('snapshot.json has no source');
  if (typeof o.floor_usd !== 'number' || !Number.isSafeInteger(o.floor_usd) || o.floor_usd <= 0) throw new SnapshotError('snapshot.json has no floor_usd');
  if (!Array.isArray(o.protocols)) throw new SnapshotError('snapshot.json has no protocols array');
  if (!Array.isArray(o.watchlist) || o.watchlist.some((s) => typeof s !== 'string')) throw new SnapshotError('snapshot.json has no watchlist of slugs');
  const protocols = o.protocols.map((v, i) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new SnapshotError(`snapshot.json's protocol ${i} is not an object`);
    const p = v as Record<string, unknown>;
    if (typeof p.slug !== 'string' || typeof p.name !== 'string' || typeof p.tvl_usd !== 'number' || !Number.isFinite(p.tvl_usd)) {
      throw new SnapshotError(`snapshot.json's protocol ${i} lacks a slug, a name or a TVL`);
    }
    return {
      slug: p.slug,
      name: p.name,
      category: typeof p.category === 'string' ? p.category : null,
      chains: Array.isArray(p.chains) ? p.chains.filter((c): c is string => typeof c === 'string') : [],
      tvl_usd: p.tvl_usd,
      change_7d: typeof p.change_7d === 'number' && Number.isFinite(p.change_7d) ? p.change_7d : null,
      mcap_usd: typeof p.mcap_usd === 'number' && Number.isFinite(p.mcap_usd) ? p.mcap_usd : null,
      listed_at: typeof p.listed_at === 'string' ? p.listed_at : null,
      gecko_id: typeof p.gecko_id === 'string' ? p.gecko_id : null,
      symbol: typeof p.symbol === 'string' ? p.symbol : null,
    };
  });
  return {
    as_of: o.as_of,
    source: o.source,
    floor_usd: o.floor_usd,
    protocols,
    watchlist: o.watchlist as string[],
  };
}

/** Why a board is not one the gate will take, or null: coverage, ranks, order, one shared implied value, and farm steps. */
export function boardIssue(board: BoardRow[], snapshot: Snapshot): string | null {
  const slugs = new Set(board.map((r) => r.slug));
  const missing = snapshot.watchlist.filter((s) => !slugs.has(s));
  if (missing.length > 0) return `the board misses ${missing.length} watchlist slug${missing.length === 1 ? '' : 's'}: ${missing.slice(0, 5).join(', ')}`;
  const ranks = board.map((r) => r.rank).sort((a, b) => a - b);
  for (let i = 0; i < ranks.length; i++) if (ranks[i] !== i + 1) return `rank ${i + 1} is ${ranks[i]}`;
  for (let i = 1; i < board.length; i++) if (board[i]!.implied_value_usd > board[i - 1]!.implied_value_usd) return `row ${i + 1} outranks row ${i} on implied value`;
  if (board.length >= 2 && board[0]!.implied_value_usd === board[board.length - 1]!.implied_value_usd) {
    return `all ${board.length} rows share the same implied value $${board[0]!.implied_value_usd}: a board that ranks nothing by value is not a ranking`;
  }
  for (const r of board) {
    const steps = r.farm_steps;
    if (steps.length < 3 || steps.length > 12) return `${r.slug} has ${steps.length} farm steps`;
    for (const s of steps) if (s.length < 20 || s.length > 600) return `${r.slug} has a farm step of ${s.length} characters`;
    if (!Number.isSafeInteger(r.implied_value_usd) || r.implied_value_usd <= 0) return `${r.slug} has implied value ${r.implied_value_usd}`;
  }
  return null;
}

/** A compact data.js: the dashboard's whole dataset as one script, no fetch and no network. */
export function dataScript(radar: RadarData): string {
  return `window.RADAR=${JSON.stringify(radar)};\n`;
}
