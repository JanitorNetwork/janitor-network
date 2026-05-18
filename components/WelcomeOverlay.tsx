"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Search, Shield, MessageSquare } from "lucide-react";
import JanitorLogo from "@/components/JanitorLogo";

const STORAGE_KEY = "janitor_welcomed_v1";

const STEPS = [
  {
    num: "01",
    icon: <Search size={20} />,
    title: "Paste an address",
    desc: "Any Solana wallet, EVM wallet, or token contract address. Copy it from wherever you found it.",
  },
  {
    num: "02",
    icon: <Shield size={20} />,
    title: "Get a trust score",
    desc: "The scanner returns a score from 0–100 with a full signal breakdown. Green is clean. Red is risk. We tell you why.",
  },
  {
    num: "03",
    icon: <MessageSquare size={20} />,
    title: "Ask TJ anything",
    desc: "Use the chat in the bottom corner to ask about any scan result, any signal, or anything else about crypto trust.",
  },
];

export default function WelcomeOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0); // 0 = welcome, 1 = tutorial, 2 = exiting
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setVisible(true);
  }, []);

  const enter = () => {
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
    }, 600);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9000] flex flex-col overflow-hidden"
          style={{ background: "var(--bg-void)" }}
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src="/mascot/IMG_8483.jpeg"
              alt="The Janitor Network"
              fill
              className="object-cover object-center opacity-20"
              priority
            />
            <div
              className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse at center, rgba(6,6,6,0.5) 0%, var(--bg-void) 70%)" }}
            />
            <div className="absolute inset-0 grid-bg opacity-30" />
          </div>

          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)",
              zIndex: 1,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">

            {/* Step 0 — Welcome */}
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="welcome-screen"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.4 }}
                  className="text-center max-w-lg"
                >
                  {/* Logo mark */}
                  <div className="flex justify-center mb-8 animate-float">
                    <JanitorLogo size={96} glow />
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-5">
                    <span className="w-2 h-2 rounded-full animate-pulse-green" style={{ background: "var(--green)" }} />
                    <span className="label-green">Night Shift Active</span>
                  </div>

                  <h1
                    className="font-black leading-[0.9] tracking-tight mb-6"
                    style={{ fontSize: "clamp(3rem, 7vw, 5rem)", color: "var(--text-cream)" }}
                  >
                    Welcome to
                    <br />
                    <span
                      style={{
                        color: "var(--green)",
                        textShadow: "0 0 60px rgba(57,255,20,0.5), 0 0 120px rgba(57,255,20,0.2)",
                      }}
                    >
                      The Janitor
                    </span>
                    <br />
                    Network.
                  </h1>

                  <p
                    className="text-lg leading-relaxed mb-10"
                    style={{ color: "var(--text-silver)", maxWidth: 420, margin: "0 auto 2.5rem" }}
                  >
                    Crypto is full of trash. We built the only tool that scans it before
                    you step in it — powered by AI, backed by community.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-primary text-base px-8 py-4"
                    >
                      Quick Tutorial <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={enter}
                      className="btn-ghost text-base px-8 py-4"
                    >
                      Skip to Site
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 1 — Tutorial */}
              {step === 1 && (
                <motion.div
                  key="tutorial-screen"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-2xl w-full"
                >
                  <div className="text-center mb-10">
                    <div className="label mb-3">How it works</div>
                    <h2
                      className="font-black tracking-tight"
                      style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "var(--text-cream)" }}
                    >
                      3 steps to trust.
                    </h2>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-5 mb-10">
                    {STEPS.map((s, i) => (
                      <motion.div
                        key={s.num}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12, duration: 0.4 }}
                        className="card p-6 text-center"
                        style={{ background: "rgba(16,16,16,0.85)", backdropFilter: "blur(8px)" }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ background: "var(--green-trace)", color: "var(--green)" }}
                        >
                          {s.icon}
                        </div>
                        <div
                          className="font-black text-2xl mb-1 font-mono-jn"
                          style={{ color: "var(--border-strong)" }}
                        >
                          {s.num}
                        </div>
                        <h3 className="font-bold text-sm mb-2" style={{ color: "var(--text-cream)" }}>
                          {s.title}
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                          {s.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Honest note */}
                  <div
                    className="p-4 rounded border border-[rgba(57,255,20,0.2)] mb-8 text-center"
                    style={{ background: "var(--green-trace)" }}
                  >
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      <strong style={{ color: "var(--green)" }}>Phase 1:</strong> The scanner is live — paste any Solana or EVM address to get a real trust score backed by on-chain data including holder concentration, liquidity signals, and deployer history.
                      If a signal can&apos;t be read, we say so.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={enter} className="btn-primary text-base px-10 py-4">
                      Enter The Janitor Network <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={() => setStep(0)}
                      className="btn-ghost text-sm px-6 py-3"
                    >
                      Back
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom strip */}
          <div
            className="relative z-10 border-t border-[var(--border-faint)] py-3 px-6 flex items-center justify-center gap-4"
            style={{ background: "rgba(6,6,6,0.8)" }}
          >
            <span
              className="text-[10px] tracking-[0.2em] uppercase font-mono-jn"
              style={{ color: "var(--text-faint)" }}
            >
              Not financial advice · Educational only · Phase 1 of 7
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
