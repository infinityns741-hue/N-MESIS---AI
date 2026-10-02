import React from 'react';

interface SystemItem {
  name: string;
  tag: string;
  accent: string;
}

const SYSTEMS: SystemItem[] = [
  { name: 'NÉMESIS - PERIMETER', tag: 'DEFENSE', accent: '#00f0ff' },
  { name: 'NÉMESIS - DANAEL', tag: 'CORE', accent: '#a855f7' },
  { name: 'NÉMESIS - LEBOUR', tag: 'ANALYTICS', accent: '#38bdf8' },
  { name: 'NÉMESIS - SECURE', tag: 'SHIELD', accent: '#f43f5e' },
  { name: 'NÉMESIS - RADIUS', tag: 'NETWORK', accent: '#34d399' },
  { name: 'NÉMESIS - IA', tag: 'UNSAAC', accent: '#22d3ee' },
];

export const NemesisTicker: React.FC = () => {
  // We duplicate the list to achieve a 100% seamless infinite marquee loop with -50% translation
  const sequence = [...SYSTEMS, ...SYSTEMS, ...SYSTEMS];

  return (
    <div 
      id="nemesis-systems-ribbon"
      className="relative w-full overflow-hidden py-3 z-20 select-none bg-gradient-to-r from-transparent via-[#080912]/80 to-transparent backdrop-blur-sm"
    >
      {/* Soft feather gradient masks on edges for fluid fade in/out */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#040508] via-[#040508]/80 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#040508] via-[#040508]/80 to-transparent z-10" />

      {/* Ultra-smooth hardware-accelerated ticker track */}
      <div className="animate-ticker-fluid flex items-center gap-8 sm:gap-14">
        {sequence.map((sys, idx) => (
          <div 
            key={`${sys.name}-${idx}`}
            className="inline-flex items-center gap-3 group cursor-default transition-transform hover:scale-105"
          >
            {/* Pulsing neon point */}
            <span 
              className="w-2 h-2 rounded-full shadow-sm"
              style={{ 
                backgroundColor: sys.accent,
                boxShadow: `0 0 10px ${sys.accent}` 
              }} 
            />

            {/* Glowing cyber text without harsh stripe gradients */}
            <span 
              className="text-xs sm:text-[13px] font-bold font-cyber tracking-widest uppercase text-zinc-100 group-hover:text-white transition-colors"
              style={{
                textShadow: `0 0 12px ${sys.accent}44`
              }}
            >
              {sys.name}
            </span>

            {/* Sleek translucent pill badge */}
            <span 
              className="text-[10px] font-mono-code px-2 py-0.5 rounded-full border bg-white/[0.04] text-zinc-400 group-hover:text-zinc-200 transition-colors"
              style={{
                borderColor: `${sys.accent}33`
              }}
            >
              {sys.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
