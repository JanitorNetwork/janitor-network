"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RotateCcw, Zap } from "lucide-react";
import JaniMascot from "@/components/JaniMascot";

interface Message {
  role: "user" | "jani";
  content: string;
  id: number;
}

const starterPrompts = [
  "How do I detect a phishing email?",
  "What is a zero-day exploit?",
  "How should I harden a new Linux server?",
  "Explain SQL injection in simple terms.",
  "What's the difference between a virus and ransomware?",
  "How do I set up 2FA properly?",
];

const responses: Record<string, string> = {
  default: "That's a sharp question. In the cybersecurity world, the short answer is: it depends on your threat model. Let me break it down for you...\n\nThe key factors are: (1) your attack surface, (2) who your adversary is, and (3) what you're protecting. Without those three anchors, any advice is just noise.\n\nWant me to dig deeper into any specific angle?",
  phishing: "Phishing emails have a few tells that Jani always checks:\n\n**Sender mismatch** — The display name says \"PayPal\" but the actual address is paypal-secure@randomdomain.ru. Always expand the sender field.\n\n**Urgency language** — \"Your account will be suspended in 24 hours!\" is a manipulation tactic. Real companies rarely demand immediate action via email.\n\n**Hover before you click** — Hover over any link. If the URL doesn't match the stated destination, it's a trap.\n\n**Attachment suspicion** — .exe, .zip, .docm files from unknown senders are almost always malicious.\n\nWant me to analyze a specific email you received?",
  "zero-day": "A zero-day is a vulnerability that the software vendor doesn't know about yet — so they've had zero days to fix it.\n\nHere's the lifecycle:\n1. Researcher (or attacker) discovers a flaw\n2. If malicious: they exploit it before a patch exists\n3. When the vendor finds out: they race to release a fix\n4. After the patch: it's no longer technically a zero-day\n\nZero-days are extremely valuable on the black market. Nation-state actors pay millions for working exploits in widely-used software.\n\nThe best defense? Patch aggressively once fixes are available, and layer your defenses so a single exploit doesn't mean total compromise.",
  harden: "Server hardening checklist — Jani approved:\n\n**Immediately after provisioning:**\n• Change all default credentials\n• Update everything: `apt update && apt upgrade -y`\n• Disable root SSH login (`PermitRootLogin no` in sshd_config)\n• Set up key-based authentication, disable password auth\n\n**Firewall:**\n• Enable UFW: allow only what you need (22, 80, 443)\n• Default deny inbound, allow outbound\n\n**Services:**\n• Disable unused services: `systemctl disable <service>`\n• Remove unnecessary software\n\n**Monitoring:**\n• Install fail2ban for SSH brute-force protection\n• Set up auditd for system call logging\n• Configure log shipping to a SIEM\n\nWant me to walk through any of these steps in detail?",
};

function getJaniResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("phish")) return responses.phishing;
  if (lower.includes("zero-day") || lower.includes("zero day") || lower.includes("zeroday")) return responses["zero-day"];
  if (lower.includes("harden") || lower.includes("linux server") || lower.includes("secure server")) return responses.harden;
  return responses.default;
}

let messageId = 0;

export default function JaniAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "jani",
      content: "Hey. I'm Jani — your cybersecurity companion.\n\nAsk me anything about threats, vulnerabilities, defenses, or the network. I'm here to help you clean up the web.",
      id: messageId++,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || typing) return;

    const userMsg: Message = { role: "user", content, id: messageId++ };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const janiMsg: Message = { role: "jani", content: getJaniResponse(content), id: messageId++ };
    setMessages((prev) => [...prev, janiMsg]);
    setTyping(false);
  };

  const reset = () => {
    setMessages([{
      role: "jani",
      content: "Session cleared. Fresh start. What do you need?",
      id: messageId++,
    }]);
    setInput("");
    setTyping(false);
  };

  const mascotMood = typing ? "scanning" : "happy";

  return (
    <div className="min-h-screen bg-[#080808] pt-16 flex flex-col">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] bg-[#080808] pt-8 pb-6">
        <div className="max-w-3xl mx-auto px-6 flex items-center gap-4">
          <JaniMascot size="sm" mood={mascotMood} />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-black text-[#e8e8e8]">Jani Assistant</h1>
              <span className="mono text-[9px] tracking-widest bg-[#00ff4110] text-[#00ff41] border border-[#00ff4125] px-2 py-0.5">AI</span>
            </div>
            <div className="mono text-xs text-[#444] flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse-green" />
              Online · Cybersecurity-focused
            </div>
          </div>
          <button
            onClick={reset}
            className="ml-auto text-[#333] hover:text-[#888] transition-colors"
            title="Clear conversation"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "jani" && (
                <div className="flex-shrink-0 mt-1">
                  <JaniMascot size="sm" mood="idle" />
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#0f1a0f] border border-[#00ff4125] text-[#e8e8e8]"
                      : "bg-[#0a0a0a] border border-[#1a1a1a] text-[#c8c8c8]"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="mono text-[9px] text-[#333]">
                  {msg.role === "jani" ? "Jani" : "You"}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <JaniMascot size="sm" mood="scanning" />
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#00ff41]"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Starter prompts — only show if conversation just started */}
      {messages.length <= 1 && (
        <div className="max-w-3xl mx-auto px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {starterPrompts.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="mono text-[10px] text-[#444] border border-[#1a1a1a] px-3 py-2 hover:text-[#888] hover:border-[#333] transition-all text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[#1a1a1a] bg-[#080808]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask Jani anything about cybersecurity..."
              rows={1}
              className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] text-[#e8e8e8] text-sm px-4 py-3 focus:outline-none focus:border-[#00ff4140] placeholder:text-[#333] resize-none"
              style={{ minHeight: 44, maxHeight: 120 }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || typing}
              className="px-4 py-3 bg-[#00ff41] text-[#080808] disabled:opacity-40 hover:bg-[#00cc33] transition-colors flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="mono text-[9px] text-[#333] mt-2 text-center">
            Enter to send · Shift+Enter for new line · Jani is for educational use only
          </div>
        </div>
      </div>
    </div>
  );
}
