"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Search,
  Users,
  Zap,
  Eye,
  Lock,
  TrendingDown,
  Bot,
  ExternalLink,
} from "lucide-react";
import JanitorLogo from "@/components/JanitorLogo";

const MARQUEE_ITEMS = [
  "NIGHT SHIFT IN PROGRESS",
  "SCAN BEFORE YOU APE",
  "CLEAN CHARTS. CLEAN MIND.",
  "RUGS DON'T HAPPEN TO PEOPLE WHO SCAN FIRST",
  "TRUST INTELLIGENCE — PHASE 1 LIVE",
  "COMMUNITY VERIFIED. ZERO HYPE.",
  "TJ WATCHES. YOU DECIDE.",
];

const FEATURES = [
  {
    href: "/scan",
    icon: <Search size={24} />,
    title: "Trash Scanner",
    desc: "Paste any Solana or EVM address. Get a risk score, signal breakdown, and detailed forensic logs — in seconds.",
    badge: "LIVE",
    badgeColor: "green" as const,
    img: "/mascot/IMG_8490.jpeg",
  },
  {
    href: "/clean",
    icon: <Zap size={24} />,
    title: "$CLEAN Token",
    desc: "The utility token of The Janitor Network. Fair launch on Solana — no pre-sale, no VC, no insider allocation. Initial liquidity locked.",
    badge: "LAUNCH NEXT",
    badgeColor: "amber" as const,
    img: "/mascot/clean-coin.jpeg",
  },
  {
    href: "/community",
    icon: <Users size={24} />,
    title: "Clean Room",
    desc: "A community of people who don't get rugged. Share intelligence, flag threats, and keep each other safe.",
    badge: "JOIN NOW",
    badgeColor: "green" as const,
    img: "/mascot/IMG_8492.jpeg",
  },
  {
    href: "/roadmap",
    icon: <Shield size={24} />,
    title: "The Roadmap",
    desc: "Seven phases from format validation to full on-chain trust infrastructure. See where this is heading.",
    badge: "PHASE 1 / 7",
    badgeColor: "muted" as const,
    img: "/mascot/IMG_8483.jpeg",
  },
];

const PROBLEMS = [
  {
    icon: <TrendingDown size={20} />,
    title: "Rug Pulls",
    headline: "The exit is already planned.",
    desc: "Developers vanish overnight. Liquidity disappears. Your portfolio goes to zero. Anyone can launch a token in minutes with no accountability and no recourse.",
  },
  {
    icon: <Bot size={20} />,
    title: "AI-Generated Scams",
    headline: "The pitch sounds real because it was built to.",
    desc: "Synthetic influencers, deepfake endorsements, AI-written whitepapers for projects that never existed. Scam infrastructure has scaled faster than the tools to spot it.",
  },
  {
    icon: <Eye size={20} />,
    title: "No Verification Layer",
    headline: "Anyone can launch. Nobody has to explain.",
    desc: "No identity checks. No audit requirements. No standard of truth. The system was built for speed — not for the people using it.",
  },
];

const WHY_TJ = [
  {
    icon: <Lock size={18} />,
    title: "Honest by design",
    desc: "We never fake data. Unknown signals stay unknown until we can verify them. We built a trust tool — so we operate with trust first.",
  },
  {
    icon: <Eye size={18} />,
    title: "Night shift mentality",
    desc: "The scammers don't sleep. Neither do we. TJ runs 24/7, continuously updated, always watching.",
  },
  {
    icon: <Shield size={18} />,
    title: "Built for what's coming",
    desc: "AI agents, autonomous wallets, synthetic media — the next wave of crypto complexity is coming. We're building the infrastructure to handle it.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)]">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[var(--bg-void)]" />
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[55%]">
            <Image
              src="/mascot/IMG_8483.jpeg"
              alt="The Janitor — trust intelligence for the crypto era"
              fill
              className="object-cover object-center"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, var(--bg-void) 0%, var(--bg-void) 25%, rgba(6,6,6,0.8) 50%, rgba(6,6,6,0.25) 100%)",
              }}
            />
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-40"
            style={{ background: "linear-gradient(to bottom, transparent, var(--bg-void))" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="max-w-[620px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-10"
            >
              <span className="w-2 h-2 rounded-full animate-pulse-green" style={{ background: "var(--green)" }} />
              <span className="text-[11px] font-bold tracking-[0.35em] uppercase font-mono-jn" style={{ color: "var(--green)" }}>
                Night Shift Active — Phase 1 Live
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-black leading-[0.92] tracking-tight mb-8"
              style={{ fontSize: "clamp(3rem, 6.5vw, 5.8rem)" }}
            >
              <span className="text-[var(--text-cream)] block">The rug</span>
              <span className="text-[var(--text-cream)] block">is already laid.</span>
              <span
                className="block mt-3"
                style={{
                  color: "var(--green)",
                  textShadow: "0 0 80px rgba(57,255,20,0.5), 0 0 160px rgba(57,255,20,0.2)",
                }}
              >
                Scan before
              </span>
              <span
                style={{
                  color: "var(--green)",
                  textShadow: "0 0 80px rgba(57,255,20,0.5), 0 0 160px rgba(57,255,20,0.2)",
                }}
              >
                you walk.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="leading-relaxed mb-10 max-w-lg"
              style={{ color: "var(--text-silver)", fontSize: "clamp(1rem, 1.5vw, 1.15rem)" }}
            >
              Every week, millions vanish from crypto wallets — not because of market
              crashes, but because of scams, rugs, and manufactured trust. The Janitor
              Network scans wallets and tokens for public risk signals before you commit.
              No hype. No fake data. Just the on-chain truth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="flex flex-wrap gap-3 mb-12"
            >
              <Link href="/scan" className="btn-primary text-sm">
                Run Your First Scan <ArrowRight size={15} />
              </Link>
              <a
                href="https://t.me/TheJanitorHQ"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-sm"
              >
                Join Clean Room
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="flex flex-wrap gap-2"
            >
              {[
                { k: "Trash Scanner", v: "Active" },
                { k: "TJ AI", v: "Live" },
                { k: "$CLEAN Launch", v: "Phase 2" },
                { k: "Scanner Hardening", v: "Phase 3" },
              ].map(({ k, v }) => (
                <div
                  key={k}
                  className="flex items-center gap-2 px-3 py-1.5 border border-[var(--border-subtle)] bg-[var(--bg-charcoal)]/80"
                  style={{ borderRadius: 3 }}
                >
                  <span className="text-[9px] tracking-[0.2em] font-semibold text-[var(--text-faint)] uppercase font-mono-jn">
                    {k}
                  </span>
                  <span
                    className="text-[9px] tracking-[0.15em] font-bold uppercase font-mono-jn"
                    style={{ color: "var(--green)" }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
        >
          <div
            className="w-px h-12 mx-auto"
            style={{ background: "linear-gradient(to bottom, var(--green), transparent)", opacity: 0.4 }}
          />
        </motion.div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="border-y border-[var(--border-faint)] py-3 overflow-hidden bg-[var(--bg-velvet)]">
        <div className="flex animate-marquee whitespace-nowrap w-max">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-4 mr-12 text-[11px] font-bold tracking-[0.25em] uppercase font-mono-jn"
              style={{ color: "var(--green)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--green)" }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── THE PROBLEM ── */}
      <section className="py-28 px-6" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="label mb-4">The Problem</div>
            <h2
              className="font-black tracking-tight leading-tight mb-4"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "var(--text-cream)" }}
            >
              Crypto is full of trash.
            </h2>
            <p className="max-w-lg mx-auto" style={{ color: "var(--text-muted)", fontSize: "1.05rem", lineHeight: 1.7 }}>
              The infrastructure for deception is better funded and more sophisticated
              than the tools built to stop it. Until now.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {PROBLEMS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="card p-8"
              >
                <div
                  className="w-10 h-10 flex items-center justify-center mb-5 rounded"
                  style={{ background: "rgba(239,68,68,0.08)", color: "var(--red)" }}
                >
                  {p.icon}
                </div>
                <div className="label mb-2" style={{ color: "var(--red)", opacity: 0.7 }}>
                  {p.title}
                </div>
                <h3
                  className="font-black text-lg leading-snug mb-3"
                  style={{ color: "var(--text-cream)" }}
                >
                  {p.headline}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section className="py-28 px-6" style={{ background: "#060606" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="label mb-4">What We Built</div>
            <h2
              className="font-black tracking-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "var(--text-cream)" }}
            >
              Trust infrastructure.{" "}
              <span style={{ color: "var(--green)" }}>Not just a scanner.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.href}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={f.href} className="block group">
                  <div
                    className="card card-glow overflow-hidden transition-all duration-300 group-hover:border-[rgba(57,255,20,0.2)] group-hover:shadow-[0_0_40px_rgba(57,255,20,0.05)]"
                    style={{ minHeight: 280 }}
                  >
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={f.img}
                        alt={f.title}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(to bottom, rgba(6,6,6,0.2) 0%, rgba(6,6,6,0.7) 100%)",
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`badge badge-${f.badgeColor === "muted" ? "muted" : f.badgeColor}`}
                        >
                          {f.badge}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span style={{ color: "var(--green)" }}>{f.icon}</span>
                        <h3
                          className="font-bold text-lg tracking-tight"
                          style={{ color: "var(--text-cream)" }}
                        >
                          {f.title}
                        </h3>
                        <ArrowRight
                          size={16}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "var(--green)" }}
                        />
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY TJ ── */}
      <section className="py-28 px-6" style={{ background: "linear-gradient(180deg, #0c0c0c 0%, #090909 100%)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="label mb-4">Why The Janitor</div>
              <h2
                className="font-black leading-tight tracking-tight mb-6"
                style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "var(--text-cream)" }}
              >
                The scammers built
                <br />
                their infrastructure.
                <br />
                <span style={{ color: "var(--green)" }}>We built ours.</span>
              </h2>
              <p className="leading-relaxed mb-10" style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
                The Janitor isn&apos;t a price tracker. It isn&apos;t an influencer. It&apos;s a
                trust verification layer for people who are done getting cleaned out
                by systems designed against them.
              </p>
              <div className="space-y-6">
                {WHY_TJ.map((w) => (
                  <div key={w.title} className="flex gap-4">
                    <div
                      className="w-9 h-9 rounded flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: "var(--green-trace)", color: "var(--green)" }}
                    >
                      {w.icon}
                    </div>
                    <div>
                      <div
                        className="font-bold text-sm mb-1"
                        style={{ color: "var(--text-cream)" }}
                      >
                        {w.title}
                      </div>
                      <div className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {w.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  height: 500,
                  boxShadow: "0 0 80px rgba(57,255,20,0.08), 0 0 0 1px var(--border-subtle)",
                }}
              >
                <Image
                  src="/mascot/IMG_8490.jpeg"
                  alt="TJ — The Janitor at work"
                  fill
                  className="object-cover object-center"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(135deg, rgba(6,6,6,0.4) 0%, transparent 60%)" }}
                />
                <div className="absolute bottom-6 left-6 right-6">
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      background: "rgba(8,8,8,0.85)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse-green" style={{ background: "var(--green)" }} />
                      <span className="text-[10px] font-bold tracking-widest uppercase font-mono-jn" style={{ color: "var(--green)" }}>
                        Trash Scanner Active
                      </span>
                    </div>
                    <div className="text-xs font-mono-jn" style={{ color: "var(--text-muted)" }}>
                      [SYSTEM] Night-shift scanner initialised.<br />
                      [CHECK] Validating address format...<br />
                      [FORMAT] EVM address (0x…) — valid.<br />
                      <span style={{ color: "var(--green)" }}>[RESULT] Clean Score: 60/100 — Phase 1</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY CTA ── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/mascot/IMG_8492.jpeg"
            alt="The Clean Room community"
            fill
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(6,6,6,0.82) 0%, rgba(6,6,6,0.6) 100%)" }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="label mb-4">Join The Clean Room</div>
            <h2
              className="font-black leading-tight tracking-tight mb-6"
              style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "var(--text-cream)" }}
            >
              You don&apos;t have to navigate crypto alone.
            </h2>
            <p className="leading-relaxed mb-10 text-lg" style={{ color: "var(--text-silver)" }}>
              The Clean Room is where people share intelligence, flag suspicious
              projects, and look out for each other. No shilling. No hype.
              Just people serious about not getting rugged.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://t.me/TheJanitorHQ"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Join Telegram <ExternalLink size={14} />
              </a>
              <a
                href="https://x.com/thejanitorhq"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Follow on X <ExternalLink size={14} />
              </a>
              <a
                href="https://www.tiktok.com/@.thejanitorhq"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                TikTok <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[var(--border-faint)] bg-[var(--bg-void)] py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <JanitorLogo size={28} glow />
                <span className="text-sm font-bold tracking-[0.18em] uppercase" style={{ color: "var(--text-cream)" }}>
                  Janitor Network
                </span>
              </div>
              <p className="text-xs leading-relaxed max-w-xs" style={{ color: "var(--text-faint)" }}>
                Trust intelligence for the crypto era. Not financial advice.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-xs" style={{ color: "var(--text-faint)" }}>
              {[
                { href: "/scan", label: "Trash Scanner" },
                { href: "/clean", label: "$CLEAN" },
                { href: "/roadmap", label: "Roadmap" },
                { href: "/gallery", label: "Gallery" },
                { href: "/comics", label: "Comics" },
                { href: "/community", label: "Community" },
                { href: "/about", label: "About" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="hover:text-[var(--text-muted)] transition-colors uppercase tracking-widest font-semibold"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a href="https://x.com/thejanitorhq" target="_blank" rel="noopener noreferrer" aria-label="X"
                className="p-2 border border-[var(--border-faint)] hover:border-[var(--border-subtle)] transition-colors"
                style={{ borderRadius: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-faint)">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://t.me/TheJanitorHQ" target="_blank" rel="noopener noreferrer" aria-label="Telegram"
                className="p-2 border border-[var(--border-faint)] hover:border-[var(--border-subtle)] transition-colors"
                style={{ borderRadius: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-faint)">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@.thejanitorhq" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                className="p-2 border border-[var(--border-faint)] hover:border-[var(--border-subtle)] transition-colors"
                style={{ borderRadius: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-faint)">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.17 8.17 0 004.77 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--border-faint)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-[10px] leading-relaxed max-w-2xl" style={{ color: "var(--text-faint)" }}>
              <strong style={{ color: "var(--text-muted)" }}>Legal disclaimer:</strong> The Janitor Network provides technical analysis of publicly available blockchain data. Outputs are informational only — not financial advice, investment recommendations, or legal findings. No guarantee of accuracy. Do your own research. Past scan results do not predict future outcomes.
            </p>
            <p className="text-[10px] whitespace-nowrap" style={{ color: "var(--text-faint)" }}>
              © 2026 The Janitor Network
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
