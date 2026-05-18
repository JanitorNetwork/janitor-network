"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Shield, Eye, Lock, Zap, ArrowRight, ExternalLink } from "lucide-react";

const VALUES = [
  {
    icon: <Lock size={20} />,
    title: "Radical honesty",
    desc: "We will never pretend to know something we don't. Unknown data stays unknown. No fake signals. No manufactured confidence.",
  },
  {
    icon: <Eye size={20} />,
    title: "Full transparency",
    desc: "Every scan result shows its reasoning. Every score explains what it's based on. Nothing is hidden behind a black box you're told to trust.",
  },
  {
    icon: <Shield size={20} />,
    title: "Community first",
    desc: "We're not building for institutional investors or venture capital. We're building for the person who just got rugged, who needs tools that actually work.",
  },
  {
    icon: <Zap size={20} />,
    title: "Infrastructure, not hype",
    desc: "Trust infrastructure takes time to build right. We'd rather ship slowly and correctly than fast and broken. We're in it for the long shift.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-20">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-[var(--border-faint)]">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/mascot/IMG_8483.jpeg"
            alt="TJ — The Janitor"
            fill
            className="object-cover object-right opacity-60"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to right, rgba(6,6,6,0.95) 0%, rgba(6,6,6,0.55) 45%, rgba(6,6,6,0.1) 100%)" }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="label mb-4">Who We Are</div>
            <h1
              className="font-black leading-tight tracking-tight mb-6"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", color: "var(--text-cream)" }}
            >
              Built for the era where
              <br />
              <span style={{ color: "var(--green)" }}>nothing is trustworthy</span>
              <br />
              by default.
            </h1>
            <p className="text-lg leading-relaxed max-w-2xl" style={{ color: "var(--text-muted)" }}>
              The Janitor Network started with a simple observation: crypto has a trust problem,
              AI is making it worse, and nobody was building the infrastructure to fix it. We are.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── THE MISSION ── */}
      <section className="py-24 px-6 bg-[var(--bg-velvet)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="label mb-4">The Mission</div>
              <h2
                className="font-black tracking-tight leading-tight mb-6"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", color: "var(--text-cream)" }}
              >
                Trust infrastructure
                <br />
                for the crypto and AI era.
              </h2>
              <div className="space-y-5" style={{ color: "var(--text-muted)" }}>
                <p className="leading-relaxed">
                  Every day, millions of people interact with crypto projects they have no way to verify.
                  Wallets, tokens, smart contracts — all look the same on the surface. The tools to
                  distinguish the clean from the corrupt either don&apos;t exist or are locked behind
                  expensive professional services.
                </p>
                <p className="leading-relaxed">
                  We&apos;re changing that. The Janitor Network gives anyone — from a first-time buyer to
                  a professional trader — access to trust intelligence that was previously unavailable.
                </p>
                <p className="leading-relaxed">
                  And we&apos;re building for what&apos;s coming: AI agents that transact autonomously,
                  synthetic identities, deepfake endorsements. The next wave of crypto complexity will
                  need trust infrastructure that can keep up. We&apos;re building that now.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  height: 480,
                  boxShadow: "0 0 60px rgba(57,255,20,0.06), 0 0 0 1px var(--border-subtle)",
                }}
              >
                <Image
                  src="/mascot/IMG_8490.jpeg"
                  alt="The Janitor at work"
                  fill
                  className="object-cover object-center"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(6,6,6,0.7) 100%)" }}
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="label-green mb-1">TJ — The Janitor</div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Community-backed. Night shift never ends.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 px-6 bg-[var(--bg-obsidian)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="label mb-3">How We Operate</div>
            <h2
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "var(--text-cream)" }}
            >
              The principles we don&apos;t compromise.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-7"
              >
                <div
                  className="w-10 h-10 rounded flex items-center justify-center mb-4"
                  style={{ background: "var(--green-trace)", color: "var(--green)" }}
                >
                  {v.icon}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-cream)" }}>
                  {v.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TJ CHARACTER ── */}
      <section className="py-24 px-6 bg-[var(--bg-velvet)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-2 gap-3">
              {["/mascot/IMG_8492.jpeg", "/mascot/IMG_8487.jpeg", "/mascot/IMG_8486.jpeg", "/mascot/IMG_8488.jpeg"].map((src) => (
                <div
                  key={src}
                  className="relative rounded-lg overflow-hidden"
                  style={{ aspectRatio: "1", border: "1px solid var(--border-faint)" }}
                >
                  <Image src={src} alt="TJ" fill className="object-cover object-center" />
                </div>
              ))}
            </div>

            <div>
              <div className="label mb-4">Meet TJ</div>
              <h2
                className="font-black tracking-tight leading-tight mb-6"
                style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", color: "var(--text-cream)" }}
              >
                The night-shift worker
                <br />
                <span style={{ color: "var(--green)" }}>who never left.</span>
              </h2>
              <div className="space-y-4" style={{ color: "var(--text-muted)" }}>
                <p className="leading-relaxed">
                  TJ — The Janitor — is the AI intelligence at the core of the network. He&apos;s
                  sharp, direct, and completely incapable of hype. He was built for the night shift:
                  persistent, dependable, still here after everyone else bailed.
                </p>
                <p className="leading-relaxed">
                  TJ doesn&apos;t give you price predictions. He doesn&apos;t tell you what to buy.
                  He tells you what the data shows and what it doesn&apos;t — and he&apos;s brutally
                  honest about the difference.
                </p>
                <p className="leading-relaxed">
                  That&apos;s the character we built the whole thing around: not a mascot, not a
                  brand gimmick. A philosophy. Trust first. Verify everything. Stay on shift.
                </p>
              </div>
              <div className="mt-8">
                <Link href="/scan" className="btn-primary">
                  Talk to TJ <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVENUE + SUSTAINABILITY ── */}
      <section className="py-24 px-6 bg-[var(--bg-obsidian)]">
        <div className="max-w-5xl mx-auto">
          <div className="label mb-4">How We&apos;re Sustainable</div>
          <h2
            className="font-black tracking-tight leading-tight mb-10"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "var(--text-cream)" }}
          >
            We make money when{" "}
            <span style={{ color: "var(--green)" }}>the tool gets used.</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                title: "Freemium scanner",
                desc: "The Trash Scanner is free. Paste any address — Solana, Ethereum, or Base — and get live risk signals instantly.",
              },
              {
                title: "$CLEAN token launch",
                desc: "Fair launch on Solana — no pre-sale, no VC allocation, no insider unlock. Initial liquidity locked at launch.",
              },
              {
                title: "B2B API licensing",
                desc: "Exchanges, bridges, and DeFi protocols pay for trust signal data feeds. Enterprise API contracts in Phase 7.",
              },
              {
                title: "$CLEAN utility",
                desc: "Deep scans, API credits, priority queue, and governance access unlock via $CLEAN — rolling out in Phase 5.",
              },
            ].map((item) => (
              <div key={item.title} className="card p-5 flex gap-4">
                <div
                  className="w-1.5 rounded-full flex-shrink-0 mt-1"
                  style={{ background: "var(--green)", minHeight: 16 }}
                />
                <div>
                  <div className="font-semibold text-sm mb-1" style={{ color: "var(--text-cream)" }}>
                    {item.title}
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-8 p-4 rounded border border-[rgba(245,158,11,0.3)]"
            style={{ background: "var(--amber-glow)" }}
          >
            <div className="text-xs font-semibold mb-1" style={{ color: "var(--amber)" }}>
              Wallet connect not live yet
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              We will never ask you to connect a wallet until the integration is fully audited and the $CLEAN contract is verified. If someone is asking you to connect your wallet now, that&apos;s not us.
            </p>
          </div>
        </div>
      </section>

      {/* ── VERSION HISTORY ── */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #060606 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="label mb-4">Release History</div>
          <h2
            className="font-black tracking-tight mb-12"
            style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", color: "var(--text-cream)" }}
          >
            Built in public.{" "}
            <span style={{ color: "var(--green)" }}>Shipped honestly.</span>
          </h2>

          <div className="space-y-6">
            {[
              {
                version: "v1.0 — MVP",
                date: "May 2026",
                status: "live" as const,
                title: "The Night Shift Begins",
                items: [
                  "Trash Scanner — Solana, Ethereum & Base live on-chain data",
                  "Holder concentration, deployer history, liquidity & volume signals",
                  "Forensic scan logs with per-signal breakdown",
                  "TJ AI chat — community intelligence assistant",
                  "The Clean Room — moderated community chat with auto-ban",
                  "Comics: The Night Shift Chronicles (6 pages)",
                  "Visual identity + mascot gallery",
                  "$CLEAN fair-launch token — no VC, initial liquidity locked",
                  "Roadmap: 7-phase buildout published",
                ],
              },
              {
                version: "v1.1",
                date: "Q3 2026 (planned)",
                status: "planned" as const,
                title: "$CLEAN Token Launch",
                items: [
                  "Fair launch on Solana — no pre-sale, no VC, no insider allocation",
                  "Initial liquidity locked at launch",
                  "$CLEAN token page live with full transparency",
                  "Token community channels and launch communications",
                  "Staking and utility roll out later in Phase 5",
                ],
              },
              {
                version: "v2.0",
                date: "Q4 2026 (planned)",
                status: "planned" as const,
                title: "Scanner Hardening + Chain Expansion",
                items: [
                  "LP lock verification for Solana and EVM",
                  "Expanded threat database — known rug deployers",
                  "Arbitrum, Polygon, and BNB Chain support",
                  "Cross-chain deployer tracing",
                  "Shareable scan reports and watchlists",
                ],
              },
              {
                version: "v3.0+",
                date: "2027 and beyond",
                status: "future" as const,
                title: "$CLEAN Utility + Trust Protocol",
                items: [
                  "$CLEAN staking — deep scan access, priority queue, governance",
                  "Trust Fingerprints — verified on-chain identity badges",
                  "AI agent staking and slashing (Phase 6)",
                  "Cross-chain trust signal aggregation",
                  "Enterprise API contracts",
                  "Persistent chat with Telegram bridge",
                ],
              },
            ].map((rel) => (
              <motion.div
                key={rel.version}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="card p-6"
                style={rel.status === "live" ? { borderColor: "rgba(57,255,20,0.25)", boxShadow: "0 0 30px rgba(57,255,20,0.04)" } : {}}
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="font-black font-mono-jn text-xl" style={{ color: rel.status === "live" ? "var(--green)" : rel.status === "planned" ? "var(--amber)" : "var(--border-strong)" }}>
                    {rel.version}
                  </span>
                  <span
                    className="badge"
                    style={
                      rel.status === "live"
                        ? { color: "var(--green)", borderColor: "rgba(57,255,20,0.3)", background: "var(--green-trace)" }
                        : rel.status === "planned"
                        ? { color: "var(--amber)", borderColor: "rgba(245,158,11,0.3)", background: "var(--amber-glow)" }
                        : { color: "var(--text-faint)", borderColor: "var(--border-mid)", background: "transparent" }
                    }
                  >
                    {rel.status === "live" ? "LIVE NOW" : rel.status === "planned" ? "PLANNED" : "FUTURE"}
                  </span>
                  <span className="text-xs font-mono-jn ml-auto" style={{ color: "var(--text-faint)" }}>{rel.date}</span>
                </div>
                <div className="font-bold mb-3" style={{ color: "var(--text-cream)" }}>{rel.title}</div>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {rel.items.map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-xs mt-1 flex-shrink-0" style={{ color: rel.status === "live" ? "var(--green)" : "var(--border-strong)" }}>▸</span>
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEGAL ── */}
      <div className="px-6 py-10 border-t border-[var(--border-faint)] bg-[var(--bg-void)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-faint)" }}>
            <strong style={{ color: "var(--text-muted)" }}>Legal:</strong> The Janitor Network provides technical analysis tools using publicly available blockchain data. Nothing on this platform constitutes financial advice, investment recommendations, or legal findings. Trash Scanner outputs are probabilistic assessments — not guarantees. $CLEAN is a utility token, not a security. Do your own research. The Janitor Network bears no liability for decisions made based on scanner outputs.
          </p>
        </div>
      </div>
    </div>
  );
}
