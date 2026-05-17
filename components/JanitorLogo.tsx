interface Props {
  size?: number;
  glow?: boolean;
}

export default function JanitorLogo({ size = 28, glow = true }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 112"
      xmlns="http://www.w3.org/2000/svg"
      style={glow ? { filter: "drop-shadow(0 0 8px rgba(250,204,21,0.6))" } : undefined}
      aria-label="Janitor Network logo"
    >
      {/* ── Dark background fill ── */}
      <circle cx="50" cy="46" r="40" fill="#080808" />

      {/* ── Rough painted circle border ── */}
      {/* Main ring */}
      <circle cx="50" cy="46" r="40" fill="none" stroke="#facc15" strokeWidth="5" />
      {/* Grunge texture — faint inner arc highlights for painted look */}
      <path d="M 14,28 Q 10,46 14,64" fill="none" stroke="#facc15" strokeWidth="2.5" opacity="0.4" />
      <path d="M 86,28 Q 90,46 86,64" fill="none" stroke="#facc15" strokeWidth="2.5" opacity="0.4" />

      {/* ── Drips from bottom of circle ── */}
      {/* Left drip */}
      <path
        d="M 27,84 C 26,90 24,96 26,103 C 27,107 30,107 31,103 C 33,96 32,88 31,84 Z"
        fill="#facc15"
      />
      <ellipse cx="28.5" cy="106" rx="3" ry="2.5" fill="#facc15" />

      {/* Center drip */}
      <path
        d="M 46,86 C 45,93 44,100 47,106 C 48,109 52,109 52,105 C 54,99 53,91 51,86 Z"
        fill="#facc15"
      />
      <ellipse cx="49.5" cy="108" rx="3.5" ry="2.5" fill="#facc15" />

      {/* Right drip */}
      <path
        d="M 67,84 C 67,90 68,95 68,100 C 68,104 71,104 72,100 C 73,95 72,89 70,84 Z"
        fill="#facc15"
      />
      <ellipse cx="70" cy="103" rx="2.5" ry="2" fill="#facc15" />

      {/* ── Paint splatter dots ── */}
      <circle cx="12" cy="26" r="2.5" fill="#facc15" opacity="0.65" />
      <circle cx="89" cy="24" r="2"   fill="#facc15" opacity="0.55" />
      <circle cx="8"  cy="52" r="1.8" fill="#facc15" opacity="0.45" />
      <circle cx="93" cy="56" r="2.8" fill="#facc15" opacity="0.45" />
      <circle cx="19" cy="10" r="1.5" fill="#facc15" opacity="0.35" />
      <circle cx="82" cy="8"  r="2"   fill="#facc15" opacity="0.35" />
      <circle cx="38" cy="2"  r="1.5" fill="#facc15" opacity="0.3"  />
      <circle cx="65" cy="4"  r="1.8" fill="#facc15" opacity="0.3"  />

      {/* ── Left X eye ── */}
      <line x1="27" y1="30" x2="41" y2="44" stroke="#facc15" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="41" y1="30" x2="27" y2="44" stroke="#facc15" strokeWidth="5.5" strokeLinecap="round" />

      {/* ── Right X eye ── */}
      <line x1="59" y1="30" x2="73" y2="44" stroke="#facc15" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="73" y1="30" x2="59" y2="44" stroke="#facc15" strokeWidth="5.5" strokeLinecap="round" />

      {/* ── Smile ── */}
      <path
        d="M 28,60 Q 50,80 72,60"
        fill="none"
        stroke="#facc15"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
