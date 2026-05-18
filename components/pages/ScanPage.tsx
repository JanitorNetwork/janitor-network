"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  Terminal,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Shield,
  Zap,
  Activity,
  Users,
  DollarSign,
  BarChart2,
} from "lucide-react";

const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_RE    = /^0x[0-9a-fA-F]{40}$/i;

interface SignalEntry {
  status:  "valid" | "invalid" | "unknown";
  summary: string;
  score?:  number;
}

interface TokenMeta {
  name?:         string;
  symbol?:       string;
  iconUrl?:      string;
  exchangeRate?: string;
  volume24h?:    string;
  holdersCount?: number;
  reputation?:   string;
}

interface ScanResult {
  success:        boolean;
  address:        string;
  chain:          "solana" | "ethereum" | "base" | "unknown";
  targetType:     string;
  dataStatus:     string;
  cleanScore:     number | null;
  scoreStatus:    "clean" | "caution" | "risk" | "unscored";
  scoreLabel:     string;
  classification: string;
  meta?:          TokenMeta;
  signals: {
    addressFormat:       SignalEntry;
    holderConcentration: SignalEntry;
    liquiditySecurity:   SignalEntry;
    deployerHistory:     SignalEntry;
    volumeBehavior:      SignalEntry;
    honeypotCheck:       SignalEntry;
  };
  tjMessage?: string;
  logs:       string[];
  disclaimer: string;
  scannedAt:  string;
}

const SIGNAL_META: Record<keyof ScanResult["signals"], { label: string; icon: React.ReactNode }> = {
  addressFormat:       { label: "Address Format",       icon: <Shield size={14} /> },
  holderConcentration: { label: "Holder Concentration", icon: <Users size={14} /> },
  liquiditySecurity:   { label: "Liquidity Security",   icon: <Zap size={14} /> },
  deployerHistory:     { label: "Deployer History",     icon: <Activity size={14} /> },
  volumeBehavior:      { label: "Volume Behavior",      icon: <BarChart2 size={14} /> },
  honeypotCheck:       { label: "Honeypot Detection",   icon: <Shield size={14} /> },
};

const EXAMPLES = [
  { label: "Solana token",   value: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", chain: "solana"   },
  { label: "Ethereum token", value: "0xdAC17F958D2ee523a2206206994597C13D831ec7",      chain: "ethereum" },
  { label: "Base token",     value: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",      chain: "base"     },
];

const SCAN_LOG_LINES = [
  { text: "[INIT]    Night-shift scanner initialised.",              delay: 0    },
  { text: "[INPUT]   Target address received — validating format…",  delay: 0.35 },
  { text: "[FORMAT]  Address encoding verified. Chain identified.",   delay: 0.75 },
  { text: "[NET]     Connecting to on-chain data nodes…",            delay: 1.15 },
  { text: "[FETCH]   Pulling holder distribution snapshot…",         delay: 1.6  },
  { text: "[FETCH]   Querying deployer wallet history…",             delay: 2.1  },
  { text: "[FETCH]   Retrieving liquidity parameters…",              delay: 2.7  },
  { text: "[FETCH]   Sampling 48h volume behavior patterns…",        delay: 3.3  },
  { text: "[FETCH]   Running GoPlus honeypot detection…",            delay: 3.9  },
  { text: "[PARSE]   Cross-referencing on-chain ledger entries…",    delay: 4.7  },
  { text: "[CALC]    Weighting risk signals across all vectors…",    delay: 5.5  },
  { text: "[CALC]    Computing aggregate CLEAN score…",              delay: 6.3  },
];

function fmtPrice(val: string | undefined): string {
  if (!val) return "—";
  const n = parseFloat(val.replace(/^\$/, ""));
  if (isNaN(n)) return val;
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (n >= 1)    return `$${n.toFixed(4)}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  return `$${n.toExponential(3)}`;
}

function fmtVolume(val: string | undefined): string {
  if (!val) return "—";
  const n = parseFloat(val.replace(/^\$/, "").replace(/,/g, ""));
  if (isNaN(n)) return val;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)         return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtHolders(val: number | undefined): string {
  if (val == null) return "—";
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `${(val / 1_000).toFixed(1)}K`;
  return val.toLocaleString();
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, status }: { score: number | null; status: string }) {
  const r    = 80;
  const circ = 2 * Math.PI * r;
  const pct  = score != null ? Math.min(100, Math.max(0, score)) / 100 : 0;
  const dash = circ * pct;
  const gap  = circ - dash;

  const color =
    status === "clean"   ? "var(--green)"  :
    status === "caution" ? "var(--amber)"  :
    status === "risk"    ? "var(--red)"    :
    "var(--border-mid)";

  const glow =
    status === "clean"   ? "rgba(57,255,20,0.5)"   :
    status === "caution" ? "rgba(245,158,11,0.5)"  :
    status === "risk"    ? "rgba(239,68,68,0.5)"   :
    "transparent";

  return (
    <svg width={192} height={192} viewBox="0 0 192 192"
      style={{ filter: score != null ? `drop-shadow(0 0 28px ${glow})` : "none", flexShrink: 0 }}>
      <circle cx={96} cy={96} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
      <circle cx={96} cy={96} r={r} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        transform="rotate(-90 96 96)"
        style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.4,0,.2,1)" }}
      />
      <text x={96} y={88} textAnchor="middle" fill={color} fontSize={44} fontWeight={900} fontFamily="monospace">
        {score ?? "—"}
      </text>
      <text x={96} y={110} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={11} fontFamily="monospace" letterSpacing={3}>
        / 100
      </text>
    </svg>
  );
}

// ── Signal card ───────────────────────────────────────────────────────────────
function SignalCard({ signalKey, signal }: { signalKey: keyof ScanResult["signals"]; signal: SignalEntry }) {
  const meta = SIGNAL_META[signalKey];

  const borderColor =
    signal.status === "valid"   ? "rgba(57,255,20,0.3)"  :
    signal.status === "invalid" ? "rgba(239,68,68,0.3)"  :
    "rgba(255,255,255,0.06)";

  const accentColor =
    signal.status === "valid"   ? "var(--green)" :
    signal.status === "invalid" ? "var(--red)"   :
    "var(--text-faint)";

  const badgeBg =
    signal.status === "valid"   ? "rgba(57,255,20,0.1)"  :
    signal.status === "invalid" ? "rgba(239,68,68,0.1)"  :
    "rgba(255,255,255,0.04)";

  const icon =
    signal.status === "valid"
      ? <CheckCircle size={15} style={{ color: "var(--green)" }} />
      : signal.status === "invalid"
      ? <XCircle size={15} style={{ color: "var(--red)" }} />
      : <AlertCircle size={15} style={{ color: "var(--text-faint)" }} />;

  const hasScore = signal.score !== undefined;
  const scoreVal = signal.score ?? 0;

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{
        background: "var(--bg-charcoal)",
        border: `1px solid ${borderColor}`,
        borderTop: `2px solid ${borderColor}`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span style={{ color: accentColor }}>{meta.icon}</span>
          <span className="text-[11px] font-bold tracking-widest uppercase font-mono-jn" style={{ color: "var(--text-faint)" }}>
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {icon}
          <span
            className="text-[10px] font-black tracking-wider font-mono-jn px-2 py-0.5 rounded"
            style={{ background: badgeBg, color: accentColor, border: `1px solid ${borderColor}` }}
          >
            {signal.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Score bar */}
      {hasScore && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono-jn" style={{ color: "var(--text-faint)" }}>Signal score</span>
            <span className="text-[11px] font-black font-mono-jn" style={{ color: accentColor }}>{scoreVal}/100</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-1.5 rounded-full"
              style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}60` }}
              initial={{ width: 0 }}
              animate={{ width: `${scoreVal}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
      )}

      {/* Summary */}
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>
        {signal.summary}
      </p>
    </div>
  );
}

// ── Token identity header ─────────────────────────────────────────────────────
function TokenHeader({ result }: { result: ScanResult }) {
  const { meta, chain, address } = result;
  const short = address.length > 22
    ? `${address.slice(0, 11)}…${address.slice(-9)}`
    : address;

  const chainColor =
    chain === "solana"   ? "#9945ff" :
    chain === "ethereum" ? "#627eea" :
    chain === "base"     ? "#0052ff" :
    "var(--text-faint)";

  const chainLabel = chain.charAt(0).toUpperCase() + chain.slice(1);
  const hasStats = meta && (meta.exchangeRate || meta.volume24h || meta.holdersCount != null);

  return (
    <div className="rounded-xl mb-5 overflow-hidden" style={{ background: "var(--bg-charcoal)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-4 p-6">
        {meta?.iconUrl && (
          <img src={meta.iconUrl} alt={meta.symbol ?? "token"} width={56} height={56}
            className="rounded-full flex-shrink-0"
            style={{ border: "2px solid var(--border-mid)" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-black" style={{ fontSize: "1.4rem", color: "var(--text-cream)", lineHeight: 1.2 }}>
              {meta?.name ?? "Unknown Token"}
            </span>
            {meta?.symbol && (
              <span className="font-mono-jn text-sm font-bold px-2.5 py-0.5 rounded"
                style={{ background: "var(--bg-void)", color: "var(--text-silver)", border: "1px solid var(--border-mid)" }}>
                {meta.symbol}
              </span>
            )}
            <span className="text-xs font-bold font-mono-jn px-2.5 py-0.5 rounded"
              style={{ background: `${chainColor}18`, color: chainColor, border: `1px solid ${chainColor}40` }}>
              {chainLabel.toUpperCase()}
            </span>
            {meta?.reputation === "spam" && (
              <span className="badge badge-red">SPAM</span>
            )}
          </div>
          <div className="font-mono-jn text-xs truncate" style={{ color: "var(--text-faint)" }}>
            {short}
          </div>
        </div>
      </div>
      {hasStats && (
        <div className="flex flex-wrap gap-8 px-6 py-4" style={{ borderTop: "1px solid var(--border-faint)", background: "rgba(0,0,0,0.2)" }}>
          {meta?.exchangeRate && (
            <div className="flex items-center gap-2">
              <DollarSign size={12} style={{ color: "var(--text-faint)" }} />
              <span className="text-[10px] uppercase tracking-widest font-mono-jn font-bold" style={{ color: "var(--text-faint)" }}>Price</span>
              <span className="font-mono-jn font-black" style={{ fontSize: "0.95rem", color: "var(--text-cream)" }}>{fmtPrice(meta.exchangeRate)}</span>
            </div>
          )}
          {meta?.volume24h && (
            <div className="flex items-center gap-2">
              <BarChart2 size={12} style={{ color: "var(--text-faint)" }} />
              <span className="text-[10px] uppercase tracking-widest font-mono-jn font-bold" style={{ color: "var(--text-faint)" }}>24H Vol</span>
              <span className="font-mono-jn font-black" style={{ fontSize: "0.95rem", color: "var(--text-cream)" }}>{fmtVolume(meta.volume24h)}</span>
            </div>
          )}
          {meta?.holdersCount != null && meta.holdersCount > 0 && (
            <div className="flex items-center gap-2">
              <Users size={12} style={{ color: "var(--text-faint)" }} />
              <span className="text-[10px] uppercase tracking-widest font-mono-jn font-bold" style={{ color: "var(--text-faint)" }}>Holders</span>
              <span className="font-mono-jn font-black" style={{ fontSize: "0.95rem", color: "var(--text-cream)" }}>{fmtHolders(meta.holdersCount)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Chain selector ────────────────────────────────────────────────────────────
function ChainSelector({ chain, onChange }: { chain: "ethereum" | "base"; onChange: (c: "ethereum" | "base") => void }) {
  return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-[10px] font-mono-jn tracking-widest uppercase" style={{ color: "var(--text-faint)" }}>Chain:</span>
      {(["ethereum", "base"] as const).map((c) => (
        <button key={c} onClick={() => onChange(c)}
          className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase font-mono-jn border transition-all duration-150"
          style={{
            borderRadius: 3,
            borderColor: chain === c ? "var(--green)" : "var(--border-faint)",
            background:  chain === c ? "var(--green-trace)" : "transparent",
            color:       chain === c ? "var(--green)" : "var(--text-faint)",
          }}>
          {c === "ethereum" ? "Ethereum" : "Base"}
        </button>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ScanPage() {
  const [address,   setAddress]   = useState("");
  const [evmChain,  setEvmChain]  = useState<"ethereum" | "base">("ethereum");
  const [scanning,  setScanning]  = useState(false);
  const [result,    setResult]    = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showLogs,  setShowLogs]  = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSolana = SOLANA_RE.test(address.trim());
  const isEvm    = EVM_RE.test(address.trim());

  const runScan = async (addr?: string, chainOverride?: "ethereum" | "base") => {
    const trimmed = (addr ?? address).trim();
    if (!trimmed || scanning) return;
    if (!SOLANA_RE.test(trimmed) && !EVM_RE.test(trimmed)) {
      setScanError("Invalid address format. Paste a valid Solana (base58, 32–44 chars) or EVM (0x… 40-char hex) address.");
      return;
    }
    if (addr) setAddress(addr);
    const chain = chainOverride ?? evmChain;
    if (chainOverride) setEvmChain(chainOverride);

    setScanning(true);
    setResult(null);
    setScanError(null);
    setShowLogs(false);

    try {
      const isEvmAddr = EVM_RE.test(trimmed);
      const url = isEvmAddr
        ? `/api/scan?address=${encodeURIComponent(trimmed)}&chain=${chain}`
        : `/api/scan?address=${encodeURIComponent(trimmed)}`;
      const res  = await fetch(url);
      const data = await res.json() as ScanResult;
      setResult(data);
    } catch {
      setScanError("Trash Scanner offline. Check your connection and try again.");
    } finally {
      setScanning(false);
    }
  };

  const reset = () => {
    setAddress(""); setResult(null); setScanError(null); setShowLogs(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const scoreColor =
    result?.scoreStatus === "clean"   ? "var(--green)"  :
    result?.scoreStatus === "caution" ? "var(--amber)"  :
    result?.scoreStatus === "risk"    ? "var(--red)"    :
    "var(--text-faint)";

  const scoreGlow =
    result?.scoreStatus === "clean"   ? "rgba(57,255,20,0.15)"   :
    result?.scoreStatus === "caution" ? "rgba(245,158,11,0.12)"  :
    result?.scoreStatus === "risk"    ? "rgba(239,68,68,0.12)"   :
    "transparent";

  const scoreLabel =
    result?.scoreStatus === "clean"   ? "CLEAN"   :
    result?.scoreStatus === "caution" ? "CAUTION" :
    result?.scoreStatus === "risk"    ? "HIGH RISK" :
    "UNSCORED";

  return (
    <div className="min-h-screen bg-[var(--bg-void)]">

      {/* ── PAGE HEADER ── */}
      <div
        className="relative overflow-hidden pt-16"
        style={{ background: "linear-gradient(180deg, #050505 0%, #080808 100%)", borderBottom: "1px solid rgba(57,255,20,0.12)" }}
      >
        {/* Scan-grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
          <svg width="100%" height="100%">
            <defs>
              <pattern id="scan-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#39ff14" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#scan-grid)" />
          </svg>
        </div>

        {/* Mascot bleed on right */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[42%]">
            <Image src="/mascot/IMG_8490.jpeg" alt="" fill className="object-cover object-center" priority />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #060606 0%, #060606 15%, rgba(6,6,6,0.7) 55%, rgba(6,6,6,0.3) 100%)" }} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to bottom, transparent, var(--bg-void))" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse-green flex-shrink-0" style={{ background: "var(--green)" }} />
              <span className="text-[10px] font-bold tracking-[0.35em] uppercase font-mono-jn" style={{ color: "var(--green)" }}>
                Live Data Active
              </span>
            </div>
            <span className="text-[var(--border-mid)]">·</span>
            <span className="font-mono-jn font-black text-[10px] tracking-widest px-2 py-0.5 rounded"
              style={{ background: "rgba(57,255,20,0.08)", color: "var(--green)", border: "1px solid rgba(57,255,20,0.2)" }}>
              v2.0
            </span>
            <span className="font-mono-jn font-black text-[10px] tracking-widest px-2 py-0.5 rounded"
              style={{ background: "rgba(57,255,20,0.05)", color: "var(--text-faint)", border: "1px solid var(--border-faint)" }}>
              6 SIGNALS
            </span>
            <span className="font-mono-jn font-black text-[10px] tracking-widest px-2 py-0.5 rounded"
              style={{ background: "rgba(245,158,11,0.08)", color: "var(--amber)", border: "1px solid rgba(245,158,11,0.3)" }}>
              BETA
            </span>
          </div>

          {/* Title */}
          <h1 className="font-black tracking-tight mb-4" style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", color: "var(--text-cream)", lineHeight: 1.05 }}>
            Trash Scanner
          </h1>
          <p className="mb-2 max-w-lg leading-relaxed" style={{ color: "var(--text-silver)", fontSize: "1.05rem" }}>
            Paste any Solana, Ethereum, or Base address. Six live on-chain signals.
            Honest risk scores. TJ tells you what he sees.
          </p>
          <p className="text-sm font-mono-jn" style={{ color: "var(--text-faint)" }}>
            Helius · Etherscan V2 · Blockscout · GoPlus Security · DexScreener
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">

          {/* ── LEFT COLUMN ── */}
          <div>

            {/* INPUT PANEL */}
            <div className="rounded-2xl mb-6 overflow-hidden"
              style={{
                background: "var(--bg-charcoal)",
                border: "1px solid rgba(57,255,20,0.3)",
                boxShadow: "0 0 60px rgba(57,255,20,0.05), inset 0 1px 0 rgba(57,255,20,0.07)",
              }}
            >
              {/* Console title bar */}
              <div className="flex items-center justify-between px-5 py-3"
                style={{ background: "rgba(57,255,20,0.03)", borderBottom: "1px solid rgba(57,255,20,0.12)" }}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.6)" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(245,158,11,0.6)" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(57,255,20,0.6)" }} />
                  </div>
                  <span className="font-mono-jn font-bold tracking-widest" style={{ color: "var(--green)", fontSize: "0.65rem" }}>
                    TRASH SCANNER v2.0 // NETWORK SECURITY CONSOLE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--green)" }}
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }} />
                  <span className="font-mono-jn text-[10px] font-bold tracking-widest" style={{ color: "var(--text-faint)" }}>ONLINE</span>
                </div>
              </div>

              {/* Input body */}
              <div className="p-5 sm:p-6">
                <label htmlFor="address-input" className="block font-bold tracking-widest uppercase mb-3 font-mono-jn" style={{ color: "var(--text-faint)", fontSize: "0.6rem" }}>
                  TARGET ADDRESS — PASTE BELOW
                </label>

                <div className="flex items-center rounded-lg overflow-hidden"
                  style={{ background: "#050505", border: "1px solid rgba(57,255,20,0.18)", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.6)" }}>
                  <div className="flex items-center px-3 py-4 flex-shrink-0" style={{ borderRight: "1px solid rgba(57,255,20,0.1)" }}>
                    <span className="font-mono-jn font-bold" style={{ color: "var(--green)", fontSize: "0.9rem" }}>&gt;_</span>
                  </div>
                  <input
                    ref={inputRef}
                    id="address-input"
                    type="text"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value.replace(/[^0-9A-Za-z]/g, "")); if (scanError) setScanError(null); }}
                    onKeyDown={(e) => e.key === "Enter" && runScan()}
                    placeholder="Solana, Ethereum, or Base address…"
                    className="flex-1 min-w-0 font-mono-jn bg-transparent outline-none"
                    style={{ color: "var(--text-cream)", fontSize: "0.88rem", padding: "14px 16px", caretColor: "var(--green)" }}
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={100}
                  />
                  <button
                    onClick={() => runScan()}
                    disabled={!address.trim() || scanning}
                    className="flex-shrink-0 flex items-center gap-2 font-mono-jn font-bold tracking-widest uppercase transition-all"
                    style={{
                      padding: "14px 22px",
                      fontSize: "0.72rem",
                      borderLeft: "1px solid rgba(57,255,20,0.15)",
                      background: !address.trim() || scanning ? "transparent" : "rgba(57,255,20,0.1)",
                      color: !address.trim() || scanning ? "var(--text-faint)" : "var(--green)",
                      cursor: !address.trim() || scanning ? "not-allowed" : "pointer",
                    }}
                  >
                    {scanning
                      ? <><Loader2 size={14} className="animate-spin" /><span className="hidden sm:inline">Scanning…</span></>
                      : <><Search size={14} /><span className="hidden sm:inline">Scan</span></>
                    }
                  </button>
                </div>

                {isEvm && !result && <ChainSelector chain={evmChain} onChange={setEvmChain} />}

                {/* Example chips */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(57,255,20,0.06)" }}>
                  <span className="text-[10px] tracking-widest uppercase font-mono-jn font-bold" style={{ color: "var(--text-faint)" }}>Try:</span>
                  {EXAMPLES.map((ex) => (
                    <button key={ex.value}
                      onClick={() => {
                        if (ex.chain === "ethereum" || ex.chain === "base") setEvmChain(ex.chain);
                        runScan(ex.value, ex.chain === "ethereum" || ex.chain === "base" ? ex.chain : undefined);
                      }}
                      className="text-[10px] font-mono-jn px-3 py-1.5 border transition-colors hover:border-[rgba(57,255,20,0.3)] hover:text-[var(--text-cream)]"
                      style={{ color: "var(--text-silver)", borderColor: "rgba(57,255,20,0.1)", borderRadius: 4, background: "rgba(57,255,20,0.02)" }}>
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ERROR */}
            <AnimatePresence>
              {scanError && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-4 rounded-xl border mb-5"
                  style={{ borderColor: "rgba(239,68,68,0.3)", background: "var(--red-glow)" }}>
                  <XCircle size={18} style={{ color: "var(--red)", flexShrink: 0 }} />
                  <span style={{ color: "var(--red)", fontSize: "0.92rem" }}>{scanError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SCANNING ANIMATION */}
            {scanning && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden mb-6"
                style={{ border: "1px solid rgba(57,255,20,0.25)", background: "#050505" }}>
                <div className="flex items-center gap-3 px-5 py-3.5"
                  style={{ background: "rgba(57,255,20,0.04)", borderBottom: "1px solid rgba(57,255,20,0.12)" }}>
                  <Loader2 size={13} className="animate-spin" style={{ color: "var(--green)" }} />
                  <span className="font-mono-jn font-bold tracking-widest" style={{ color: "var(--green)", fontSize: "0.65rem" }}>
                    DEEP SCAN IN PROGRESS — PARSING ON-CHAIN LEDGER
                  </span>
                </div>
                <div className="h-[2px] bg-[var(--border-faint)] relative overflow-hidden">
                  <motion.div className="absolute left-0 top-0 h-full"
                    style={{ background: "linear-gradient(to right, rgba(57,255,20,0.3), var(--green), rgba(57,255,20,0.3))" }}
                    initial={{ width: "0%" }} animate={{ width: "94%" }} transition={{ duration: 8, ease: "easeOut" }} />
                </div>
                <div className="p-5 space-y-1">
                  {SCAN_LOG_LINES.map((line, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: line.delay, duration: 0.2 }}
                      className="font-mono-jn" style={{ color: "var(--text-silver)", fontSize: "0.8rem", lineHeight: 1.9 }}>
                      {line.text}
                    </motion.div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <motion.span className="font-mono-jn" style={{ color: "var(--green)", fontSize: "0.8rem" }}
                    animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.85, repeat: Infinity }}>▋</motion.span>
                </div>
              </motion.div>
            )}

            {/* RESULTS */}
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}>

                  {/* Token identity */}
                  <TokenHeader result={result} />

                  {/* TJ MESSAGE */}
                  {result.tjMessage && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                      className="rounded-2xl mb-5 overflow-hidden"
                      style={{
                        background: "var(--bg-charcoal)",
                        border: "1px solid rgba(57,255,20,0.3)",
                        boxShadow: "0 0 40px rgba(57,255,20,0.06)",
                      }}>
                      <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, rgba(57,255,20,0.5), transparent)" }} />
                      <div className="p-5 sm:p-6 flex items-start gap-5">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden"
                          style={{ border: "2px solid rgba(57,255,20,0.4)", boxShadow: "0 0 16px rgba(57,255,20,0.2)" }}>
                          <Image src="/mascot/IMG_8490.jpeg" alt="TJ" width={48} height={48} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase font-mono-jn" style={{ color: "var(--green)" }}>
                              TJ — Night Shift Assessment
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse-green flex-shrink-0" style={{ background: "var(--green)" }} />
                          </div>
                          <p style={{ color: "var(--text-cream)", fontSize: "1rem", lineHeight: 1.7, fontStyle: "italic" }}>
                            &ldquo;{result.tjMessage}&rdquo;
                          </p>
                        </div>
                      </div>
                      <div className="h-px w-full" style={{ background: "linear-gradient(to right, transparent, rgba(57,255,20,0.15), transparent)" }} />
                    </motion.div>
                  )}

                  {/* SCORE BANNER */}
                  <motion.div
                    className="rounded-2xl mb-6 overflow-hidden"
                    style={{ background: "var(--bg-charcoal)", border: `1px solid ${scoreColor}35` }}
                    animate={{ boxShadow: [`0 0 20px ${scoreGlow}`, `0 0 60px ${scoreGlow}`, `0 0 20px ${scoreGlow}`] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-7">
                      <ScoreRing score={result.cleanScore} status={result.scoreStatus} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="font-black font-mono-jn tracking-widest px-4 py-1.5 rounded-lg"
                            style={{
                              color: scoreColor,
                              background: `${scoreColor}14`,
                              border: `1px solid ${scoreColor}45`,
                              fontSize: "0.85rem",
                              letterSpacing: "0.2em",
                            }}>
                            {scoreLabel}
                          </span>
                          {result.dataStatus === "partial_live_data" && (
                            <span className="badge badge-amber">PARTIAL DATA</span>
                          )}
                        </div>
                        <div className="font-black mb-2" style={{ color: "var(--text-cream)", fontSize: "1.3rem", lineHeight: 1.2 }}>
                          {result.scoreLabel}
                        </div>
                        <div className="font-mono-jn text-sm mb-1" style={{ color: "var(--text-muted)" }}>
                          {result.classification} · {result.targetType.replace(/_/g, " ")}
                        </div>
                        <div className="font-mono-jn text-xs" style={{ color: "var(--text-faint)" }}>
                          Scanned {new Date(result.scannedAt).toLocaleTimeString()}
                        </div>
                        {(result.chain === "ethereum" || result.chain === "base") && (
                          <button onClick={() => runScan(result.address, result.chain === "ethereum" ? "base" : "ethereum")}
                            className="mt-3 text-xs font-mono-jn font-semibold underline transition-colors hover:text-[var(--green)]"
                            style={{ color: "var(--text-faint)" }}>
                            Also scan on {result.chain === "ethereum" ? "Base" : "Ethereum"} →
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* SIGNAL GRID */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-black tracking-widest uppercase font-mono-jn" style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>
                        Risk Signals
                      </span>
                      <span className="font-mono-jn font-bold text-[10px] px-2 py-0.5 rounded"
                        style={{ color: "var(--text-faint)", background: "var(--bg-charcoal)", border: "1px solid var(--border-faint)" }}>
                        6 CHECKS
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {(Object.entries(result.signals) as [keyof ScanResult["signals"], SignalEntry][]).map(([key, signal], i) => (
                        <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}>
                          <SignalCard signalKey={key} signal={signal} />
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* TERMINAL LOGS */}
                  <div className="rounded-xl overflow-hidden mb-5" style={{ border: "1px solid rgba(57,255,20,0.15)", background: "#040404" }}>
                    <button onClick={() => setShowLogs(v => !v)}
                      className="w-full flex items-center justify-between px-5 py-4 transition-colors"
                      style={{ background: "rgba(57,255,20,0.03)", borderBottom: showLogs ? "1px solid rgba(57,255,20,0.1)" : "none" }}>
                      <div className="flex items-center gap-2.5">
                        <Terminal size={13} style={{ color: "var(--green)" }} />
                        <span className="font-mono-jn font-bold tracking-widest uppercase" style={{ color: "var(--green)", fontSize: "0.65rem" }}>
                          Scanner Logs — {result.logs.length} entries
                        </span>
                      </div>
                      {showLogs ? <ChevronUp size={13} style={{ color: "var(--text-faint)" }} /> : <ChevronDown size={13} style={{ color: "var(--text-faint)" }} />}
                    </button>
                    <AnimatePresence>
                      {showLogs && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <div className="p-5 space-y-1" style={{ maxHeight: 400, overflowY: "auto" }}>
                            {result.logs.map((line, i) => {
                              const color =
                                line.startsWith("[RESULT]") ? "var(--green)"      :
                                line.startsWith("[ERROR]")  ? "var(--red)"        :
                                line.startsWith("[FORMAT]") ? "var(--amber)"      :
                                line.startsWith("[CAP")     ? "var(--text-cream)" :
                                "var(--text-silver)";
                              return <div key={i} className="font-mono-jn" style={{ color, fontSize: "0.78rem", lineHeight: 1.9 }}>{line}</div>;
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="leading-relaxed mb-5" style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{result.disclaimer}</p>

                  <button onClick={reset} className="flex items-center gap-2 font-bold transition-colors hover:text-[var(--green)]"
                    style={{ color: "var(--text-silver)", fontSize: "0.9rem" }}>
                    <RotateCcw size={15} /> Scan another address
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* IDLE STATE */}
            {!result && !scanError && !scanning && (
              <motion.div className="py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                {/* How it works */}
                <div className="mb-8">
                  <p className="text-[10px] tracking-[0.3em] uppercase font-mono-jn font-bold mb-5" style={{ color: "var(--text-faint)" }}>
                    How it works
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { n: "01", title: "Paste address", desc: "Any Solana, Ethereum, or Base address — token or wallet." },
                      { n: "02", title: "TJ scans it",   desc: "6 live signals pulled in parallel from on-chain data sources." },
                      { n: "03", title: "Read the score", desc: "Clean score 0–100 with a signal breakdown and TJ's take." },
                    ].map((step) => (
                      <div key={step.n} className="rounded-xl p-5" style={{ background: "var(--bg-charcoal)", border: "1px solid var(--border-faint)" }}>
                        <div className="font-black font-mono-jn mb-2" style={{ fontSize: "1.6rem", color: "rgba(57,255,20,0.2)", lineHeight: 1 }}>{step.n}</div>
                        <div className="font-bold mb-1.5" style={{ color: "var(--text-cream)", fontSize: "0.9rem" }}>{step.title}</div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signal preview */}
                <p className="text-[10px] tracking-[0.3em] uppercase font-mono-jn font-bold mb-4" style={{ color: "var(--text-faint)" }}>
                  Signals checked
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {(Object.entries(SIGNAL_META) as [keyof typeof SIGNAL_META, typeof SIGNAL_META[keyof typeof SIGNAL_META]][]).map(([key, m]) => (
                    <div key={key} className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ background: "var(--bg-charcoal)", border: "1px solid var(--border-faint)" }}>
                      <span style={{ color: "var(--green)", opacity: 0.7 }}>{m.icon}</span>
                      <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{m.label}</span>
                      <span className="ml-auto font-mono-jn text-[10px] font-bold" style={{ color: "var(--green)" }}>LIVE</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="space-y-5">

            {/* TJ on duty */}
            <div className="relative rounded-2xl overflow-hidden" style={{ height: 260 }}>
              <Image src="/mascot/IMG_8490.jpeg" alt="TJ — The Janitor" fill className="object-cover object-center" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 35%, rgba(6,6,6,0.95) 100%)" }} />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse-green" style={{ background: "var(--green)" }} />
                  <span className="text-xs font-mono-jn font-bold" style={{ color: "var(--green)" }}>TJ on duty — night shift active</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-faint)" }}>
                  Scanning Solana, Ethereum &amp; Base 24/7.
                </p>
              </div>
            </div>

            {/* Score legend */}
            <div className="rounded-xl p-5" style={{ background: "var(--bg-charcoal)", border: "1px solid var(--border-subtle)" }}>
              <div className="text-[10px] font-bold tracking-widest uppercase font-mono-jn mb-4" style={{ color: "var(--text-faint)" }}>Score Guide</div>
              <div className="space-y-3">
                {[
                  { range: "80–100", label: "Clean",    sub: "Low risk signals",    color: "var(--green)" },
                  { range: "50–79",  label: "Caution",  sub: "Mixed signals — DYOR", color: "var(--amber)" },
                  { range: "0–49",   label: "High Risk", sub: "Significant red flags", color: "var(--red)"  },
                  { range: "—",      label: "Unscored", sub: "Insufficient data",   color: "var(--text-faint)" },
                ].map((s) => (
                  <div key={s.range} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
                      <span className="font-mono-jn font-black" style={{ color: s.color, fontSize: "0.7rem" }}>{s.range}</span>
                    </div>
                    <div>
                      <div className="font-bold text-xs" style={{ color: "var(--text-cream)" }}>{s.label}</div>
                      <div className="text-[10px]" style={{ color: "var(--text-faint)" }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported chains */}
            <div className="rounded-xl p-5" style={{ background: "var(--bg-charcoal)", border: "1px solid var(--border-subtle)" }}>
              <div className="text-[10px] font-bold tracking-widest uppercase font-mono-jn mb-4" style={{ color: "var(--text-faint)" }}>Supported Chains</div>
              <div className="space-y-3">
                {[
                  { name: "Solana",   color: "#9945ff", signals: 6, note: "Helius + GoPlus"      },
                  { name: "Ethereum", color: "#627eea", signals: 6, note: "Etherscan + GoPlus"   },
                  { name: "Base",     color: "#0052ff", signals: 6, note: "Blockscout + GoPlus"  },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: `${c.color}08`, border: `1px solid ${c.color}20` }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs" style={{ color: "var(--text-cream)" }}>{c.name}</div>
                      <div className="text-[10px] font-mono-jn" style={{ color: "var(--text-faint)" }}>{c.note}</div>
                    </div>
                    <span className="font-mono-jn font-black text-[10px]" style={{ color: c.color }}>{c.signals} signals</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-faint)" }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--text-faint)" }} />
                  <div className="flex-1">
                    <div className="font-bold text-xs" style={{ color: "var(--text-faint)" }}>More chains</div>
                  </div>
                  <span className="font-mono-jn font-black text-[10px]" style={{ color: "var(--text-faint)" }}>Phase 4</span>
                </div>
              </div>
            </div>

            {/* System status */}
            <div className="rounded-xl p-5" style={{ background: "rgba(57,255,20,0.03)", border: "1px solid rgba(57,255,20,0.12)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={12} style={{ color: "var(--green)" }} />
                <span className="text-[10px] font-bold tracking-widest uppercase font-mono-jn" style={{ color: "var(--green)" }}>
                  System Status
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "Helius RPC",      status: "ONLINE"  },
                  { label: "Etherscan V2",    status: "ONLINE"  },
                  { label: "Blockscout",      status: "ONLINE"  },
                  { label: "GoPlus Security", status: "ONLINE"  },
                  { label: "DexScreener",     status: "ONLINE"  },
                  { label: "Score engine",    status: "ACTIVE"  },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="font-mono-jn text-[11px]" style={{ color: "var(--text-faint)" }}>{s.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full" style={{ background: "var(--green)" }} />
                      <span className="font-mono-jn font-bold text-[10px]" style={{ color: "var(--green)" }}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-xl p-5" style={{ background: "var(--bg-charcoal)", border: "1px solid var(--border-faint)" }}>
              <div className="font-bold mb-1.5" style={{ color: "var(--text-cream)", fontSize: "0.9rem" }}>
                Scanner + Community
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                Share what you find in the Clean Room. One scan could save someone else&apos;s bag.
              </p>
              <a href="https://t.me/TheJanitorHQ" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold transition-colors hover:text-[var(--green)]"
                style={{ color: "var(--text-silver)" }}>
                Join Telegram <ArrowRight size={12} />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Legal disclaimer */}
      <div className="border-t border-[var(--border-faint)] px-6 py-5" style={{ background: "var(--bg-void)" }}>
        <p className="max-w-5xl mx-auto text-[10px] leading-relaxed text-center" style={{ color: "var(--text-faint)" }}>
          <strong style={{ color: "var(--text-muted)" }}>Legal disclaimer:</strong> The Janitor Network provides technical analysis of publicly available blockchain data. Scan outputs are informational only — not financial advice, investment recommendations, or legal findings. No guarantee of accuracy. Do your own research. Past scan results do not predict future outcomes.
        </p>
      </div>
    </div>
  );
}
