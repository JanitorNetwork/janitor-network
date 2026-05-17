"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, ChevronRight } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "What does the scanner check?",
  "What is holder concentration?",
  "What is a rug pull?",
  "What is $CLEAN used for?",
];

const FALLBACK_RESPONSES: Record<string, string> = {
  default:
    "I'm TJ. Set your ANTHROPIC_API_KEY to activate live AI.\n\nFor now: The Janitor Network scans wallets and token addresses for public risk signals — holder concentration, deployer history, liquidity security, volume patterns. Everything is on-chain truth, nothing manufactured.",
  holder:
    "Holder concentration: what percentage of a token's supply sits in the top wallets.\n\nIf the top 10 wallets control 80%+, a few players can tank the price at will. That's a risk signal — flagged in every scan.",
  liquidity:
    "Liquidity security: whether the pool backing a token can be yanked without warning.\n\nUnlocked LP means a dev can pull the floor at any time. We check for locks and burns on every scan.",
  deployer:
    "Deployer history traces the wallet that created a contract.\n\nHas it launched rugged projects? Bridged to mixers? Holds unusual amounts? Patterns matter. We trace it in every scan.",
  scanner:
    "Trash Scanner validates address formats and pulls live on-chain signals: holder distribution, liquidity security, deployer history, volume behavior.\n\nIf a signal can't be verified, we say so plainly — no manufactured confidence.",
  clean:
    "$CLEAN is the utility token. Fair launch on Solana — no pre-sale, no VC. Launch is Phase 2.\n\nStaking and utility features activate in Phase 5. No financial advice — do your own research.",
  rug: "Rug pull: devs abandon a project and drain the liquidity, crashing to zero.\n\nPatterns: anonymous deployer, unlocked LP, concentrated supply, sudden treasury movement. The Trash Scanner checks every one of these.",
};

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("holder"))    return FALLBACK_RESPONSES.holder;
  if (lower.includes("liquidity")) return FALLBACK_RESPONSES.liquidity;
  if (lower.includes("deployer"))  return FALLBACK_RESPONSES.deployer;
  if (lower.includes("scanner") || lower.includes("scan")) return FALLBACK_RESPONSES.scanner;
  if (lower.includes("clean") || lower.includes("token")) return FALLBACK_RESPONSES.clean;
  if (lower.includes("rug"))       return FALLBACK_RESPONSES.rug;
  return FALLBACK_RESPONSES.default;
}

// Typewriter component — animates characters for the latest TJ response
function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    setShown(0);
    doneRef.current = false;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setShown(i);
      if (i >= text.length && !doneRef.current) {
        doneRef.current = true;
        clearInterval(t);
        onDone?.();
      }
    }, 10);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <span style={{ whiteSpace: "pre-wrap" }}>
      {text.slice(0, shown)}
      {shown < text.length && (
        <span className="animate-blink" style={{ color: "var(--green)", marginLeft: 1 }}>▋</span>
      )}
    </span>
  );
}

let msgId = 0;

export default function TJChat() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: msgId++,
      role: "assistant",
      content:
        "I'm TJ — The Janitor.\n\nPaste a wallet or token address into the Trash Scanner and I'll help you read the signals. Or ask me anything about crypto risk, on-chain data, or how the network works.",
    },
  ]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [typingMsgId, setTypingMsgId] = useState<number | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open && aiAvailable === null) {
      fetch("/api/jani", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "ping" }] }),
      })
        .then(r => setAiAvailable(r.ok))
        .catch(() => setAiAvailable(false));
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open, aiAvailable]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || loading) return;

      const userMsg: Message = { id: msgId++, role: "user", content };
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      const history = [...messages, userMsg].map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      }));

      try {
        const res  = await fetch("/api/jani", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        const data = await res.json();

        if (res.ok && data.success && data.message) {
          setAiAvailable(true);
          const newMsg: Message = { id: msgId++, role: "assistant", content: data.message };
          setMessages(prev => [...prev, newMsg]);
          setTypingMsgId(newMsg.id);
        } else {
          setAiAvailable(false);
          const fallback: Message = { id: msgId++, role: "assistant", content: getFallbackResponse(content) };
          setMessages(prev => [...prev, fallback]);
          setTypingMsgId(fallback.id);
        }
      } catch {
        const fallback: Message = { id: msgId++, role: "assistant", content: getFallbackResponse(content) };
        setMessages(prev => [...prev, fallback]);
        setTypingMsgId(fallback.id);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading, messages]
  );

  const reset = () => {
    const resetMsg: Message = { id: msgId++, role: "assistant", content: "Session cleared. What do you need?" };
    setMessages([resetMsg]);
    setTypingMsgId(resetMsg.id);
    setInput("");
  };

  return (
    <>
      {/* ── Trigger button ── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        {!open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 pointer-events-none"
            style={{
              background: "rgba(6,6,6,0.95)",
              border: "1px solid rgba(57,255,20,0.25)",
              borderRadius: 3,
              boxShadow: "0 0 12px rgba(57,255,20,0.08)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-green flex-shrink-0" style={{ background: "var(--green)" }} />
            <span className="text-[9px] font-black font-mono-jn tracking-[0.25em] uppercase" style={{ color: "var(--green)" }}>
              TJ ONLINE
            </span>
          </motion.div>
        )}

        <button
          onClick={() => setOpen(v => !v)}
          className="relative flex items-center justify-center transition-all duration-200"
          style={{
            width: 52,
            height: 52,
            background: open ? "rgba(57,255,20,0.08)" : "#0a0a0a",
            border: `2px solid ${open ? "rgba(57,255,20,0.6)" : "rgba(57,255,20,0.3)"}`,
            borderRadius: 6,
            boxShadow: open
              ? "0 0 24px rgba(57,255,20,0.25), inset 0 0 12px rgba(57,255,20,0.05)"
              : "0 0 12px rgba(57,255,20,0.12)",
          }}
          aria-label={open ? "Close TJ command capsule" : "Open TJ command capsule"}
        >
          {open ? (
            <X size={16} style={{ color: "var(--green)" }} />
          ) : (
            <span
              className="font-black font-mono-jn"
              style={{ color: "var(--green)", fontSize: "0.65rem", letterSpacing: "0.1em", lineHeight: 1, textShadow: "0 0 8px rgba(57,255,20,0.6)" }}
            >
              TJ
            </span>
          )}
          {!open && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border"
              style={{ background: "var(--green)", borderColor: "#060606", boxShadow: "0 0 6px rgba(57,255,20,0.8)" }}
            />
          )}
        </button>
      </div>

      {/* ── Command capsule panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 flex flex-col"
            style={{
              bottom: 76,
              right: 20,
              width: "min(420px, calc(100vw - 24px))",
              maxHeight: "min(580px, calc(100vh - 100px))",
              background: "#050505",
              border: "1px solid rgba(57,255,20,0.35)",
              borderRadius: 6,
              boxShadow: "0 0 40px rgba(57,255,20,0.1), 0 0 0 1px rgba(57,255,20,0.04), 0 24px 60px rgba(0,0,0,0.9)",
              overflow: "hidden",
            }}
          >
            {/* Corner accent lines */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, rgba(57,255,20,0.6) 0%, rgba(57,255,20,0.1) 60%, transparent 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(57,255,20,0.08) 40%, rgba(57,255,20,0.25) 100%)" }} />

            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(57,255,20,0.12)", background: "rgba(57,255,20,0.03)" }}
            >
              {/* Status dot cluster */}
              <div className="flex gap-1.5 items-center flex-shrink-0">
                <span className="w-2 h-2 rounded-full animate-pulse-green" style={{ background: "var(--green)", boxShadow: "0 0 6px rgba(57,255,20,0.8)" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black tracking-[0.15em] uppercase font-mono-jn" style={{ color: "var(--green)" }}>
                    TJ-COMMAND
                  </span>
                  <span
                    className="text-[8px] font-bold tracking-widest uppercase font-mono-jn px-1.5 py-0.5"
                    style={{
                      color: aiAvailable === true ? "var(--green)" : "var(--text-faint)",
                      border: `1px solid ${aiAvailable === true ? "rgba(57,255,20,0.3)" : "var(--border-mid)"}`,
                      borderRadius: 2,
                      background: aiAvailable === true ? "var(--green-trace)" : "transparent",
                    }}
                  >
                    {aiAvailable === true ? "AI LIVE" : aiAvailable === false ? "LOCAL" : "INIT"}
                  </span>
                </div>
                <div className="text-[9px] font-mono-jn mt-0.5" style={{ color: "var(--text-faint)" }}>
                  Night shift active · Phase 1
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={reset}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: "var(--text-faint)" }}
                  title="Clear session"
                >
                  <RotateCcw size={12} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded transition-colors"
                  style={{ color: "var(--text-faint)" }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center mt-0.5"
                      style={{ background: "var(--green-trace)", border: "1px solid rgba(57,255,20,0.2)" }}
                    >
                      <span className="font-black font-mono-jn" style={{ color: "var(--green)", fontSize: "0.45rem", letterSpacing: "0.05em" }}>TJ</span>
                    </div>
                  )}
                  <div
                    className="max-w-[85%] text-xs leading-relaxed"
                    style={
                      msg.role === "assistant"
                        ? {
                            color: "var(--text-silver)",
                            fontFamily: "'Geist Mono', monospace",
                            background: "rgba(57,255,20,0.02)",
                            border: "1px solid rgba(57,255,20,0.08)",
                            borderRadius: "2px 8px 8px 8px",
                            padding: "10px 12px",
                          }
                        : {
                            color: "var(--text-cream)",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "8px 2px 8px 8px",
                            padding: "10px 12px",
                            textAlign: "right",
                          }
                    }
                  >
                    {msg.role === "assistant" && msg.id === typingMsgId
                      ? <TypewriterText text={msg.content} onDone={() => setTypingMsgId(null)} />
                      : <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
                    }
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2.5"
                  >
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center mt-0.5"
                      style={{ background: "var(--green-trace)", border: "1px solid rgba(57,255,20,0.2)" }}
                    >
                      <span className="font-black font-mono-jn" style={{ color: "var(--green)", fontSize: "0.45rem" }}>TJ</span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 px-3 py-2.5"
                      style={{ background: "rgba(57,255,20,0.02)", border: "1px solid rgba(57,255,20,0.08)", borderRadius: "2px 8px 8px 8px" }}
                    >
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{ background: "var(--green)" }}
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1.1, delay: i * 0.18, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Starter prompts */}
            {messages.length <= 1 && !loading && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-[9px] font-mono-jn tracking-wide px-2.5 py-1.5 transition-all duration-150"
                    style={{
                      color: "var(--text-faint)",
                      border: "1px solid var(--border-faint)",
                      borderRadius: 3,
                      background: "transparent",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(57,255,20,0.3)";
                      (e.currentTarget as HTMLElement).style.color = "var(--green)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border-faint)";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-faint)";
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Command input */}
            <div
              className="flex-shrink-0 px-4 py-3"
              style={{ borderTop: "1px solid rgba(57,255,20,0.1)", background: "rgba(0,0,0,0.4)" }}
            >
              <div
                className="flex items-center gap-2"
                style={{ background: "#0a0a0a", border: "1px solid rgba(57,255,20,0.2)", borderRadius: 4, padding: "10px 12px" }}
              >
                <ChevronRight size={12} style={{ color: "var(--green)", flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask TJ anything…"
                  className="flex-1 bg-transparent outline-none text-xs font-mono-jn placeholder:text-[var(--text-faint)] min-w-0"
                  style={{ color: "var(--text-cream)" }}
                  maxLength={500}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="flex-shrink-0 px-2.5 py-1 text-[8px] font-black tracking-[0.2em] uppercase font-mono-jn transition-all duration-150 disabled:opacity-25"
                  style={{
                    background: "var(--green)",
                    color: "#060606",
                    borderRadius: 3,
                    boxShadow: input.trim() && !loading ? "0 0 10px rgba(57,255,20,0.3)" : "none",
                  }}
                >
                  SEND
                </button>
              </div>
              <p className="text-[8px] font-mono-jn mt-1.5 text-center" style={{ color: "var(--text-faint)" }}>
                Educational only · Not financial advice
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
