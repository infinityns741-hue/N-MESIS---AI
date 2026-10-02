import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, BarChart3, ArrowRight, Key, Terminal } from 'lucide-react';
import { UserRole } from '../types';

interface PortalSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

export const PortalSelector: React.FC<PortalSelectorProps> = ({ onSelectRole }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-md mx-auto flex flex-col items-center"
    >
      {/* NÉMESIS - IA Title with chromatic aberration, lights and glow effect */}
      <div className="relative text-center my-5 sm:my-8 select-none w-full">
        {/* Decorative ambient light behind title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-gradient-to-r from-cyan-500/20 via-white/10 to-rose-500/20 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col items-center justify-center">
          <h1 
            id="brand-nemesis-title"
            className="nemesis-title text-[28px] sm:text-5xl md:text-6xl font-extrabold tracking-tight whitespace-nowrap px-2"
          >
            NÉMESIS - IA
          </h1>
          <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-sm font-medium font-cyber tracking-[0.25em] sm:tracking-[0.3em] uppercase text-zinc-400">
            RED NEURONAL ACADÉMICA
          </p>
        </div>
      </div>

      {/* Role Selection Cards */}
      <div className="w-full space-y-3 sm:space-y-4 px-2">
        {/* Portal Alumno Card */}
        <motion.button
          id="btn-portal-alumno"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRole('alumno')}
          className="group relative w-full text-left p-4 sm:p-5 rounded-2xl bg-[#0e1017]/90 border border-zinc-800/90 hover:border-cyan-500/50 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] overflow-hidden cursor-pointer"
        >
          {/* Subtle hover gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative flex items-center gap-4 sm:gap-5">
            {/* Cyan Square Icon with glowing backdrop */}
            <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#111420] border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.35)] group-hover:shadow-[0_0_28px_rgba(6,182,212,0.6)] group-hover:border-cyan-400 transition-all duration-300">
              <GraduationCap className="w-8 h-8 sm:w-9 sm:h-9 text-cyan-300 group-hover:text-cyan-200 transition-colors" />
            </div>

            {/* Content text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-cyan-100 transition-colors">
                  Portal Alumno
                </h2>
                <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all duration-200" />
              </div>
              <p className="text-sm text-zinc-400 mt-1 font-normal">
                Tutorías IA y simulaciones
              </p>
            </div>
          </div>
        </motion.button>

        {/* Portal Docente Card */}
        <motion.button
          id="btn-portal-docente"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRole('docente')}
          className="group relative w-full text-left p-4 sm:p-5 rounded-2xl bg-[#0e1017]/90 border border-zinc-800/90 hover:border-rose-500/50 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(244,63,94,0.25)] overflow-hidden cursor-pointer"
        >
          {/* Subtle hover gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative flex items-center gap-4 sm:gap-5">
            {/* Coral/Red Square Icon with glowing backdrop */}
            <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#171116] border border-rose-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.35)] group-hover:shadow-[0_0_28px_rgba(244,63,94,0.6)] group-hover:border-rose-400 transition-all duration-300">
              <BarChart3 className="w-8 h-8 sm:w-9 sm:h-9 text-rose-400 group-hover:text-rose-200 transition-colors" />
            </div>

            {/* Content text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-rose-100 transition-colors">
                  Portal Docente
                </h2>
                <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-rose-300 group-hover:translate-x-1 transition-all duration-200" />
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal uppercase tracking-wider font-medium">
                ANÁLISIS Y GESTIÓN DE AULAS
              </p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Discrete Developer Portal Entry Button */}
      <div className="mt-5 sm:mt-6 w-full px-2 flex justify-center">
        <button
          type="button"
          onClick={() => onSelectRole('developer')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/70 hover:bg-[#121626] border border-zinc-800 hover:border-cyan-500/40 text-zinc-400 hover:text-cyan-300 text-xs font-mono-code transition-all cursor-pointer shadow-sm group"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Portal Desarrollador</span>
        </button>
      </div>
    </motion.div>
  );
};

