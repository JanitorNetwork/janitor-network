import { NextRequest, NextResponse } from "next/server";

// ── Regex ─────────────────────────────────────────────────────────────────────
const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_RE    = /^0x[0-9a-fA-F]{40}$/;

// ── Solana constants ──────────────────────────────────────────────────────────
const SOL_TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

// ── Known malicious deployers (add verified rug addresses here over time) ─────
const BAD_SOL = new Set<string>([]);
const BAD_EVM = new Set<string>([]);

// In production, never return raw exception messages to the browser.
const IS_PROD = process.env.NODE_ENV === "production";
function safeErr(e: unknown): string {
  if (IS_PROD) return "data source temporarily unavailable";
  return e instanceof Error ? e.message : String(e);
}

// ── Chain routing architecture ────────────────────────────────────────────────
// Address format determines the processing path:
//
//   SOLANA  — base58, 32–44 chars, no 0x prefix
//             → Helius RPC (mainnet.helius-rpc.com) + DAS API + Enhanced Txs
//             → DexScreener for market data
//
//   ETHEREUM — 0x-prefix, 42-char EVM hex, chain=ethereum (default)
//             → Etherscan V2 (api.etherscan.io/v2/api?chainid=1)
//               Etherscan V1 (api.etherscan.io/api) is deprecated — V2 is free for ETH.
//
//   BASE L2  — 0x-prefix, 42-char EVM hex, chain=base (user-selected)
//             → Blockscout (base.blockscout.com/api) — open-source, no key required
//               Basescan V1 is deprecated. Etherscan V2 free plan blocks chainid=8453.
//               Blockscout provides identical module/action coverage at $0.
const EVM_CHAIN = {
  ethereum: {
    api:     "https://api.etherscan.io/v2/api",
    chainId: "1",
    apiV2:   "https://eth.blockscout.com/api/v2",
    label:   "Ethereum",
    key:     () => process.env.ETHERSCAN_API_KEY ?? "",
  },
  base: {
    api:     "https://base.blockscout.com/api",     // Etherscan-compatible, keyless
    chainId: "",                                    // Not used — Blockscout URL is chain-specific
    apiV2:   "https://base.blockscout.com/api/v2",
    label:   "Base",
    key:     () => "",                              // Blockscout requires no API key
  },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type Chain       = "solana" | "ethereum" | "base" | "unknown";
type SignalStatus = "valid" | "invalid" | "unknown";
type ScoreStatus = "clean" | "caution" | "risk" | "unscored";
interface Signal  { status: SignalStatus; summary: string; score?: number; }
interface TokenMeta {
  name?:         string;
  symbol?:       string;
  iconUrl?:      string;
  exchangeRate?: string;
  volume24h?:    string;
  holdersCount?: number;
  reputation?:   string;
}
interface ScanResponse {
  success: boolean; address: string; chain: Chain; targetType: string;
  dataStatus: string; cleanScore: number | null; scoreStatus: ScoreStatus;
  scoreLabel: string; classification: string;
  meta?: TokenMeta;
  signals: { addressFormat: Signal; holderConcentration: Signal; liquiditySecurity: Signal; deployerHistory: Signal; volumeBehavior: Signal; honeypotCheck: Signal; };
  tjMessage: string;
  logs: string[]; disclaimer: string; scannedAt: string;
}

export const dynamic = "force-dynamic";

const scanRateLimits = new Map<string, number[]>();

function getScanIP(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function checkScanRateLimit(ip: string): boolean {
  const now = Date.now();
  const times = (scanRateLimits.get(ip) ?? []).filter(t => now - t < 60_000);
  if (times.length >= 20) return true;
  times.push(now);
  scanRateLimits.set(ip, times);
  return false;
}

// ── Helius JSON-RPC ───────────────────────────────────────────────────────────
const HELIUS_KEY = () => process.env.HELIUS_API_KEY ?? "";

async function rpc(method: string, params: unknown[]): Promise<Record<string, unknown>> {
  const key = HELIUS_KEY();
  if (!key) throw new Error("HELIUS_API_KEY not set");
  const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(9000),
  });
  if (!res.ok) throw new Error(`Helius RPC ${res.status}`);
  const j = await res.json() as Record<string, unknown>;
  if (j.error) throw new Error(String((j.error as Record<string, unknown>).message ?? j.error));
  return j;
}

// ── Helius DAS getAsset — named params format required by DAS API ─────────────
// Standard rpc() sends params as an array; getAsset needs params: {id: "..."}.
async function dasGetAsset(mint: string): Promise<Record<string, unknown> | null> {
  const key = HELIUS_KEY();
  if (!key) return null;
  try {
    const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getAsset", params: { id: mint } }),
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) return null;
    const j = await res.json() as Record<string, unknown>;
    if (j.error) return null;
    return (j.result as Record<string, unknown>) ?? null;
  } catch { return null; }
}

// ── Solana market data — DexScreener (free, no API key) ───────────────────────
// Only use priceUsd from pairs where the queried mint is the BASE token.
// Quote-token pairs (e.g. SOL/USDC where USDC is quote) have priceUsd for the
// OTHER token — using that would show a completely wrong price.
type DexPair = {
  baseToken?:  { address?: string };
  quoteToken?: { address?: string };
  priceUsd?: string;
  volume?:   { h24?: number };
  liquidity?: { usd?: number };
};
async function solMarketData(mint: string): Promise<{ price?: string; volume24h?: string } | null> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { pairs?: DexPair[] };
    const pairs = data.pairs;
    if (!pairs || pairs.length === 0) return null;
    const mintLower = mint.toLowerCase();
    // Filter to pairs where this token is the base — only these have a meaningful priceUsd
    const basePairs = pairs.filter(p => p.baseToken?.address?.toLowerCase() === mintLower);
    if (basePairs.length === 0) return null;
    const best = basePairs.reduce((a, b) => ((a.liquidity?.usd ?? 0) > (b.liquidity?.usd ?? 0) ? a : b));
    return {
      price:     best.priceUsd ? `$${best.priceUsd}` : undefined,
      volume24h: best.volume?.h24 != null ? String(best.volume.h24) : undefined,
    };
  } catch { return null; }
}

// ── Solana holder count — Helius DAS getTokenAccounts ────────────────────────
async function solHolderCount(mint: string): Promise<number | null> {
  const key = HELIUS_KEY();
  if (!key) return null;
  try {
    const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getTokenAccounts", params: { mint, limit: 1, page: 1 } }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const j = await res.json() as Record<string, unknown>;
    if (j.error) return null;
    const result = j.result as Record<string, unknown> | null;
    const count = typeof result?.total === "number" ? result.total : null;
    // Reject obviously invalid counts — a real token always has > 1 holder account
    if (count !== null && count <= 1) return null;
    return count;
  } catch { return null; }
}

// ── Helius Enhanced Transactions REST (real token swap/transfer activity) ─────
type EnhancedTx = { timestamp: number; type: string; source?: string };
async function enhancedTxs(address: string, limit = 100): Promise<EnhancedTx[]> {
  const key = HELIUS_KEY();
  if (!key) throw new Error("HELIUS_API_KEY not set");
  const url = `https://api.helius.xyz/v0/addresses/${encodeURIComponent(address)}/transactions?api-key=${key}&limit=${limit}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error(`Helius Enhanced ${res.status}`);
  return res.json() as Promise<EnhancedTx[]>;
}

// ── EVM explorer fetch (Etherscan V2 or Blockscout Etherscan-compatible) ──────
async function evmFetch(chain: "ethereum" | "base", params: Record<string, string>): Promise<Record<string, unknown>> {
  const cfg = EVM_CHAIN[chain];
  const url = new URL(cfg.api);
  if (cfg.chainId) url.searchParams.set("chainid", cfg.chainId);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const apiKey = cfg.key();
  if (apiKey) url.searchParams.set("apikey", apiKey);
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error(`${cfg.label} HTTP ${res.status}`);
  const j = await res.json() as Record<string, unknown>;
  if (j.message === "NOTOK" || (j.status === "0" && typeof j.result === "string" &&
      !(j.result as string).startsWith("["))) {
    throw new Error(`${cfg.label} API: ${j.result as string}`);
  }
  return j;
}

// Blockscout V2 REST API — returns richer token metadata
async function bsV2<T>(chain: "ethereum" | "base", path: string): Promise<T> {
  const cfg = EVM_CHAIN[chain];
  const res = await fetch(`${cfg.apiV2}${path}`, { signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error(`${cfg.label} V2 HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Scoring helpers ───────────────────────────────────────────────────────────
function toStatus(score: number): SignalStatus {
  return score >= 70 ? "valid" : score >= 40 ? "unknown" : "invalid";
}

// SRS formula: (Holder*0.25) + (History*0.20) + (Liquidity*0.20) + (Volume*0.15) + (Honeypot*0.20)
// Missing signals excluded and remaining weights rescaled proportionally.
function computeScore(h: number | null, d: number | null, l: number | null, v: number | null, hp: number | null): number {
  const w = [[h, 0.25], [d, 0.20], [l, 0.20], [v, 0.15], [hp, 0.20]] as [number | null, number][];
  let sum = 0, total = 0;
  for (const [val, wt] of w) {
    if (val !== null) { sum += val * wt; total += wt; }
  }
  return total === 0 ? 50 : Math.round(sum / total);
}

function scoreStatus(s: number): ScoreStatus {
  return s >= 80 ? "clean" : s >= 50 ? "caution" : "risk";
}

const SCORE_LABELS: Record<ScoreStatus, string> = {
  clean:    "Clean — low risk signals detected",
  caution:  "Caution — mixed signals, do your own research",
  risk:     "Risk — significant red flags found",
  unscored: "Unscored",
};

// ── SOL CAP 1: Holder Concentration ──────────────────────────────────────────
// SRS: Base 100, deduct 2 pts per 1% top-10 concentration above 50%.
async function solHolder(mint: string, logs: string[]): Promise<Signal> {
  try {
    const [hRes, sRes] = await Promise.all([
      rpc("getTokenLargestAccounts", [mint]),
      rpc("getTokenSupply", [mint]),
    ]);
    type TA = { uiAmount: number | null; uiAmountString?: string };
    const accounts  = ((hRes.result as Record<string, unknown>)?.value as TA[]) ?? [];
    const supplyRaw = (((sRes.result as Record<string, unknown>)?.value as Record<string, unknown>));
    const total     = (supplyRaw?.uiAmount as number | null) ?? parseFloat((supplyRaw?.uiAmountString as string) ?? "0");

    if (!accounts.length || total === 0) {
      logs.push("[CAP1] Holder data unavailable from RPC.");
      return { status: "unknown", summary: "Not enough verified data yet — holder accounts unavailable for this token." };
    }

    const top10 = accounts.slice(0, 10)
      .reduce((s, a) => s + (a.uiAmount ?? parseFloat(a.uiAmountString ?? "0")), 0);
    const pct = (top10 / total) * 100;

    // Threshold at 65%: established tokens have exchanges/DEX pools in top-10.
    // Deduct 2 pts per 1% above 65% — extreme insider concentration still scores badly.
    const score = pct > 65 ? Math.max(0, Math.round(100 - (pct - 65) * 2)) : 100;

    logs.push(`[CAP1] Top-10 concentration: ${pct.toFixed(1)}% → score ${score}/100`);

    const risk =
      pct > 90 ? "Extreme concentration — very high rug risk." :
      pct > 75 ? "High concentration — major risk factor. Note: may include DEX pool accounts." :
      pct > 65 ? "Elevated concentration — proceed with caution. Note: may include exchange and DEX pool accounts." :
                 "Distribution looks healthy.";

    return {
      status:  toStatus(score),
      summary: `Top 10 accounts hold ${pct.toFixed(1)}% of total supply. ${risk}`,
      score,
    };
  } catch (e) {
    logs.push(`[CAP1] Error: ${safeErr(e)}`);
    return { status: "unknown", summary: "Not enough verified data yet — holder data fetch failed." };
  }
}

// ── SOL CAP 2: Deployer History ───────────────────────────────────────────────
// Finds the actual creation transaction fee-payer, not just the current mint authority.
async function solDeployer(mint: string, mintInfo: Record<string, unknown> | null, logs: string[]): Promise<Signal> {
  try {
    const sigRes = await rpc("getSignaturesForAddress", [mint, { limit: 100 }]);
    type Sig = { signature: string; err?: unknown };
    const sigs = (sigRes.result as Sig[]) ?? [];

    if (sigs.length === 0) {
      logs.push("[CAP2] No signatures found for mint — brand new or not indexed.");
      const ma = mintInfo?.mintAuthority as string | null ?? null;
      return { status: "unknown", summary: "No transaction history found — token may be brand new.", score: 60 };
    }

    // Oldest signature = creation transaction
    const creationSig = sigs[sigs.length - 1].signature;
    const txRes = await rpc("getTransaction", [creationSig, { maxSupportedTransactionVersion: 0, encoding: "jsonParsed" }]);
    const tx    = txRes.result as Record<string, unknown> | null;

    if (!tx) throw new Error("Creation tx not returned");

    type AK = { pubkey?: string } | string;
    const keys     = (tx.transaction as Record<string, unknown>)?.message as Record<string, unknown>;
    const akRaw    = keys?.accountKeys as AK[] | undefined;
    const feePayer = akRaw?.[0] ? (typeof akRaw[0] === "string" ? akRaw[0] : (akRaw[0] as Record<string, string>).pubkey) : null;

    if (!feePayer) {
      logs.push("[CAP2] Could not extract fee payer from creation tx.");
      return { status: "unknown", summary: "Creation transaction found but deployer wallet not parseable.", score: 70 };
    }

    const isBad = BAD_SOL.has(feePayer);
    const score = isBad ? Math.max(0, 100 - 35) : 100;
    logs.push(`[CAP2] Deployer: ${feePayer.slice(0, 12)}… — ${isBad ? "⚠️ MATCHED rug database" : "no known issues"} → score ${score}/100`);

    return {
      status:  toStatus(score),
      summary: isBad
        ? `⚠️ Deployer wallet (${feePayer.slice(0, 10)}…) matched a known rug deployer in our threat database.`
        : `Deployer wallet (${feePayer.slice(0, 10)}…) has no known malicious history.`,
      score,
    };
  } catch {
    // Fallback: use mint authority if available
    const ma = mintInfo?.mintAuthority as string | null ?? null;
    if (!ma) {
      logs.push("[CAP2] Mint authority renounced — deployer not traceable.");
      return { status: "valid", summary: "Mint authority renounced — original deployer is not traceable from authority alone.", score: 90 };
    }
    const isBad = BAD_SOL.has(ma);
    const score = isBad ? 65 : 85;
    logs.push(`[CAP2] Fallback to mint authority: ${ma.slice(0, 12)}… → score ${score}/100`);
    return {
      status:  toStatus(score),
      summary: isBad
        ? `⚠️ Mint authority (${ma.slice(0, 10)}…) matched rug database.`
        : `Could not retrieve creation tx. Mint authority (${ma.slice(0, 10)}…) has no known issues — authority is still active.`,
      score,
    };
  }
}

// ── SOL CAP 3: Liquidity / Mint Security ─────────────────────────────────────
// SRS: Binary LP burn check (100 if locked, 20 if unlocked).
// Phase 1: We use mint/freeze authority as the available on-chain liquidity signal.
// LP pool burn verification requires Raydium pool indexing — connecting Phase 3.
function solLiquidity(mintInfo: Record<string, unknown> | null, logs: string[]): Signal {
  if (!mintInfo) {
    logs.push("[CAP3] Mint info unavailable.");
    return { status: "unknown", summary: "Not enough verified data yet — mint account data unavailable." };
  }

  const mintRenounced = !mintInfo.mintAuthority;
  const freezeActive  = !!mintInfo.freezeAuthority;

  // Calibrated scoring — active authorities are a risk signal, not an instant disqualifier.
  // Regulated stablecoins (USDC, USDT) intentionally retain mint+freeze for compliance.
  // Renounced + no freeze: 100 (cleanest possible)
  // Renounced + freeze:    65  (supply fixed, but accounts can be frozen)
  // Active + no freeze:    60  (creator can dilute — real risk, not catastrophic alone)
  // Active + freeze:       35  (both authorities active — notable risk signal)
  let score: number;
  const parts: string[] = [];

  if (mintRenounced && !freezeActive) {
    score = 100;
    parts.push("Mint authority renounced — no additional supply can be created.");
    parts.push("No freeze authority — user token accounts cannot be locked.");
  } else if (mintRenounced && freezeActive) {
    score = 65;
    parts.push("Mint authority renounced — supply is fixed.");
    parts.push("⚠️ Freeze authority active — creator can freeze individual token accounts.");
  } else if (!mintRenounced && !freezeActive) {
    score = 60;
    parts.push("⚠️ Mint authority active — creator can still mint additional tokens, diluting supply.");
    parts.push("No freeze authority.");
  } else {
    score = 45;
    parts.push("⚠️ Mint authority active — creator can mint additional tokens.");
    parts.push("⚠️ Freeze authority active — creator can freeze any token account.");
  }

  logs.push(`[CAP3] mintRenounced=${mintRenounced} freezeActive=${freezeActive} → score ${score}/100`);
  return { status: toStatus(score), summary: parts.join(" "), score };
}

// ── SOL CAP 4: Volume Behavior (via Helius Enhanced API) ─────────────────────
// SRS: Programmatic micro-trading ratio > 40% over 48h = 0/100.
// Uses Helius Enhanced Transactions (real swap/transfer events, not raw mint sigs).
async function solVolume(address: string, isToken: boolean, logs: string[]): Promise<Signal> {
  try {
    const txs = await enhancedTxs(address, 100);

    if (!txs || txs.length === 0) {
      logs.push("[CAP4] No enhanced transaction history found.");
      return { status: "unknown", summary: "No transaction history found. Token may be brand new or have no on-chain activity.", score: 50 };
    }

    const cutoff = Math.floor(Date.now() / 1000) - 48 * 3600;
    const recent  = txs.filter(t => t.timestamp > cutoff);
    const swaps   = recent.filter(t => t.type === "SWAP");

    logs.push(`[CAP4] ${recent.length} events in 48h (${swaps.length} swaps)`);

    if (recent.length < 2) {
      return {
        status:  "unknown",
        summary: `${recent.length} transaction(s) in last 48h — insufficient activity for pattern analysis. ${txs.length} total historical events found.`,
        score:   60,
      };
    }

    // Source diversity check: if many different protocols are interacting,
    // high-frequency bursts are organic DeFi routing, not a single bot.
    const sources       = recent.map(t => t.source).filter(Boolean) as string[];
    const uniqueSources = new Set(sources).size;

    if (recent.length > 20 && uniqueSources >= 4) {
      logs.push(`[CAP4] ${recent.length} events from ${uniqueSources} unique sources — organic multi-protocol activity → score 90`);
      return {
        status:  "valid",
        summary: `${recent.length} transactions in 48h from ${uniqueSources} different protocols (${swaps.length} swaps). Multi-protocol activity indicates organic demand — no bot pattern.`,
        score:   90,
      };
    }

    const times     = recent.map(t => t.timestamp).sort((a, b) => a - b);
    const intervals = times.slice(1).map((t, i) => t - times[i]);
    const micro     = intervals.filter(i => i < 2).length;  // under 2 seconds = suspicious
    const ratio     = micro / intervals.length;
    const avg       = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // SRS CAP 4: ratio > 40% = 0/100
    if (ratio > 0.4) {
      logs.push(`[CAP4] WASH TRADING DETECTED — micro ratio ${(ratio * 100).toFixed(0)}% > 40% threshold → score 0`);
      return {
        status:  "invalid",
        summary: `⚠️ ${(ratio * 100).toFixed(0)}% of recent transactions are under 2s apart — bot or wash-trading pattern. ${recent.length} events (${swaps.length} swaps) in 48h. Source diversity: ${uniqueSources} protocol(s).`,
        score:   0,
      };
    }

    if (ratio > 0.2) {
      logs.push(`[CAP4] Elevated micro-trade ratio ${(ratio * 100).toFixed(0)}% → score 40`);
      return {
        status:  "unknown",
        summary: `Elevated rapid-transaction activity (${(ratio * 100).toFixed(0)}% of txs under 2s). ${recent.length} events (${swaps.length} swaps) in 48h — worth monitoring.`,
        score:   40,
      };
    }

    logs.push(`[CAP4] Organic activity — avg interval ${avg.toFixed(1)}s → score 100`);
    return {
      status:  "valid",
      summary: `${recent.length} transactions in 48h (${swaps.length} swaps). Average interval ${avg.toFixed(0)}s. No wash-trading pattern detected.`,
      score:   100,
    };
  } catch (e) {
    logs.push(`[CAP4] Enhanced API failed: ${safeErr(e)} — falling back to RPC`);

    // Fallback: RPC signatures (accurate for wallets, limited for tokens)
    try {
      const cutoff = Math.floor(Date.now() / 1000) - 48 * 3600;
      const sigRes  = await rpc("getSignaturesForAddress", [address, { limit: 500 }]);
      type S = { blockTime?: number };
      const sigs   = (sigRes.result as S[]) ?? [];
      const recent = sigs.filter(s => s.blockTime && s.blockTime > cutoff);

      if (recent.length < 2) {
        return { status: "unknown", summary: `${recent.length} transaction(s) in 48h — insufficient for pattern analysis.`, score: 60 };
      }

      const times     = recent.map(s => s.blockTime!).sort((a, b) => a - b);
      const intervals = times.slice(1).map((t, i) => t - times[i]);
      const micro     = intervals.filter(i => i < 2).length;
      const ratio     = micro / intervals.length;
      const avg       = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      if (ratio > 0.4) return { status: "invalid", summary: `⚠️ ${(ratio * 100).toFixed(0)}% micro-tx ratio — bot pattern. ${recent.length} txs in 48h.`, score: 0 };
      if (ratio > 0.2) return { status: "unknown", summary: `Elevated rapid-tx activity (${(ratio * 100).toFixed(0)}%). ${recent.length} txs in 48h.`, score: 40 };
      return { status: "valid", summary: `${recent.length} txs in 48h. Avg interval ${avg.toFixed(1)}s. No unusual patterns.`, score: 100 };
    } catch {
      return { status: "unknown", summary: "Volume analysis unavailable — all data sources failed.", score: undefined };
    }
  }
}

// ── EVM CAP 1 + Token Metadata: Blockscout V2 REST ───────────────────────────
// Returns both the holder-concentration signal AND display metadata in one call.
type BsToken = {
  name?: string; symbol?: string; icon_url?: string;
  exchange_rate?: string; volume_24h?: string;
  holders_count?: string; reputation?: string;
};
async function evmTokenData(address: string, chain: "ethereum" | "base", logs: string[]): Promise<{ signal: Signal; meta: TokenMeta }> {
  const cfg = EVM_CHAIN[chain];
  try {
    const data = await bsV2<BsToken>(chain, `/tokens/${encodeURIComponent(address)}`);
    const holders   = parseInt(data.holders_count ?? "0");
    const rep       = data.reputation ?? "unknown";

    let score: number;
    let riskNote: string;
    if      (holders >= 10000) { score = 100; riskNote = "Highly distributed holder base."; }
    else if (holders >= 2000)  { score = 90;  riskNote = "Well-distributed holder base."; }
    else if (holders >= 500)   { score = 75;  riskNote = "Moderate distribution."; }
    else if (holders >= 100)   { score = 55;  riskNote = "Low holder count — concentration risk."; }
    else if (holders >= 20)    { score = 30;  riskNote = "Very few holders — high concentration risk."; }
    else                       { score = 10;  riskNote = "Extremely few holders — insider concentration likely."; }

    if (rep === "spam") score = Math.max(0, score - 30);

    logs.push(`[CAP1] EVM holders: ${holders} (rep: ${rep}) → score ${score}/100`);

    return {
      signal: {
        status:  toStatus(score),
        summary: `${holders.toLocaleString()} token holders on ${cfg.label}.${rep === "ok" ? " ✓ Verified reputation." : rep === "spam" ? " ⚠️ Flagged as spam by Blockscout." : ""} ${riskNote}`,
        score,
      },
      meta: {
        name:         data.name,
        symbol:       data.symbol,
        iconUrl:      data.icon_url,
        exchangeRate: data.exchange_rate,
        volume24h:    data.volume_24h,
        holdersCount: holders,
        reputation:   rep,
      },
    };
  } catch (e) {
    logs.push(`[CAP1] EVM token data: ${safeErr(e)} — not a token or not indexed`);
    return {
      signal: { status: "unknown", summary: "Holder data unavailable — address may not be an ERC-20 token or not yet indexed." },
      meta: {},
    };
  }
}

// ── EVM CAP 3: Contract Security (source verification + proxy) ────────────────
async function evmSecurity(address: string, chain: "ethereum" | "base", logs: string[]): Promise<Signal> {
  const cfg = EVM_CHAIN[chain];
  try {
    // Blockscout V2 /addresses/{addr} gives us is_contract and is_verified
    // without ambiguity — getsourcecode alone can't tell a wallet from an unverified contract.
    type BsAddr = { is_contract?: boolean; is_verified?: boolean };
    const addrInfo = await bsV2<BsAddr>(chain, `/addresses/${encodeURIComponent(address)}`);

    if (addrInfo.is_contract === false) {
      logs.push("[CAP3] EVM: EOA/wallet address — liquidity security not applicable.");
      return { status: "unknown", summary: "Wallet address — liquidity security check only applies to token contracts. Signal excluded from score." };
    }

    // It's a contract — fetch source details for verification and proxy status
    const data = await evmFetch(chain, { module: "contract", action: "getsourcecode", address });
    type SC = { SourceCode?: string; Proxy?: string; ContractName?: string };
    const result = data.result as SC[] | string | null;
    const src    = Array.isArray(result) && result.length > 0 ? result[0] : null;
    const name   = src?.ContractName ?? "";

    const isVerified = addrInfo.is_verified === true || (!!src?.SourceCode && src.SourceCode.trim().length > 0);
    const isProxy    = src?.Proxy === "1";
    const parts: string[] = [];
    let score: number;

    if (isVerified && !isProxy) {
      score = 90;
      parts.push(`✓ Contract source verified on ${cfg.label}${name ? ` (${name})` : ""}.`);
      parts.push("No proxy — logic is fixed and auditable.");
    } else if (isVerified && isProxy) {
      score = 65;
      parts.push(`✓ Contract source verified${name ? ` (${name})` : ""}.`);
      parts.push("⚠️ Upgradeable proxy — owner can replace contract logic.");
    } else if (!isProxy) {
      score = 40;
      parts.push("⚠️ Contract source not verified on Blockscout — code cannot be audited.");
    } else {
      score = 20;
      parts.push("⚠️ Unverified upgradeable proxy — logic is neither auditable nor fixed.");
    }

    logs.push(`[CAP3] EVM is_contract=${addrInfo.is_contract} verified=${isVerified} proxy=${isProxy} → score ${score}/100`);
    return { status: toStatus(score), summary: parts.join(" "), score };
  } catch (e) {
    logs.push(`[CAP3] EVM security error: ${safeErr(e)}`);
    return { status: "unknown", summary: "Contract security data unavailable — API error." };
  }
}

// ── EVM CAP 2: Deployer ───────────────────────────────────────────────────────
async function evmDeployer(address: string, chain: "ethereum" | "base", logs: string[]): Promise<Signal> {
  const cfg = EVM_CHAIN[chain];
  try {
    const data = await evmFetch(chain, { module: "contract", action: "getcontractcreation", contractaddresses: address });
    type CR = { contractCreator: string };
    const results = data.result as CR[] | string | null;

    if (!Array.isArray(results) || results.length === 0) {
      logs.push("[CAP2] No contract creation found — likely a wallet or unindexed contract.");
      return { status: "unknown", summary: "No contract creation record found — this address may be a wallet, or the contract predates Blockscout indexing. Signal excluded from score." };
    }

    const deployer = results[0].contractCreator.toLowerCase();
    const isBad    = BAD_EVM.has(deployer);
    const score    = isBad ? Math.max(0, 100 - 35) : 100;
    logs.push(`[CAP2] EVM deployer: ${deployer.slice(0, 12)}… → score ${score}/100`);

    return {
      status:  toStatus(score),
      summary: isBad
        ? `⚠️ Contract deployer (${deployer.slice(0, 10)}…) matched a known rug deployer.`
        : `Contract deployer (${deployer.slice(0, 10)}…) — no known malicious history.`,
      score,
    };
  } catch (e) {
    logs.push(`[CAP2] EVM deployer error: ${safeErr(e)}`);
    return { status: "unknown", summary: "Deployer lookup failed — API error.", score: undefined };
  }
}

// ── EVM CAP 4: Volume Behavior ────────────────────────────────────────────────
async function evmVolume(address: string, chain: "ethereum" | "base", logs: string[]): Promise<Signal> {
  const cfg = EVM_CHAIN[chain];
  try {
    // Try token transfers first; fall back to normal tx list for wallets.
    // Track which mode we're in — micro-ratio analysis is meaningful for wallets
    // (one wallet making rapid-fire trades), but NOT for token contracts
    // (many independent users transferring within the same block is organic).
    let rows: Array<{ timeStamp: string }> = [];
    let isWalletMode = false;

    const tokenData = await evmFetch(chain, { module: "account", action: "tokentx", contractaddress: address, sort: "desc", page: "1", offset: "200" });
    if (tokenData.status === "1" && Array.isArray(tokenData.result)) {
      rows = tokenData.result as Array<{ timeStamp: string }>;
    } else {
      const walletData = await evmFetch(chain, { module: "account", action: "txlist", address, sort: "desc", page: "1", offset: "200" });
      if (walletData.status === "1" && Array.isArray(walletData.result)) {
        rows = walletData.result as Array<{ timeStamp: string }>;
        isWalletMode = true;
      }
    }

    if (rows.length === 0) {
      return { status: "unknown", summary: "No transaction activity found — token may be inactive, too new, or data unavailable." };
    }

    const cutoff = Math.floor(Date.now() / 1000) - 48 * 3600;
    const recent  = rows.filter(r => parseInt(r.timeStamp) > cutoff);

    if (recent.length < 3) {
      return {
        status:  "unknown",
        summary: `${recent.length} transfer(s) in the last 48h — not enough activity for pattern analysis. Token may be inactive, very new, or liquidity is concentrated off-chain.`,
        score:   60,
      };
    }

    // High-volume token contracts: many users transferring within the same block is normal.
    // Only apply micro-ratio wash-trading detection to wallets or low-volume tokens.
    if (!isWalletMode && recent.length > 40) {
      logs.push(`[CAP4] EVM high-volume token — ${recent.length} transfers in 48h, multi-user activity, skip micro-ratio`);
      return {
        status:  "valid",
        summary: `High-volume token — ${recent.length} transfers in 48h. Multiple independent users transacting in the same block is expected for liquid tokens.`,
        score:   90,
      };
    }

    const times     = recent.map(r => parseInt(r.timeStamp)).sort((a, b) => a - b);
    const intervals = times.slice(1).map((t, i) => t - times[i]);
    // ~13s = one Ethereum block. Under 1 block between txs from same wallet = suspicious
    const micro     = intervals.filter(i => i < 13).length;
    const ratio     = micro / intervals.length;
    const avg       = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    logs.push(`[CAP4] EVM ${recent.length} recent txs (${isWalletMode ? "wallet" : "token"} mode), micro ratio ${(ratio * 100).toFixed(0)}%`);

    if (ratio > 0.4) return { status: "invalid", summary: `⚠️ ${(ratio * 100).toFixed(0)}% of transactions are within one block — bot or wash-trading pattern. ${recent.length} events in 48h.`, score: 0 };
    if (ratio > 0.2) return { status: "unknown", summary: `Elevated sub-block transaction activity (${(ratio * 100).toFixed(0)}%). ${recent.length} events in 48h.`, score: 40 };
    return { status: "valid", summary: `${recent.length} transactions in 48h. Avg interval ${avg.toFixed(0)}s. No suspicious patterns.`, score: 100 };
  } catch (e) {
    logs.push(`[CAP4] EVM volume error: ${safeErr(e)}`);
    return { status: "unknown", summary: "Volume analysis unavailable — API error.", score: undefined };
  }
}

// ── GoPlus Honeypot Detection ────────────────────────────────────────────────
// Solana and EVM have different GoPlus endpoints AND different response schemas.
// Solana: /api/v1/solana/token_security (no chain suffix) — returns program-authority fields
// EVM:    /api/v1/token_security/{chainId}               — returns is_honeypot / sell_tax fields
const GOPLUS_EVM_IDS: Record<"ethereum" | "base", string> = { ethereum: "1", base: "8453" };

type GoPlusEVMData  = { is_honeypot?: string; cannot_sell_all?: string; cannot_buy?: string; sell_tax?: string; buy_tax?: string; honeypot_with_same_creator?: string; trusted_token?: string };
type GoPlusSolData  = { non_transferable?: string; trusted_token?: number | string; mintable?: { status?: string }; freezable?: { status?: string }; transfer_hook?: unknown[]; transfer_fee?: Record<string, unknown> };

async function goplusHoneypot(address: string, chain: Chain, logs: string[]): Promise<Signal> {
  try {
    let url: string;
    if (chain === "solana") {
      // Correct endpoint: no /mainnet suffix
      url = `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${encodeURIComponent(address)}`;
    } else if (chain === "ethereum" || chain === "base") {
      url = `https://api.gopluslabs.io/api/v1/token_security/${GOPLUS_EVM_IDS[chain]}?contract_addresses=${encodeURIComponent(address)}`;
    } else {
      return { status: "unknown", summary: "Honeypot check not supported for this chain." };
    }

    const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
    if (!res.ok) {
      logs.push(`[CAP5] GoPlus returned HTTP ${res.status}`);
      return { status: "unknown", summary: "Honeypot check data unavailable." };
    }

    const json = await res.json() as { code?: number; message?: string; result?: Record<string, unknown> };
    if (json.code !== 1 || !json.result) {
      logs.push(`[CAP5] GoPlus: code=${json.code} msg=${json.message}`);
      return { status: "unknown", summary: "Token not yet indexed by GoPlus Security." };
    }

    // GoPlus keys result by address (EVM lowercase, Solana case-sensitive)
    const key  = chain === "solana" ? address : address.toLowerCase();
    const raw  = json.result[key] ?? json.result[Object.keys(json.result)[0]];
    if (!raw) {
      logs.push("[CAP5] GoPlus: address not in result");
      return { status: "unknown", summary: "Token not yet indexed by GoPlus Security." };
    }

    // ── Solana response schema ──────────────────────────────────────────────
    if (chain === "solana") {
      const d = raw as GoPlusSolData;
      const nonTransferable = d.non_transferable === "1";
      const trusted         = Number(d.trusted_token) === 1;
      const hasHook         = Array.isArray(d.transfer_hook) && d.transfer_hook.length > 0;
      const hasFee          = d.transfer_fee && Object.keys(d.transfer_fee).length > 0;
      const mintable        = d.mintable?.status === "1";
      const freezable       = d.freezable?.status === "1";

      let score: number;
      const parts: string[] = [];

      if (nonTransferable) {
        score = 0;
        parts.push("⚠️ NON-TRANSFERABLE — tokens cannot be sold or moved once received.");
      } else if (hasHook) {
        score = 20;
        parts.push("⚠️ Custom transfer hook detected — contract can restrict or intercept transfers.");
        if (freezable) parts.push("Freeze authority active.");
      } else if (trusted) {
        score = 100;
        parts.push("GoPlus: trusted token.");
        if (mintable)  parts.push("Mint authority active (known for regulated tokens like USDC).");
        if (freezable) parts.push("Freeze authority active (expected for regulated tokens).");
        if (hasFee)    parts.push("Transfer fee configured.");
      } else {
        score = freezable ? 60 : 85;
        parts.push("No transfer restrictions detected.");
        if (mintable)  parts.push("Mint authority active — creator can issue more tokens.");
        if (freezable) parts.push("⚠️ Freeze authority active — creator can freeze token accounts.");
        if (hasFee)    parts.push("Transfer fee configured.");
      }

      logs.push(`[CAP5] GoPlus Solana: trusted=${trusted} nonTransfer=${nonTransferable} hook=${hasHook} mintable=${mintable} freeze=${freezable} → score ${score}/100`);
      return { status: toStatus(score), summary: parts.join(" "), score };
    }

    // ── EVM response schema ─────────────────────────────────────────────────
    const d = raw as GoPlusEVMData;
    const isHoneypot    = d.is_honeypot    === "1";
    const cannotSell    = d.cannot_sell_all === "1";
    const cannotBuy     = d.cannot_buy      === "1";
    const sellTax       = parseFloat(d.sell_tax ?? "0");
    const buyTax        = parseFloat(d.buy_tax  ?? "0");
    const sameCreatorHp = d.honeypot_with_same_creator === "1";
    const trusted       = d.trusted_token === "1";

    const parts: string[] = [];
    let score: number;

    if (isHoneypot || (sellTax >= 99 && !isNaN(sellTax))) {
      score = 0;
      parts.push("⚠️ HONEYPOT DETECTED — sell transactions are blocked or taxed to zero.");
      if (cannotSell) parts.push("Contract explicitly prevents all sells.");
      if (sameCreatorHp) parts.push("Creator has deployed other honeypots.");
    } else if (cannotBuy) {
      score = 10;
      parts.push("⚠️ Buy transactions are currently blocked by the contract.");
    } else if (sellTax > 50) {
      score = 10;
      parts.push(`⚠️ Sell tax is extremely high: ${sellTax}% — effectively a trap.`);
    } else if (sellTax > 20) {
      score = 30;
      parts.push(`⚠️ High sell tax: ${sellTax}%.`);
    } else if (sellTax > 10) {
      score = 55;
      parts.push(`Elevated sell tax: ${sellTax}%.`);
    } else {
      score = trusted ? 100 : 95;
      parts.push(`No honeypot detected.`);
      parts.push(`Buy/sell tax: ${buyTax}% / ${sellTax}%.`);
      if (trusted) parts.push("GoPlus: trusted token.");
    }

    if (sameCreatorHp && score > 10) {
      score = Math.max(0, score - 20);
      parts.push("⚠️ Creator has deployed honeypots under other contracts.");
    }

    logs.push(`[CAP5] GoPlus EVM: honeypot=${isHoneypot} sellTax=${sellTax}% buyTax=${buyTax}% sameCreator=${sameCreatorHp} → score ${score}/100`);
    return { status: toStatus(score), summary: parts.join(" "), score };
  } catch (e) {
    logs.push(`[CAP5] GoPlus check failed: ${safeErr(e)}`);
    return { status: "unknown", summary: "Honeypot check unavailable — data source error." };
  }
}

// ── TJ Message Generator ──────────────────────────────────────────────────────
function generateTJMessage(score: number | null, status: ScoreStatus, hp: Signal, targetType: string): string {
  if (hp.score !== undefined && hp.score <= 10) {
    const msgs = [
      "Mop down. This thing doesn't let you sell. Classic roach trap — they built it to take your money, not make you any. I'm not cleaning this one up.",
      "Called it. Honeypot. The buy goes through, the sell doesn't. You hand them your bag and say goodbye. Night shift doesn't recommend this.",
      "This is a trap. Literally. You can buy in, but the exit door is welded shut. Walk away. I've seen what happens to the ones who didn't.",
    ];
    return msgs[Math.floor(Date.now() / 1000) % msgs.length];
  }

  if (score === null) {
    return "Not enough data to score this one. Could be brand new, could be nothing — either way, the floor's still wet. Come back when there's more activity on-chain.";
  }

  if (status === "risk") {
    const msgs = [
      "This one's got red flags everywhere. I've seen cleaner crime scenes. Not my job to stop you — it's my job to warn you.",
      "Trash bag. Multiple signals lighting up at once. I wouldn't touch this without a hazmat suit. The data's talking — you should listen.",
      "I'm not saying it's a rug. I'm saying the lights are off, the floor is wet, and the deployer left the back door open. Your call.",
    ];
    return msgs[Math.floor(Date.now() / 1000) % msgs.length];
  }

  if (status === "caution") {
    const msgs = [
      "Mixed signals. Not clean, not a dumpster fire — somewhere in between. The night shift's watching this one.",
      "I see what they're doing here. Not screaming red flags, but I wouldn't sleep on it. Keep an eye and set your exits.",
      "Could go either way. Some signals solid, others I don't love. This is your DYOR moment — I gave you the data.",
    ];
    return msgs[Math.floor(Date.now() / 1000) % msgs.length];
  }

  if (targetType === "wallet") {
    return "Wallet checks out. No deployer flags in the database and clean transaction patterns. One clean scan doesn't make a saint — stay sharp.";
  }

  const msgs = [
    "Night shift done. Signals check out. Still DYOR — I scan, you decide.",
    "Floor's clean. For now. Nothing major jumping out from the data. Keep watching the volume.",
    "Looks solid from my end. Mint's tight, distribution's reasonable, no honeypot. That's as clean as it gets on-chain.",
  ];
  return msgs[Math.floor(Date.now() / 1000) % msgs.length];
}

// ── Error response ────────────────────────────────────────────────────────────
function errResponse(address: string, logs: string[], msg: string): ScanResponse {
  return {
    success: false, address, chain: "unknown", targetType: "unknown",
    dataStatus: "invalid_input", cleanScore: 0, scoreStatus: "risk",
    scoreLabel: msg, classification: "Invalid Input",
    signals: {
      addressFormat:       { status: "invalid", summary: msg },
      holderConcentration: { status: "unknown", summary: "Not enough verified data yet." },
      liquiditySecurity:   { status: "unknown", summary: "Not enough verified data yet." },
      deployerHistory:     { status: "unknown", summary: "Not enough verified data yet." },
      volumeBehavior:      { status: "unknown", summary: "Not enough verified data yet." },
      honeypotCheck:       { status: "unknown", summary: "Not enough verified data yet." },
    },
    tjMessage: "Couldn't run the full scan on that one. Check the format and try again — the night shift's still here.",
    logs, disclaimer: "Not financial advice. Outputs are technical assessments of public on-chain data.",
    scannedAt: new Date().toISOString(),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const scanIP = getScanIP(request);
  if (checkScanRateLimit(scanIP)) {
    return NextResponse.json(
      errResponse("", ["[ERROR] Rate limit exceeded."], "Too many requests — slow down."),
      { status: 429 }
    );
  }

  const { searchParams } = request.nextUrl;
  const rawAddress = searchParams.get("address") ?? "";
  const chainParam = (searchParams.get("chain") ?? "ethereum") as "ethereum" | "base";
  const address    = rawAddress.trim().slice(0, 100);
  const logs: string[] = ["[SYSTEM] Night-shift scanner initialised."];

  if (!address) {
    return NextResponse.json(errResponse("", [...logs, "[ERROR] No address provided."], "No address provided"), { status: 400 });
  }

  logs.push("[INPUT] Address received.");
  logs.push("[CHECK] Validating format...");

  // ── SOLANA ──────────────────────────────────────────────────────────────────
  if (SOLANA_RE.test(address)) {
    logs.push("[FORMAT] Solana base58 — valid.");
    logs.push("[SCAN] Connecting to Helius RPC...");

    try {
      const infoRes = await rpc("getAccountInfo", [address, { encoding: "jsonParsed" }]);
      const value   = (infoRes.result as Record<string, unknown>)?.value as Record<string, unknown> | null;

      if (!value) {
        logs.push("[CHAIN] Account not found on mainnet — valid format, no on-chain presence.");
        return NextResponse.json<ScanResponse>({
          success: false, address, chain: "solana", targetType: "unknown",
          dataStatus: "not_found", cleanScore: null, scoreStatus: "unscored",
          scoreLabel: "Address not found on Solana mainnet",
          classification: "Not Found",
          signals: {
            addressFormat:       { status: "valid",    summary: "Valid Solana format, but this address has no on-chain account on mainnet." },
            holderConcentration: { status: "unknown",  summary: "Not enough verified data yet — account does not exist." },
            liquiditySecurity:   { status: "unknown",  summary: "Not enough verified data yet — account does not exist." },
            deployerHistory:     { status: "unknown",  summary: "Not enough verified data yet — account does not exist." },
            volumeBehavior:      { status: "unknown",  summary: "Not enough verified data yet — account does not exist." },
            honeypotCheck:       { status: "unknown",  summary: "Not enough verified data yet — account does not exist." },
          },
          tjMessage: "Nothing on-chain with this address. It's either fresh out of the mint or you got a typo. Double-check and try again.",
          logs, disclaimer: "Not financial advice.",
          scannedAt: new Date().toISOString(),
        }, { headers: { "Cache-Control": "no-store" } });
      }

      const owner    = value.owner as string | undefined;
      const parsed   = (value.data as Record<string, unknown>)?.parsed as Record<string, unknown> | undefined;
      const mintInfo = parsed?.info as Record<string, unknown> | null ?? null;
      const isToken  = owner === SOL_TOKEN_PROGRAM;

      logs.push(`[CHAIN] Account type: ${isToken ? "SPL token mint" : "wallet / system account"}.`);

      let cap1: Signal, cap2: Signal, cap3: Signal, cap4: Signal;

      if (isToken) {
        logs.push("[CAP1] Fetching holder concentration...");
        logs.push("[CAP2] Locating creation transaction...");
        logs.push("[CAP3] Checking mint/freeze authority...");
        logs.push("[CAP4] Fetching on-chain volume data...");
        logs.push("[CAP5] Checking honeypot status via GoPlus...");

        // Parallel: holder + deployer + volume + honeypot + DAS metadata + market data + holder count
        cap3 = solLiquidity(mintInfo, logs);
        const [cap1r, cap2r, cap4r, cap5r, assetData, market, hCount] = await Promise.all([
          solHolder(address, logs),
          solDeployer(address, mintInfo, logs),
          solVolume(address, true, logs),
          goplusHoneypot(address, "solana", logs),
          dasGetAsset(address),
          solMarketData(address),
          solHolderCount(address),
        ]);
        cap1 = cap1r; cap2 = cap2r; cap4 = cap4r;
        const cap5 = cap5r;

        // Extract token name/symbol/icon from DAS result (already the asset object)
        const assetContent = assetData?.content as Record<string, unknown> | null;
        const assetMeta    = assetContent?.metadata as Record<string, unknown> | null;
        const tokenName    = assetMeta?.name as string | undefined;
        const tokenSymbol  = assetMeta?.symbol as string | undefined;
        const tokenIcon    = (assetContent?.links as Record<string, unknown> | null)?.image as string | undefined;
        const solMeta: TokenMeta = {
          ...(tokenName   ? { name: tokenName }             : {}),
          ...(tokenSymbol ? { symbol: tokenSymbol }         : {}),
          ...(tokenIcon   ? { iconUrl: tokenIcon }          : {}),
          ...(market?.price     ? { exchangeRate: market.price }     : {}),
          ...(market?.volume24h ? { volume24h: market.volume24h }    : {}),
          ...(hCount != null    ? { holdersCount: hCount }           : {}),
        };

        const final  = computeScore(cap1.score ?? null, cap2.score ?? null, cap3.score ?? null, cap4.score ?? null, cap5.score ?? null);
        const status = scoreStatus(final);
        logs.push(`[RESULT] Clean Score: ${final}/100 — ${SCORE_LABELS[status]}`);

        return NextResponse.json<ScanResponse>({
          success: true, address, chain: "solana",
          targetType:     "token_mint",
          dataStatus:     "live_data",
          cleanScore:     final,
          scoreStatus:    status,
          scoreLabel:     SCORE_LABELS[status],
          classification: "Live Solana Scan — Token Mint",
          meta:           Object.keys(solMeta).length > 0 ? solMeta : undefined,
          signals: {
            addressFormat:       { status: "valid", summary: `Valid Solana SPL token mint (${address.length} chars, base58).` },
            holderConcentration: cap1,
            deployerHistory:     cap2,
            liquiditySecurity:   cap3,
            volumeBehavior:      cap4,
            honeypotCheck:       cap5,
          },
          tjMessage: generateTJMessage(final, status, cap5, "token_mint"),
          logs,
          disclaimer: "Scanner metrics are derived from publicly available on-chain data only. Not financial advice and not criminal findings.",
          scannedAt: new Date().toISOString(),
        }, { headers: { "Cache-Control": "no-store" } });

      } else {
        logs.push("[CAP2] Checking wallet against rug deployer database...");
        logs.push("[CAP4] Analyzing wallet transaction patterns...");
        cap1 = { status: "unknown", summary: "Not applicable — holder concentration is checked on token mint addresses, not wallets." };
        cap3 = { status: "unknown", summary: "Not applicable — liquidity security runs on token mint addresses." };
        const isBad = BAD_SOL.has(address);
        cap2 = isBad
          ? { status: "invalid", summary: "⚠️ This wallet is in the known rug deployer database.", score: 0 }
          : { status: "valid",   summary: "Wallet not found in rug deployer database.", score: 100 };
        cap4 = await solVolume(address, false, logs);
        const walletHp: Signal = { status: "unknown", summary: "Not applicable — honeypot detection runs on token contracts, not wallet addresses." };

        const final  = computeScore(null, cap2.score ?? null, null, cap4.score ?? null, null);
        const status = scoreStatus(final);
        logs.push(`[RESULT] Clean Score: ${final}/100 — ${SCORE_LABELS[status]}`);

        return NextResponse.json<ScanResponse>({
          success: true, address, chain: "solana",
          targetType:     "wallet",
          dataStatus:     "live_data",
          cleanScore:     final,
          scoreStatus:    status,
          scoreLabel:     SCORE_LABELS[status],
          classification: "Live Solana Scan — Wallet",
          signals: {
            addressFormat:       { status: "valid", summary: `Valid Solana address (${address.length} chars, base58). Type: Wallet.` },
            holderConcentration: cap1,
            deployerHistory:     cap2,
            liquiditySecurity:   cap3,
            volumeBehavior:      cap4,
            honeypotCheck:       walletHp,
          },
          tjMessage: generateTJMessage(final, status, walletHp, "wallet"),
          logs,
          disclaimer: "Scanner metrics are derived from publicly available on-chain data only. Not financial advice and not criminal findings.",
          scannedAt: new Date().toISOString(),
        }, { headers: { "Cache-Control": "no-store" } });
      }

    } catch (e) {
      logs.push(`[ERROR] Solana scan failed: ${safeErr(e)}`);
      return NextResponse.json(errResponse(address, logs, "Scanner encountered an error — please try again."), { headers: { "Cache-Control": "no-store" } });
    }
  }

  // ── EVM ─────────────────────────────────────────────────────────────────────
  if (EVM_RE.test(address)) {
    const cfg = EVM_CHAIN[chainParam];
    logs.push(`[FORMAT] EVM address (0x…) — valid.`);
    logs.push(`[CHAIN] Scanning ${cfg.label}...`);
    logs.push("[CAP1] Fetching token holder distribution...");
    logs.push("[CAP2] Fetching contract deployer...");
    logs.push("[CAP3] Checking contract verification and security...");
    logs.push("[CAP4] Analyzing transaction patterns...");
    logs.push("[CAP5] Checking honeypot status via GoPlus...");

    try {
    // All calls run in parallel — each has its own try/catch so individual
    // failures return null scores without collapsing the whole scan.
    const [tokenData, cap2, cap3, cap4, cap5] = await Promise.all([
      evmTokenData(address, chainParam, logs),
      evmDeployer(address, chainParam, logs),
      evmSecurity(address, chainParam, logs),
      evmVolume(address, chainParam, logs),
      goplusHoneypot(address, chainParam, logs),
    ]);

    const cap1 = tokenData.signal;
    const meta = tokenData.meta;

    const scores    = [cap1, cap2, cap3, cap4, cap5].filter(s => s.score !== undefined);
    const liveCount = scores.length;
    const final     = computeScore(cap1.score ?? null, cap2.score ?? null, cap3.score ?? null, cap4.score ?? null, cap5.score ?? null);
    const status    = scoreStatus(final);
    const isFullData = liveCount === 5;
    logs.push(`[RESULT] Clean Score: ${final}/100 — ${SCORE_LABELS[status]} (${liveCount} of 5 signals live)`);

    return NextResponse.json<ScanResponse>({
      success: true, address, chain: chainParam,
      targetType:     cap2.score !== undefined ? "token_contract" : "wallet_or_eoa",
      dataStatus:     isFullData ? "live_data" : "partial_live_data",
      cleanScore:     final,
      scoreStatus:    status,
      scoreLabel:     SCORE_LABELS[status],
      classification: `Live ${cfg.label} Scan`,
      meta:           Object.keys(meta).length > 0 ? meta : undefined,
      signals: {
        addressFormat:       { status: "valid", summary: `Valid EVM address (0x-prefixed, 20-byte hex). Scanning ${cfg.label}.` },
        holderConcentration: cap1,
        deployerHistory:     cap2,
        liquiditySecurity:   cap3,
        volumeBehavior:      cap4,
        honeypotCheck:       cap5,
      },
      tjMessage: generateTJMessage(final, status, cap5, cap2.score !== undefined ? "token_contract" : "wallet_or_eoa"),
      logs,
      disclaimer: "Scanner metrics are derived from publicly available on-chain data only. Not financial advice and not criminal findings.",
      scannedAt: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
    } catch (e) {
      logs.push(`[ERROR] EVM scan failed: ${safeErr(e)}`);
      return NextResponse.json(errResponse(address, logs, "Scanner encountered an error — please try again."), { headers: { "Cache-Control": "no-store" } });
    }
  }

  // ── Invalid format ────────────────────────────────────────────────────────
  logs.push("[FORMAT] Not recognised as Solana or EVM.");
  logs.push("[RESULT] Cannot proceed — invalid input.");
  return NextResponse.json(errResponse(address, logs, "Not a recognised Solana (base58) or EVM (0x hex) address format."), { headers: { "Cache-Control": "no-store" } });
}
