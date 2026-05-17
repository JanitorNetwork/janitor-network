"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import JanitorLogo from "@/components/JanitorLogo";
import { ArrowRight, Search, Users, Zap, Shield, X } from "lucide-react";

const TOUR_STEPS = [
  {
    icon: <Search size={28} />,
    title: "The Trash Scanner",
    body: "Paste any Solana or EVM wallet or token address. Get a risk score, signal breakdown, and forensic scan log — free, in seconds. No account required.",
    cta: "Try the Trash Scanner",
    href: "/scan",
    img: "/mascot/IMG_8490.jpeg",
  },
  {
    icon: <Users size={28} />,
    title: "The Clean Room",
    body: "A community that doesn't get rugged. Share intel, flag threats, and tag @TJ — the AI — when you need a second opinion. Moderated automatically, 24/7.",
    cta: "Join the Community",
    href: "/community",
    img: "/mascot/IMG_8492.jpeg",
  },
  {
    icon: <Zap size={28} />,
    title: "$CLEAN Token",
    body: "The utility token powering the network. Stake to unlock deep blockchain scans, API access, and governance. Launching on Solana soon.",
    cta: "Learn About $CLEAN",
    href: "/clean",
    img: "/mascot/clean-coin.jpeg",
  },
  {
    icon: <Shield size={28} />,
    title: "The Roadmap",
    body: "Seven phases from format validation to full on-chain trust protocol. We build slowly and in public — no moonshots, no hype, just infrastructure.",
    cta: "See the Roadmap",
    href: "/roadmap",
    img: "/mascot/IMG_8483.jpeg",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "tour">("welcome");
  const [tourIdx, setTourIdx] = useState(0);

  useEffect(() => {
    const alreadySeen = localStorage.getItem("jn_welcomed");
    if (alreadySeen) router.replace("/");
  }, [router]);

  const enter = () => {
    localStorage.setItem("jn_welcomed", "1");
    router.replace("/");
  };

  const startTour = () => setStep("tour");

  const nextTour = () => {
    if (tourIdx < TOUR_STEPS.length - 1) setTourIdx(i => i + 1);
    else enter();
  };

  const current = TOUR_STEPS[tourIdx];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: "var(--bg-void)" }}>
      {/* Background mascot */}
      <div className="absolute inset-0">
        <Image
          src="/mascot/IMG_8488.jpeg"
          alt=""
          fill
          className="object-cover object-center opacity-20"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(6,6,6,0.5) 0%, rgba(6,6,6,0.95) 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(57,255,20,0.08) 0%, transparent 100%)" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === "welcome" ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.35 }}
              className="mb-8"
            >
              <JanitorLogo size={96} glow />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-green" style={{ background: "var(--green)" }} />
                <span className="text-xs font-mono-jn tracking-[0.3em] uppercase" style={{ color: "var(--green)" }}>
                  Phase 1 — Night Shift Active
                </span>
              </div>

              <h1
                className="font-black leading-tight tracking-tight mb-4"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "var(--text-cream)" }}
              >
                The Janitor
                <br />
                <span style={{ color: "var(--green)", textShadow: "0 0 60px rgba(57,255,20,0.5)" }}>
                  Network
                </span>
              </h1>

              <p
                className="text-lg leading-relaxed mb-10 max-w-md mx-auto"
                style={{ color: "var(--text-muted)" }}
              >
                Trust intelligence for the crypto era. Scan wallets, tokens, and contracts
                before you commit — free, honest, no hype.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={startTour}
                  className="btn-primary text-sm px-8 py-3"
                >
                  Take the Tour <ArrowRight size={15} />
                </button>
                <button
                  onClick={enter}
                  className="btn-ghost text-sm px-8 py-3"
                >
                  Skip — Enter the Site
                </button>
              </div>

              <p className="mt-8 text-xs" style={{ color: "var(--text-faint)" }}>
                You&apos;ll only see this once. Not financial advice.
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="tour"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex items-center justify-center min-h-screen px-6"
          >
            <div className="w-full max-w-2xl">
              {/* Tour header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  {TOUR_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: i === tourIdx ? 32 : 8,
                        background: i <= tourIdx ? "var(--green)" : "var(--border-mid)",
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={enter}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: "var(--text-faint)" }}
                  aria-label="Skip tour"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tour card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={tourIdx}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="card overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={current.img}
                      alt={current.title}
                      fill
                      className="object-cover object-center"
                      priority
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to bottom, rgba(6,6,6,0.2) 0%, rgba(6,6,6,0.8) 100%)" }}
                    />
                    <div className="absolute bottom-5 left-6 flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--green-trace)", border: "1px solid rgba(57,255,20,0.3)", color: "var(--green)" }}
                      >
                        {current.icon}
                      </div>
                      <h2 className="font-black text-xl" style={{ color: "var(--text-cream)" }}>
                        {current.title}
                      </h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
                      {current.body}
                    </p>
                    <div className="flex gap-3">
                      <Link href={current.href} onClick={enter} className="btn-ghost text-sm flex-1 justify-center">
                        {current.cta}
                      </Link>
                      <button onClick={nextTour} className="btn-primary text-sm flex-1 justify-center">
                        {tourIdx < TOUR_STEPS.length - 1 ? "Next →" : "Enter the Site →"}
                      </button>
                    </div>
                    <p className="text-center text-xs mt-4" style={{ color: "var(--text-faint)" }}>
                      {tourIdx + 1} of {TOUR_STEPS.length}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
