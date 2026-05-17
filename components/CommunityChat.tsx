"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Shield, Send, AlertTriangle, Ban, X, CheckCircle, XCircle, AtSign, ArrowDown } from "lucide-react";
import Image from "next/image";

interface ChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  type: "user" | "tj" | "system";
}

const HANDLE_RE = /^[a-zA-Z0-9_-]{2,24}$/;

const JOIN_RULES = [
  { num: "01", rule: "Talk about Janitor — share intel, discuss projects, analyze on-chain data.", red: false },
  { num: "02", rule: "Zero shilling — no promoting tokens you hold, no buy pressure, no price calls.", red: false },
  { num: "03", rule: "Data over drama — back claims with wallets, contracts, or evidence.", red: false },
  { num: "04", rule: "No financial advice — share intelligence, not investment calls.", red: false },
  { num: "05", rule: "Anonymity is respected — doxxing another member = instant permanent ban.", red: false },
  { num: "06", rule: "Tag @TJ to get the AI. TJ monitors silently otherwise — don't spam it.", red: false },
  { num: "07", rule: "One standard, no exceptions — rules apply equally to everyone.", red: false },
  { num: "08", rule: "Zero tolerance: slurs, threats, sexual content, phishing = instant permanent ban. No warnings.", red: true },
];

const PALETTE = [
  "#7c3aed","#2563eb","#0891b2","#059669",
  "#d97706","#c026d3","#e11d48","#0f766e",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

// ─── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg, me }: { msg: ChatMessage; me: string }) {
  const isTJ     = msg.type === "tj";
  const isSys    = msg.type === "system";
  const isMe     = !isTJ && !isSys && msg.username.toLowerCase() === me.toLowerCase();

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isTJ ? (
          <div className="w-10 h-10 rounded-full overflow-hidden"
            style={{ border: "2px solid var(--green)", boxShadow: "0 0 10px rgba(57,255,20,0.22)" }}>
            <Image src="/mascot/0E25E965-C0CE-4836-8CBA-E04603295FFB.jpeg" alt="TJ" width={40} height={40} className="object-cover w-full h-full" />
          </div>
        ) : isSys ? (
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)" }}>
            <Ban size={15} style={{ color: "var(--red)" }} />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
            style={{ background: avatarColor(msg.username), color: "#fff", border: isMe ? "2px solid var(--green)" : "2px solid transparent" }}>
            {msg.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-bold"
            style={{ color: isTJ ? "var(--green)" : isSys ? "var(--red)" : isMe ? "var(--text-cream)" : "var(--text-silver)" }}>
            {isTJ ? "TJ — The Janitor" : msg.username}
            {isMe && <span className="ml-1.5 text-[9px] font-normal" style={{ color: "var(--text-faint)" }}>(you)</span>}
          </span>
          {isTJ && (
            <span className="text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5"
              style={{ color: "var(--green)", background: "rgba(57,255,20,0.08)", border: "1px solid rgba(57,255,20,0.2)" }}>
              AI
            </span>
          )}
          <span className="text-[9px] font-mono-jn ml-auto" style={{ color: "var(--text-faint)" }}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {isTJ ? (
          <div className="text-sm leading-relaxed break-words"
            style={{ color: "var(--text-silver)", background: "linear-gradient(135deg,rgba(57,255,20,0.07),rgba(57,255,20,0.03))", border: "1px solid rgba(57,255,20,0.14)", borderLeft: "3px solid var(--green)", borderRadius: "0 10px 10px 0", padding: "10px 14px" }}>
            {msg.text}
          </div>
        ) : isSys ? (
          <div className="text-sm leading-relaxed break-words"
            style={{ color: "#fca5a5", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderLeft: "3px solid var(--red)", borderRadius: "0 10px 10px 0", padding: "10px 14px" }}>
            {msg.text}
          </div>
        ) : (
          <p className="text-sm leading-relaxed break-words" style={{ color: "var(--text-silver)" }}>{msg.text}</p>
        )}
      </div>
    </div>
  );
}

function TJTyping() {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
        style={{ border: "2px solid var(--green)", boxShadow: "0 0 10px rgba(57,255,20,0.22)" }}>
        <Image src="/mascot/0E25E965-C0CE-4836-8CBA-E04603295FFB.jpeg" alt="TJ" width={40} height={40} className="object-cover w-full h-full" />
      </div>
      <div className="flex-1">
        <div className="text-xs font-bold mb-1" style={{ color: "var(--green)" }}>TJ — The Janitor</div>
        <div className="inline-flex items-center gap-1.5 px-4 py-3"
          style={{ background: "rgba(57,255,20,0.06)", border: "1px solid rgba(57,255,20,0.14)", borderLeft: "3px solid var(--green)", borderRadius: "0 10px 10px 0" }}>
          {[0,1,2].map(i => (
            <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
              style={{ background: "var(--green)", animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Join gate ─────────────────────────────────────────────────────────────────
function JoinGate({ onJoin }: { onJoin: (h: string) => void }) {
  const [handle, setHandle]  = useState("");
  const [agreed, setAgreed]  = useState(false);
  const [checking, setCheck] = useState(false);
  const [apiErr, setApiErr]  = useState("");

  const trimmed  = handle.trim();
  const valid    = HANDLE_RE.test(trimmed);
  const tooShort = trimmed.length > 0 && trimmed.length < 2;
  const badChars = trimmed.length >= 2 && !HANDLE_RE.test(trimmed);
  const canGo    = valid && agreed && !checking;

  const submit = async () => {
    if (!valid) { setApiErr("Handle must be 2–24 characters: letters, numbers, _ or - only."); return; }
    if (!agreed) { setApiErr("You must agree to the community rules before entering."); return; }
    if (checking) return;
    setCheck(true); setApiErr("");
    try {
      const res  = await fetch("/api/community", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: trimmed }),
      });
      const data = await res.json();
      if (data.banned) { setApiErr("This handle has been permanently banned."); setCheck(false); return; }
      if (!data.ok)    { setApiErr(data.error ?? "Handle not available."); setCheck(false); return; }
      onJoin(trimmed);
    } catch { setApiErr("Connection error. Try again."); setCheck(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-7 flex flex-col gap-5"
      style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border-mid) transparent" }}>

      {/* TJ intro */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-16 h-16 rounded-full overflow-hidden"
          style={{ border: "3px solid var(--green)", boxShadow: "0 0 24px rgba(57,255,20,0.28)" }}>
          <Image src="/mascot/0E25E965-C0CE-4836-8CBA-E04603295FFB.jpeg" alt="TJ" width={64} height={64} className="object-cover w-full h-full" />
        </div>
        <div>
          <h3 className="font-black text-lg mb-1" style={{ color: "var(--text-cream)" }}>Join The Clean Room</h3>
          <p className="text-xs leading-relaxed max-w-xs mx-auto" style={{ color: "var(--text-muted)" }}>
            Pick a handle, read the rules, agree. Then you&apos;re in. TJ monitors everything silently —
            tag <strong style={{ color: "var(--green)" }}>@TJ</strong> when you need the AI.
          </p>
        </div>
      </div>

      {/* Handle input */}
      <div>
        <label className="block text-[10px] font-black tracking-widest uppercase mb-1.5" style={{ color: "var(--text-muted)" }}>
          Choose Your Handle
        </label>
        <p className="text-[10px] mb-2.5 leading-relaxed" style={{ color: "var(--text-faint)" }}>
          Your anonymous username — no real name or email required. 2–24 characters.
          Use letters, numbers, underscores, or hyphens. No spaces.
        </p>
        <div className="relative">
          <input
            type="text"
            value={handle}
            onChange={e => { setHandle(e.target.value); setApiErr(""); }}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="e.g. CryptoWatcher or anon_9182"
            maxLength={24}
            autoFocus
            className="w-full bg-transparent text-sm outline-none"
            style={{
              border: valid ? "1px solid rgba(57,255,20,0.5)" : (tooShort || badChars) ? "1px solid rgba(239,68,68,0.4)" : "1px solid var(--border-subtle)",
              borderRadius: 8, padding: "11px 40px 11px 14px", color: "var(--text-cream)",
            }}
          />
          {trimmed.length >= 2 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {valid ? <CheckCircle size={14} style={{ color: "var(--green)" }} /> : <XCircle size={14} style={{ color: "var(--red)" }} />}
            </div>
          )}
        </div>
        <div className="flex justify-between mt-1.5">
          <p className="text-[10px]" style={{ color: tooShort || badChars ? "var(--red)" : "var(--text-faint)" }}>
            {tooShort
              ? "Too short — needs at least 2 characters"
              : badChars
              ? "Only letters, numbers, _ and - are allowed"
              : trimmed.length === 0
              ? "Pick something you'll use consistently"
              : valid
              ? "Looks good — pick a name you remember"
              : "2–24 chars · letters, numbers, underscores, hyphens"}
          </p>
          <span className="text-[10px] font-mono-jn" style={{ color: trimmed.length > 20 ? "var(--green)" : "var(--text-faint)" }}>
            {trimmed.length}/24
          </span>
        </div>
        {apiErr && <p className="text-xs mt-1.5 font-semibold" style={{ color: "var(--red)" }}>{apiErr}</p>}
      </div>

      {/* Rules */}
      <div>
        <div className="flex items-center gap-2 px-4 py-2.5"
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border-faint)", borderBottom: "none", borderRadius: "8px 8px 0 0" }}>
          <Shield size={11} style={{ color: "var(--green)" }} />
          <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: "var(--text-cream)" }}>
            Community Rules — Read Before Entering
          </span>
        </div>
        <div style={{ border: "1px solid var(--border-faint)", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
          {JOIN_RULES.map((r, i) => (
            <div key={r.num} className="flex gap-3 px-4 py-3"
              style={{ borderBottom: i < JOIN_RULES.length - 1 ? "1px solid var(--border-faint)" : "none", background: i % 2 === 0 ? "var(--bg-charcoal)" : "var(--bg-panel)" }}>
              <span className="text-[10px] font-black font-mono-jn flex-shrink-0 mt-0.5"
                style={{ color: r.red ? "var(--red)" : "var(--green)", opacity: 0.85 }}>
                {r.num}
              </span>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{r.rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mt-0.5 transition-all"
          style={{ background: agreed ? "var(--green)" : "var(--bg-panel)", border: `2px solid ${agreed ? "var(--green)" : "var(--border-subtle)"}` }}
          onClick={() => setAgreed(v => !v)}>
          {agreed && <CheckCircle size={11} style={{ color: "#060606" }} />}
        </div>
        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="sr-only" />
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          I have read and agree to The Clean Room rules. I understand that moderation is automatic
          and final — violations result in permanent bans with no appeals. Nothing here is financial advice.
        </p>
      </label>

      {/* Submit */}
      <button onClick={submit} disabled={checking}
        className="w-full py-3.5 text-sm font-black tracking-widest uppercase transition-all duration-200"
        style={{
          background: canGo ? "var(--green)" : "var(--bg-panel)",
          color: canGo ? "#060606" : valid && !agreed ? "var(--amber)" : "var(--text-faint)",
          border: `1px solid ${canGo ? "var(--green)" : valid && !agreed ? "rgba(245,158,11,0.4)" : "var(--border-subtle)"}`,
          borderRadius: 8, cursor: checking ? "wait" : "pointer",
          boxShadow: canGo ? "0 0 20px rgba(57,255,20,0.22)" : "none",
        }}>
        {checking
          ? "Checking…"
          : !valid && trimmed.length > 0
          ? "Fix your handle to continue"
          : valid && !agreed
          ? "Agree to the rules to continue ↑"
          : "Enter The Clean Room →"}
      </button>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export default function CommunityChat() {
  const [joined,   setJoined]   = useState(false);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input,    setInput]    = useState("");
  const [sending,  setSending]  = useState(false);
  const [banned,   setBanned]   = useState(false);
  const [error,    setError]    = useState("");
  const [tjTyping, setTjTyping] = useState(false);
  const [total,    setTotal]    = useState(0);
  const [atBottom, setAtBottom] = useState(true);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const lastTJId     = useRef("");
  const tjTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const h = localStorage.getItem("cleanroom_handle");
    const a = localStorage.getItem("cleanroom_agreed_v2");
    if (h && a === "true") { setUsername(h); setJoined(true); }
  }, []);

  const fetchMsgs = useCallback(async () => {
    try {
      const res  = await fetch("/api/community");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.messages)) setMessages(data.messages);
      if (typeof data.totalMessages === "number") setTotal(data.totalMessages);
      if (Array.isArray(data.bannedUsers) && username && data.bannedUsers.includes(username.toLowerCase())) setBanned(true);
      const latestTJ = [...(data.messages ?? [])].reverse().find((m: ChatMessage) => m.type === "tj");
      if (latestTJ && latestTJ.id !== lastTJId.current) {
        lastTJId.current = latestTJ.id;
        setTjTyping(false);
        if (tjTimer.current) clearTimeout(tjTimer.current);
      }
    } catch { /* ignore */ }
  }, [username]);

  useEffect(() => {
    fetchMsgs();
    pollRef.current = setInterval(fetchMsgs, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (tjTimer.current) clearTimeout(tjTimer.current);
    };
  }, [fetchMsgs]);

  // Track whether user is near the bottom of the chat
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distFromBottom < 120);
  }, []);

  // Only auto-scroll when user is already at the bottom
  useEffect(() => {
    if (atBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, tjTyping, atBottom]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setAtBottom(true);
  };

  const handleJoin = (h: string) => {
    setUsername(h); setJoined(true);
    localStorage.setItem("cleanroom_handle",   h);
    localStorage.setItem("cleanroom_agreed_v2","true");
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const leave = () => {
    setJoined(false); setUsername("");
    localStorage.removeItem("cleanroom_handle");
    localStorage.removeItem("cleanroom_agreed_v2");
  };

  const send = async () => {
    if (!input.trim() || sending || banned) return;
    const text = input.trim();
    setSending(true); setError(""); setInput("");
    const callsTJ = /@tj\b|@janitor\b|hey\s+tj[\s,!?]|\btj[,—:]\s/i.test(text);
    try {
      const res  = await fetch("/api/community", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, text }),
      });
      const data = await res.json();
      if (data.banned) { setBanned(true); setError(data.error ?? "Permanently removed."); }
      else if (res.status === 429) { setError(data.error ?? "Too many messages."); setInput(text); }
      else if (data.error && !data.success && !data.filtered) { setError(data.error); setInput(text); }
      else if (Array.isArray(data.messages)) {
        setMessages(data.messages);
        if (typeof data.totalMessages === "number") setTotal(data.totalMessages);
        if (data.filtered && data.warning) { setError(data.warning); }
        else if (callsTJ) {
          setTjTyping(true);
          tjTimer.current = setTimeout(() => setTjTyping(false), 25000);
        }
      }
    } catch { setError("Failed to send. Check your connection."); setInput(text); }
    finally  { setSending(false); inputRef.current?.focus(); scrollToBottom(); }
  };

  return (
    <div className="flex flex-col overflow-hidden h-full"
      style={{ background: "var(--bg-charcoal)", border: "1px solid var(--border-subtle)", borderRadius: 12, minHeight: 820 }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0 border-b border-[var(--border-faint)]"
        style={{ background: "var(--bg-panel)" }}>
        <div className="relative flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse-green" style={{ background: "var(--green)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black" style={{ color: "var(--text-cream)" }}>The Clean Room</div>
          <div className="text-[10px] font-mono-jn" style={{ color: "var(--text-faint)" }}>
            {joined ? `${total} messages · tag @TJ to call the AI` : "Join required to chat"}
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 flex-shrink-0"
          style={{ background: "var(--green-trace)", border: "1px solid rgba(57,255,20,0.25)" }}>
          <Shield size={10} style={{ color: "var(--green)" }} />
          <span className="text-[9px] font-mono-jn tracking-widest uppercase" style={{ color: "var(--green)" }}>TJ Active</span>
        </div>
      </div>

      {/* Gate or Chat */}
      {!joined ? (
        <JoinGate onJoin={handleJoin} />
      ) : (
        <>
          {/* Messages */}
          <div className="relative flex-1 overflow-hidden">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-full overflow-y-auto px-5 py-5 space-y-5"
              style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border-mid) transparent" }}
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <Shield size={18} style={{ color: "var(--text-faint)" }} />
                  <p className="text-xs" style={{ color: "var(--text-faint)" }}>Loading messages…</p>
                </div>
              )}
              {messages.map(msg => <Bubble key={msg.id} msg={msg} me={username} />)}
              {tjTyping && <TJTyping />}
              <div ref={bottomRef} />
            </div>

            {/* Jump-to-bottom button when scrolled up */}
            {!atBottom && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-3 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{ background: "var(--green)", color: "#060606", boxShadow: "0 2px 12px rgba(57,255,20,0.35)" }}
              >
                <ArrowDown size={12} /> Latest
              </button>
            )}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-[var(--border-faint)] p-4" style={{ background: "var(--bg-panel)" }}>
            {banned ? (
              <div className="flex items-center gap-3 p-4 rounded-lg"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <Ban size={16} style={{ color: "var(--red)", flexShrink: 0 }} />
                <div>
                  <div className="text-sm font-bold mb-0.5" style={{ color: "var(--red)" }}>Permanently Removed</div>
                  <p className="text-xs" style={{ color: "#fca5a5" }}>TJ has removed this handle. Bans are final — no appeals.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{ background: avatarColor(username), color: "#fff", border: "1.5px solid var(--green)" }}>
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                    <strong style={{ color: "var(--text-muted)" }}>{username}</strong>
                  </span>
                  <button onClick={leave} className="text-[10px] underline ml-1" style={{ color: "var(--text-faint)" }}>leave</button>
                  <div className="ml-auto flex items-center gap-1">
                    <AtSign size={9} style={{ color: "var(--text-faint)" }} />
                    <span className="text-[9px] font-mono-jn" style={{ color: "var(--text-faint)" }}>type @TJ to call the AI</span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 mb-2.5 px-3 py-2 rounded-lg"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertTriangle size={11} style={{ color: "var(--red)", flexShrink: 0 }} />
                    <span className="text-xs flex-1" style={{ color: "var(--red)" }}>{error}</span>
                    <button onClick={() => setError("")}><X size={11} style={{ color: "var(--red)" }} /></button>
                  </div>
                )}

                <div className="flex items-center gap-2"
                  style={{ border: "1px solid var(--border-subtle)", borderRadius: 10, background: "var(--bg-charcoal)", padding: "2px 4px 2px 14px" }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Talk freely, share intel, or tag @TJ for the AI…"
                    maxLength={500}
                    disabled={sending}
                    className="flex-1 bg-transparent text-sm outline-none py-3"
                    style={{ color: "var(--text-cream)", opacity: sending ? 0.6 : 1 }}
                  />
                  {input.length > 420 && (
                    <span className="text-[10px] font-mono-jn flex-shrink-0" style={{ color: input.length > 480 ? "var(--red)" : "var(--text-faint)" }}>
                      {500 - input.length}
                    </span>
                  )}
                  <button onClick={send} disabled={sending || !input.trim()}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 flex-shrink-0"
                    style={{
                      background: input.trim() && !sending ? "var(--green)" : "transparent",
                      border: `1px solid ${input.trim() && !sending ? "var(--green)" : "var(--border-faint)"}`,
                      color: input.trim() && !sending ? "#060606" : "var(--text-faint)",
                    }}>
                    <Send size={15} />
                  </button>
                </div>
                <p className="text-[9px] mt-2 font-mono-jn" style={{ color: "var(--text-faint)" }}>
                  Enter to send · @TJ calls the AI · violations removed before posting · bans permanent · not financial advice
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
