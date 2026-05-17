"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Fingerprint, Lock, Shield, Mail, Globe, Hash } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import JaniMascot from "@/components/JaniMascot";

const verifyTypes = [
  { id: "email", icon: Mail, label: "Email", placeholder: "user@example.com" },
  { id: "domain", icon: Globe, label: "Domain", placeholder: "example.com" },
  { id: "certificate", icon: Lock, label: "SSL Certificate", placeholder: "Paste PEM or fingerprint..." },
  { id: "hash", icon: Hash, label: "File Hash", placeholder: "SHA-256 / MD5 hash..." },
];

interface VerifyResult {
  verified: boolean;
  confidence: number;
  details: { label: string; value: string; ok: boolean }[];
}

function mockVerify(type: string, input: string): Promise<VerifyResult> {
  return new Promise((res) => setTimeout(() => {
    const verified = !input.includes("fake") && !input.includes("invalid");
    res({
      verified,
      confidence: verified ? 94 : 12,
      details: [
        { label: "Format", value: "Valid syntax", ok: true },
        { label: "Reputation", value: verified ? "No flags" : "Flagged in 3 feeds", ok: verified },
        { label: "Registration", value: verified ? "Active, registered 2021" : "Unregistered or expired", ok: verified },
        { label: "DMARC / SPF", value: verified ? "Configured correctly" : "Not configured", ok: verified },
        { label: "Network Activity", value: verified ? "Normal" : "Anomalous traffic detected", ok: verified },
      ],
    });
  }, 2000));
}

export default function VerifyPage() {
  const [activeType, setActiveType] = useState(verifyTypes[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleVerify = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    const res = await mockVerify(activeType.id, input);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-16">
      <PageHeader
        tag="VERIFY"
        title="Trust, confirmed."
        description="Validate digital identities, certificates, and entities against our verification network."
      />

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Type selector */}
        <div className="grid grid-cols-4 gap-px bg-[#1a1a1a] mb-6">
          {verifyTypes.map((type) => {
            const Icon = type.icon;
            const active = activeType.id === type.id;
            return (
              <button
                key={type.id}
                onClick={() => { setActiveType(type); setResult(null); setInput(""); }}
                className={`flex flex-col items-center gap-2 p-4 transition-all ${
                  active ? "bg-[#00ff410a] text-[#00ff41]" : "bg-[#0a0a0a] text-[#444] hover:text-[#888] hover:bg-[#0f0f0f]"
                }`}
              >
                <Icon size={16} />
                <span className="mono text-[9px] tracking-widest uppercase">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 mb-6">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              placeholder={activeType.placeholder}
              className="flex-1 bg-[#080808] border border-[#1a1a1a] text-[#e8e8e8] mono text-sm px-4 py-3 focus:outline-none focus:border-[#00ff4140] placeholder:text-[#333]"
            />
            <button
              onClick={handleVerify}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-[#00ff41] text-[#080808] text-xs font-black tracking-widest uppercase disabled:opacity-40 hover:bg-[#00cc33] transition-colors flex items-center gap-2"
            >
              <Fingerprint size={14} />
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center py-16 gap-6">
              <JaniMascot size="md" mood="scanning" />
              <div className="mono text-xs text-[#444] tracking-widest">RUNNING VERIFICATION CHECKS...</div>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {/* Result header */}
              <div className={`border p-6 mb-4 flex items-center gap-6 ${
                result.verified ? "border-[#00ff4125] bg-[#00ff4108]" : "border-[#ff414125] bg-[#ff414108]"
              }`}>
                {result.verified
                  ? <CheckCircle size={32} className="text-[#00ff41] flex-shrink-0" />
                  : <XCircle size={32} className="text-[#ff4141] flex-shrink-0" />
                }
                <div>
                  <div className={`text-xl font-black ${result.verified ? "text-[#00ff41]" : "text-[#ff4141]"}`}>
                    {result.verified ? "VERIFIED" : "VERIFICATION FAILED"}
                  </div>
                  <div className="mono text-xs text-[#555] mt-1">
                    Confidence: {result.confidence}% · {activeType.label} · {input}
                  </div>
                </div>
              </div>

              {/* Detail checks */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
                <div className="mono text-[10px] text-[#444] tracking-[0.3em] uppercase mb-4">Verification Details</div>
                <div className="space-y-3">
                  {result.details.map((d) => (
                    <div key={d.label} className="flex items-center justify-between py-2 border-b border-[#111] last:border-0">
                      <div className="flex items-center gap-3">
                        {d.ok ? <CheckCircle size={12} className="text-[#00ff41]" /> : <XCircle size={12} className="text-[#ff4141]" />}
                        <span className="mono text-xs text-[#888]">{d.label}</span>
                      </div>
                      <span className="mono text-xs text-[#e8e8e8]">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setResult(null); setInput(""); }}
                className="mt-4 w-full py-3 border border-[#1a1a1a] text-xs mono text-[#444] tracking-widest uppercase hover:border-[#00ff4130] hover:text-[#00ff41] transition-all"
              >
                Verify Another
              </button>
            </motion.div>
          )}

          {!result && !loading && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center py-16 gap-4">
              <JaniMascot size="md" mood="idle" />
              <div className="mono text-xs text-[#333] tracking-widest">SELECT A TYPE AND ENTER YOUR TARGET</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
