"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle, Clock, Circle } from "lucide-react";

const PHASES = [
  {
    phase: "01",
    title: "MVP Launch",
    status: "active" as const,
    eta: "Live Now",
    items: [
      "Trash Scanner live — Solana, Ethereum & Base with real on-chain data",
      "TJ AI assistant — Claude-powered, in character 24/7",
      "Live risk scores: holder concentration, deployer history, volume patterns",
      "Community chat with TJ moderation, platform pages, and gallery",
      "Comics, gallery, roadmap, and full site published",
    ],
  },
  {
    phase: "02",
    title: "$CLEAN Token Launch",
    status: "planned" as const,
    eta: "Q3 2026",
    items: [
      "Fair launch on Solana — no pre-sale, no VC, no insider allocation",
      "Initial liquidity locked at launch",
      "$CLEAN token page live with full transparency report",
      "Token community channels and launch communications",
      "Foundation for Phase 05 utility — staking rolls out later",
    ],
  },
  {
    phase: "03",
    title: "Scanner Hardening",
    status: "future" as const,
    eta: "Q4 2026",
    items: [
      "LP burn & lock verification for Solana and EVM",
      "Expanded threat database — known rug deployers and malicious wallets",
      "Wallet-cluster mapping — connected address graphs",
      "Shareable visual risk reports (PDF + link)",
      "Scan history, saved addresses, and real-time watchlists",
    ],
  },
  {
    phase: "04",
    title: "Chain Expansion",
    status: "future" as const,
    eta: "Q1 2027",
    items: [
      "Arbitrum, Polygon, BNB Chain support",
      "Cross-chain deployer tracing",
      "Multi-chain wallet risk scoring",
      "Real-time alerts for monitored addresses",
      "Developer API for trust signal consumption",
    ],
  },
  {
    phase: "05",
    title: "$CLEAN Utility Live",
    status: "future" as const,
    eta: "Q2 2027",
    items: [
      "$CLEAN staking for deep scan access and priority queue",
      "API credits system for developers",
      "Subscription tiers: Free → Pro → Enterprise",
      "Holder-only features: bulk scanning, watchlist alerts, PDF exports",
      "Developer SDK for trust signal consumption",
    ],
  },
  {
    phase: "06",
    title: "Trust Fingerprints",
    status: "future" as const,
    eta: "Q3 2027",
    items: [
      "Immutable on-chain trust records for wallets & contracts",
      "AI agent identity registration and verification",
      "Public Trust Fingerprint directory",
      "Dispute and reporting infrastructure",
      "Economic accountability layer via $CLEAN staking",
    ],
  },
  {
    phase: "07",
    title: "AI Governance + Protocol",
    status: "future" as const,
    eta: "2028+",
    items: [
      "AI agents must stake $CLEAN to operate in the network",
      "Trust Fingerprint issuance for verified AI agents",
      "Slashing protocol — bad actors lose their stake",
      "B2B scanner API licensing for exchanges & bridges",
      "Open standard for on-chain trust scoring",
    ],
  },
];

const STATUS_STYLES = {
  active: {
    badge: { color: "var(--green)", borderColor: "rgba(57,255,20,0.3)", background: "var(--green-trace)" },
    connector: "var(--green)",
    icon: <CheckCircle size={18} style={{ color: "var(--green)" }} />,
    label: "ACTIVE",
  },
  planned: {
    badge: { color: "var(--amber)", borderColor: "rgba(245,158,11,0.3)", background: "var(--amber-glow)" },
    connector: "var(--amber)",
    icon: <Clock size={18} style={{ color: "var(--amber)" }} />,
    label: "PLANNED",
  },
  future: {
    badge: { color: "var(--text-faint)", borderColor: "var(--border-mid)", background: "transparent" },
    connector: "var(--border-mid)",
    icon: <Circle size={18} style={{ color: "var(--border-mid)" }} />,
    label: "FUTURE",
  },
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-20">

      {/* Header */}
      <div className="relative overflow-hidden border-b border-[var(--border-faint)] bg-[var(--bg-velvet)]">
        <div className="absolute inset-0 pointer-events-none">
          <Image src="/mascot/IMG_8491.jpeg" alt="" fill className="object-cover object-center opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--bg-void) 0%, rgba(6,6,6,0.65) 40%, rgba(6,6,6,0.2) 100%)" }} />
        </div>
        <div className="max-w-4xl mx-auto px-6 py-16 relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full animate-pulse-green" style={{ background: "var(--green)" }} />
            <span className="label-green">Phase 1 Active · $CLEAN Launch Next</span>
          </div>
          <h1
            className="font-black tracking-tight mb-4"
            style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)", color: "var(--text-cream)" }}
          >
            The path from scanner
            <br />
            to{" "}
            <span style={{ color: "var(--green)" }}>trust protocol.</span>
          </h1>
          <p className="max-w-lg" style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.7 }}>
            Seven phases. Each one builds on the last. We&apos;re not promising moonshots —
            we&apos;re building infrastructure. Slowly, correctly, and in public.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="relative">
          {/* Vertical connector line */}
          <div
            className="absolute left-[19px] sm:left-[27px] top-2 bottom-2 w-px"
            style={{ background: "linear-gradient(to bottom, var(--green), var(--border-faint))" }}
          />

          <div className="space-y-8">
            {PHASES.map((phase, i) => {
              const styles = STATUS_STYLES[phase.status];
              return (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex gap-4 sm:gap-8"
                >
                  {/* Node */}
                  <div className="flex-shrink-0 w-10 sm:w-14 flex flex-col items-center">
                    <div
                      className="w-10 h-10 sm:w-[56px] sm:h-[56px] rounded-full flex items-center justify-center border-2 bg-[var(--bg-void)] z-10 relative"
                      style={{ borderColor: styles.connector }}
                    >
                      {styles.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 card p-4 sm:p-6 mb-0"
                    style={
                      phase.status === "active"
                        ? { borderColor: "rgba(57,255,20,0.25)", boxShadow: "0 0 40px rgba(57,255,20,0.04)" }
                        : {}
                    }
                  >
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                      <span
                        className="font-black font-mono-jn text-xl sm:text-2xl"
                        style={{ color: phase.status === "active" ? "var(--green)" : "var(--border-strong)" }}
                      >
                        {phase.phase}
                      </span>
                      <h2
                        className="font-bold text-base sm:text-lg"
                        style={{ color: "var(--text-cream)" }}
                      >
                        {phase.title}
                      </h2>
                      <span className="badge" style={styles.badge}>
                        {styles.label}
                      </span>
                      <span className="text-xs font-mono-jn ml-auto" style={{ color: "var(--text-faint)" }}>
                        {phase.eta}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span
                            className="text-xs mt-1 flex-shrink-0"
                            style={{ color: phase.status === "active" ? "var(--green)" : "var(--border-strong)" }}
                          >
                            ▸
                          </span>
                          <span className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Honest footer note */}
        <div
          className="mt-16 p-6 rounded-lg border border-[var(--border-faint)]"
          style={{ background: "var(--bg-charcoal)" }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            <strong style={{ color: "var(--text-cream)" }}>Roadmap honesty note:</strong> Phase ETAs are estimates, not commitments.
            We will always be transparent about delays, pivots, and scope changes in our{" "}
            <a
              href="https://t.me/TheJanitorHQ"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--green)] transition-colors"
              style={{ color: "var(--text-silver)" }}
            >
              Telegram community
            </a>
            . If you want to stay close to the build, that&apos;s where to be.
          </p>
        </div>
      </div>
    </div>
  );
}
