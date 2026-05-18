"use client";

import { useState, useRef, useEffect } from "react";
import { Music, Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";

const STATIONS = [
  { name: "Lo-fi Plaza",    vibe: "Beats to study & relax",  url: "https://radio.plaza.one/ogg" },
  { name: "Chillhop Radio", vibe: "Relaxed grooves 24/7",    url: "https://streams.ilovemusic.de/iloveradio17.mp3" },
  { name: "Lo-fi Hip Hop",  vibe: "Smooth ambient tones",    url: "https://stream.laut.fm/lofi" },
];

type PS = "idle" | "loading" | "playing" | "error";

export default function LofiPlayer() {
  const [ps, setPs]     = useState<PS>("idle");
  const [muted, setMuted] = useState(false);
  const [idx, setIdx]     = useState(0);
  const elRef  = useRef<HTMLAudioElement | null>(null);
  const idxRef = useRef(0);
  idxRef.current = idx;

  useEffect(() => {
    const el = document.createElement("audio");
    el.volume = 0.28;

    el.addEventListener("playing", () => setPs("playing"));
    el.addEventListener("waiting", () => setPs("loading"));
    el.addEventListener("error",   () => setPs("error"));

    // Use a microtask so an immediately-following play() overrides "idle"
    el.addEventListener("pause", () => {
      Promise.resolve().then(() => {
        if (elRef.current === el && el.paused) setPs("idle");
      });
    });

    elRef.current = el;
    return () => {
      el.pause();
      el.src = "";
      elRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (el) el.muted = muted;
  }, [muted]);

  const startStation = (stationIndex: number) => {
    const el = elRef.current;
    if (!el) return;
    el.src = STATIONS[stationIndex].url;
    setPs("loading");
    el.play().catch(() => setPs("error"));
  };

  const toggle = () => {
    const el = elRef.current;
    if (!el) return;
    if (ps === "playing" || ps === "loading") {
      el.pause();
    } else {
      startStation(idx);
    }
  };

  const next = () => {
    const newIdx = (idxRef.current + 1) % STATIONS.length;
    setIdx(newIdx);
    if (ps === "playing" || ps === "loading") {
      const el = elRef.current;
      if (el) { el.pause(); }
      startStation(newIdx);
    }
  };

  const st = STATIONS[idx];
  const playing = ps === "playing";
  const loading = ps === "loading";
  const error   = ps === "error";

  return (
    <div
      className="inline-flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: "rgba(6,6,6,0.78)",
        border: "1px solid rgba(57,255,20,0.28)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Status icon */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: playing ? "var(--green)" : "rgba(57,255,20,0.1)",
          border: "1px solid rgba(57,255,20,0.3)",
        }}
      >
        <Music size={14} style={{ color: playing ? "#060606" : "var(--green)" }} />
      </div>

      {/* Station info */}
      <div className="min-w-0" style={{ minWidth: 110 }}>
        <div className="text-xs font-bold leading-tight" style={{ color: "var(--text-cream)" }}>
          {loading ? "Connecting…" : error ? "Stream offline" : playing ? st.name : "Lo-fi Radio"}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {playing && (
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse-green" style={{ background: "var(--green)" }} />
          )}
          <span className="text-[9px] leading-none truncate" style={{ color: "var(--text-faint)" }}>
            {playing ? st.vibe : error ? "Try next →" : "Click play for ambient music"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => setMuted(v => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: muted ? "var(--text-faint)" : "var(--text-muted)" }}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>

        <button
          onClick={toggle}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150"
          style={{ background: "var(--green)", color: "#060606", flexShrink: 0 }}
          title={playing ? "Pause" : "Play lo-fi radio"}
        >
          {loading ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#060606] border-t-transparent animate-spin" />
          ) : playing ? (
            <Pause size={14} />
          ) : (
            <Play size={14} style={{ marginLeft: 1 }} />
          )}
        </button>

        <button
          onClick={next}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "var(--text-faint)" }}
          title="Next station"
        >
          <SkipForward size={13} />
        </button>
      </div>
    </div>
  );
}
