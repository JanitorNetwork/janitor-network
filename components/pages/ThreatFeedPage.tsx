"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Pause, Play, Circle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

type Category = "MALWARE" | "PHISHING" | "C2" | "BOTNET" | "EXPLOIT";
type FilterOption = "ALL" | Category;
type Severity = "critical" | "high" | "medium" | "low";
type IndicatorType = "IP" | "DOMAIN" | "HASH" | "URL";

interface ThreatEntry {
  id: number;
  ts: string;
  category: Category;
  indicator: string;
  indicatorType: IndicatorType;
  severity: Severity;
  source: string;
  confidence: number;
}

const SOURCES = ["AbuseIPDB", "VirusTotal", "OTX", "MISP", "URLhaus", "PhishTank", "Feodo", "Shodan"];
const CATEGORIES: Category[] = ["MALWARE", "PHISHING", "C2", "BOTNET", "EXPLOIT"];

const categoryColors: Record<Category, string> = {
  MALWARE: "#ff4141",
  PHISHING: "#ff8800",
  C2:       "#bb44ff",
  BOTNET:   "#ff6600",
  EXPLOIT:  "#ff3333",
};

const severityColors: Record<Severity, { text: string; border: string }> = {
  critical: { text: "#ff4141", border: "#ff414135" },
  high:     { text: "#ff8800", border: "#ff880035" },
  medium:   { text: "#ffaa00", border: "#ffaa0035" },
  low:      { text: "#555555", border: "#55555535" },
};

const FILTERS: FilterOption[] = ["ALL", "MALWARE", "PHISHING", "C2", "BOTNET", "EXPLOIT"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeIndicator(type: IndicatorType): string {
  const domainPrefixes = ["secure", "login", "account", "update", "verify", "cdn", "api", "mail"];
  const domainBodies  = ["paypal", "google", "microsoft", "amazon", "apple", "chase", "steam", "netflix"];
  const tlds          = [".ru", ".xyz", ".cc", ".top", ".pw", ".info", ".cn"];
  const paths         = ["/payload.exe", "/gate.php", "/c2/beacon", "/loader", "/dropper.bin"];

  switch (type) {
    case "IP":
      return `${rand(1,254)}.${rand(1,254)}.${rand(1,254)}.${rand(1,254)}`;
    case "DOMAIN":
      return `${pick(domainPrefixes)}-${pick(domainBodies)}${pick(tlds)}`;
    case "HASH":
      return Array.from({ length: 16 }, () => rand(0, 15).toString(16)).join("") + "…";
    case "URL":
      return `http://srv${rand(1,99)}-${rand(100,999)}${pick(tlds)}${pick(paths)}`;
  }
}

function makeSeverity(): Severity {
  const r = Math.random();
  if (r < 0.15) return "critical";
  if (r < 0.45) return "high";
  if (r < 0.80) return "medium";
  return "low";
}

let uid = 0;

function makeEntry(): ThreatEntry {
  const now = new Date();
  const indicatorType = pick<IndicatorType>(["IP", "DOMAIN", "HASH", "URL"]);
  return {
    id: uid++,
    ts: now.toTimeString().slice(0, 8),
    category: pick(CATEGORIES),
    indicator: makeIndicator(indicatorType),
    indicatorType,
    severity: makeSeverity(),
    source: pick(SOURCES),
    confidence: rand(62, 99),
  };
}

function seedEntries(count: number): ThreatEntry[] {
  return Array.from({ length: count }, () => makeEntry());
}

const sourceList = [
  { name: "AbuseIPDB",  status: "live" },
  { name: "VirusTotal", status: "live" },
  { name: "AlienVault OTX", status: "live" },
  { name: "MISP",       status: "live" },
  { name: "URLhaus",    status: "live" },
  { name: "PhishTank",  status: "live" },
  { name: "Feodo Tracker", status: "live" },
  { name: "Shodan",     status: "live" },
  { name: "Internal",   status: "live" },
  { name: "GreyNoise",  status: "delayed" },
  { name: "DShield",    status: "live" },
  { name: "SpamHaus",   status: "live" },
];

export default function ThreatFeedPage() {
  const [entries, setEntries] = useState<ThreatEntry[]>(() => seedEntries(35));
  const [filter, setFilter] = useState<FilterOption>("ALL");
  const [live, setLive] = useState(true);
  const [todayCount, setTodayCount] = useState(847_329);
  const [newFlash, setNewFlash] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!live) return;

    const schedule = () => {
      const delay = 1800 + Math.random() * 2800;
      timeoutRef.current = setTimeout(() => {
        setEntries((prev) => [makeEntry(), ...prev.slice(0, 59)]);
        setTodayCount((n) => n + 1);
        setNewFlash(true);
        setTimeout(() => setNewFlash(false), 400);
        schedule();
      }, delay);
    };

    schedule();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [live]);

  const visible = filter === "ALL" ? entries : entries.filter((e) => e.category === filter);

  const categoryCounts = CATEGORIES.reduce<Record<Category, number>>(
    (acc, cat) => ({ ...acc, [cat]: entries.filter((e) => e.category === cat).length }),
    {} as Record<Category, number>
  );

  return (
    <div className="min-h-screen bg-[#080808] pt-16">
      <PageHeader
        tag="THREAT FEED"
        title="Live intelligence, raw."
        description="The intake never stops. Here's what came in while you were looking away."
      />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Live toggle */}
          <button
            onClick={() => setLive((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 border mono text-xs tracking-widest uppercase transition-all ${
              live
                ? "border-[#00ff4130] text-[#00ff41] bg-[#00ff410a]"
                : "border-[#1a1a1a] text-[#444] hover:text-[#888]"
            }`}
          >
            {live ? <Pause size={11} /> : <Play size={11} />}
            {live ? "Live" : "Paused"}
            {live && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse-green" />
            )}
          </button>

          <div className="w-px h-5 bg-[#1a1a1a]" />

          {/* Category filters */}
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`mono text-[10px] tracking-widest uppercase px-3 py-2 border transition-all ${
                filter === f
                  ? f === "ALL"
                    ? "border-[#00ff41] text-[#00ff41] bg-[#00ff410a]"
                    : `text-[${categoryColors[f as Category]}] bg-[#0a0a0a]`
                  : "border-[#1a1a1a] text-[#444] hover:text-[#888]"
              }`}
              style={
                filter === f && f !== "ALL"
                  ? { borderColor: categoryColors[f as Category] + "40", color: categoryColors[f as Category] }
                  : undefined
              }
            >
              {f}
            </button>
          ))}

          <div className="ml-auto mono text-[10px] text-[#333]">
            {visible.length} entries shown
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_260px] gap-6">
          {/* Feed */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[80px_100px_80px_1fr_90px_90px_60px] gap-3 px-4 py-2 border-b border-[#141414] mono text-[9px] text-[#333] tracking-[0.2em] uppercase">
              <span>Time</span>
              <span>Category</span>
              <span>Type</span>
              <span>Indicator</span>
              <span>Severity</span>
              <span>Source</span>
              <span className="text-right">Conf.</span>
            </div>

            <div className="divide-y divide-[#0f0f0f]">
              <AnimatePresence initial={false}>
                {visible.map((entry, i) => {
                  const sc = severityColors[entry.severity];
                  const cc = categoryColors[entry.category];
                  const isNew = i === 0 && live;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={isNew ? { opacity: 0, backgroundColor: "#00ff4108" } : { opacity: 1 }}
                      animate={{ opacity: 1, backgroundColor: "transparent" }}
                      transition={{ duration: isNew ? 0.6 : 0 }}
                      className="grid grid-cols-[80px_100px_80px_1fr_90px_90px_60px] gap-3 px-4 py-2.5 hover:bg-[#0d0d0d] transition-colors group"
                    >
                      <span className="mono text-[11px] text-[#444]">{entry.ts}</span>

                      <span
                        className="mono text-[9px] tracking-widest self-center px-1.5 py-0.5 border w-fit"
                        style={{ color: cc, borderColor: cc + "35" }}
                      >
                        {entry.category}
                      </span>

                      <span className="mono text-[10px] text-[#555] self-center">{entry.indicatorType}</span>

                      <span className="mono text-[11px] text-[#c8c8c8] self-center truncate group-hover:text-white transition-colors">
                        {entry.indicator}
                      </span>

                      <span
                        className="mono text-[10px] self-center capitalize"
                        style={{ color: sc.text }}
                      >
                        {entry.severity}
                      </span>

                      <span className="mono text-[10px] text-[#444] self-center">{entry.source}</span>

                      <span className="mono text-[10px] self-center text-right" style={{ color: entry.confidence > 85 ? "#00ff41" : "#888" }}>
                        {entry.confidence}%
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {visible.length === 0 && (
                <div className="py-16 text-center mono text-xs text-[#333] tracking-widest">
                  NO ENTRIES MATCH THIS FILTER
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Feed status */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Radio size={11} className="text-[#00ff41]" />
                <span className="mono text-[10px] text-[#444] tracking-[0.3em] uppercase">Feed Status</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "IOCs Today",        value: todayCount.toLocaleString(), green: true },
                  { label: "Active Sources",    value: "12",        green: false },
                  { label: "Active Campaigns",  value: "23",        green: false },
                  { label: "Feed Latency",      value: "< 2s",      green: true },
                ].map(({ label, value, green }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="mono text-[10px] text-[#444]">{label}</span>
                    <span className={`mono text-[10px] ${green ? "text-[#00ff41]" : "text-[#888]"}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
              <div className="mono text-[10px] text-[#444] tracking-[0.3em] uppercase mb-4">This Session</div>
              <div className="space-y-2.5">
                {CATEGORIES.map((cat) => {
                  const count = categoryCounts[cat];
                  const pct = entries.length > 0 ? Math.round((count / entries.length) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between mb-1">
                        <span className="mono text-[9px]" style={{ color: categoryColors[cat] }}>{cat}</span>
                        <span className="mono text-[9px] text-[#444]">{count}</span>
                      </div>
                      <div className="h-px bg-[#141414] relative overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0"
                          style={{ backgroundColor: categoryColors[cat], opacity: 0.6 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active sources */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5">
              <div className="mono text-[10px] text-[#444] tracking-[0.3em] uppercase mb-4">Data Sources</div>
              <div className="space-y-2">
                {sourceList.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <Circle
                      size={5}
                      className={s.status === "live" ? "text-[#00ff41] fill-[#00ff41]" : "text-[#ffaa00] fill-[#ffaa00]"}
                    />
                    <span className="mono text-[10px] text-[#555]">{s.name}</span>
                    {s.status === "delayed" && (
                      <span className="mono text-[8px] text-[#ffaa00] ml-auto">DELAYED</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notice */}
            <div className="border border-[#1a1a1a] p-4">
              <p className="mono text-[10px] text-[#333] leading-relaxed">
                Feed data is for threat awareness only. Do not use indicators for automated blocking without independent verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
