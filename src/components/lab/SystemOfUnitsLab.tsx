import React, { useState } from 'react';
import { 
  Scale, 
  Ruler, 
  Clock, 
  Thermometer, 
  RotateCcw, 
  Sparkles,
  Layers
} from 'lucide-react';

interface MassWeight {
  id: string;
  name: string;
  massKg: number;
  icon: string;
}

const CALIBRATION_WEIGHTS: MassWeight[] = [
  { id: '1kg-pt', name: 'Patrón 1.0 kg (Pt-Ir)', massKg: 1.0, icon: '⚖️' },
  { id: '500g', name: 'Pesa 500 g', massKg: 0.5, icon: '🪙' },
  { id: '200g', name: 'Pesa 200 g', massKg: 0.2, icon: '🔩' },
  { id: '100g', name: 'Pesa 100 g', massKg: 0.1, icon: '⚙️' },
  { id: 'gold', name: 'Lingote 2.5 kg', massKg: 2.5, icon: '🧱' },
  { id: 'apple', name: 'Manzana 150 g', massKg: 0.15, icon: '🍎' },
];

const GRAVITIES = [
  { id: 'cusco', name: 'Tierra (Cusco / UNSAAC)', g: 9.78, icon: '🌍' },
  { id: 'sea', name: 'Tierra (Nivel del Mar)', g: 9.81, icon: '🌐' },
  { id: 'moon', name: 'Luna', g: 1.62, icon: '🌕' },
  { id: 'mars', name: 'Marte', g: 3.72, icon: '🔴' },
  { id: 'jupiter', name: 'Júpiter', g: 24.79, icon: '🪐' },
];

export const SystemOfUnitsLab: React.FC = () => {
  const [activeUnit, setActiveUnit] = useState<'kg' | 'm' | 's'>('kg');

  // Balanza del Kilogramo
  const [selectedGravity, setSelectedGravity] = useState(GRAVITIES[0]);
  const [trayWeights, setTrayWeights] = useState<MassWeight[]>([CALIBRATION_WEIGHTS[0]]);

  // Metro Láser
  const [targetDistance, setTargetDistance] = useState<number>(4.2); // metros
  const speedOfLight = 299792458; // m/s
  const flightTimeNs = (2 * targetDistance / speedOfLight) * 1e9; // nanosegundos

  const totalMassKg = trayWeights.reduce((acc, w) => acc + w.massKg, 0);
  const totalWeightN = totalMassKg * selectedGravity.g;

  const handleAddWeight = (w: MassWeight) => {
    setTrayWeights(prev => [...prev, w]);
  };

  const handleRemoveWeight = (index: number) => {
    setTrayWeights(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full h-full flex flex-col select-none overflow-hidden bg-[#060a16] text-white">
      {/* Escenario de Pantalla Completa */}
      <div className="flex-1 w-full flex flex-col justify-between p-3 sm:p-5 gap-3 overflow-hidden">
        {/* Selector de Magnitud SI Superior */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveUnit('kg')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeUnit === 'kg'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>1. Kilogramo (kg) • Balanza Analítica Cuántica</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveUnit('m')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeUnit === 'm'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Ruler className="w-4 h-4" />
              <span>2. Metro (m) • Riel Óptico y Láser c</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveUnit('s')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeUnit === 's'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>3. Segundo (s) • Reloj Atómico Cesio 133</span>
            </button>
          </div>

          {activeUnit === 'kg' && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400">Entorno Gravitatorio:</span>
              <select
                value={selectedGravity.id}
                onChange={(e) => {
                  const found = GRAVITIES.find(g => g.id === e.target.value);
                  if (found) setSelectedGravity(found);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-bold cursor-pointer focus:outline-none"
              >
                {GRAVITIES.map(g => (
                  <option key={g.id} value={g.id} className="bg-zinc-950 text-white">
                    {g.icon} {g.name} (g = {g.g} m/s²)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* CONTENIDO 1: BALANZA DEL KILOGRAMO */}
        {activeUnit === 'kg' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-hidden">
            {/* Balanza Gráfica 2D Realista con Platillos */}
            <div className="lg:col-span-8 rounded-3xl bg-[#080d1e] border border-cyan-500/30 p-5 flex flex-col justify-between relative shadow-2xl overflow-hidden">
              {/* Telemetría Digital de Precisión */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-black/80 border border-cyan-500/40 shadow-xl">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                    MASA INERCIAL INVARIANTE (m):
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-mono font-black text-white">
                      {totalMassKg.toFixed(3)}
                    </span>
                    <span className="text-sm font-mono font-bold text-cyan-400">kg</span>
                    <span className="text-xs font-mono text-zinc-500">
                      ({(totalMassKg * 1000).toFixed(0)} g)
                    </span>
                  </div>
                </div>

                <div className="text-right border-l border-zinc-800 pl-5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                    FUERZA PESO GRAVITATORIA (W = m · g):
                  </span>
                  <div className="flex items-baseline justify-end gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-mono font-black text-emerald-300">
                      {totalWeightN.toFixed(2)}
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-400">N (Newtons)</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {selectedGravity.name} • g = {selectedGravity.g} m/s²
                  </span>
                </div>
              </div>

              {/* Balanza Mecánica con Campana de Cristal */}
              <div className="relative flex-1 my-3 flex flex-col items-center justify-end pb-2">
                {/* Campana de cristal */}
                <div className="relative w-80 h-56 rounded-t-full bg-gradient-to-b from-cyan-400/10 to-transparent border-2 border-cyan-400/30 flex flex-col items-center justify-end pb-3">
                  {/* Objetos en el platillo */}
                  <div className="flex items-end justify-center gap-2 mb-2 z-10">
                    {trayWeights.map((w, idx) => (
                      <div
                        key={`${w.id}-${idx}`}
                        onClick={() => handleRemoveWeight(idx)}
                        className="p-2 rounded-xl bg-zinc-900 border border-cyan-400 shadow-md flex flex-col items-center cursor-pointer hover:scale-105 transition-all"
                        title="Toca para quitar del platillo"
                      >
                        <span className="text-2xl select-none">{w.icon}</span>
                        <span className="text-[9px] font-mono font-bold text-white mt-0.5">{w.massKg}kg</span>
                      </div>
                    ))}
                  </div>

                  {/* Platillo metálico */}
                  <div className="w-64 h-3.5 rounded-full bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 border border-zinc-300 shadow-xl" />
                  {/* Brazo vertical */}
                  <div className="w-5 h-16 bg-gradient-to-b from-zinc-600 to-zinc-800 border-x border-zinc-500" />
                  {/* Base pesada de la balanza */}
                  <div className="w-72 h-8 rounded-t-2xl bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-900 border border-zinc-600 flex items-center justify-center">
                    <span className="text-[10px] font-mono font-black text-cyan-400 tracking-widest uppercase">
                      UNSAAC • METROLOGÍA FÍSICA
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón vaciar */}
              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2">
                <span className="text-xs text-zinc-400">
                  Pesas en el platillo: <strong className="text-white">{trayWeights.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setTrayWeights([])}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  Vaciar Platillo
                </button>
              </div>
            </div>

            {/* Catálogo de Pesas Calibradas (Derecha) */}
            <div className="lg:col-span-4 rounded-3xl bg-[#080d1e] border border-cyan-500/30 p-4 flex flex-col justify-between">
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-3">
                Pesas Patrón para el Platillo:
              </span>

              <div className="grid grid-cols-2 gap-2 flex-1">
                {CALIBRATION_WEIGHTS.map(w => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleAddWeight(w)}
                    className="p-3 rounded-2xl bg-zinc-900/90 hover:bg-cyan-950/60 border border-zinc-800 hover:border-cyan-500/60 text-left transition-all cursor-pointer flex flex-col items-center justify-center gap-1 shadow-md hover:scale-102"
                  >
                    <span className="text-3xl select-none">{w.icon}</span>
                    <span className="text-xs font-bold text-white text-center mt-1">{w.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{w.massKg} kg</span>
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-black/60 border border-cyan-500/30 mt-3 text-center text-xs font-mono text-cyan-300">
                Constante de Planck: h = 6.626 070 15 × 10⁻³⁴ J·s
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO 2: METRO LÁSER */}
        {activeUnit === 'm' && (
          <div className="flex-1 rounded-3xl bg-[#080d1e] border border-emerald-500/30 p-5 flex flex-col justify-between">
            <div className="p-4 rounded-2xl bg-black/80 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">DISTANCIA REGISTRADA (d):</span>
                <span className="text-4xl font-mono font-black text-white block mt-1">{targetDistance.toFixed(3)} m</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">TIEMPO DE VUELO (Δt = 2d / c):</span>
                <span className="text-4xl font-mono font-black text-cyan-300 block mt-1">{flightTimeNs.toFixed(2)} ns</span>
              </div>
            </div>

            {/* Riel óptico */}
            <div className="h-44 rounded-2xl bg-black border border-zinc-800 relative flex items-center justify-between px-8 overflow-hidden">
              <div className="flex flex-col items-center">
                <div className="w-14 h-16 rounded-xl bg-zinc-800 border-2 border-emerald-500 flex items-center justify-center font-bold text-xs text-white">
                  LÁSER
                </div>
                <span className="text-[10px] font-mono text-emerald-400 mt-1">0 m</span>
              </div>

              {/* Haz láser */}
              <div className="flex-1 h-1 bg-red-600 relative mx-3 shadow-[0_0_15px_#ef4444]">
                <div className="absolute inset-0 bg-red-500" />
              </div>

              <div className="flex flex-col items-center">
                <div className="w-8 h-20 rounded-lg bg-cyan-300 border-2 border-white shadow-[0_0_20px_#38bdf8] flex items-center justify-center">
                  <span className="text-[8px] font-black text-black rotate-90">ESPEJO</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 mt-1">{targetDistance.toFixed(2)} m</span>
              </div>
            </div>

            {/* Slider de control de distancia */}
            <div className="p-3 rounded-2xl bg-black/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Ajustar Posición del Reflector Óptico:</span>
                <span className="text-emerald-400 font-bold">{targetDistance.toFixed(2)} metros</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={targetDistance}
                onChange={(e) => setTargetDistance(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-2"
              />
            </div>
          </div>
        )}

        {/* CONTENIDO 3: SEGUNDO ATÓMICO */}
        {activeUnit === 's' && (
          <div className="flex-1 rounded-3xl bg-[#080d1e] border border-amber-500/30 p-5 flex flex-col justify-between">
            <div className="p-4 rounded-2xl bg-black/80 border border-amber-500/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase">TRANSICIÓN CUÁNTICA DEL CESIO 133:</span>
                <span className="text-3xl font-mono font-black text-white block mt-1">ΔνCs = 9 192 631 770 Hz</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 text-xs font-mono font-bold border border-amber-600">
                Exacto por Definición Internacional
              </span>
            </div>

            {/* Osciloscopio Cuántico */}
            <div className="flex-1 rounded-2xl bg-black border border-zinc-800 p-4 flex items-center justify-center my-3 relative overflow-hidden">
              <svg className="w-full h-full text-amber-400" preserveAspectRatio="none" viewBox="0 0 500 100">
                <path
                  d="M0,50 Q25,10 50,50 T100,50 T150,50 T200,50 T250,50 T300,50 T350,50 T400,50 T450,50 T500,50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
