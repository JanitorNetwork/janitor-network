"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Lock, X, Download, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const MASCOT_IMAGES = [
  { src: "/mascot/IMG_8483.jpeg", caption: "Deleting influencers" },
  { src: "/mascot/IMG_8490.jpeg", caption: "FUD disposal — mop & bags" },
  { src: "/mascot/IMG_8492.jpeg", caption: "Community cleanup crew" },
  { src: "/mascot/IMG_8484.jpeg", caption: "Night shift" },
  { src: "/mascot/IMG_8485.jpeg", caption: "On patrol" },
  { src: "/mascot/IMG_8486.jpeg", caption: "TJ at work" },
  { src: "/mascot/IMG_8487.jpeg", caption: "Rug pull prevention" },
  { src: "/mascot/IMG_8488.jpeg", caption: "Clean signal" },
  { src: "/mascot/IMG_8489.jpeg", caption: "The sweep" },
  { src: "/mascot/IMG_8491.jpeg", caption: "Trust check" },
  { src: "/mascot/IMG_8493.jpeg", caption: "TJ in the field" },
  { src: "/mascot/IMG_8494.jpeg", caption: "Crypto cleanup" },
  { src: "/mascot/IMG_8495.jpeg", caption: "Night operations" },
  { src: "/mascot/IMG_8496.jpeg", caption: "Threat detected" },
  { src: "/mascot/IMG_8497.jpeg", caption: "All clear" },
  { src: "/mascot/IMG_8498.jpeg", caption: "Scan complete" },
  { src: "/mascot/IMG_8499.jpeg", caption: "Phase 1 active" },
  { src: "/mascot/IMG_8515.jpeg", caption: "The Janitor" },
  { src: "/mascot/IMG_8572.jpeg", caption: "Clean room" },
  { src: "/mascot/IMG_8478.jpeg", caption: "On shift" },
  { src: "/mascot/IMG_8479.jpeg", caption: "The mission" },
  { src: "/mascot/IMG_8480.jpeg", caption: "Background check" },
  { src: "/mascot/IMG_8481.jpeg", caption: "Trust verified" },
];

export default function GalleryPage() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const openLightbox = (i: number) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prev = useCallback(() => setLightbox(i => i !== null ? Math.max(0, i - 1) : null), []);
  const next = useCallback(() => setLightbox(i => i !== null ? Math.min(MASCOT_IMAGES.length - 1, i + 1) : null), []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, prev, next]);

  const handleDownload = async (src: string, caption: string) => {
    const res = await fetch(src);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `janitor-network-${caption.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-20">

      {/* Header */}
      <div className="relative overflow-hidden border-b border-[var(--border-faint)] bg-[var(--bg-velvet)]">
        <div className="absolute inset-0 pointer-events-none">
          <Image src="/mascot/IMG_8492.jpeg" alt="" fill className="object-cover object-center opacity-35" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--bg-void) 0%, rgba(6,6,6,0.6) 40%, rgba(6,6,6,0.15) 100%)" }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 py-16 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="label mb-3">Visual Identity</div>
              <h1
                className="font-black tracking-tight mb-3"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--text-cream)" }}
              >
                The Janitor Archive
              </h1>
              <p style={{ color: "var(--text-muted)", maxWidth: 500, lineHeight: 1.7 }}>
                The full visual identity of The Janitor Network. These images define the
                character, the mission, and the brand. More coming as the project grows.
              </p>
            </div>

            <div
              className="flex items-center gap-3 px-4 py-3 rounded border border-[var(--border-subtle)]"
              style={{ background: "var(--bg-charcoal)", flexShrink: 0 }}
            >
              <Lock size={14} style={{ color: "var(--text-faint)" }} />
              <div>
                <div className="text-xs font-bold" style={{ color: "var(--text-cream)" }}>
                  Admin Gallery
                </div>
                <div className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                  Member uploads — Phase 4
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {MASCOT_IMAGES.map((img, i) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, delay: i * 0.025 }}
              className="group relative overflow-hidden cursor-pointer"
              style={{
                borderRadius: 6,
                border: "1px solid var(--border-faint)",
                aspectRatio: "1",
                boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
              }}
              onClick={() => openLightbox(i)}
            >
              <Image
                src={img.src}
                alt={img.caption}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                quality={90}
              />
              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(to top, rgba(6,6,6,0.85) 0%, rgba(6,6,6,0.4) 100%)",
                  backdropFilter: "blur(1px)",
                }}
              >
                <ZoomIn size={20} style={{ color: "var(--green)", filter: "drop-shadow(0 0 6px rgba(57,255,20,0.6))" }} />
                <span
                  className="text-[10px] font-bold text-center px-2 leading-tight tracking-wider uppercase font-mono-jn"
                  style={{ color: "var(--text-cream)" }}
                >
                  {img.caption}
                </span>
              </div>
              {/* Green border glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded pointer-events-none"
                style={{ boxShadow: "inset 0 0 0 1px rgba(57,255,20,0.3)" }}
              />
            </motion.div>
          ))}

          {/* Coming soon placeholder */}
          <div
            className="flex flex-col items-center justify-center border border-dashed border-[var(--border-faint)]"
            style={{ borderRadius: 6, aspectRatio: "1" }}
          >
            <div className="label mb-1 text-center">More</div>
            <div className="text-[10px] text-center" style={{ color: "var(--text-faint)" }}>coming soon</div>
          </div>
        </div>

        <p className="text-xs text-center mt-8" style={{ color: "var(--text-faint)" }}>
          All artwork © 2026 The Janitor Network. Click any image to expand and download.
          Member uploads launch in Phase 4.
        </p>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.93)" }}
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
              style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-cream)" }}
              aria-label="Close"
            >
              <X size={22} />
            </button>

            {/* Prev */}
            {lightbox > 0 && (
              <button
                onClick={e => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-cream)" }}
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Next */}
            {lightbox < MASCOT_IMAGES.length - 1 && (
              <button
                onClick={e => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-cream)" }}
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              transition={{ duration: 0.18 }}
              className="relative flex flex-col items-center"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: "min(92vw, 820px)", width: "min(92vw, 820px)" }}
            >
              {/* Fixed-height container — fill + contain preserves any aspect ratio */}
              <div
                className="relative w-full"
                style={{ height: "72vh" }}
              >
                <Image
                  src={MASCOT_IMAGES[lightbox].src}
                  alt={MASCOT_IMAGES[lightbox].caption}
                  fill
                  style={{ objectFit: "contain", borderRadius: 8 }}
                  sizes="min(92vw, 820px)"
                  priority
                />
              </div>
              {/* Caption + download */}
              <div className="flex items-center justify-between w-full mt-4 px-1 gap-4">
                <div>
                  <p className="font-semibold" style={{ color: "var(--text-cream)" }}>
                    {MASCOT_IMAGES[lightbox].caption}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                    {lightbox + 1} of {MASCOT_IMAGES.length} · The Janitor Network
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(MASCOT_IMAGES[lightbox].src, MASCOT_IMAGES[lightbox].caption)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wider uppercase rounded transition-all hover:opacity-90 flex-shrink-0"
                  style={{ background: "var(--green)", color: "#060606" }}
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
