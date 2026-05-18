"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGES = [
  { num: "00", title: "Title Page",        sub: "The Night Shift Chronicles",                         file: "title-page.png" },
  { num: "01", title: "A New Threat",      sub: "The night shift begins. TJ gets his first signal.",  file: "comic-1.png"    },
  { num: "02", title: "FOMO Kevin",         sub: "He almost aped in without scanning. Almost.",        file: "comic-2.png"    },
  { num: "03", title: "The Rug Artists",    sub: "TJ traces the deployer back four contracts.",        file: "comic-3.png"    },
  { num: "04", title: "Clean Signal",       sub: "Not every token is trash — TJ confirms it.",         file: "comic-4.png"    },
  { num: "05", title: "The Great Rug Hunt", sub: "Eight-panel adventure across the blockchain.",       file: "comic-5.png"    },
];

export default function ComicsPage() {
  const [idx, setIdx] = useState(0);

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx(i => Math.min(PAGES.length - 1, i + 1)), []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const page = PAGES[idx];
  const hasPrev = idx > 0;
  const hasNext = idx < PAGES.length - 1;

  return (
    <div className="min-h-screen pt-20" style={{ background: "var(--bg-void)" }}>

      {/* ── Series bar ── */}
      <div className="relative overflow-hidden" style={{ background: "var(--bg-velvet)", borderBottom: "1px solid var(--border-faint)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <Image src="/mascot/IMG_8484.jpeg" alt="" fill className="object-cover object-top opacity-25" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(6,6,6,0.88) 0%, rgba(6,6,6,0.6) 50%, rgba(6,6,6,0.88) 100%)" }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4 flex-wrap relative">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--green)" }} />
            <h1 className="font-black tracking-tight text-lg sm:text-xl" style={{ color: "var(--text-cream)" }}>
              The Night Shift Chronicles
            </h1>
            <span
              className="hidden sm:block text-[9px] font-black tracking-widest uppercase font-mono-jn px-2 py-1"
              style={{ color: "var(--green)", border: "1px solid rgba(57,255,20,0.3)", borderRadius: 2, background: "var(--green-trace)" }}
            >
              Original Series
            </span>
          </div>
          <span className="text-xs font-bold font-mono-jn" style={{ color: "var(--text-faint)" }}>
            {idx + 1} of {PAGES.length}
          </span>
        </div>
      </div>

      {/* ── Episode tabs ── */}
      <div style={{ background: "var(--bg-charcoal)", borderBottom: "1px solid var(--border-faint)" }}>
        <div className="max-w-6xl mx-auto px-2">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {PAGES.map((p, i) => (
              <button
                key={p.num}
                onClick={() => setIdx(i)}
                className="flex-shrink-0 px-4 sm:px-5 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-all border-b-2 whitespace-nowrap font-mono-jn"
                style={{
                  borderColor: i === idx ? "var(--green)" : "transparent",
                  color: i === idx ? "var(--green)" : "var(--text-faint)",
                  background: "transparent",
                }}
              >
                {p.num === "00" ? "Cover" : `Ep ${p.num}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reader ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Episode header */}
        <div className="flex items-start justify-between mb-5 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <span
              className="font-black font-mono-jn leading-none flex-shrink-0"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "var(--border-strong)" }}
            >
              {page.num}
            </span>
            <div className="w-px self-stretch" style={{ background: "var(--border-mid)", flexShrink: 0 }} />
            <div>
              <div
                className="font-black tracking-tight leading-tight"
                style={{ fontSize: "clamp(1rem, 2.5vw, 1.4rem)", color: "var(--text-cream)" }}
              >
                {page.title}
              </div>
              <div className="text-xs sm:text-sm mt-0.5 leading-relaxed" style={{ color: "var(--text-faint)" }}>
                {page.sub}
              </div>
            </div>
          </div>
          {/* Desktop arrow hints */}
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0 mt-1">
            <span className="text-[10px] font-mono-jn" style={{ color: "var(--text-faint)" }}>← → to navigate</span>
          </div>
        </div>

        {/* Comic panel — full width, large */}
        <div className="relative group">

          {/* Desktop side arrows */}
          {hasPrev && (
            <button
              onClick={prev}
              className="absolute left-0 top-0 bottom-0 w-14 z-10 hidden sm:flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Previous page"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: "var(--bg-charcoal)", border: "2px solid var(--border-subtle)" }}
              >
                <ChevronLeft size={20} style={{ color: "var(--text-cream)" }} />
              </div>
            </button>
          )}

          {hasNext && (
            <button
              onClick={next}
              className="absolute right-0 top-0 bottom-0 w-14 z-10 hidden sm:flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Next page"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl"
                style={{ background: "var(--bg-charcoal)", border: "2px solid var(--border-subtle)" }}
              >
                <ChevronRight size={20} style={{ color: "var(--text-cream)" }} />
              </div>
            </button>
          )}

          {/* The comic image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={page.file}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden relative"
              style={{ border: "4px solid #000", borderRadius: 4, boxShadow: "6px 6px 0 #000" }}
            >
              {/* Mobile tap zones — invisible buttons over left/right thirds */}
              {hasPrev && (
                <button
                  onClick={prev}
                  className="absolute left-0 top-0 bottom-0 w-1/3 z-10 sm:hidden"
                  aria-label="Previous page"
                />
              )}
              {hasNext && (
                <button
                  onClick={next}
                  className="absolute right-0 top-0 bottom-0 w-1/3 z-10 sm:hidden"
                  aria-label="Next page"
                />
              )}

              <Image
                src={`/comics/${page.file}`}
                alt={`${page.title}`}
                width={1400}
                height={2000}
                style={{ width: "100%", height: "auto", display: "block" }}
                quality={100}
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom nav row */}
        <div className="flex items-center justify-between mt-6 gap-3">
          <button
            onClick={prev}
            disabled={!hasPrev}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all duration-150 disabled:opacity-25 flex-shrink-0"
            style={{
              background: "var(--bg-charcoal)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
              color: "var(--text-cream)",
              cursor: hasPrev ? "pointer" : "default",
            }}
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {PAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === idx ? 24 : 8,
                  height: 8,
                  background: i === idx ? "var(--green)" : "var(--border-strong)",
                  boxShadow: i === idx ? "0 0 10px rgba(57,255,20,0.5)" : "none",
                }}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={!hasNext}
            className="flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all duration-150 disabled:opacity-25 flex-shrink-0"
            style={{
              background: hasNext ? "var(--green)" : "var(--bg-charcoal)",
              border: `1px solid ${hasNext ? "var(--green)" : "var(--border-subtle)"}`,
              borderRadius: 8,
              color: hasNext ? "#060606" : "var(--text-cream)",
              cursor: hasNext ? "pointer" : "default",
            }}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <p className="text-center text-[10px] mt-3 font-mono-jn" style={{ color: "var(--text-faint)" }}>
          Tap left / right side of the comic on mobile · use ← → arrow keys on desktop
        </p>
      </div>

      {/* ── Footer ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 mt-4">
        <div className="text-center py-10 border border-dashed border-[var(--border-faint)] rounded-lg">
          <div className="font-bold mb-2 text-base" style={{ color: "var(--text-cream)" }}>More episodes coming</div>
          <p className="text-sm" style={{ color: "var(--text-faint)" }}>
            Follow{" "}
            <a href="https://x.com/thejanitorhq" target="_blank" rel="noopener noreferrer"
              className="underline transition-colors hover:text-[var(--green)]" style={{ color: "var(--text-muted)" }}>
              @thejanitorhq
            </a>
            {" "}and{" "}
            <a href="https://www.tiktok.com/@.thejanitorhq" target="_blank" rel="noopener noreferrer"
              className="underline transition-colors hover:text-[var(--green)]" style={{ color: "var(--text-muted)" }}>
              @.thejanitorhq
            </a>
            {" "}to know first.
          </p>
        </div>
        <p className="text-xs text-center mt-5" style={{ color: "var(--text-faint)" }}>
          Original fiction. Any resemblance to actual rugs is purely statistical. There are a lot of rugs.
        </p>
      </div>
    </div>
  );
}
