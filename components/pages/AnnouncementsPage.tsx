"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, Megaphone, ArrowRight } from "lucide-react";
import LaunchCountdown from "@/components/LaunchCountdown";

const ANNOUNCEMENTS = [
  {
    id: "clean-launch",
    date: "May 17, 2026",
    category: "TOKEN LAUNCH",
    categoryColor: "green" as const,
    title: "$CLEAN Token Launch — May 25, 2026",
    body: [
      "$CLEAN, the utility token of The Janitor Network, launches on Solana on May 25, 2026 at 10:00 AM MDT.",
      "Fair launch — no pre-sale, no VC allocation, no insider unlock. Initial liquidity locked at launch.",
      "$CLEAN is fuel, not speculation. It powers deep scan access, priority queue, API credits, and governance rights as the platform scales through its phases.",
      "Get notified the moment it goes live by joining the Telegram channel below.",
    ],
    cta: { label: "Get Notified on Telegram", href: "https://t.me/TheJanitorHQ", external: true },
    featured: true,
    showCountdown: true,
  },
];

function CategoryBadge({ color }: { color: "green" | "amber" | "red" | "muted" }) {
  const styles: Record<string, { color: string; border: string; bg: string }> = {
    green: { color: "var(--green)",  border: "rgba(57,255,20,0.3)",   bg: "var(--green-trace)" },
    amber: { color: "var(--amber)",  border: "rgba(245,158,11,0.3)",  bg: "var(--amber-glow)" },
    red:   { color: "var(--red)",    border: "rgba(239,68,68,0.3)",   bg: "rgba(239,68,68,0.07)" },
    muted: { color: "var(--text-faint)", border: "var(--border-mid)", bg: "transparent" },
  };
  return styles[color];
}

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-20">

      {/* ── HEADER ── */}
      <section className="py-16 px-6 border-b border-[var(--border-faint)]" style={{ background: "var(--bg-velvet)" }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded flex items-center justify-center"
                style={{ background: "var(--green-trace)", color: "var(--green)" }}
              >
                <Megaphone size={20} />
              </div>
              <div className="label">Official Announcements</div>
            </div>
            <h1
              className="font-black leading-tight tracking-tight mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", color: "var(--text-cream)" }}
            >
              From The{" "}
              <span style={{ color: "var(--green)", textShadow: "0 0 40px rgba(57,255,20,0.4)" }}>
                Janitor Network.
              </span>
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: "var(--text-muted)", maxWidth: 520 }}>
              Major updates, launches, and network milestones — posted here first.
              No noise. No filler. Only what matters.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── ANNOUNCEMENTS ── */}
      <section className="py-14 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {ANNOUNCEMENTS.map((ann, i) => {
            const badgeStyle = CategoryBadge({ color: ann.categoryColor });
            return (
              <motion.article
                key={ann.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="card overflow-hidden"
                style={ann.featured ? { borderColor: "rgba(57,255,20,0.3)", boxShadow: "0 0 60px rgba(57,255,20,0.05)" } : {}}
              >
                {/* Top bar */}
                <div
                  className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-[var(--border-faint)]"
                  style={{ background: ann.featured ? "rgba(57,255,20,0.03)" : "var(--bg-panel)" }}
                >
                  {ann.featured && (
                    <span
                      className="text-[9px] font-black tracking-[0.3em] uppercase px-2 py-1 rounded-sm"
                      style={{ background: "var(--green)", color: "#060606" }}
                    >
                      FEATURED
                    </span>
                  )}
                  <span
                    className="badge text-[9px] tracking-[0.2em]"
                    style={{ color: badgeStyle.color, borderColor: badgeStyle.border, background: badgeStyle.bg }}
                  >
                    {ann.category}
                  </span>
                  <span className="text-xs font-mono-jn ml-auto" style={{ color: "var(--text-faint)" }}>
                    {ann.date}
                  </span>
                </div>

                <div className="p-6 md:p-8">
                  <h2
                    className="font-black leading-tight tracking-tight mb-6"
                    style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "var(--text-cream)" }}
                  >
                    {ann.title}
                  </h2>

                  {/* Countdown — featured only */}
                  {ann.showCountdown && (
                    <div
                      className="mb-8 py-8 px-6 rounded-xl border border-[rgba(57,255,20,0.2)] text-center"
                      style={{ background: "var(--bg-charcoal)" }}
                    >
                      <LaunchCountdown />
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    {ann.body.map((paragraph, j) => (
                      <p key={j} className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {ann.cta && (
                    ann.cta.external ? (
                      <a
                        href={ann.cta.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex"
                      >
                        {ann.cta.label} <ExternalLink size={13} />
                      </a>
                    ) : (
                      <Link href={ann.cta.href} className="btn-primary inline-flex">
                        {ann.cta.label} <ArrowRight size={13} />
                      </Link>
                    )
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ── STAY UPDATED ── */}
      <section className="py-14 px-6 border-t border-[var(--border-faint)]" style={{ background: "var(--bg-velvet)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-black tracking-tight mb-3" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "var(--text-cream)" }}>
            Don&apos;t miss the next one.
          </h2>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Join the Telegram and follow on X to get every announcement the moment it drops.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://t.me/TheJanitorHQ" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Join Telegram <ExternalLink size={13} />
            </a>
            <a href="https://x.com/thejanitorhq" target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Follow on X <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
