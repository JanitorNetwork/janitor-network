"use client";

import Image from "next/image";

export type MascotMood = "idle" | "scanning" | "alert" | "happy";
export type MascotSize = "xs" | "sm" | "md" | "lg" | "xl";

interface JaniMascotProps {
  size?: MascotSize;
  mood?: MascotMood;
  float?: boolean;
  className?: string;
  /** When true, renders as a square/rectangle. When false (default for xs/sm), renders circular. */
  square?: boolean;
}

const SIZE_PX: Record<MascotSize, number> = {
  xs: 40,
  sm: 72,
  md: 160,
  lg: 260,
  xl: 380,
};

// Aspect ratios for square mode — all images are roughly 1:1 at these sizes
const ASPECT: Record<MascotSize, number> = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 1,
  xl: 0.88,
};

// Real mascot images mapped by mood
const MOOD_IMAGE: Record<MascotMood, string> = {
  idle:     "/mascot/0E25E965-C0CE-4836-8CBA-E04603295FFB.jpeg", // user-specified chat avatar
  scanning: "/mascot/IMG_8490.jpeg",   // FUD disposal — mop + trash bags
  alert:    "/mascot/IMG_8483.jpeg",   // deleting influencers — dramatic
  happy:    "/mascot/IMG_8492.jpeg",   // community cleanup crew
};

export default function JaniMascot({
  size = "md",
  mood = "idle",
  float = true,
  className = "",
  square = false,
}: JaniMascotProps) {
  const w = SIZE_PX[size];
  const h = square ? Math.round(w / ASPECT[size]) : w;
  const isCircle = !square && (size === "xs" || size === "sm");

  return (
    <div
      className={`relative flex-shrink-0 overflow-hidden ${
        isCircle ? "rounded-full" : "rounded-lg"
      } ${float ? "animate-float" : ""} ${className}`}
      style={{ width: w, height: h }}
    >
      <Image
        src={MOOD_IMAGE[mood]}
        alt="TJ — The Janitor"
        fill
        className="object-cover object-center"
        sizes={`${w}px`}
        priority={size === "xl" || size === "lg"}
      />
      {/* Subtle green glow border for the floating avatar sizes */}
      {(size === "xs" || size === "sm") && (
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 12px rgba(57,255,20,0.25), inset 0 0 0 1px rgba(57,255,20,0.3)" }}
        />
      )}
    </div>
  );
}
