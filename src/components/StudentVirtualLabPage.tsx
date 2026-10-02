import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FlaskConical, 
  Scale, 
  Car, 
  ChevronDown,
  Maximize2,
  Minimize2,
  Sparkles, 
  Layers,
  Check,
  X
} from 'lucide-react';
import { UserSession } from '../types';
import { ScientificMethodLab } from './lab/ScientificMethodLab';
import { SystemOfUnitsLab } from './lab/SystemOfUnitsLab';
import { MruKinematicsLab } from './lab/MruKinematicsLab';

interface StudentVirtualLabPageProps {
  session: UserSession;
  onBack: () => void;
  initialPractice?: 'mru' | 'scientific-method' | 'system-units';
}

export interface LabPracticeItem {
  id: 'mru' | 'scientific-method' | 'system-units';
  number: string;
  name: string;
  badge: string;
  icon: string;
}

const LAB_PRACTICES: LabPracticeItem[] = [
  {
    id: 'mru',
    number: '03',
    name: 'CINEMÁTICA: MRU Y MOVIMIENTOS RECTILÍNEOS',
    badge: 'Simulación Cinemática 2D y Gráficas x-t, v-t, a-t',
    icon: '🏎️',
  },
  {
    id: 'scientific-method',
    number: '01',
    name: 'EL MÉTODO CIENTÍFICO',
    badge: 'Tubo de Newton en Vacío vs Aire (Galileo)',
    icon: '🔬',
  },
  {
    id: 'system-units',
    number: '02',
    name: 'SISTEMA INTERNACIONAL DE UNIDADES (SI)',
    badge: 'Balanza Cuántica del Kilogramo y Láser c',
    icon: '⚖️',
  },
];

export const StudentVirtualLabPage: React.FC<StudentVirtualLabPageProps> = ({
  session,
  onBack,
  initialPractice = 'mru', // Por defecto muestra directamente el simulador de cinemática
}) => {
  const [activePractice, setActivePractice] = useState<'mru' | 'scientific-method' | 'system-units'>(initialPractice);
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Toggle de Pantalla Completa del Navegador
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const currentLab = LAB_PRACTICES.find(p => p.id === activePractice) || LAB_PRACTICES[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#050814] text-white flex flex-col overflow-hidden select-none">
      {/* =========================================================
          BARRA SUPERIOR MINIMALISTA CON BOTÓN ÍNDICE FLOTANTE
          ========================================================= */}
      <header className="flex-shrink-0 h-14 bg-[#080d1e] border-b border-cyan-500/30 px-3 sm:px-6 flex items-center justify-between z-30 shadow-2xl">
        {/* Izquierda: Botón Salir */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Volver a la plataforma"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>

        {/* Centro: EL BOTÓN SOLICITADO «ÍNDICE DE LABORATORIOS ▼» */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsIndexOpen(!isIndexOpen)}
            className="px-4 sm:px-6 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-600/30 border border-cyan-300/40 hover:scale-102 active:scale-98"
          >
            <span className="text-base">{currentLab.icon}</span>
            <span className="font-extrabold uppercase">ÍNDICE DE LABORATORIOS</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isIndexOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menú Desplegable Flotante con todo el Índice de Laboratorios */}
          {isIndexOpen && (
            <>
              {/* Backdrop para cerrar al hacer clic afuera */}
              <div 
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
                onClick={() => setIsIndexOpen(false)}
              />

              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 sm:w-96 rounded-3xl bg-[#090e24] border-2 border-cyan-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-3 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    SELECCIONAR PRÁCTICA DE FÍSICA I:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsIndexOpen(false)}
                    className="text-zinc-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {LAB_PRACTICES.map((practice) => {
                  const isSelected = activePractice === practice.id;
                  return (
                    <button
                      key={practice.id}
                      type="button"
                      onClick={() => {
                        setActivePractice(practice.id);
                        setIsIndexOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3 border ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <span className="text-2xl p-2 rounded-xl bg-black/50 flex-shrink-0">
                        {practice.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black truncate">{practice.name}</span>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold ml-1">
                            #{practice.number}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 block truncate mt-0.5">
                          {practice.badge}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Derecha: Nombre del Lab Activo y Botón Pantalla Completa */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 font-bold">{currentLab.name}</span>
          </div>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 transition-colors cursor-pointer"
            title={isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-zinc-300" />
            )}
          </button>
        </div>
      </header>

      {/* =========================================================
          CONTENIDO DEL LABORATORIO (PANTALLA COMPLETA, SIN CAJAS)
          ========================================================= */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {activePractice === 'mru' && <MruKinematicsLab />}
        {activePractice === 'scientific-method' && <ScientificMethodLab />}
        {activePractice === 'system-units' && <SystemOfUnitsLab />}
      </main>
    </div>
  );
};
