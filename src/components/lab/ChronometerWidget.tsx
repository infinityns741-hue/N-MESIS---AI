import React from 'react';
import { Timer } from 'lucide-react';
import { LatexMath } from './LatexMath';

interface ChronometerWidgetProps {
  currentTime: number; // en segundos
  isPlaying: boolean;
  currentVelocity: number; // m/s
  currentDistance: number; // m
  acceleration: number; // m/s²
}

export const ChronometerWidget: React.FC<ChronometerWidgetProps> = ({
  currentTime,
  isPlaying,
  currentVelocity,
  currentDistance,
  acceleration,
}) => {
  // Conversión a minutos, segundos y centésimas
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60);
  const hundredths = Math.floor((currentTime % 1) * 100);

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  const formattedHundredths = hundredths.toString().padStart(2, '0');

  // Conversión a km/h
  const kmh = (currentVelocity * 3.6).toFixed(1);

  return (
    <div className="relative flex items-center gap-3 select-none">
      {/* =========================================================================
          CRONÓMETRO DE PRECISIÓN ESTILO CRONÓGRAFO DEPORTIVO DE ALTA GAMA
          ========================================================================= */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#090e1e]/90 backdrop-blur-md border border-cyan-500/40 shadow-[0_8px_25px_rgba(0,0,0,0.7)]">
        {/* Ícono de cronógrafo con indicador de estado */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <Timer className={`w-5 h-5 ${isPlaying ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '4s' }} />
            {isPlaying && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span className={`text-[8px] font-mono font-black uppercase mt-0.5 ${
            isPlaying ? 'text-emerald-400' : currentTime > 0 ? 'text-amber-400' : 'text-slate-400'
          }`}>
            {isPlaying ? 'EN MARCHA' : currentTime > 0 ? 'PAUSADO' : 'LISTO'}
          </span>
        </div>

        <div className="w-px h-8 bg-cyan-500/30" />

        {/* Display Digital de Tiempo: MM:SS.cc con Tipografía Cristalina */}
        <div className="flex flex-col items-start">
          <span className="text-[8px] font-mono font-extrabold text-cyan-400/90 tracking-widest uppercase">
            TIEMPO DE LABORATORIO
          </span>
          <div className="flex items-baseline font-mono tracking-tight text-white font-black text-xl sm:text-2xl drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">
            <span className="text-cyan-200">{formattedMinutes}:</span>
            <span className="text-white">{formattedSeconds}</span>
            <span className="text-xs text-cyan-400 font-bold ml-0.5">.{formattedHundredths}</span>
            <span className="text-[10px] text-cyan-400 font-normal ml-1">s</span>
          </div>
        </div>

        <div className="w-px h-8 bg-cyan-500/30 hidden sm:block" />

        {/* Telemetría Rápida: Velocidad & Espacio */}
        <div className="hidden sm:flex items-center gap-3 font-mono text-xs">
          {/* Velocidad */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-emerald-400">
              <span className="text-[8px] font-bold uppercase tracking-wider">Velocidad</span>
              <LatexMath math="v(t)" className="text-emerald-300 text-[9px]" />
            </div>
            <div className="text-emerald-300 font-black flex items-baseline gap-1">
              <span>{currentVelocity.toFixed(1)} <span className="text-[9px] text-emerald-400/80 font-normal">m/s</span></span>
              <span className="text-[10px] text-slate-400 font-normal">({kmh} km/h)</span>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-700/60" />

          {/* Espacio Recorrido */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-cyan-400">
              <span className="text-[8px] font-bold uppercase tracking-wider">Distancia</span>
              <LatexMath math="\Delta x" className="text-cyan-300 text-[9px]" />
            </div>
            <span className="text-cyan-200 font-black block">
              {currentDistance.toFixed(1)} <span className="text-[9px] text-cyan-400/80 font-normal">m</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
