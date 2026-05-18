"use client";

import { useState, useRef, useEffect } from "react";
import { Music, Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";

const STATIONS = [
  { name: "Lo-fi Plaza",    vibe: "Beats to study & relax",  url: "https://radio.plaza.one/ogg" },
  { name: "Chillhop Radio", vibe: "Relaxed grooves 24/7",    url: "https://streams.ilovemusic.de/iloveradio17.mp3" },
  { name: "Lo-fi Hip Hop",  vibe: "Smooth ambient tones",    url: "https://stream.laut.fm/lofi" },
];

export default function LofiPlayer() {
  const [playing, setPlaying]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [muted, setMuted]           = useState(false);
  const [stationIdx, setStationIdx] = useState(0);
  const [started, setStarted]       = useState(false);
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  startedRef.current = started;

  useEffect(() => {
    const el = new Audio();
    el.volume = 0.28;
    el.src = STATIONS[0].url;
    el.preload = "none";
    el.addEventListener("play",    () => { setPlaying(true);  setLoading(false); });
    el.addEventListener("pause",   () => setPlaying(false));
    el.addEventListener("waiting", () => setLoading(true));
    el.addEventListener("canplay", () => setLoading(false));
    el.addEventListener("error",   () => {
      setLoading(false);
      setPlaying(false);
      setStationIdx(prev => (prev + 1) % STATIONS.length);
    });
    audioRef.current = el;
    return () => { el.pause(); el.src = ""; audioRef.current = null; };
  }, []);

  // Only reload audio when station changes AFTER the user has started playback.
  // Do NOT include 'started' in deps — triggering this effect when 'started'
  // first becomes true would immediately pause the audio the user just started.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !startedRef.current) return;
    const wasPlaying = !el.paused;
    el.pause();
    el.src = STATIONS[stationIdx].url;
    el.load();
    if (wasPlaying) {
      setLoading(true);
      el.play().catch(() => setLoading(false));
    }
  }, [stationIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
    } else {
      if (!startedRef.current) {
        setStarted(true);
        el.src = STATIONS[stationIdx].url;
        el.load();
      }
      setLoading(true);
      el.play().catch(() => setLoading(false));
    }
  };

  const next = () => setStationIdx(p => (p + 1) % STATIONS.length);

  const st = STATIONS[stationIdx];

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
      {/* Icon */}
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
      <div className="min-w-0" style={{ minWidth: 120 }}>
        <div className="text-xs font-bold leading-tight" style={{ color: "var(--text-cream)" }}>
          {loading ? "Connecting…" : playing ? st.name : "Lo-fi Radio"}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {playing && (
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse-green" style={{ background: "var(--green)" }} />
          )}
          <span className="text-[9px] leading-none truncate" style={{ color: "var(--text-faint)" }}>
            {playing ? st.vibe : "Click play for ambient music"}
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
