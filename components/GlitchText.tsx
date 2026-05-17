"use client";

import { useEffect, useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
  interval?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

export default function GlitchText({ text, className = "", interval = 40 }: GlitchTextProps) {
  const [displayed, setDisplayed] = useState(text);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const triggerGlitch = () => {
      setGlitching(true);
      let iteration = 0;
      const maxIterations = text.length * 1.5;

      const tick = setInterval(() => {
        setDisplayed(
          text
            .split("")
            .map((char, i) => {
              if (char === " ") return " ";
              if (i < iteration / 1.5) return text[i];
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        iteration++;
        if (iteration >= maxIterations) {
          clearInterval(tick);
          setDisplayed(text);
          setGlitching(false);
        }
      }, interval);
    };

    const scheduleGlitch = () => {
      const delay = 4000 + Math.random() * 8000;
      return setTimeout(triggerGlitch, delay);
    };

    let timer = scheduleGlitch();
    const reschedule = () => {
      timer = scheduleGlitch();
    };

    return () => clearTimeout(timer);
  }, [text, interval]);

  return (
    <span className={`mono ${className}`} data-text={text}>
      {displayed}
    </span>
  );
}
