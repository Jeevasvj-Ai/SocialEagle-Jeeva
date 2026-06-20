import { motion } from 'framer-motion';

interface RoosterMascotProps {
  size?: number;
  /** Continuous idle bob/strut animation, for hero spots. Off by default for small inline uses. */
  animated?: boolean;
}

/**
 * Hand-drawn-style cartoon rooster mascot for Assignment Roaster's branding
 * ("Roaster" / "Rooster" — the pun is the whole point). Pure inline SVG so
 * there's no external image asset to fetch or fail to load.
 */
export function RoosterMascot({ size = 96, animated = false }: RoosterMascotProps) {
  const svg = (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label="Rooster mascot">
      {/* Tail feathers, fanning out behind the body */}
      <path d="M40 70 C 10 55, 0 25, 14 5 C 22 28, 32 42, 46 55 Z" fill="#805ad5" />
      <path d="M44 74 C 18 68, 4 44, 10 18 C 22 38, 34 50, 50 60 Z" fill="#d6336c" />
      <path d="M48 78 C 28 80, 10 64, 10 40 C 24 54, 38 60, 54 64 Z" fill="#ed8936" />

      {/* Body */}
      <ellipse cx="62" cy="76" rx="26" ry="22" fill="#f6e6c8" />
      <ellipse cx="62" cy="76" rx="26" ry="22" fill="url(#bodyShade)" opacity="0.5" />

      {/* Legs + feet */}
      <path d="M52 96 L50 114 M50 114 L44 114 M50 114 L56 116" stroke="#ed8936" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 96 L72 114 M72 114 L66 116 M72 114 L78 114" stroke="#ed8936" strokeWidth="3" strokeLinecap="round" />

      {/* Head */}
      <circle cx="80" cy="46" r="18" fill="#fdf3e2" />

      {/* Comb (the "roast" crown, naturally) */}
      <path
        d="M68 30 C 66 22, 72 18, 74 24 C 76 16, 84 16, 84 24 C 88 16, 94 20, 90 28 C 94 28, 94 34, 88 34 L 70 34 Z"
        fill="#e53e3e"
      />

      {/* Wattle */}
      <path d="M88 54 C 92 56, 92 62, 87 62 C 84 62, 83 57, 88 54 Z" fill="#e53e3e" />

      {/* Beak */}
      <path d="M95 44 L106 47 L95 51 Z" fill="#ed8936" />

      {/* Eye */}
      <circle cx="86" cy="42" r="3" fill="#2d2235" />
      <circle cx="87" cy="41" r="1" fill="white" />

      <defs>
        <linearGradient id="bodyShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ed8936" stopOpacity="0" />
          <stop offset="100%" stopColor="#ed8936" stopOpacity="0.25" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (!animated) return svg;

  return (
    <motion.div
      animate={{ rotate: [-4, 4, -4], y: [0, -4, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ display: 'inline-block' }}
    >
      {svg}
    </motion.div>
  );
}
