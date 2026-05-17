"use client";

import { useEffect, useState } from "react";

interface TerminalLineProps {
  text: string;
  delay?: number;
  speed?: number;
  prefix?: string;
  className?: string;
  onComplete?: () => void;
}

export default function TerminalLine({
  text,
  delay = 0,
  speed = 30,
  prefix = "> ",
  className = "",
  onComplete,
}: TerminalLineProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
      let i = 0;
      const tick = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(tick);
          setDone(true);
          onComplete?.();
        }
      }, speed);
      return () => clearInterval(tick);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, delay, speed, onComplete]);

  if (!started) return null;

  return (
    <div className={`mono text-sm ${className}`}>
      <span className="text-[#00ff41] opacity-60">{prefix}</span>
      <span>{displayed}</span>
      {!done && <span className="animate-blink text-[#00ff41]">█</span>}
    </div>
  );
}
