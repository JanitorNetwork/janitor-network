"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import JanitorLogo from "@/components/JanitorLogo";

const NAV_LINKS = [
  { href: "/",          label: "Home" },
  { href: "/scan",      label: "Trash Scanner" },
  { href: "/clean",     label: "$CLEAN" },
  { href: "/roadmap",   label: "Roadmap" },
  { href: "/gallery",   label: "Gallery" },
  { href: "/comics",    label: "Comics" },
  { href: "/community", label: "Community" },
  { href: "/about",     label: "About" },
];

const SOCIAL = [
  {
    label: "X",
    href: "https://x.com/thejanitorhq",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@.thejanitorhq",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.69a8.17 8.17 0 004.77 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me/TheJanitorHQ",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/JanitorNetwork/janitor-network",
    mobileOnly: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Top navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled ? "backdrop-blur-xl" : "backdrop-blur-md"
        }`}
        style={{
          background: scrolled ? "rgba(8,8,8,0.97)" : "rgba(8,8,8,0.88)",
          borderBottom: "1px solid rgba(57,255,20,0.14)",
          boxShadow: scrolled ? "0 4px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(57,255,20,0.08)" : "none",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(57,255,20,0.5) 30%, rgba(57,255,20,0.5) 70%, transparent)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center gap-4 sm:gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0 mr-2">
            <JanitorLogo size={34} glow />
            <div className="hidden sm:flex flex-col leading-none">
              <span
                className="text-[11px] font-black tracking-[0.22em] uppercase transition-colors duration-200 group-hover:text-[var(--green)]"
                style={{ color: "var(--text-cream)" }}
              >
                Janitor Network
              </span>
              <span className="text-[8px] font-bold tracking-[0.18em] uppercase font-mono-jn" style={{ color: "var(--green)" }}>
                MVP · Phase 1 Live
              </span>
            </div>
          </Link>

          {/* Separator */}
          <div className="hidden lg:block w-px h-6 flex-shrink-0" style={{ background: "var(--border-mid)" }} />

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center flex-1 min-w-0">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase transition-all duration-200 whitespace-nowrap flex-shrink-0"
                  style={{ color: active ? "var(--green)" : "var(--text-silver)" }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-cream)"; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-silver)"; }}
                >
                  {link.label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-px"
                      style={{ background: "var(--green)", boxShadow: "0 0 6px rgba(57,255,20,0.8)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0 ml-auto">
            <div className="flex items-center gap-1">
              {SOCIAL.filter(s => !s.mobileOnly).map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 flex items-center justify-center rounded transition-all duration-200"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-cream)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-charcoal)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
            <div className="w-px h-5" style={{ background: "var(--border-mid)" }} />
            <div
              className="flex items-center gap-1.5 px-2.5 py-1"
              style={{ background: "rgba(57,255,20,0.06)", border: "1px solid rgba(57,255,20,0.2)", borderRadius: 4 }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-green flex-shrink-0" style={{ background: "var(--green)" }} />
              <span className="text-[9px] font-black font-mono-jn tracking-[0.22em] uppercase" style={{ color: "var(--green)" }}>P1 Live</span>
            </div>
            <Link
              href="/scan"
              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-black tracking-[0.18em] uppercase transition-all duration-200"
              style={{ background: "var(--green)", color: "#060606", borderRadius: 4, boxShadow: "0 0 16px rgba(57,255,20,0.25)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(57,255,20,0.45)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(57,255,20,0.25)"}
            >
              Scan Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(v => !v)}
            className="lg:hidden ml-auto flex items-center justify-center w-10 h-10 rounded transition-colors"
            style={{
              color: open ? "var(--green)" : "var(--text-muted)",
              background: open ? "rgba(57,255,20,0.07)" : "transparent",
              border: open ? "1px solid rgba(57,255,20,0.2)" : "1px solid transparent",
            }}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile slide-out drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-50 lg:hidden"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)" }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              key="nav-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300, mass: 0.8 }}
              className="fixed top-0 right-0 bottom-0 z-[60] lg:hidden flex flex-col"
              style={{
                width: "min(320px, 88vw)",
                background: "#0a0a0a",
                borderLeft: "1px solid rgba(57,255,20,0.15)",
                boxShadow: "-12px 0 60px rgba(0,0,0,0.8)",
              }}
              role="dialog"
              aria-label="Navigation menu"
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{ borderBottom: "1px solid var(--border-faint)" }}
              >
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                  <JanitorLogo size={28} glow />
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-black tracking-[0.22em] uppercase" style={{ color: "var(--text-cream)" }}>
                      Janitor Network
                    </span>
                    <span className="text-[7px] font-bold tracking-widest uppercase font-mono-jn" style={{ color: "var(--green)" }}>
                      MVP · Phase 1 Live
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded transition-colors"
                  style={{ color: "var(--text-muted)", background: "var(--bg-charcoal)", border: "1px solid var(--border-faint)" }}
                  aria-label="Close menu"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto py-3">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.035 + 0.06 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 border-l-2 transition-all duration-150"
                        style={{
                          borderColor: active ? "var(--green)" : "transparent",
                          color: active ? "var(--green)" : "var(--text-silver)",
                          background: active ? "rgba(57,255,20,0.04)" : "transparent",
                        }}
                      >
                        <span className="flex-1 text-xs font-semibold tracking-[0.15em] uppercase">
                          {link.label}
                        </span>
                        {active && <ArrowRight size={12} style={{ color: "var(--green)" }} />}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Drawer footer */}
              <div
                className="px-5 py-5 flex-shrink-0"
                style={{ borderTop: "1px solid var(--border-faint)", background: "rgba(0,0,0,0.25)" }}
              >
                {/* Social + phase badge */}
                <div className="flex items-center gap-2 mb-4">
                  {SOCIAL.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-9 h-9 flex items-center justify-center rounded"
                      style={{
                        color: "var(--text-muted)",
                        background: "var(--bg-charcoal)",
                        border: "1px solid var(--border-faint)",
                      }}
                    >
                      {s.icon}
                    </a>
                  ))}
                  <div
                    className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5"
                    style={{ background: "rgba(57,255,20,0.07)", border: "1px solid rgba(57,255,20,0.2)", borderRadius: 4 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse-green" style={{ background: "var(--green)" }} />
                    <span className="text-[8px] font-mono-jn tracking-widest uppercase font-black" style={{ color: "var(--green)" }}>
                      Phase 1
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/scan"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 text-[11px] font-black tracking-[0.18em] uppercase rounded"
                  style={{ background: "var(--green)", color: "#060606", boxShadow: "0 0 24px rgba(57,255,20,0.35)" }}
                >
                  Scan Now <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
