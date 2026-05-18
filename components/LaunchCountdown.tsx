"use client";

import { useEffect, useState } from "react";

// May 25, 2026 at 10:00:00 GMT-0600 (Mountain Daylight Time)
const LAUNCH_TARGET = new Date("2026-05-25T16:00:00.000Z").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  launched: boolean;
}

function calc(): TimeLeft {
  const diff = LAUNCH_TARGET - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, launched: true };
  return {
    days:     Math.floor(diff / 86_400_000),
    hours:    Math.floor((diff % 86_400_000) / 3_600_000),
    minutes:  Math.floor((diff % 3_600_000)  / 60_000),
    seconds:  Math.floor((diff % 60_000)     / 1_000),
    launched: false,
  };
}

function Digit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div
        className="font-black font-mono-jn tabular-nums leading-none"
        style={{
          fontSize: "clamp(2.2rem, 6vw, 4rem)",
          color: "var(--green)",
          textShadow: "0 0 40px rgba(57,255,20,0.4)",
          minWidth: "2ch",
          textAlign: "center",
        }}
      >
        {display}
      </div>
      <div
        className="text-[9px] tracking-[0.25em] uppercase font-mono-jn mt-1"
        style={{ color: "var(--text-faint)" }}
      >
        {label}
      </div>
    </div>
  );
}

function Colon() {
  return (
    <div
      className="font-black font-mono-jn self-start pt-1"
      style={{ fontSize: "clamp(1.8rem, 5vw, 3.2rem)", color: "rgba(57,255,20,0.35)", lineHeight: 1 }}
    >
      :
    </div>
  );
}

export default function LaunchCountdown() {
  const [time, setTime] = useState<TimeLeft>(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  if (time.launched) {
    return (
      <div className="text-center py-6">
        <div
          className="font-black text-3xl tracking-tight"
          style={{ color: "var(--green)", textShadow: "0 0 60px rgba(57,255,20,0.6)" }}
        >
          $CLEAN IS LIVE
        </div>
        <div className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          The night shift paid off.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-[10px] tracking-[0.3em] uppercase font-mono-jn" style={{ color: "var(--text-faint)" }}>
        Launch in
      </div>
      <div className="flex items-start gap-3 sm:gap-5">
        {time.days > 0 && (
          <>
            <Digit value={time.days} label="days" />
            <Colon />
          </>
        )}
        <Digit value={time.hours}   label="hrs"  />
        <Colon />
        <Digit value={time.minutes} label="min"  />
        <Colon />
        <Digit value={time.seconds} label="sec"  />
      </div>
      <div className="text-[10px] font-mono-jn" style={{ color: "var(--text-faint)" }}>
        May 25, 2026 · 10:00 AM MDT
      </div>
    </div>
  );
}
