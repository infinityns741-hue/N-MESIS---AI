import React from 'react';
import { Database, Smartphone, Monitor } from 'lucide-react';

interface HeaderStatusProps {
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
}

export const HeaderStatus: React.FC<HeaderStatusProps> = ({
  onOpenSupabaseModal,
  isSupabaseConnected,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-3 py-2 sm:px-6 sm:py-3 z-30 select-none">
      {/* Left Pill: FÍSICA - UNSAAC */}
      <div 
        id="sys-nemesis-badge"
        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0d0e15]/90 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-md"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
        </span>
        <span className="text-[12px] sm:text-[13px] font-bold font-cyber tracking-wider text-cyan-200 uppercase">
          FÍSICA - UNSAAC
        </span>
      </div>

      {/* Right controls: Mobile toggle & Version badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Device frame toggle (Mobile vs Desktop) */}
        <button
          id="btn-toggle-device-view"
          onClick={onToggleMobileFrame}
          title={isMobileFrame ? "Cambiar a vista de pantalla completa" : "Cambiar a vista móvil (Android/Web)"}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d0e15]/90 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-all"
        >
          {isMobileFrame ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vista Móvil</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5 text-zinc-400" />
              <span>Vista Web</span>
            </>
          )}
        </button>

        {/* Version Pill: V_0.1.0 */}
        <div 
          id="sys-version-badge"
          className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#0d0e15]/90 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)] backdrop-blur-md"
        >
          <span className="text-[11px] sm:text-[12px] font-semibold font-mono-code text-cyan-300 tracking-wider">
            V_0.1.0
          </span>
        </div>
      </div>
    </header>
  );
};
