"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Database, AlertTriangle, User, Lock, Calendar, Server } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import JaniMascot from "@/components/JaniMascot";

interface BreachRecord {
  name: string;
  date: string;
  records: string;
  fields: string[];
  severity: "critical" | "high" | "medium";
}

const mockBreaches: BreachRecord[] = [
  { name: "DataCorp Leak 2024", date: "2024-08-14", records: "4.2M", fields: ["email", "password_hash", "phone", "ip_address"], severity: "critical" },
  { name: "ShadowForum DB", date: "2024-03-01", records: "891K", fields: ["username", "email", "bcrypt_hash"], severity: "high" },
  { name: "RetailNet Commerce", date: "2023-11-22", records: "2.1M", fields: ["email", "full_name", "address"], severity: "medium" },
];

const filters = ["All", "Email", "Username", "Domain", "IP", "Phone"];

export default function WhitePagesPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setSearched(true);
  };

  const severityColor = { critical: "#ff4141", high: "#ff8800", medium: "#ffaa00" };

  return (
    <div className="min-h-screen bg-[#080808] pt-16">
      <PageHeader
        tag="WHITE PAGES"
        title="Intelligence Database"
        description="Search breach records, exposed credentials, and threat actor profiles across our global dataset."
      />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Search */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 mb-6">
          <div className="flex gap-3 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search email, username, domain, IP address..."
              className="flex-1 bg-[#080808] border border-[#1a1a1a] text-[#e8e8e8] mono text-sm px-4 py-3 focus:outline-none focus:border-[#00ff4140] placeholder:text-[#333]"
            />
            <button
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className="px-6 py-3 bg-[#00ff41] text-[#080808] text-xs font-black tracking-widest uppercase disabled:opacity-40 hover:bg-[#00cc33] transition-colors"
            >
              {loading ? "Querying..." : "Query"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`mono text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-all ${
                  activeFilter === f
                    ? "border-[#00ff41] text-[#00ff41] bg-[#00ff410a]"
                    : "border-[#1a1a1a] text-[#444] hover:border-[#333] hover:text-[#888]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-px bg-[#1a1a1a] mb-8">
          {[
            { icon: Database, label: "Total Records", value: "14.8B" },
            { icon: Server, label: "Breach Sources", value: "2,847" },
            { icon: Calendar, label: "Last Updated", value: "2 min ago" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-[#0a0a0a] p-4 flex items-center gap-3">
              <Icon size={14} className="text-[#333]" />
              <div>
                <div className="mono text-xs text-[#00ff41] font-bold">{value}</div>
                <div className="mono text-[9px] text-[#444] tracking-widest">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center py-20 gap-6">
              <JaniMascot size="md" mood="scanning" />
              <div className="mono text-xs text-[#444] tracking-widest animate-pulse-green">QUERYING DATABASE...</div>
            </motion.div>
          )}

          {searched && !loading && (
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="mono text-xs text-[#888]">
                  Found <span className="text-[#00ff41]">3 breach records</span> for <span className="text-[#e8e8e8]">{query}</span>
                </div>
                <div className="mono text-[10px] text-[#444] tracking-widest">CENSORED FOR SAFETY</div>
              </div>

              <div className="space-y-3">
                {mockBreaches.map((breach, i) => (
                  <motion.div
                    key={breach.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 hover:border-[#00ff4120] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <AlertTriangle size={14} style={{ color: severityColor[breach.severity] }} />
                          <span className="text-[#e8e8e8] font-semibold">{breach.name}</span>
                        </div>
                        <div className="mono text-xs text-[#444] mt-1 ml-[22px]">{breach.date}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="mono text-xs text-[#888]">{breach.records} records</span>
                        <span
                          className="mono text-[9px] tracking-widest uppercase px-2 py-1 border"
                          style={{ color: severityColor[breach.severity], borderColor: severityColor[breach.severity] + "40" }}
                        >
                          {breach.severity}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-[22px]">
                      {breach.fields.map((field) => (
                        <span key={field} className="mono text-[9px] bg-[#111] border border-[#1a1a1a] px-2 py-1 text-[#555]">
                          {field}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 bg-[#0a0a0a] border border-[#ffaa0025] p-4 flex items-start gap-3">
                <AlertTriangle size={14} className="text-[#ffaa00] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#888]">
                  Results are partially redacted to prevent misuse. Full records available to verified security researchers and law enforcement only.
                </p>
              </div>
            </motion.div>
          )}

          {!searched && !loading && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center py-20 gap-4 text-center">
              <JaniMascot size="md" mood="scanning" />
              <div>
                <div className="mono text-xs text-[#333] tracking-widest mb-2">INTELLIGENCE DATABASE READY</div>
                <p className="text-[#444] text-sm max-w-sm">Search any identifier to check if it appears in our breach records and threat intelligence feeds.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
