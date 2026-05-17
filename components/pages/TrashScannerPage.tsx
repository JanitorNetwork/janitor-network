"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertTriangle, CheckCircle, Clock, Wifi, Globe, Shield, XCircle } from "lucide-react";
import JaniMascot from "@/components/JaniMascot";
import PageHeader from "@/components/PageHeader";

type ScanStatus = "idle" | "scanning" | "clean" | "threat" | "warning";

interface ScanResult {
  status: "clean" | "threat" | "warning";
  score: number;
  checks: { label: string; result: "pass" | "fail" | "warn"; detail: string }[];
  metadata: { label: string; value: string }[];
}

function mockScan(input: string): Promise<ScanResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isSuspicious = input.includes("malware") || input.includes("phish") || input.includes("evil");
      const hasWarning = input.includes("warn") || input.length > 50;

      if (isSuspicious) {
        resolve({
          status: "threat",
          score: 12,
          checks: [
            { label: "Domain Reputation", result: "fail", detail: "Listed in 4 threat intelligence feeds" },
            { label: "SSL Certificate", result: "fail", detail: "Certificate expired 14 days ago" },
            { label: "Malware Signatures", result: "fail", detail: "Matches known malware pattern: TROJAN.WIN32.GENERIC" },
            { label: "Phishing Indicators", result: "warn", detail: "2 lookalike domain matches detected" },
            { label: "DNS Records", result: "pass", detail: "Resolves normally" },
          ],
          metadata: [
            { label: "IP Address", value: "185.234.219.17" },
            { label: "ASN", value: "AS202422 G-Core Labs" },
            { label: "Country", value: "RU" },
            { label: "First Seen", value: "2024-11-03" },
            { label: "Category", value: "Malware Distribution" },
          ],
        });
      } else if (hasWarning) {
        resolve({
          status: "warning",
          score: 61,
          checks: [
            { label: "Domain Reputation", result: "pass", detail: "No active flags" },
            { label: "SSL Certificate", result: "warn", detail: "Certificate expires in 12 days" },
            { label: "Malware Signatures", result: "pass", detail: "No known signatures" },
            { label: "Phishing Indicators", result: "warn", detail: "New domain — registered 3 days ago" },
            { label: "DNS Records", result: "pass", detail: "Records nominal" },
          ],
          metadata: [
            { label: "IP Address", value: "104.21.44.18" },
            { label: "ASN", value: "AS13335 Cloudflare" },
            { label: "Country", value: "US" },
            { label: "First Seen", value: "2026-05-13" },
            { label: "Category", value: "Unknown / New" },
          ],
        });
      } else {
        resolve({
          status: "clean",
          score: 97,
          checks: [
            { label: "Domain Reputation", result: "pass", detail: "Clean across all feeds" },
            { label: "SSL Certificate", result: "pass", detail: "Valid — expires 2027-03-12" },
            { label: "Malware Signatures", result: "pass", detail: "No signatures found" },
            { label: "Phishing Indicators", result: "pass", detail: "No lookalike domains detected" },
            { label: "DNS Records", result: "pass", detail: "All records nominal" },
          ],
          metadata: [
            { label: "IP Address", value: "172.67.181.42" },
            { label: "ASN", value: "AS13335 Cloudflare" },
            { label: "Country", value: "US" },
            { label: "First Seen", value: "2019-04-17" },
            { label: "Category", value: "Trusted Infrastructure" },
          ],
        });
      }
    }, 2800);
  });
}

const resultColors = {
  clean: { text: "#00ff41", bg: "#00ff4108", border: "#00ff4125" },
  threat: { text: "#ff4141", bg: "#ff414108", border: "#ff414125" },
  warning: { text: "#ffaa00", bg: "#ffaa0008", border: "#ffaa0025" },
};

const checkIcons = {
  pass: CheckCircle,
  fail: XCircle,
  warn: AlertTriangle,
};

const checkColors = {
  pass: "#00ff41",
  fail: "#ff4141",
  warn: "#ffaa00",
};

export default function TrashScannerPage() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleScan = async () => {
    if (!input.trim() || status === "scanning") return;
    setStatus("scanning");
    setResult(null);

    try {
      const res = await mockScan(input.trim());
      setResult(res);
      setStatus(res.status);
      setHistory((prev) => [input.trim(), ...prev.slice(0, 4)]);
    } catch {
      setStatus("idle");
    }
  };

  const mascotMood = status === "scanning" ? "scanning" : status === "threat" ? "alert" : status === "clean" ? "happy" : "idle";

  return (
    <div className="min-h-screen bg-[#080808] pt-16">
      <PageHeader
        tag="TRASH SCANNER"
        title="Scan anything. Trust nothing."
        description="Submit a URL, IP, domain, or hash. Jani tears it apart."
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Scan Input */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="mono text-[10px] text-[#444] tracking-[0.3em]">TARGET</span>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                placeholder="https://example.com, 192.168.1.1, domain.net..."
                className="w-full bg-[#080808] border border-[#1a1a1a] text-[#e8e8e8] mono text-sm px-4 py-3 focus:outline-none focus:border-[#00ff4140] placeholder:text-[#333] transition-colors"
              />
              {input && (
                <button
                  onClick={() => setInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#e8e8e8] transition-colors"
                >
                  <XCircle size={14} />
                </button>
              )}
            </div>
            <button
              onClick={handleScan}
              disabled={!input.trim() || status === "scanning"}
              className="px-6 py-3 bg-[#00ff41] text-[#080808] text-xs font-black tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#00cc33] transition-colors flex items-center gap-2"
            >
              {status === "scanning" ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Search size={14} />
                  </motion.div>
                  Scanning
                </>
              ) : (
                <>
                  <Search size={14} />
                  Scan
                </>
              )}
            </button>
          </div>

          {/* Recent history */}
          {history.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {history.map((h) => (
                <button
                  key={h}
                  onClick={() => setInput(h)}
                  className="mono text-[10px] text-[#444] border border-[#1a1a1a] px-2 py-1 hover:text-[#888] hover:border-[#333] transition-colors"
                >
                  {h.length > 30 ? h.slice(0, 30) + "…" : h}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scanning state */}
        <AnimatePresence mode="wait">
          {status === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 py-16"
            >
              <JaniMascot size="lg" mood="scanning" />
              <div className="text-center">
                <div className="mono text-xs text-[#00ccff] tracking-[0.3em] animate-pulse-green mb-2">SCANNING IN PROGRESS</div>
                <div className="mono text-[10px] text-[#444]">{input}</div>
              </div>
              <div className="w-64 h-px bg-[#1a1a1a] relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[#00ccff]"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}

          {result && status !== "scanning" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Score header */}
              <div
                className="border p-6 mb-4 flex items-center gap-6"
                style={{
                  background: resultColors[result.status].bg,
                  borderColor: resultColors[result.status].border,
                }}
              >
                <JaniMascot size="sm" mood={mascotMood as any} />
                <div className="flex-1">
                  <div className="mono text-[10px] tracking-[0.3em] mb-1" style={{ color: resultColors[result.status].text }}>
                    {result.status === "clean" ? "CLEAN — NO THREATS FOUND" : result.status === "threat" ? "THREAT DETECTED" : "WARNING — REVIEW RECOMMENDED"}
                  </div>
                  <div className="text-2xl font-black" style={{ color: resultColors[result.status].text }}>
                    Safety Score: {result.score}/100
                  </div>
                  <div className="mono text-xs text-[#444] mt-1 break-all">{input}</div>
                </div>
                <div
                  className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-xl font-black mono"
                  style={{
                    borderColor: resultColors[result.status].text,
                    color: resultColors[result.status].text,
                  }}
                >
                  {result.score}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Checks */}
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
                  <div className="mono text-[10px] text-[#444] tracking-[0.3em] uppercase mb-4">Security Checks</div>
                  <div className="space-y-3">
                    {result.checks.map((check) => {
                      const Icon = checkIcons[check.result];
                      return (
                        <div key={check.label} className="flex items-start gap-3">
                          <Icon size={14} style={{ color: checkColors[check.result], flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <div className="text-sm text-[#e8e8e8] font-medium">{check.label}</div>
                            <div className="mono text-xs text-[#555] mt-0.5">{check.detail}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
                  <div className="mono text-[10px] text-[#444] tracking-[0.3em] uppercase mb-4">Target Metadata</div>
                  <div className="space-y-3">
                    {result.metadata.map((item) => (
                      <div key={item.label} className="flex justify-between items-center border-b border-[#111] pb-3 last:border-0 last:pb-0">
                        <span className="mono text-xs text-[#444]">{item.label}</span>
                        <span className="mono text-xs text-[#e8e8e8]">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setStatus("idle"); setResult(null); setInput(""); inputRef.current?.focus(); }}
                className="mt-4 w-full py-3 border border-[#1a1a1a] text-xs mono text-[#444] tracking-widest uppercase hover:border-[#00ff4130] hover:text-[#00ff41] transition-all"
              >
                Scan Another Target
              </button>
            </motion.div>
          )}

          {status === "idle" && !result && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-20 text-center"
            >
              <JaniMascot size="md" mood="idle" />
              <div className="mono text-xs text-[#333] tracking-widest mt-4">
                ENTER A TARGET ABOVE TO BEGIN
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6 max-w-sm w-full">
                {[
                  { icon: Globe, label: "URLs" },
                  { icon: Wifi, label: "IP Addresses" },
                  { icon: Shield, label: "Domains" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="bg-[#0a0a0a] border border-[#1a1a1a] p-3 flex flex-col items-center gap-2">
                    <Icon size={16} className="text-[#333]" />
                    <span className="mono text-[9px] text-[#333] tracking-widest">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
