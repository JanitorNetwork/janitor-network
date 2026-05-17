"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, Shield, Eye, MessageSquare, AlertTriangle, Bot, Ban, Zap, AtSign } from "lucide-react";
import CommunityChat from "@/components/CommunityChat";
import LofiPlayer from "@/components/LofiPlayer";

const SIDEBAR_RULES = [
  { num: "01", title: "Talk about Janitor",      desc: "Share intel, discuss on-chain data, analyze projects together.", red: false },
  { num: "02", title: "Zero shilling",            desc: "No promoting tokens you hold. No buy pressure. No price calls. Ever.", red: false },
  { num: "03", title: "Data over drama",          desc: "Back claims with wallets, contracts, or on-chain evidence.", red: false },
  { num: "04", title: "No financial advice",      desc: "Share intelligence — not investment calls. Not financial advice.", red: false },
  { num: "05", title: "Anonymity respected",      desc: "Don't identify others. Doxxing = instant permanent ban.", red: false },
  { num: "06", title: "Tag @TJ to call the AI",  desc: "TJ monitors silently. Tag @TJ when you need a response.", red: false },
  { num: "07", title: "One standard, no exceptions", desc: "Rules apply to everyone equally — including the team.", red: false },
  { num: "08", title: "Zero tolerance offenses", desc: "Slurs, threats, sexual content, phishing = instant permanent ban. No appeals.", red: true },
];

const PLATFORMS = [
  {
    name: "Telegram",
    handle: "@TheJanitorHQ",
    href: "https://t.me/TheJanitorHQ",
    desc: "Main hub for real-time alerts, threat intel sharing, and direct access. TJ monitors this 24/7.",
    badge: "Primary · TJ Monitored",
    green: true,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--green)" }}>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
  },
  {
    name: "X (Twitter)",
    handle: "@thejanitorhq",
    href: "https://x.com/thejanitorhq",
    desc: "Trash Scanner updates, threat alerts, on-chain intelligence, and highlights. Updated daily.",
    badge: "Active",
    green: false,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-silver)" }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: "TikTok",
    handle: "@.thejanitorhq",
    href: "https://www.tiktok.com/@.thejanitorhq",
    desc: "Short-form breakdowns of rug pulls, scanner features, and TJ in action. Follow for alerts.",
    badge: "Active",
    green: false,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-silver)" }}>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.17 8.17 0 004.77 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
      </svg>
    ),
  },
  {
    name: "GitHub",
    handle: "JanitorNetwork",
    href: "https://github.com/JanitorNetwork/janitor-network",
    desc: "Open source codebase. Read the scanner logic, audit the AI prompts, and verify there are no tricks.",
    badge: "Open Source",
    green: false,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-silver)" }}>
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
];

const TJ_CAPS = [
  { icon: <Eye size={16} />,          title: "Pattern Detection",   desc: "Every message scanned for coordinated shill campaigns, bot behavior, and link spam." },
  { icon: <AtSign size={16} />,       title: "AI on Demand",        desc: "Tag @TJ in any message. The AI responds with risk signals, scanner data, and project intel." },
  { icon: <Ban size={16} />,          title: "Instant Bans",        desc: "Hard violations trigger an immediate permanent ban. No warnings, no appeals, no second chances." },
  { icon: <AlertTriangle size={16} />,title: "Pre-Post Filtering",  desc: "Harmful content is filtered before it ever appears in the chat — not after. No one sees it." },
  { icon: <Bot size={16} />,          title: "Bot Detection",       desc: "Scripted posting, coordinated wallets, and frequency patterns flagged and removed automatically." },
  { icon: <Zap size={16} />,          title: "Community Intel",     desc: "Flagged addresses from the community feed TJ's scanner watchlist. You make it smarter." },
  { icon: <MessageSquare size={16} />,title: "Silent Monitoring",   desc: "TJ monitors 24/7 without interrupting the conversation. The room stays yours." },
  { icon: <Shield size={16} />,       title: "Zero Tolerance Rules",desc: "8 community rules enforced automatically and equally. No favoritism. No exceptions." },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-20">

      {/* ── VIDEO HERO ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: "62vh", minHeight: 420, maxHeight: 640 }}>
        {/* Looping video */}
        <video
          src="/community/video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlays — lighter to let video breathe */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,6,6,0.3) 0%, rgba(6,6,6,0.1) 40%, rgba(6,6,6,0.65) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(6,6,6,0.5) 0%, transparent 55%)" }} />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12">
          {/* Top badge */}
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full animate-pulse-green" style={{ background: "var(--green)" }} />
            <span className="label-green text-[10px] tracking-widest">The Clean Room — Open · TJ Monitored 24/7</span>
            <span
              className="font-black font-mono-jn tracking-widest uppercase px-2 py-0.5"
              style={{ color: "var(--amber)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: 3, background: "rgba(245,158,11,0.1)", fontSize: "0.6rem" }}
            >
              BETA
            </span>
          </div>

          {/* Bottom content */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <h1
                className="font-black leading-tight tracking-tight mb-4"
                style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", color: "var(--text-cream)", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
              >
                The community that
                <br />
                <span style={{ color: "var(--green)", textShadow: "0 0 40px rgba(57,255,20,0.5)" }}>
                  actually protects you.
                </span>
              </h1>
              <p className="text-base leading-relaxed mb-6 max-w-xl" style={{ color: "rgba(255,255,255,0.75)" }}>
                Talk freely. Share intel. Flag threats. Tag @TJ when you need the AI.
                Shillers, bots, and bad actors are removed before anyone sees them.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://t.me/TheJanitorHQ" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Join Telegram <ExternalLink size={13} />
                </a>
                <a href="https://x.com/thejanitorhq" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Follow on X <ExternalLink size={13} />
                </a>
                <a href="https://www.tiktok.com/@.thejanitorhq" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  TikTok <ExternalLink size={13} />
                </a>
                <a href="https://github.com/JanitorNetwork/janitor-network" target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  GitHub <ExternalLink size={13} />
                </a>
              </div>
            </motion.div>

            {/* Lo-fi player */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-shrink-0"
            >
              <LofiPlayer />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── LIVE CHAT + RULES SIDEBAR ────────────────────────────────────────── */}
      <section className="py-14 px-6" style={{ background: "var(--bg-velvet)" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="label mb-2">Live on Janitor.Network</div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
              <h2 className="font-black tracking-tight" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "var(--text-cream)" }}>
                Talk here.{" "}
                <span style={{ color: "var(--green)" }}>Tag @TJ when you need the AI.</span>
              </h2>
              <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>
                Harmful content is blocked before it appears. Bad actors are banned instantly.
              </p>
            </div>
          </motion.div>

          {/* Two-column grid */}
          <div className="grid lg:grid-cols-5 gap-6 items-start">

            {/* Chat — 3 cols */}
            <div className="lg:col-span-3">
              <CommunityChat />
            </div>

            {/* Sidebar — 2 cols */}
            <motion.div
              className="lg:col-span-2 flex flex-col gap-5"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* TJ Status */}
              <div className="p-5 rounded-xl" style={{ background: "var(--bg-charcoal)", border: "1px solid rgba(57,255,20,0.18)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
                    style={{ border: "2px solid var(--green)", boxShadow: "0 0 12px rgba(57,255,20,0.2)" }}>
                    <Image src="/mascot/0E25E965-C0CE-4836-8CBA-E04603295FFB.jpeg" alt="TJ" width={44} height={44} className="object-cover w-full h-full" />
                  </div>
                  <div>
                    <div className="text-sm font-black" style={{ color: "var(--green)" }}>TJ — The Janitor</div>
                    <div className="text-[10px] font-mono-jn" style={{ color: "var(--text-faint)" }}>AI Monitor · Silent · 24/7</div>
                  </div>
                  <div className="ml-auto w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse-green" style={{ background: "var(--green)" }} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  TJ monitors every message silently. <strong style={{ color: "var(--green)" }}>Tag @TJ</strong> in your message to
                  get a direct AI response. TJ won&apos;t interrupt the conversation otherwise — the room stays yours.
                </p>
              </div>

              {/* Rules */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-subtle)" }}>
                <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border-faint)]"
                  style={{ background: "var(--bg-panel)" }}>
                  <Shield size={12} style={{ color: "var(--green)" }} />
                  <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: "var(--text-cream)" }}>
                    Community Rules
                  </span>
                </div>
                <div className="divide-y divide-[var(--border-faint)]">
                  {SIDEBAR_RULES.map((r, i) => (
                    <div key={r.num} className="flex gap-3 px-5 py-3.5"
                      style={{ background: i % 2 === 0 ? "var(--bg-charcoal)" : "var(--bg-panel)" }}>
                      <span className="text-[10px] font-black font-mono-jn flex-shrink-0 mt-0.5"
                        style={{ color: r.red ? "var(--red)" : "var(--green)", opacity: 0.8 }}>
                        {r.num}
                      </span>
                      <div>
                        <div className="text-xs font-bold mb-0.5" style={{ color: r.red ? "#fca5a5" : "var(--text-cream)" }}>{r.title}</div>
                        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] font-mono-jn leading-relaxed px-1" style={{ color: "var(--text-faint)" }}>
                Phase 1 — in-memory chat. Messages reset with server restart. Persistent storage +
                Telegram bridge coming in Phase 3. Not financial advice. Educational purposes only.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW TJ WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "var(--bg-obsidian)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="label mb-3">AI Moderation Engine</div>
            <h2 className="font-black tracking-tight mb-3" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", color: "var(--text-cream)" }}>
              TJ runs the door.{" "}
              <span style={{ color: "var(--green)" }}>Silently.</span>
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
              Most crypto community moderation is reactive — someone reports it, someone reviews it, then maybe it gets removed.
              TJ acts before the message ever appears. No one sees the bad content. Not even for a second.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TJ_CAPS.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card p-4"
              >
                <div className="w-8 h-8 rounded flex items-center justify-center mb-3"
                  style={{ background: "var(--green-trace)", color: "var(--green)" }}>
                  {cap.icon}
                </div>
                <h3 className="font-bold text-xs mb-1.5" style={{ color: "var(--text-cream)" }}>{cap.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ background: "var(--bg-velvet)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="label mb-3">Find Us Everywhere</div>
            <h2 className="font-black tracking-tight mb-3" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "var(--text-cream)" }}>
              Three platforms. One community.
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
              Chat here live. Real-time alerts on Telegram. Updates on X. Short-form intel on TikTok.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PLATFORMS.map((p, i) => (
              <motion.a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card card-glow p-6 group flex flex-col gap-4"
                style={{ textDecoration: "none" }}
              >
                <div className="flex items-center justify-between">
                  {p.icon}
                  <span className={`badge badge-${p.green ? "green" : "muted"}`} style={{ fontSize: 8 }}>{p.badge}</span>
                </div>
                <div>
                  <div className="font-bold text-base mb-0.5" style={{ color: "var(--text-cream)" }}>{p.name}</div>
                  <div className="text-xs font-mono-jn mb-2" style={{ color: "var(--green)" }}>{p.handle}</div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-auto">
                  <span className="text-xs font-semibold" style={{ color: "var(--green)" }}>Visit</span>
                  <ExternalLink size={11} style={{ color: "var(--green)" }} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 text-center border-t border-[var(--border-faint)]" style={{ background: "var(--bg-void)" }}>
        <div className="max-w-xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: "var(--green-trace)", border: "1px solid rgba(57,255,20,0.3)" }}>
            <Shield size={28} style={{ color: "var(--green)" }} />
          </div>
          <h2 className="font-black tracking-tight mb-4" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: "var(--text-cream)" }}>
            The Clean Room is open.
          </h2>
          <p className="leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
            No token required. No waiting list. Chat live above or join across all three platforms.
            Follow the rules. Help keep crypto cleaner.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://t.me/TheJanitorHQ" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Telegram <ExternalLink size={13} />
            </a>
            <a href="https://x.com/thejanitorhq" target="_blank" rel="noopener noreferrer" className="btn-primary">
              X / Twitter <ExternalLink size={13} />
            </a>
            <a href="https://www.tiktok.com/@.thejanitorhq" target="_blank" rel="noopener noreferrer" className="btn-primary">
              TikTok <ExternalLink size={13} />
            </a>
            <a href="https://github.com/JanitorNetwork/janitor-network" target="_blank" rel="noopener noreferrer" className="btn-ghost">
              GitHub <ExternalLink size={13} />
            </a>
          </div>
          <p className="text-xs mt-8" style={{ color: "var(--text-faint)" }}>
            The Janitor Network community is for informational and educational purposes only.
            Nothing discussed constitutes financial advice. Always do your own research.
          </p>
        </div>
      </section>

    </div>
  );
}
