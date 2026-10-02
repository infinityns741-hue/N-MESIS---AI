import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Wind, 
  Sparkles,
  Gauge,
  Timer,
  CheckCircle2,
  Sliders,
  Layers
} from 'lucide-react';

export const ScientificMethodLab: React.FC = () => {
  // Estado del entorno experimental
  const [isVacuum, setIsVacuum] = useState<boolean>(false);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [hasLanded, setHasLanded] = useState<boolean>(false);

  // Parámetros de caída
  const [tubeHeight] = useState<number>(20); // 20 metros de tubo vertical
  const [featherY, setFeatherY] = useState<number>(0); // 0 (arriba) a 20 (abajo)
  const [leadY, setLeadY] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Registro de tiempos finales
  const [leadTime, setLeadTime] = useState<number | null>(null);
  const [featherTime, setFeatherTime] = useState<number | null>(null);

  // Animación
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Fórmulas físicas:
  // En vacío: a = g = 9.81 m/s² para ambos -> y = 0.5 * g * t²
  // En aire: la esfera de plomo tiene poca resistencia (cae en ~2.02 s)
  //          la pluma tiene alta resistencia aerodinámica con velocidad terminal baja (~1.5 m/s, cae en ~7.5 s)
  const g = 9.81;

  const handleStartDrop = () => {
    if (isDropping) return;
    setIsDropping(true);
    setHasLanded(false);
    setLeadTime(null);
    setFeatherTime(null);
    setFeatherY(0);
    setLeadY(0);
    setElapsedTime(0);

    const startTs = performance.now();
    startTimeRef.current = startTs;

    const loop = (now: number) => {
      const t = (now - startTs) / 1000;
      setElapsedTime(t);

      // Posición de la esfera de plomo
      // En vacío y aire cae casi idéntico por su alta densidad
      const leadPos = Math.min(0.5 * g * t * t, tubeHeight);
      setLeadY(leadPos);
      if (leadPos >= tubeHeight && leadTime === null) {
        setLeadTime(t);
      }

      // Posición de la pluma
      let featherPos = 0;
      if (isVacuum) {
        // En vacío, exactamente igual que el plomo
        featherPos = Math.min(0.5 * g * t * t, tubeHeight);
      } else {
        // En aire, resistencia proporcional al arrastre aerodinámico
        // v_terminal ~ 3.2 m/s
        const vTerm = 3.2;
        featherPos = Math.min(vTerm * t + (g / 2) * Math.min(t * t * 0.15, 0.5), tubeHeight);
      }
      setFeatherY(featherPos);
      if (featherPos >= tubeHeight && featherTime === null) {
        setFeatherTime(t);
      }

      // Condición de finalización
      if (leadPos >= tubeHeight && featherPos >= tubeHeight) {
        setIsDropping(false);
        setHasLanded(true);
        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const handleReset = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsDropping(false);
    setHasLanded(false);
    setFeatherY(0);
    setLeadY(0);
    setElapsedTime(0);
    setLeadTime(null);
    setFeatherTime(null);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col select-none overflow-hidden bg-[#060a16] text-white">
      {/* Escenario de Laboratorio a Pantalla Completa */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 sm:p-5 overflow-hidden">
        {/* Panel Izquierdo: Tubo de Newton Realista (Columna Vertical) */}
        <div className="lg:col-span-8 h-full rounded-3xl bg-gradient-to-b from-[#0c1224] via-[#080d1a] to-[#04060d] border border-cyan-500/30 p-4 flex flex-col justify-between relative shadow-2xl overflow-hidden">
          {/* Luz ambiental del laboratorio */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-20 bg-cyan-500/10 blur-3xl pointer-events-none" />

          {/* Cabecera del Tubo de Ensayo con Manómetro Digital */}
          <div className="flex items-center justify-between z-10 border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center gap-2 shadow-inner">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>PRESIÓN DE CÁMARA:</span>
                <strong className={isVacuum ? 'text-emerald-400 font-black' : 'text-amber-400 font-black'}>
                  {isVacuum ? '0.001 Torr (Vacío Cuántico)' : '760 Torr (Atmósfera Normal)'}
                </strong>
              </div>
            </div>

            {/* Cronómetro Digital de Precisión */}
            <div className="px-4 py-1.5 rounded-xl bg-black/75 border border-white/20 font-mono text-xl sm:text-2xl font-black text-cyan-300 tracking-wider">
              {elapsedTime.toFixed(2)} <span className="text-xs text-zinc-400">s</span>
            </div>
          </div>

          {/* El Tubo Vertical de Newton (Simulación Gráfica con Graduación) */}
          <div className="relative flex-1 my-3 flex items-center justify-center">
            {/* Cilindro de Vidrio de Alta Resistencia */}
            <div className="relative w-72 sm:w-88 h-full max-h-[460px] rounded-3xl bg-gradient-to-r from-cyan-900/15 via-sky-500/5 to-cyan-900/15 border-2 border-cyan-400/40 shadow-[0_0_40px_rgba(6,182,212,0.15)] flex justify-between px-6 py-4 overflow-hidden">
              {/* Reflejos especulares de cristal cilíndrico */}
              <div className="absolute top-0 bottom-0 left-2 w-3 bg-white/20 blur-[1px] rounded-full pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-4 w-1 bg-white/15 blur-[0.5px] rounded-full pointer-events-none" />

              {/* Partículas de aire (visibles solo cuando no hay vacío) */}
              {!isVacuum && (
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="w-full h-full flex flex-wrap gap-4 p-4 animate-pulse">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-blue-300 rounded-full" />
                    ))}
                  </div>
                </div>
              )}

              {/* Regla métrica de altura vertical (de 20m a 0m) */}
              <div className="absolute left-3 top-4 bottom-4 w-4 flex flex-col justify-between text-[9px] font-mono text-zinc-500 pointer-events-none border-r border-zinc-700/60 pr-1">
                <span>20m</span>
                <span>15m</span>
                <span>10m</span>
                <span>5m</span>
                <span>0m</span>
              </div>

              {/* Carril Izquierdo: Esfera de Plomo */}
              <div className="relative w-28 h-full flex flex-col items-center">
                <span className="text-[10px] font-mono font-bold text-zinc-400 mb-1">
                  Esfera Pb (0.5 kg)
                </span>
                <div className="relative w-full flex-1">
                  {/* Objeto Esfera */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 transition-transform duration-75"
                    style={{ top: `${(leadY / tubeHeight) * 88}%` }}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-200 via-zinc-500 to-zinc-800 border-2 border-zinc-300 shadow-[0_0_12px_rgba(255,255,255,0.3)] flex items-center justify-center text-[9px] font-bold text-black select-none">
                      Pb
                    </div>
                  </div>
                </div>
                {leadTime !== null && (
                  <span className="text-[10px] font-mono font-black text-cyan-300 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/50">
                    {leadTime.toFixed(2)} s
                  </span>
                )}
              </div>

              {/* Divisor central del tubo de doble carril */}
              <div className="w-px h-full bg-cyan-500/20" />

              {/* Carril Derecho: Pluma de Ave */}
              <div className="relative w-28 h-full flex flex-col items-center">
                <span className="text-[10px] font-mono font-bold text-zinc-400 mb-1">
                  Pluma (0.005 kg)
                </span>
                <div className="relative w-full flex-1">
                  {/* Objeto Pluma */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 transition-transform duration-75"
                    style={{ top: `${(featherY / tubeHeight) * 88}%` }}
                  >
                    <div className={`text-3xl select-none filter drop-shadow-[0_0_8px_#fde047] ${
                      !isVacuum && isDropping ? 'animate-bounce' : ''
                    }`}>
                      🪶
                    </div>
                  </div>
                </div>
                {featherTime !== null && (
                  <span className="text-[10px] font-mono font-black text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-amber-500/50">
                    {featherTime.toFixed(2)} s
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Barra de Controles Inferior de la Cámara */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 z-10">
            {/* Interruptor Bomba de Vacío */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isDropping) {
                    setIsVacuum(!isVacuum);
                    handleReset();
                  }
                }}
                disabled={isDropping}
                className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border shadow-lg ${
                  isVacuum 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-950/50' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
              >
                <Wind className="w-4 h-4" />
                <span>{isVacuum ? 'BOMBA: VACÍO ACTIVADO (ON)' : 'BOMBA: AIRE NORMAL (OFF)'}</span>
              </button>
            </div>

            {/* Botones de Liberación y Reinicio */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer border border-zinc-700"
                title="Subir objetos y reiniciar cronómetro"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleStartDrop}
                disabled={isDropping}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs transition-all cursor-pointer shadow-xl shadow-cyan-500/30 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>SOLTAR CUERPOS SIMULTÁNEAMENTE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Telemetría y Gráficas de Altura vs Tiempo */}
        <div className="lg:col-span-4 h-full flex flex-col justify-between gap-3">
          {/* Gráfica en Tiempo Real: Altura vs Tiempo */}
          <div className="flex-1 rounded-3xl bg-[#030610] border border-cyan-500/30 p-4 flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800 pb-2">
              <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Trayectoria y(t) • Caída Libre
              </span>
              <span className="text-zinc-400 text-[10px]">
                g = 9.81 m/s²
              </span>
            </div>

            {/* SVG Curva Caída */}
            <div className="relative flex-1 w-full my-2 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="none">
                {/* Rejilla */}
                <line x1="20" y1="20" x2="190" y2="20" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2,2" />
                <line x1="20" y1="60" x2="190" y2="60" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2,2" />
                <line x1="20" y1="100" x2="190" y2="100" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2,2" />

                {/* Ejes */}
                <line x1="20" y1="10" x2="20" y2="105" stroke="#475569" strokeWidth="1.2" />
                <line x1="20" y1="105" x2="190" y2="105" stroke="#475569" strokeWidth="1.2" />

                {/* Curva Esfera de Plomo (Parábola Azul) */}
                <path
                  d={`M20,15 Q80,25 140,105`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                />

                {/* Curva Pluma (Amarilla: recta en aire, parábola en vacío) */}
                <path
                  d={isVacuum ? `M20,15 Q80,25 140,105` : `M20,15 L180,105`}
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="2.5"
                  strokeDasharray={isVacuum ? '' : '3,3'}
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
              <span className="text-cyan-400">Esfera (Pb)</span>
              <span>{isVacuum ? 'Vacío: Caída Idéntica' : 'Aire: Resistencia Aerodinámica'}</span>
              <span className="text-yellow-400">Pluma (Ave)</span>
            </div>
          </div>

          {/* Resultado Experimental Inmediato */}
          <div className="rounded-3xl bg-[#090e1f] border border-cyan-500/20 p-4 space-y-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              CONCLUSIÓN CIENTÍFICA OBSERVADA:
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {isVacuum ? (
                <strong className="text-emerald-400">
                  En el vacío, la aceleración gravitatoria es universal e independiente de la masa. Ambos cuerpos tocan el fondo exactamente al mismo tiempo (~2.02 s).
                </strong>
              ) : (
                <strong className="text-amber-300">
                  En presencia de aire, la fuerza de arrastre aerodinámica frena a la pluma, haciendo que caiga más lento, tal como creía erróneamente Aristóteles.
                </strong>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
