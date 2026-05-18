"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Zap,
  Lock,
  Users,
  BarChart2,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import LaunchCountdown from "@/components/LaunchCountdown";

const UTILITY = [
  {
    icon: <ShieldCheck size={20} />,
    title: "Deep Scan Access",
    desc: "Stake $CLEAN to unlock Phase 2 live blockchain scanning — holder concentration, liquidity security, deployer history, volume behavior.",
  },
  {
    icon: <BarChart2 size={20} />,
    title: "Priority Queue",
    desc: "Token holders get priority scan processing and real-time alerts when addresses on their watchlist trigger risk signals.",
  },
  {
    icon: <Lock size={20} />,
    title: "API Credits",
    desc: "Developers and teams use $CLEAN as credits for the Janitor Network B2B API — trust signal integration for exchanges, bridges, and DeFi protocols.",
  },
  {
    icon: <Users size={20} />,
    title: "Governance Rights",
    desc: "Shape the scanner's signal weights, vote on new chain integrations, and decide which AI governance standards get enforced.",
  },
  {
    icon: <Zap size={20} />,
    title: "AI Agent Staking",
    desc: "Phase 6: AI agents must stake $CLEAN to operate within the network. Bad actors get slashed. Trusted agents earn Trust Fingerprints.",
  },
];

const TOKENOMICS_ITEMS = [
  { label: "Ticker", value: "$CLEAN" },
  { label: "Network", value: "Solana" },
  { label: "Standard", value: "SPL Token" },
  { label: "Supply", value: "TBA pre-launch" },
  { label: "Launch", value: "Coming Soon" },
  { label: "Live Price", value: "Activates at launch" },
  { label: "Staking", value: "Phase 5" },
];

export default function CleanPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-20">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-[var(--border-faint)]">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/mascot/IMG_8479.jpeg"
            alt="$CLEAN token"
            fill
            className="object-cover object-center opacity-40"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, var(--bg-void) 0%, rgba(6,6,6,0.7) 40%, rgba(6,6,6,0.35) 100%)" }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-16">
            {/* Text */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 mb-6"
              >
                <span className="badge badge-amber">Launching Soon on Solana</span>
                <span className="badge badge-green">SOL</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-black tracking-tight leading-tight mb-6"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", color: "var(--text-cream)" }}
              >
                The token that
                <br />
                powers the{" "}
                <span style={{ color: "var(--green)", textShadow: "0 0 60px rgba(57,255,20,0.4)" }}>
                  clean.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg leading-relaxed mb-8 max-w-xl"
                style={{ color: "var(--text-muted)" }}
              >
                $CLEAN is the utility token for The Janitor Network. It&apos;s not a
                speculative asset — it&apos;s fuel. Stake it to unlock deep scans, earn
                trust credentials, and participate in governance. The more people use
                the network, the stronger it gets.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="flex flex-wrap gap-3"
              >
                <a
                  href="https://t.me/TheJanitorHQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Get Notified at Launch <ExternalLink size={14} />
                </a>
                <Link href="/roadmap" className="btn-ghost">
                  See the Roadmap <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>

            {/* Coin */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-shrink-0"
            >
              <div
                className="relative rounded-full overflow-hidden animate-float"
                style={{
                  width: 240,
                  height: 240,
                  boxShadow: "0 0 80px rgba(57,255,20,0.2), 0 0 200px rgba(57,255,20,0.08), 0 0 0 1px rgba(57,255,20,0.15)",
                }}
              >
                <Image
                  src="/mascot/clean-coin.jpeg"
                  alt="$CLEAN coin"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── LAUNCH COUNTDOWN ── */}
      <section className="py-14 px-6 border-b border-[var(--border-faint)]" style={{ background: "var(--bg-charcoal)" }}>
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LaunchCountdown />
          </motion.div>
        </div>
      </section>

      {/* ── MARKET DATA (coming soon) ── */}
      <section className="py-12 px-6 border-b border-[var(--border-faint)] bg-[var(--bg-velvet)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Price", value: "—", sub: "Activates at launch" },
              { label: "Market Cap", value: "—", sub: "TBA" },
              { label: "24h Volume", value: "—", sub: "TBA" },
              { label: "Holders", value: "—", sub: "Pre-launch" },
            ].map((item) => (
              <div
                key={item.label}
                className="card p-5 text-center"
              >
                <div className="label mb-1">{item.label}</div>
                <div
                  className="font-black text-2xl mb-1"
                  style={{ color: "var(--text-faint)" }}
                >
                  {item.value}
                </div>
                <div className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-4" style={{ color: "var(--text-faint)" }}>
            Live market data activates after token launch. All data sourced from public chain data only.
          </p>
        </div>
      </section>

      {/* ── UTILITY ── */}
      <section className="py-24 px-6 bg-[var(--bg-obsidian)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="label mb-4">Token Utility</div>
            <h2
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", color: "var(--text-cream)" }}
            >
              $CLEAN does something real.
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
              Every feature powered by $CLEAN is tied to actual platform usage — not hype, not speculation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {UTILITY.map((u, i) => (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card p-6"
              >
                <div
                  className="w-10 h-10 rounded flex items-center justify-center mb-4"
                  style={{ background: "var(--green-trace)", color: "var(--green)" }}
                >
                  {u.icon}
                </div>
                <h3
                  className="font-bold text-base mb-2"
                  style={{ color: "var(--text-cream)" }}
                >
                  {u.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {u.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOKENOMICS ── */}
      <section className="py-24 px-6 bg-[var(--bg-velvet)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="label mb-4">Tokenomics</div>
              <h2
                className="font-black tracking-tight mb-6"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "var(--text-cream)" }}
              >
                Simple. Transparent.
                <br />
                <span style={{ color: "var(--green)" }}>No hidden allocations.</span>
              </h2>
              <p className="leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
                Full tokenomics details will be published before launch. No team wallet shenanigans, no
                surprise unlocks, no venture capital dumps. We&apos;re building trust infrastructure —
                we start by being trustworthy.
              </p>
              <a
                href="https://t.me/TheJanitorHQ"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                Join Telegram for launch details <ExternalLink size={13} />
              </a>
            </div>

            <div className="card divide-y divide-[var(--border-faint)]">
              {TOKENOMICS_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-6 py-4">
                  <span className="text-xs font-semibold uppercase tracking-widest font-mono-jn" style={{ color: "var(--text-faint)" }}>
                    {item.label}
                  </span>
                  <span className="text-sm font-bold font-mono-jn" style={{ color: "var(--text-cream)" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ── */}
      <div className="px-6 py-8 border-t border-[var(--border-faint)] bg-[var(--bg-void)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-faint)" }}>
            <strong style={{ color: "var(--text-muted)" }}>$CLEAN Disclaimer:</strong> $CLEAN is a utility token for platform access. This page does not constitute financial advice, investment solicitation, or any offer to buy or sell securities. Cryptocurrency investments carry significant risk. Do your own research. Past performance of any asset does not predict future results. The Janitor Network makes no guarantees regarding token value or returns.
          </p>
        </div>
      </div>
    </div>
  );
}
