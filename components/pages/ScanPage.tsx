"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
  Users,
  DollarSign,
  BarChart2,
  Activity,
  Shield,
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

const SIGNAL_LABELS: Record<keyof ScanResult["signals"], string> = {
  addressFormat:       "Address Format",
  holderConcentration: "Holder Concentration",
  liquiditySecurity:   "Liquidity Security",
  deployerHistory:     "Deployer History",
  volumeBehavior:      "Volume Behavior",
  honeypotCheck:       "Honeypot Detection",
};

const EXAMPLES = [
  { label: "Solana token",    value: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", chain: "solana" },
  { label: "Ethereum token",  value: "0xdAC17F958D2ee523a2206206994597C13D831ec7",      chain: "ethereum" },
  { label: "Base token",      value: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",      chain: "base" },
];

const SCAN_LOG_LINES = [
  { text: "[INIT]    Night-shift scanner initialised.",               delay: 0 },
  { text: "[INPUT]   Target address received — validating format…",   delay: 0.35 },
  { text: "[FORMAT]  Address encoding verified. Chain identified.",    delay: 0.75 },
  { text: "[NET]     Connecting to on-chain data nodes…",             delay: 1.15 },
  { text: "[FETCH]   Pulling holder distribution snapshot…",          delay: 1.6 },
  { text: "[FETCH]   Querying deployer wallet history…",              delay: 2.1 },
  { text: "[FETCH]   Retrieving liquidity pool parameters…",          delay: 2.7 },
  { text: "[FETCH]   Sampling 48h volume behavior patterns…",         delay: 3.3 },
  { text: "[FETCH]   Running GoPlus honeypot detection…",             delay: 3.9 },
  { text: "[PARSE]   Cross-referencing on-chain ledger entries…",     delay: 4.7 },
  { text: "[CALC]    Weighting risk signals across all vectors…",     delay: 5.5 },
  { text: "[CALC]    Computing aggregate CLEAN score…",               delay: 6.3 },
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

// ── Token identity header ─────────────────────────────────────────────────────
function TokenHeader({ result }: { result: ScanResult }) {
  const { meta, chain, address } = result;
  const short = address.length > 20
    ? `${address.slice(0, 10)}…${address.slice(-8)}`
    : address;

  const chainColor =
    chain === "solana"   ? "#9945ff" :
    chain === "ethereum" ? "#627eea" :
    chain === "base"     ? "#0052ff" :
    "var(--text-faint)";

  const chainLabel = chain.charAt(0).toUpperCase() + chain.slice(1);
  const hasStats = meta && (meta.exchangeRate || meta.volume24h || meta.holdersCount != null);

  return (
    <div
      className="rounded-xl mb-5"
      style={{ background: "var(--bg-charcoal)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center gap-4 p-6">
        {meta?.iconUrl && (
          <img
            src={meta.iconUrl}
            alt={meta.symbol ?? "token"}
            width={52}
            height={52}
            className="rounded-full flex-shrink-0"
            style={{ border: "2px solid var(--border-mid)" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-black" style={{ fontSize: "1.35rem", color: "var(--text-cream)", lineHeight: 1.2 }}>
              {meta?.name ?? "Unknown Token"}
            </span>
            {meta?.symbol && (
              <span
                className="font-mono-jn text-sm font-bold px-2.5 py-0.5 rounded"
                style={{ background: "var(--bg-void)", color: "var(--text-silver)", border: "1px solid var(--border-mid)" }}
              >
                {meta.symbol}
              </span>
            )}
            <span
              className="text-xs font-bold font-mono-jn px-2.5 py-0.5 rounded"
              style={{ background: `${chainColor}18`, color: chainColor, border: `1px solid ${chainColor}40` }}
            >
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
        <div
          className="flex flex-wrap gap-6 px-6 py-4"
          style={{ borderTop: "1px solid var(--border-faint)", background: "rgba(0,0,0,0.2)" }}
        >
          {meta?.exchangeRate && (
            <div className="flex items-center gap-2">
              <DollarSign size={13} style={{ color: "var(--text-faint)" }} />
              <span className="text-xs uppercase tracking-widest font-mono-jn font-bold" style={{ color: "var(--text-faint)" }}>Price</span>
              <span className="font-mono-jn font-black" style={{ fontSize: "1rem", color: "var(--text-cream)" }}>
                {fmtPrice(meta.exchangeRate)}
              </span>
            </div>
          )}
          {meta?.volume24h && (
            <div className="flex items-center gap-2">
              <BarChart2 size={13} style={{ color: "var(--text-faint)" }} />
              <span className="text-xs uppercase tracking-widest font-mono-jn font-bold" style={{ color: "var(--text-faint)" }}>24H VOL</span>
              <span className="font-mono-jn font-black" style={{ fontSize: "1rem", color: "var(--text-cream)" }}>
                {fmtVolume(meta.volume24h)}
              </span>
            </div>
          )}
          {meta?.holdersCount != null && meta.holdersCount > 0 && (
            <div className="flex items-center gap-2">
              <Users size={13} style={{ color: "var(--text-faint)" }} />
              <span className="text-xs uppercase tracking-widest font-mono-jn font-bold" style={{ color: "var(--text-faint)" }}>Holders</span>
              <span className="font-mono-jn font-black" style={{ fontSize: "1rem", color: "var(--text-cream)" }}>
                {fmtHolders(meta.holdersCount)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Score ring (scaled up) ────────────────────────────────────────────────────
function ScoreRing({ score, status }: { score: number | null; status: string }) {
  const r    = 72;
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
    status === "clean"   ? "rgba(57,255,20,0.4)"   :
    status === "caution" ? "rgba(245,158,11,0.4)"  :
    status === "risk"    ? "rgba(239,68,68,0.4)"   :
    "transparent";

  return (
    <svg
      width={174} height={174} viewBox="0 0 174 174"
      style={{ filter: score != null ? `drop-shadow(0 0 22px ${glow})` : "none", flexShrink: 0 }}
    >
      {/* Track */}
      <circle cx={87} cy={87} r={r} fill="none" stroke="var(--border-mid)" strokeWidth={9} />
      {/* Fill */}
      <circle
        cx={87} cy={87} r={r} fill="none"
        stroke={color} strokeWidth={9}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        transform="rotate(-90 87 87)"
        style={{ transition: "stroke-dasharray 0.9s ease" }}
      />
      {/* Score number */}
      <text x={87} y={82} textAnchor="middle" fill={color} fontSize={38} fontWeight={800} fontFamily="monospace">
        {score ?? "—"}
      </text>
      {/* / 100 label */}
      <text x={87} y={103} textAnchor="middle" fill="var(--text-faint)" fontSize={12} fontFamily="monospace" letterSpacing={2}>
        / 100
      </text>
    </svg>
  );
}

// ── Signal row ────────────────────────────────────────────────────────────────
function SignalRow({ label, signal }: { label: string; signal: SignalEntry }) {
  const icon =
    signal.status === "valid"
      ? <CheckCircle size={16} style={{ color: "var(--green)" }} className="flex-shrink-0 mt-0.5" />
      : signal.status === "invalid"
      ? <XCircle    size={16} style={{ color: "var(--red)"   }} className="flex-shrink-0 mt-0.5" />
      : <AlertCircle size={16} style={{ color: "var(--text-faint)" }} className="flex-shrink-0 mt-0.5" />;

  return (
    <div className="flex items-start gap-4 py-5 border-b border-[var(--border-faint)] last:border-0">
      {icon}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold tracking-widest uppercase mb-1.5 font-mono-jn" style={{ color: "var(--text-faint)" }}>
          {label}
        </div>
        <div className="text-sm leading-relaxed" style={{ color: "var(--text-silver)", fontSize: "0.9rem" }}>
          {signal.summary}
        </div>
        {signal.score !== undefined && (
          <div className="mt-1.5 text-[11px] font-mono-jn font-bold" style={{ color: signal.status === "valid" ? "var(--green)" : signal.status === "invalid" ? "var(--red)" : "var(--text-faint)" }}>
            Signal score: {signal.score}/100
          </div>
        )}
      </div>
      <div
        className={`badge flex-shrink-0 ml-2 text-[10px] px-2.5 py-1 ${
          signal.status === "valid"   ? "badge-green" :
          signal.status === "invalid" ? "badge-red"   :
          "badge-muted"
        }`}
      >
        {signal.status.toUpperCase()}
      </div>
    </div>
  );
}

// ── Chain selector ────────────────────────────────────────────────────────────
function ChainSelector({
  chain, onChange,
}: { chain: "ethereum" | "base"; onChange: (c: "ethereum" | "base") => void }) {
  return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-[10px] font-mono-jn tracking-widest uppercase" style={{ color: "var(--text-faint)" }}>
        Chain:
      </span>
      {(["ethereum", "base"] as const).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase font-mono-jn border transition-all duration-150"
          style={{
            borderRadius: 3,
            borderColor:  chain === c ? "var(--green)" : "var(--border-faint)",
            background:   chain === c ? "var(--green-trace)" : "transparent",
            color:        chain === c ? "var(--green)" : "var(--text-faint)",
          }}
        >
          {c === "ethereum" ? "Ethereum" : "Base"}
        </button>
      ))}
    </div>
  );
}

// ── Corner accent for score panel ─────────────────────────────────────────────
function CornerAccents({ color }: { color: string }) {
  const corners = [
    { top: 6, left: 6,   borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    { top: 6, right: 6,  borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` },
    { bottom: 6, left: 6,  borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    { bottom: 6, right: 6, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` },
  ];
  return (
    <>
      {corners.map((style, i) => (
        <motion.div
          key={i}
          className="absolute w-5 h-5 pointer-events-none"
          style={style}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ScanPage() {
  const [address,  setAddress]  = useState("");
  const [evmChain, setEvmChain] = useState<"ethereum" | "base">("ethereum");
  const [scanning, setScanning] = useState(false);
  const [result,   setResult]   = useState<ScanResult | null>(null);
  const [scanError,setScanError]= useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSolana = SOLANA_RE.test(address.trim());
  const isEvm    = EVM_RE.test(address.trim());

  const runScan = async (addr?: string, chainOverride?: "ethereum" | "base") => {
    const trimmed = (addr ?? address).trim();
    if (!trimmed || scanning) return;
    // Client-side format gate — must be Solana base58 or EVM 0x hex before any network call
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
    setShowLogs(true);

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
    inputRef.current?.focus();
  };

  const scoreStatusColor =
    result?.scoreStatus === "clean"   ? "var(--green)"  :
    result?.scoreStatus === "caution" ? "var(--amber)"  :
    result?.scoreStatus === "risk"    ? "var(--red)"    :
    "var(--text-faint)";

  const scoreStatusLabel =
    result?.scoreStatus === "clean"   ? "CLEAN"   :
    result?.scoreStatus === "caution" ? "CAUTION" :
    result?.scoreStatus === "risk"    ? "RISK"     :
    "UNSCORED";

  const scoreGlowColor =
    result?.scoreStatus === "clean"   ? "rgba(57,255,20,0.12)"  :
    result?.scoreStatus === "caution" ? "rgba(245,158,11,0.12)" :
    result?.scoreStatus === "risk"    ? "rgba(239,68,68,0.12)"  :
    "transparent";

  const sidebarItems = [
    {
      label:  "Address Format",
      status: "live",
      desc:   "Validates Solana base58 and EVM hex encoding",
    },
    {
      label:  "Holder Concentration",
      status: "live",
      desc:   isSolana
        ? "Top-10 wallet supply distribution"
        : "Token holder count from on-chain data",
    },
    {
      label:  "Liquidity Security",
      status: "live",
      desc:   isSolana
        ? "Mint authority & freeze authority check"
        : "Contract verification & freeze flag check",
    },
    {
      label:  "Deployer History",
      status: "live",
      desc:   "Creator wallet first-transaction reputation check",
    },
    {
      label:  "Volume Behavior",
      status: "live",
      desc:   "48h transaction pattern analysis",
    },
    {
      label:  "Honeypot Detection",
      status: "live",
      desc:   "GoPlus Security API — sell-block & tax trap detection",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-20">

      {/* ── Header ── */}
      <div className="relative overflow-hidden border-b border-[var(--border-faint)] bg-[var(--bg-velvet)]">
        <div className="absolute inset-0 pointer-events-none">
          <Image src="/mascot/IMG_8490.jpeg" alt="" fill className="object-cover object-center opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--bg-void) 0%, rgba(6,6,6,0.6) 35%, rgba(6,6,6,0.15) 100%)" }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse-green" style={{ background: "var(--green)" }} />
            <span className="label-green text-xs tracking-widest">Trash Scanner — Live Data Active</span>
            <span
              className="font-black font-mono-jn tracking-widest uppercase px-2 py-0.5"
              style={{ color: "var(--amber)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 3, background: "var(--amber-glow)", fontSize: "0.6rem" }}
            >
              BETA
            </span>
          </div>
          <h1 className="font-black tracking-tight mb-5" style={{ fontSize: "clamp(2.4rem, 5vw, 3.8rem)", color: "var(--text-cream)", lineHeight: 1.1 }}>
            Scan any wallet<br />or token address.
          </h1>
          <p style={{ color: "var(--text-silver)", maxWidth: 540, lineHeight: 1.8, fontSize: "1.05rem" }}>
            Paste a Solana, Ethereum, or Base address. Live on-chain data pulls holder
            concentration, deployer history, contract security, and volume patterns. If
            data isn&apos;t available, we say so plainly.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid lg:grid-cols-[1fr_340px] gap-10">

          {/* ── Left — Scanner ── */}
          <div>

            {/* ── Security console input panel ── */}
            <div
              className="rounded-xl mb-8 overflow-hidden"
              style={{
                background: "var(--bg-charcoal)",
                border: "1px solid rgba(57,255,20,0.35)",
                boxShadow: "0 0 40px rgba(57,255,20,0.06), inset 0 1px 0 rgba(57,255,20,0.08)",
              }}
            >
              {/* Console title bar */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{
                  background: "rgba(57,255,20,0.04)",
                  borderBottom: "1px solid rgba(57,255,20,0.15)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.65)" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(245,158,11,0.65)" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(57,255,20,0.65)" }} />
                  </div>
                  <span className="font-mono-jn font-bold tracking-widest hidden sm:block" style={{ color: "var(--green)", fontSize: "0.68rem" }}>
                    TRASH SCANNER v1.0 // NETWORK SECURITY PANEL
                  </span>
                  <span className="font-mono-jn font-bold tracking-widest sm:hidden" style={{ color: "var(--green)", fontSize: "0.68rem" }}>
                    TRASH SCANNER v1.0
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--green)" }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="font-mono-jn text-[10px] font-bold tracking-widest" style={{ color: "var(--text-faint)" }}>ONLINE</span>
                </div>
              </div>

              {/* Console body */}
              <div className="p-5 sm:p-6">
                <label htmlFor="address-input" className="block font-bold tracking-widest uppercase mb-3 font-mono-jn" style={{ color: "var(--text-faint)", fontSize: "0.65rem" }}>
                  INPUT // TARGET ADDRESS
                </label>

                {/* Terminal input row */}
                <div
                  className="flex items-center gap-0 rounded-lg overflow-hidden"
                  style={{
                    background: "#050505",
                    border: "1px solid rgba(57,255,20,0.22)",
                    boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  <div
                    className="flex items-center px-3 py-3.5 flex-shrink-0 select-none"
                    style={{ borderRight: "1px solid rgba(57,255,20,0.12)" }}
                  >
                    <span className="font-mono-jn font-bold text-sm" style={{ color: "var(--green)" }}>&gt;_</span>
                  </div>
                  <input
                    ref={inputRef}
                    id="address-input"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      // Strip any char that can't appear in a valid address (Solana base58 or EVM 0x hex)
                      setAddress(e.target.value.replace(/[^0-9A-Za-z]/g, ""));
                      if (scanError) setScanError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && runScan()}
                    placeholder="Paste wallet or token address…"
                    className="flex-1 min-w-0 font-mono-jn bg-transparent outline-none"
                    style={{
                      color: "var(--text-cream)",
                      fontSize: "0.88rem",
                      padding: "13px 14px",
                      caretColor: "var(--green)",
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={100}
                  />
                  <button
                    onClick={() => runScan()}
                    disabled={!address.trim() || scanning}
                    className="flex-shrink-0 flex items-center gap-2 font-mono-jn font-bold tracking-widest uppercase transition-all"
                    style={{
                      padding: "13px 20px",
                      fontSize: "0.72rem",
                      borderLeft: "1px solid rgba(57,255,20,0.2)",
                      background: !address.trim() || scanning ? "transparent" : "rgba(57,255,20,0.08)",
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

                {/* EVM chain selector */}
                {isEvm && !result && (
                  <ChainSelector chain={evmChain} onChange={setEvmChain} />
                )}

                {/* Example addresses */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(57,255,20,0.08)" }}>
                  <span className="text-[10px] tracking-widest uppercase font-mono-jn font-bold" style={{ color: "var(--text-faint)" }}>
                    Try:
                  </span>
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.value}
                      onClick={() => {
                        if (ex.chain === "ethereum" || ex.chain === "base") setEvmChain(ex.chain);
                        runScan(ex.value, ex.chain === "ethereum" || ex.chain === "base" ? ex.chain : undefined);
                      }}
                      className="text-[10px] font-mono-jn px-3 py-1.5 border transition-colors"
                      style={{
                        color: "var(--text-silver)",
                        borderColor: "rgba(57,255,20,0.15)",
                        borderRadius: 4,
                        background: "rgba(57,255,20,0.03)",
                      }}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {scanError && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-5 rounded-xl border border-[rgba(239,68,68,0.3)] bg-[var(--red-glow)] mb-6"
                >
                  <XCircle size={18} style={{ color: "var(--red)", flexShrink: 0 }} />
                  <span style={{ color: "var(--red)", fontSize: "0.95rem" }}>{scanError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Token identity + stats */}
                  <TokenHeader result={result} />

                  {/* Score banner with animated border tracking */}
                  <motion.div
                    className="rounded-xl mb-6 overflow-hidden relative"
                    style={{
                      background: "var(--bg-charcoal)",
                      border: `1px solid ${scoreStatusColor}45`,
                    }}
                    animate={{
                      boxShadow: [
                        `0 0 20px ${scoreGlowColor}`,
                        `0 0 50px ${scoreGlowColor}`,
                        `0 0 20px ${scoreGlowColor}`,
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <CornerAccents color={scoreStatusColor} />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-7">
                      <ScoreRing score={result.cleanScore} status={result.scoreStatus} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span
                            className="font-black font-mono-jn tracking-widest px-3 py-1"
                            style={{
                              color: scoreStatusColor,
                              borderColor: `${scoreStatusColor}50`,
                              background: `${scoreStatusColor}12`,
                              border: `1px solid ${scoreStatusColor}50`,
                              borderRadius: 4,
                              fontSize: "0.8rem",
                            }}
                          >
                            {scoreStatusLabel}
                          </span>
                          {result.dataStatus === "partial_live_data" && (
                            <span className="badge badge-amber">PARTIAL DATA</span>
                          )}
                        </div>
                        <div className="font-black mb-2" style={{ color: "var(--text-cream)", fontSize: "1.25rem", lineHeight: 1.3 }}>
                          {result.scoreLabel}
                        </div>
                        <div className="font-mono-jn text-sm" style={{ color: "var(--text-muted)" }}>
                          {result.classification} · {result.targetType.replace(/_/g, " ")}
                        </div>
                        <div className="font-mono-jn text-xs mt-1" style={{ color: "var(--text-faint)" }}>
                          Scanned at {new Date(result.scannedAt).toLocaleTimeString()}
                        </div>
                        {(result.chain === "ethereum" || result.chain === "base") && (
                          <button
                            onClick={() => runScan(result.address, result.chain === "ethereum" ? "base" : "ethereum")}
                            className="mt-3 text-xs font-mono-jn font-semibold underline"
                            style={{ color: "var(--text-faint)" }}
                          >
                            Also scan on {result.chain === "ethereum" ? "Base" : "Ethereum"} →
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* TJ message */}
                  {result.tjMessage && (
                    <div
                      className="rounded-xl mb-5 p-5"
                      style={{ background: "var(--bg-charcoal)", border: "1px solid rgba(57,255,20,0.25)", boxShadow: "0 0 20px rgba(57,255,20,0.04)" }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden"
                          style={{ border: "2px solid rgba(57,255,20,0.35)" }}
                        >
                          <Image src="/mascot/IMG_8490.jpeg" alt="TJ" width={40} height={40} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold tracking-widest uppercase font-mono-jn" style={{ color: "var(--green)" }}>
                              TJ // Night Shift Assessment
                            </span>
                            <Shield size={10} style={{ color: "var(--green)", flexShrink: 0 }} />
                          </div>
                          <p className="leading-relaxed" style={{ color: "var(--text-cream)", fontSize: "0.95rem", fontStyle: "italic" }}>
                            &ldquo;{result.tjMessage}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Signals */}
                  <div className="rounded-xl mb-5" style={{ background: "var(--bg-charcoal)", border: "1px solid var(--border-subtle)" }}>
                    <div className="px-7 pt-6 pb-2">
                      <div className="font-black tracking-widest uppercase font-mono-jn" style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                        Risk Signals
                      </div>
                    </div>
                    <div className="px-7 pb-4">
                      {(Object.entries(result.signals) as [keyof ScanResult["signals"], SignalEntry][]).map(
                        ([key, signal]) => <SignalRow key={key} label={SIGNAL_LABELS[key]} signal={signal} />
                      )}
                    </div>
                  </div>

                  {/* Terminal logs — always expanded after scan */}
                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(57,255,20,0.2)", background: "#050505" }}>
                    <button
                      onClick={() => setShowLogs(v => !v)}
                      className="w-full flex items-center justify-between px-5 py-4 transition-colors"
                      style={{ background: "rgba(57,255,20,0.04)", borderBottom: showLogs ? "1px solid rgba(57,255,20,0.12)" : "none" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Terminal size={13} style={{ color: "var(--green)" }} />
                        <span className="font-mono-jn font-bold tracking-widest uppercase" style={{ color: "var(--green)", fontSize: "0.68rem" }}>
                          Trash Scanner Logs ({result.logs.length} entries)
                        </span>
                      </div>
                      {showLogs
                        ? <ChevronUp   size={13} style={{ color: "var(--text-faint)" }} />
                        : <ChevronDown size={13} style={{ color: "var(--text-faint)" }} />
                      }
                    </button>

                    <AnimatePresence>
                      {showLogs && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 space-y-1.5" style={{ maxHeight: 480, overflowY: "auto" }}>
                            {result.logs.map((line, i) => {
                              const color =
                                line.startsWith("[RESULT]") ? "var(--green)"      :
                                line.startsWith("[ERROR]")  ? "var(--red)"        :
                                line.startsWith("[FORMAT]") ? "var(--amber)"      :
                                line.startsWith("[CAP")     ? "var(--text-cream)" :
                                "var(--text-silver)";
                              return (
                                <div key={i} className="font-mono-jn" style={{ color, fontSize: "0.8rem", lineHeight: 1.8 }}>{line}</div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="mt-6 leading-relaxed" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {result.disclaimer}
                  </p>

                  <button onClick={reset} className="flex items-center gap-2 mt-5" style={{ color: "var(--text-silver)", fontSize: "0.95rem", fontWeight: 700 }}>
                    <RotateCcw size={15} /> Scan another address
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Idle state */}
            {!result && !scanError && !scanning && (
              <motion.div
                className="py-16 text-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: "rgba(57,255,20,0.06)", border: "1px solid rgba(57,255,20,0.2)" }}
                  animate={{ boxShadow: ["0 0 0px rgba(57,255,20,0.1)", "0 0 30px rgba(57,255,20,0.2)", "0 0 0px rgba(57,255,20,0.1)"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Search size={36} style={{ color: "var(--green)" }} />
                </motion.div>
                <p className="font-bold mb-3" style={{ color: "var(--text-cream)", fontSize: "1.2rem" }}>Ready to scan</p>
                <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
                  Paste any Solana, Ethereum, or Base address above and hit Scan.
                </p>
                <p className="mt-2" style={{ color: "var(--text-faint)", fontSize: "0.85rem" }}>
                  Live on-chain data — holder concentration, deployer history, volume patterns.
                </p>
              </motion.div>
            )}

            {/* ── Scanning animation — elaborate terminal ── */}
            {scanning && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(57,255,20,0.3)", background: "#050505" }}
              >
                {/* Scanner header */}
                <div
                  className="flex items-center gap-3 px-5 py-3.5"
                  style={{ background: "rgba(57,255,20,0.05)", borderBottom: "1px solid rgba(57,255,20,0.15)" }}
                >
                  <Loader2 size={13} className="animate-spin" style={{ color: "var(--green)" }} />
                  <span className="font-mono-jn font-bold tracking-widest" style={{ color: "var(--green)", fontSize: "0.68rem" }}>
                    DEEP SCAN IN PROGRESS — PARSING ON-CHAIN LEDGER
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-[2px] bg-[var(--border-faint)] relative overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full"
                    style={{ background: "linear-gradient(to right, rgba(57,255,20,0.4), var(--green))" }}
                    initial={{ width: "0%" }}
                    animate={{ width: "92%" }}
                    transition={{ duration: 7, ease: "easeOut" }}
                  />
                </div>

                {/* Log lines */}
                <div className="p-5 space-y-1">
                  {SCAN_LOG_LINES.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: line.delay, duration: 0.2 }}
                      className="font-mono-jn"
                      style={{ color: "var(--text-silver)", fontSize: "0.82rem", lineHeight: 1.8 }}
                    >
                      {line.text}
                    </motion.div>
                  ))}
                </div>

                {/* Blinking cursor */}
                <div className="px-5 pb-5">
                  <motion.span
                    className="font-mono-jn"
                    style={{ color: "var(--green)", fontSize: "0.82rem" }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  >
                    ▋
                  </motion.span>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Right — Info panel ── */}
          <div className="space-y-6">

            {/* TJ mascot */}
            <div className="relative rounded-xl overflow-hidden" style={{ height: 280 }}>
              <Image src="/mascot/IMG_8490.jpeg" alt="TJ — The Janitor scanning" fill className="object-cover object-center" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, var(--bg-charcoal) 100%)" }} />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse-green" style={{ background: "var(--green)" }} />
                  <span className="text-xs font-mono-jn font-bold" style={{ color: "var(--green)" }}>TJ on duty</span>
                </div>
              </div>
            </div>

            {/* What we check */}
            <div className="card p-5">
              <div className="label mb-4">What We Check</div>
              <div className="space-y-4">
                {sidebarItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span
                      className="badge flex-shrink-0 mt-0.5"
                      style={
                        item.status === "live"
                          ? { color: "var(--green)", borderColor: "rgba(57,255,20,0.3)", background: "var(--green-trace)", fontSize: "0.65rem" }
                          : { color: "var(--text-faint)", borderColor: "var(--border-faint)", background: "transparent", fontSize: "0.65rem" }
                      }
                    >
                      {item.status === "live" ? "LIVE" : "P3"}
                    </span>
                    <div>
                      <div className="font-semibold mb-0.5" style={{ color: "var(--text-cream)", fontSize: "0.875rem" }}>{item.label}</div>
                      <div style={{ color: "var(--text-faint)", fontSize: "0.8rem", lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score guide */}
            <div className="card p-5">
              <div className="label mb-4">Score Guide</div>
              <div className="space-y-3">
                {[
                  { range: "80–100", label: "Clean",    color: "var(--green)"      },
                  { range: "50–79",  label: "Caution",  color: "var(--amber)"      },
                  { range: "0–49",   label: "Risk",     color: "var(--red)"        },
                  { range: "—",      label: "Unscored", color: "var(--text-faint)" },
                ].map((s) => (
                  <div key={s.range} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="font-mono-jn font-black" style={{ color: s.color, fontSize: "0.85rem", minWidth: 56 }}>{s.range}</span>
                    <span className="font-semibold" style={{ color: "var(--text-silver)", fontSize: "0.85rem" }}>{s.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 leading-relaxed" style={{ color: "var(--text-faint)", fontSize: "0.78rem" }}>
                Scores weight all available live signals. Partial data is flagged when a signal cannot be retrieved.
              </p>
            </div>

            {/* Supported chains */}
            <div className="card p-5">
              <div className="label mb-4">Supported Chains</div>
              <div className="space-y-3">
                {[
                  { name: "Solana",   status: "Full scan — 6 signals", color: "var(--green)" },
                  { name: "Ethereum", status: "Full scan — 6 signals", color: "var(--green)" },
                  { name: "Base",     status: "Full scan — 6 signals", color: "var(--green)" },
                  { name: "More",     status: "Phase 3",               color: "var(--text-faint)" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center justify-between gap-3">
                    <span className="font-semibold" style={{ color: "var(--text-cream)", fontSize: "0.875rem" }}>{c.name}</span>
                    <span className="font-mono-jn" style={{ color: c.color, fontSize: "0.78rem" }}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live signal indicator */}
            <div
              className="rounded-xl p-5"
              style={{
                background: "rgba(57,255,20,0.04)",
                border: "1px solid rgba(57,255,20,0.15)",
              }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <Activity size={13} style={{ color: "var(--green)" }} />
                <span className="font-mono-jn font-bold tracking-widest uppercase" style={{ color: "var(--green)", fontSize: "0.65rem" }}>
                  System Status
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Data feed",    status: "NOMINAL" },
                  { label: "Chain nodes",  status: "ONLINE" },
                  { label: "Score engine", status: "ACTIVE" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="font-mono-jn text-[11px]" style={{ color: "var(--text-faint)" }}>{s.label}</span>
                    <span className="font-mono-jn font-bold text-[11px]" style={{ color: "var(--green)" }}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
