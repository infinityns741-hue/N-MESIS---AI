import React from 'react';

interface ChatWallpaperTextureProps {
  className?: string;
  opacity?: number;
}

/**
 * High-definition authentic WhatsApp-style wallpaper texture
 * featuring subtle academic, scientific, and communication doodles:
 * atoms, formulas (E=mc², ∫, Σ, Δ), books, lightbulbs, compasses,
 * speech bubbles, beakers, gears, and geometric nodes.
 */
export const ChatWallpaperTexture: React.FC<ChatWallpaperTextureProps> = ({
  className = '',
  opacity = 0.08,
}) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Deep atmospheric base gradient matching WhatsApp dark theme */}
      <div className="absolute inset-0 bg-[#080d1a]" />
      <div 
        className="absolute inset-0 bg-radial from-[#0e172a] via-[#080d1a] to-[#04060d] opacity-90"
      />

      {/* Repeating SVG Doodle Pattern */}
      <svg 
        className="absolute inset-0 w-full h-full"
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern 
            id="whatsapp-academic-doodle" 
            width="320" 
            height="320" 
            patternUnits="userSpaceOnUse"
          >
            {/* 1. Atom / Nucleus */}
            <g transform="translate(30, 35) scale(0.9)" stroke="currentColor" fill="none" strokeWidth="1.4" className="text-cyan-200">
              <circle cx="20" cy="20" r="3" fill="currentColor" />
              <ellipse cx="20" cy="20" rx="18" ry="7" transform="rotate(30 20 20)" />
              <ellipse cx="20" cy="20" rx="18" ry="7" transform="rotate(-30 20 20)" />
              <ellipse cx="20" cy="20" rx="18" ry="7" transform="rotate(90 20 20)" />
            </g>

            {/* 2. Physics & Math Formula: E = mc² */}
            <text 
              x="140" 
              y="40" 
              fontFamily="monospace" 
              fontSize="12" 
              fontWeight="bold" 
              fill="currentColor" 
              className="text-cyan-100"
              letterSpacing="1"
            >
              E = mc²
            </text>

            {/* 3. Speech Bubble (WhatsApp classic) */}
            <g transform="translate(240, 25) scale(0.85)" stroke="currentColor" fill="none" strokeWidth="1.4" className="text-white">
              <path d="M5 5h22a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H14l-6 5v-5H5a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4z" />
              <circle cx="10" cy="15" r="1.5" fill="currentColor" />
              <circle cx="16" cy="15" r="1.5" fill="currentColor" />
              <circle cx="22" cy="15" r="1.5" fill="currentColor" />
            </g>

            {/* 4. Integral & Differential ∫ v(t) dt */}
            <text 
              x="35" 
              y="125" 
              fontFamily="serif" 
              fontSize="13" 
              fontStyle="italic" 
              fontWeight="bold" 
              fill="currentColor" 
              className="text-emerald-200"
            >
              ∫ v dt = Δx
            </text>

            {/* 5. Chemistry / Physics Beaker */}
            <g transform="translate(145, 100) scale(0.85)" stroke="currentColor" fill="none" strokeWidth="1.4" className="text-amber-200">
              <path d="M10 5h16M13 5v8l-9 16a2 2 0 0 0 2 3h20a2 2 0 0 0 2-3l-9-16V5" />
              <path d="M7 26c3-1 6-1 9 0s6 1 9 0" strokeDasharray="2 2" />
              <circle cx="12" cy="20" r="1" fill="currentColor" />
              <circle cx="18" cy="22" r="1.5" fill="currentColor" />
            </g>

            {/* 6. Compass / Geometrical tool */}
            <g transform="translate(245, 115) scale(0.8)" stroke="currentColor" fill="none" strokeWidth="1.4" className="text-cyan-200">
              <circle cx="16" cy="6" r="3" />
              <path d="M14 9L6 32M18 9l8 23M10 24h12" />
            </g>

            {/* 7. Book / Thesis open */}
            <g transform="translate(30, 185) scale(0.85)" stroke="currentColor" fill="none" strokeWidth="1.4" className="text-white">
              <path d="M2 6s5-2 12-2 12 2 12 2v20s-5-2-12-2-12 2-12 2V6z" />
              <path d="M14 4v20" />
            </g>

            {/* 8. Summation & Delta: ∑ F = m·a */}
            <text 
              x="130" 
              y="205" 
              fontFamily="monospace" 
              fontSize="12" 
              fontWeight="bold" 
              fill="currentColor" 
              className="text-cyan-100"
            >
              ∑ F = m·a
            </text>

            {/* 9. Lightbulb (Innovation / Idea) */}
            <g transform="translate(245, 180) scale(0.85)" stroke="currentColor" fill="none" strokeWidth="1.4" className="text-amber-300">
              <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 3 2 5 3 7h8c1-2 3-4 3-7a7 7 0 0 0-7-7z" />
            </g>

            {/* 10. Gear / Mechanical Engineering */}
            <g transform="translate(40, 260) scale(0.85)" stroke="currentColor" fill="none" strokeWidth="1.4" className="text-zinc-300">
              <circle cx="14" cy="14" r="5" />
              <path d="M14 2v3M14 23v3M2 14h3M23 14h3M5.5 5.5l2.2 2.2M20.3 20.3l2.2 2.2M5.5 22.5l2.2-2.2M20.3 7.7l2.2-2.2" />
            </g>

            {/* 11. Wave graph: y = A·sin(ωt + φ) */}
            <g transform="translate(130, 255) scale(0.9)" stroke="currentColor" fill="none" strokeWidth="1.4" className="text-teal-200">
              <path d="M2 15h32M18 2v26" strokeDasharray="1 3" />
              <path d="M2 15c4-10 8-10 12 0s8 10 12 0 8-10 8-10" />
            </g>

            {/* 12. Paperclip (WhatsApp attachment icon) */}
            <g transform="translate(250, 260) scale(0.85)" stroke="currentColor" fill="none" strokeWidth="1.4" className="text-white">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </g>

            {/* Subtle decorative particles/nodes */}
            <circle cx="100" cy="80" r="1.2" fill="currentColor" className="text-cyan-300" />
            <circle cx="210" cy="70" r="1.2" fill="currentColor" className="text-cyan-300" />
            <circle cx="95" cy="155" r="1" fill="currentColor" className="text-amber-300" />
            <circle cx="215" cy="235" r="1.2" fill="currentColor" className="text-emerald-300" />
            <circle cx="105" cy="230" r="1.5" fill="currentColor" className="text-cyan-300" />
            <circle cx="300" cy="160" r="1.2" fill="currentColor" className="text-cyan-300" />
            <circle cx="15" cy="230" r="1" fill="currentColor" className="text-cyan-300" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#whatsapp-academic-doodle)" />
      </svg>
    </div>
  );
};
