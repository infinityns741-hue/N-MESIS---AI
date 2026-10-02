import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  StepBack,
  Sliders, 
  Volume2, 
  VolumeX, 
  Table, 
  Activity, 
  Sun, 
  Moon, 
  Sunset, 
  Clock, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Gauge,
  SlidersHorizontal,
  Car
} from 'lucide-react';
import { DetailedVehicleSvg, VehicleId, VEHICLE_LIST } from './vehicles/DetailedVehicleSvg';
import { EnvironmentBackdrop, TimeOfDay } from './EnvironmentBackdrop';
import { ChronometerWidget } from './ChronometerWidget';
import { KinematicsCharts } from './KinematicsCharts';
import { TelemetryModal, TelemetryDataPoint } from './TelemetryModal';
import { LatexMath } from './LatexMath';

// Función para calcular la hora exacta en Perú (UTC-5) y determinar la fase del día
function getPeruTimeInfo(): { hour: number; minute: number; phase: TimeOfDay; formatted: string } {
  try {
    const now = new Date();
    const limaDateStr = now.toLocaleString('en-US', { timeZone: 'America/Lima' });
    const limaDate = new Date(limaDateStr);
    const hour = limaDate.getHours();
    const minute = limaDate.getMinutes();
    const formatted = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    let phase: TimeOfDay = 'day';
    if (hour >= 6 && hour < 17) {
      phase = 'day';
    } else if (hour >= 17 && hour < 19) {
      phase = 'sunset';
    } else {
      phase = 'night';
    }
    return { hour, minute, phase, formatted };
  } catch {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const peruHour = (utcHours - 5 + 24) % 24;
    const peruMin = now.getUTCMinutes();
    const formatted = `${peruHour.toString().padStart(2, '0')}:${peruMin.toString().padStart(2, '0')}`;
    let phase: TimeOfDay = 'day';
    if (peruHour >= 6 && peruHour < 17) phase = 'day';
    else if (peruHour >= 17 && peruHour < 19) phase = 'sunset';
    else phase = 'night';
    return { hour: peruHour, minute: peruMin, phase, formatted };
  }
}

export const MruKinematicsLab: React.FC = () => {
  // ==========================================
  // 1. PARÁMETROS CINEMÁTICOS DE CONFIGURACIÓN
  // ==========================================
  const [v0, setV0] = useState<number>(15);              // Velocidad inicial (m/s) [por defecto 15 m/s = 54 km/h]
  const [acc, setAcc] = useState<number>(0);             // Aceleración (m/s²) [0 para MRU puro]
  const [targetDistance, setTargetDistance] = useState<number>(150); // Espacio / Distancia meta (m)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleId>('land-cruiser');
  const [showVehicleMenu, setShowVehicleMenu] = useState<boolean>(false);

  // ==========================================
  // 2. ESTADO DEL TIEMPO Y ENTORNO (PERÚ)
  // ==========================================
  const [timeMode, setTimeMode] = useState<'auto' | 'day' | 'sunset' | 'night'>('auto');
  const [peruInfo, setPeruInfo] = useState(getPeruTimeInfo());

  // Actualizar hora de Perú periódicamente
  useEffect(() => {
    const timer = setInterval(() => {
      setPeruInfo(getPeruTimeInfo());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Fase activa del cielo
  const activeTimeOfDay: TimeOfDay = useMemo(() => {
    if (timeMode === 'auto') return peruInfo.phase;
    return timeMode;
  }, [timeMode, peruInfo.phase]);

  const headlightsOn = activeTimeOfDay === 'night' || activeTimeOfDay === 'sunset';

  // ==========================================
  // 3. ESTADO DE SIMULACIÓN Y TELEMETRÍA
  // ==========================================
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [showDataModal, setShowDataModal] = useState<boolean>(false);
  const [showGraphs, setShowGraphs] = useState<boolean>(true);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryDataPoint[]>([]);

  // Referencias para animación en tiempo real y audio
  const animFrameRef = useRef<number | null>(null);
  const currentTimeRef = useRef<number>(0);
  currentTimeRef.current = currentTime;
  const lastLogDropRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Cálculo cinemático instantáneo exacto
  // x(t) = v0*t + 0.5*a*t^2
  // v(t) = v0 + a*t
  const currentDistance = Math.max(0, v0 * currentTime + 0.5 * acc * currentTime * currentTime);
  const currentV = Math.max(0, v0 + acc * currentTime);
  const isBraking = acc < -0.1 && currentV > 0;

  // Posición del vehículo en la pista (de 8% a la izquierda hasta 82% a la derecha)
  // El vehículo arranca en el extremo IZQUIERDO y viaja hacia la DERECHA
  const leftMarginPercent = 8;
  const rightMarginPercent = 82;
  const availableTrackWidth = rightMarginPercent - leftMarginPercent;
  const progressRatio = Math.min(1, Math.max(0, currentDistance / targetDistance));
  const vehicleLeftPercent = leftMarginPercent + progressRatio * availableTrackWidth;

  // Calibración cinemática exacta: rodadura física pura sin deslizamiento (v_rueda = v_suelo)
  // En pantalla, una vuelta completa de 360° equivale al perímetro de la rueda en la pista (~9.5%)
  const visualCircumferencePercent = 9.5;
  const visualTravelPercent = progressRatio * availableTrackWidth;
  const wheelRotationDeg = (visualTravelPercent / visualCircumferencePercent) * 360;

  // =========================================================================
  // CÁMARA DINÁMICA: ZOOM-OUT / ALEJAMIENTO PARA ALTA DISTANCIA Y ALTA VELOCIDAD
  // "si yo pongo velocidad alta, distancia alta, se debe hacer como que un alejamiento"
  // =========================================================================
  const distanceZoomFactor = useMemo(() => {
    // 50m es la escala estándar (zoom = 1.0)
    // Para distancias mayores (100m, 200m, 350m, 500m), la cámara se aleja gradualmente
    if (targetDistance <= 50) return 1.0;
    const factor = Math.log10(targetDistance / 50); // log10(100/50)=0.301, log10(500/50)=1.0
    return Math.max(0.50, 1.0 - factor * 0.48);
  }, [targetDistance]);

  // Alejamiento cinemático dinámico por velocidad alta (efecto cámara dron retrocediendo)
  const speedZoomPull = Math.min(0.12, (currentV / 40) * 0.12);
  const cameraZoom = Math.max(0.46, Math.min(1.05, distanceZoomFactor - speedZoomPull));

  // Límite de tiempo estimado o cuando alcanza la distancia objetivo
  const isGoalReached = currentDistance >= targetDistance && currentTime > 0.1;

  // ==========================================
  // 4. SÍNTESIS DE SONIDO DE MOTOR REALISTA
  // ==========================================
  const startAudio = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      if (!oscillatorRef.current) {
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, audioContextRef.current.currentTime);
        gain.gain.setValueAtTime(0.03, audioContextRef.current.currentTime);
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.start();
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      }
    } catch {
      // Ignorar si audio está restringido
    }
  }, []);

  const stopAudio = useCallback(() => {
    try {
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.05);
      }
      setTimeout(() => {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
          oscillatorRef.current = null;
        }
      }, 80);
    } catch {
      // Ignorar
    }
  }, []);

  // Modulación de tono acústico de motor con la velocidad
  useEffect(() => {
    if (audioEnabled && isPlaying && oscillatorRef.current && audioContextRef.current) {
      const targetFreq = Math.min(300, 60 + currentV * 5 + Math.abs(acc) * 8);
      oscillatorRef.current.frequency.setTargetAtTime(targetFreq, audioContextRef.current.currentTime, 0.08);
    }
  }, [currentV, acc, audioEnabled, isPlaying]);

  // ==========================================
  // 5. ACCIONES DE CONTROL: PLAY, STOP, RESET
  // ==========================================
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioEnabled) stopAudio();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      if (isGoalReached) {
        handleReset();
      }
      setIsPlaying(true);
      if (audioEnabled) startAudio();
      lastLogDropRef.current = currentTime;
    }
  };

  const handleReset = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsPlaying(false);
    if (audioEnabled) stopAudio();
    currentTimeRef.current = 0;
    setCurrentTime(0);
    setTelemetryLogs([]);
    lastLogDropRef.current = 0;
  };

  const handleStepForward = () => {
    if (isGoalReached) return;
    const newT = currentTime + 0.25;
    setCurrentTime(newT);
    const newDist = Math.max(0, v0 * newT + 0.5 * acc * newT * newT);
    const newV = Math.max(0, v0 + acc * newT);
    setTelemetryLogs(prev => [
      ...prev,
      { t: newT, x: newDist, v: newV, a: acc, deltaX: newDist }
    ]);
  };

  const handleStepBack = () => {
    if (currentTime <= 0) return;
    const newT = Math.max(0, currentTime - 0.25);
    setCurrentTime(newT);
    setTelemetryLogs(prev => prev.filter(p => p.t <= newT));
  };

  // ==========================================
  // 6. LOOP DE SIMULACIÓN FÍSICA DE ALTA PRECISIÓN (60 FPS)
  // ==========================================
  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (timestamp: number) => {
      const deltaMs = timestamp - lastTime;
      lastTime = timestamp;
      // Limitar deltaSec para evitar saltos anómalos si el navegador suspende la pestaña
      const deltaSec = Math.min(0.06, Math.max(0.001, deltaMs / 1000));

      const prevT = currentTimeRef.current;
      const nextT = prevT + deltaSec;
      const nextDist = Math.max(0, v0 * nextT + 0.5 * acc * nextT * nextT);
      const nextV = Math.max(0, v0 + acc * nextT);

      currentTimeRef.current = nextT;
      setCurrentTime(nextT);

      // Verificación de fin de carrera: alcance de meta o frenado total
      const isStoppedBraking = nextV <= 0 && acc < 0;
      const isReachedTarget = nextDist >= targetDistance;

      if (isStoppedBraking || isReachedTarget) {
        setIsPlaying(false);
        if (audioEnabled) stopAudio();
        // Registro final de llegada
        setTelemetryLogs((prev) => [
          ...prev,
          {
            t: Number(nextT.toFixed(2)),
            x: Number(nextDist.toFixed(2)),
            v: Number(Math.max(0, nextV).toFixed(2)),
            a: acc,
            deltaX: Number(nextDist.toFixed(2)),
          },
        ]);
        return;
      }

      // Registro de datos de telemetría cada ~0.35 segundos
      if (nextT - lastLogDropRef.current >= 0.35) {
        setTelemetryLogs((prev) => [
          ...prev,
          {
            t: Number(nextT.toFixed(2)),
            x: Number(nextDist.toFixed(2)),
            v: Number(nextV.toFixed(2)),
            a: acc,
            deltaX: Number(nextDist.toFixed(2)),
          },
        ]);
        lastLogDropRef.current = nextT;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, v0, acc, targetDistance, audioEnabled, stopAudio]);

  // Si se cambian las condiciones iniciales en reposo
  useEffect(() => {
    if (!isPlaying && currentTime === 0) {
      setTelemetryLogs([]);
    }
  }, [v0, acc, targetDistance]);

  const currentVehicleObj = VEHICLE_LIST.find(v => v.id === selectedVehicle) || VEHICLE_LIST[0];

  return (
    <div className="w-full h-full flex flex-col select-none overflow-hidden bg-[#070b19] text-slate-100 font-sans">
      {/* =========================================================================
          1. BARRA DE HERRAMIENTAS: HORA DE PERÚ, ENTORNO Y SONIDO
          ========================================================================= */}
      <div className="flex-shrink-0 h-11 bg-[#090e21] border-b border-cyan-500/25 px-3 sm:px-6 flex items-center justify-between z-30">
        {/* Izquierda: Reloj de Perú y Selector de Fase Atmosférica */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono">
            <span className="text-base leading-none">🇵🇪</span>
            <span className="text-slate-400 font-semibold hidden sm:inline">Hora Perú:</span>
            <span className="text-cyan-300 font-black">{peruInfo.formatted}</span>
            <span className="text-[10px] text-cyan-400 uppercase font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40">
              {peruInfo.phase === 'day' ? 'Día' : peruInfo.phase === 'sunset' ? 'Atardecer' : 'Noche'}
            </span>
          </div>

          {/* Selector de Modo de Luz / Hora */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-0.5 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTimeMode('auto')}
              className={`px-2 py-0.8 rounded-lg font-bold transition-all cursor-pointer ${
                timeMode === 'auto'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Automático: Sincronizado con la hora real de Perú"
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setTimeMode('day')}
              className={`px-2 py-0.8 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                timeMode === 'day'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Forzar modo Día soleado"
            >
              <Sun className="w-3 h-3" />
              <span className="hidden sm:inline">Día</span>
            </button>
            <button
              type="button"
              onClick={() => setTimeMode('sunset')}
              className={`px-2 py-0.8 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                timeMode === 'sunset'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Forzar modo Atardecer"
            >
              <Sunset className="w-3 h-3" />
              <span className="hidden sm:inline">Tarde</span>
            </button>
            <button
              type="button"
              onClick={() => setTimeMode('night')}
              className={`px-2 py-0.8 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                timeMode === 'night'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Forzar modo Noche estrellada"
            >
              <Moon className="w-3 h-3" />
              <span className="hidden sm:inline">Noche</span>
            </button>
          </div>
        </div>

        {/* Derecha: Botón de Audio y Ver Gráficas */}
        <div className="flex items-center gap-2">
          {/* Toggle de Sonido de Motor */}
          <button
            type="button"
            onClick={() => {
              const next = !audioEnabled;
              setAudioEnabled(next);
              if (!next) stopAudio();
              else if (isPlaying) startAudio();
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              audioEnabled
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 shadow-md'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Activar o desactivar sonido acústico del motor"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{audioEnabled ? 'Sonido ON' : 'Sonido'}</span>
          </button>

          {/* Toggle para mostrar/ocultar gráficas de análisis */}
          <button
            type="button"
            onClick={() => setShowGraphs(!showGraphs)}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              showGraphs
                ? 'bg-slate-800 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Ver u ocultar gráficas del osciloscopio"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gráficas</span>
            {showGraphs ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. ESCENARIO REALISTA: PAISAJE (ÁRBOLES, CÉSPED, MONTAÑAS, PISTA ASFALTO)
             Y VEHÍCULO ORIENTADO HACIA LA DERECHA ARRANCANDO DESDE LA IZQUIERDA
          ========================================================================= */}
      <div className="relative w-full h-[38vh] sm:h-[42vh] flex-shrink-0 overflow-hidden shadow-2xl border-b border-cyan-500/30">
        {/* Entorno dinámico: cielo según hora de Perú, montañas, árboles que se mecen, césped y pista */}
        <EnvironmentBackdrop timeOfDay={activeTimeOfDay} />

        {/* CRONÓMETRO DE PRECISIÓN FLOTANTE (ARRIBA A LA IZQUIERDA) */}
        <div className="absolute top-3 left-3 z-30">
          <ChronometerWidget
            currentTime={currentTime}
            isPlaying={isPlaying}
            currentVelocity={currentV}
            currentDistance={currentDistance}
            acceleration={acc}
          />
        </div>

        {/* BADGE DE CÁMARA DINÁMICA (ALEJAMIENTO PARA ALTA DISTANCIA / ALTA VELOCIDAD) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-2.5 py-0.5 rounded-full bg-slate-950/85 border border-cyan-500/40 text-cyan-300 font-mono text-[9.5px] flex items-center gap-1.5 shadow-xl backdrop-blur-md">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
          <span className="font-bold">CÁMARA: {cameraZoom.toFixed(2)}x</span>
          {targetDistance > 50 && (
            <span className="text-slate-300 hidden sm:inline">• Alejamiento panorámico ({targetDistance} m)</span>
          )}
        </div>

        {/* META / DISTANCIA OBJETIVO (SEÑALIZACIÓN VERTICAL EN LA PISTA) */}
        <div 
          className="absolute bottom-20 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
          style={{ 
            left: `${rightMarginPercent}%`,
            transform: `scale(${Math.max(0.72, cameraZoom)})`,
            transformOrigin: 'bottom center',
            transition: isPlaying ? 'none' : 'transform 0.4s ease-out',
          }}
        >
          <div className="px-2 py-0.5 rounded-md bg-amber-500/95 text-black font-mono font-black text-[9px] shadow-lg border border-amber-300 flex items-center gap-1 mb-0.5">
            <span>🏁 META: {targetDistance} m</span>
          </div>
          <div className="w-0.5 h-16 bg-amber-400/80 border-r border-dashed border-amber-300" />
        </div>

        {/* LÍNEA DE PARTIDA (A LA IZQUIERDA EN x=0m) */}
        <div 
          className="absolute bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
          style={{ 
            left: `${leftMarginPercent}%`,
            transform: `scale(${Math.max(0.72, cameraZoom)})`,
            transformOrigin: 'bottom center',
            transition: isPlaying ? 'none' : 'transform 0.4s ease-out',
          }}
        >
          <div className="px-1.5 py-0.5 rounded bg-black/85 text-white font-mono font-bold text-[8px] border border-slate-600 mb-0.5">
            x₀ = 0 m
          </div>
          <div className="w-1 h-20 bg-white/60" />
        </div>

        {/* =========================================================================
            MÓVIL REALISTA: ORIENTADO DE IZQUIERDA A DERECHA (VIAJA HACIA LA DERECHA)
            MOVIMIENTO DIRECTO A 60 FPS SIN RETARDOS DE CSS + ESCALA DE CÁMARA (ALEJAMIENTO)
            ========================================================================= */}
        <div
          className="absolute bottom-4 -translate-x-1/2 z-20 pointer-events-none will-change-transform"
          style={{ 
            left: `${vehicleLeftPercent}%`,
            transform: `scale(${cameraZoom})`,
            transformOrigin: 'bottom center',
            transition: isPlaying ? 'none' : 'transform 0.4s ease-out, left 0.15s ease-out',
          }}
        >
          {/* Renderizado de carrocería detallada, aros que giran, lunas, manillas, faros */}
          <DetailedVehicleSvg
            vehicleId={selectedVehicle}
            wheelRotationDeg={wheelRotationDeg}
            headlightsOn={headlightsOn}
            isBraking={isBraking}
          />
        </div>

        {/* ALERTA VISUAL CUANDO ALCANZA LA META */}
        {isGoalReached && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 px-6 py-3 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 text-white text-center shadow-2xl backdrop-blur-md animate-in zoom-in-95">
            <h4 className="text-base font-black text-emerald-300">¡Distancia Meta Alcanzada!</h4>
            <p className="text-xs font-mono text-slate-200 mt-1">
              Recorrido: {currentDistance.toFixed(2)} m en {currentTime.toFixed(2)} s (Velocidad final: {currentV.toFixed(2)} m/s)
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          3. CONSOLA DE MANDO Y CONFIGURACIÓN: BOTONES START, STOP, REINICIAR,
             CONFIGURAR VELOCIDAD, ACELERACIÓN, DISTANCIA Y VER DATOS
          ========================================================================= */}
      <div className="flex-1 bg-[#050916] px-3 sm:px-6 py-2.5 flex flex-col justify-between overflow-y-auto">
        {/* FILA 1: BOTONES GRANDES DE ACCIÓN RÁPIDA (START, STOP, RESET, VER DATOS) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-cyan-500/20">
          {/* Controles de Reproducción Principales */}
          <div className="flex items-center gap-2">
            {/* BOTÓN PRINCIPAL: SOLO "INICIAR" / "PAUSAR" (REQUERIMIENTO EXACTO DEL USUARIO) */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2 shadow-xl hover:scale-102 active:scale-98 ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-500/30'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>PAUSAR</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>INICIAR</span>
                </>
              )}
            </button>

            {/* BOTÓN REINICIAR */}
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-slate-700 shadow-md"
              title="Reiniciar a la posición inicial (x=0, t=0)"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>REINICIAR</span>
            </button>

            {/* Paso a paso */}
            <button
              type="button"
              onClick={handleStepBack}
              disabled={isPlaying || currentTime <= 0}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 border border-slate-800"
              title="Paso Atrás (-0.25s)"
            >
              <StepBack className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleStepForward}
              disabled={isPlaying || isGoalReached}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 border border-slate-800"
              title="Paso Adelante (+0.25s)"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* BOTÓN "COCHE" CON LISTA DESPLAZANTE AL HACER CLIC */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVehicleMenu(!showVehicleMenu)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900/95 hover:bg-slate-800 text-white border border-cyan-500/50 hover:border-cyan-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950/40"
              title="Abrir lista de coches"
            >
              <Car className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">Coche:</span>
              <span className="text-cyan-300 font-extrabold max-w-[130px] sm:max-w-[170px] truncate">
                {currentVehicleObj.name}
              </span>
              <span
                className="w-3 h-3 rounded-full border border-white/60 shadow-sm flex-shrink-0"
                style={{ backgroundColor: currentVehicleObj.primaryColor }}
              />
              <ChevronDown
                className={`w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 ${
                  showVehicleMenu ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* LISTA DESPLAZANTE / DROPDOWN DE COCHES */}
            {showVehicleMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowVehicleMenu(false)}
                />
                <div className="absolute top-full left-0 sm:right-auto sm:left-0 mt-2 w-72 sm:w-80 max-h-80 overflow-y-auto rounded-2xl bg-[#040817]/95 backdrop-blur-xl border border-cyan-500/50 p-2 shadow-2xl z-50 divide-y divide-slate-800/80">
                  <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] font-mono font-bold text-cyan-400 border-b border-cyan-500/30 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5" />
                      <span>LISTA DE COCHES ({VEHICLE_LIST.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Desplaza para elegir</span>
                  </div>

                  <div className="flex flex-col gap-1 py-1">
                    {VEHICLE_LIST.map((veh) => {
                      const isSelected = selectedVehicle === veh.id;
                      return (
                        <button
                          key={veh.id}
                          type="button"
                          onClick={() => {
                            setSelectedVehicle(veh.id);
                            setShowVehicleMenu(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-950/80 border border-cyan-400 text-white shadow-md'
                              : 'hover:bg-slate-900 border border-transparent text-slate-300 hover:text-white'
                          }`}
                        >
                          <div
                            className="w-3.5 h-3.5 rounded-full border-2 border-white/60 shadow flex-shrink-0"
                            style={{ backgroundColor: veh.primaryColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs truncate">{veh.name}</span>
                              {isSelected && (
                                <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-black flex-shrink-0">
                                  ACTIVO
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-cyan-300/90 truncate">{veh.tag}</div>
                            <div className="text-[9px] text-slate-400 truncate">{veh.specs}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* BOTÓN VER TABLA DE DATOS */}
          <button
            type="button"
            onClick={() => setShowDataModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 font-bold text-xs flex items-center gap-2 border border-cyan-400/50 shadow-md shadow-cyan-950/40 cursor-pointer"
          >
            <Table className="w-4 h-4" />
            <span>VER TABLA DE DATOS</span>
            {telemetryLogs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-black text-[10px] font-black">
                {telemetryLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* FILA 2: CONTROLES DE PARÁMETROS (VELOCIDAD, ACELERACIÓN, DISTANCIA Y PRESETS) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center my-1.5">
          {/* Controles Físicos: Sliders y Cajas de Texto Numéricas (Requerimiento del Usuario) */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Control Velocidad Inicial v0: Con Caja de Texto y Deslizador */}
            <div className="p-2 rounded-2xl bg-slate-950/85 border border-emerald-500/40 space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold text-xs">Velocidad</span>
                  <LatexMath math="v_0" className="text-emerald-300 text-xs font-bold" />
                </div>
                {/* Campo de texto numérico para escribir la velocidad */}
                <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-lg border border-emerald-500/40 focus-within:border-emerald-400 transition-colors">
                  <input
                    type="number"
                    min={0}
                    max={60}
                    step={1}
                    value={v0}
                    disabled={isPlaying}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) setV0(Math.max(0, Math.min(60, val)));
                    }}
                    className="w-11 bg-transparent text-white font-mono font-bold text-xs text-right focus:outline-none"
                    title="Escribe la velocidad directamente"
                  />
                  <span className="text-[10px] text-emerald-300 font-mono">m/s</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={v0}
                disabled={isPlaying}
                onChange={(e) => setV0(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5"
                title={`Velocidad: ${v0} m/s (${(v0 * 3.6).toFixed(0)} km/h)`}
              />
              <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400">
                <span>0 m/s</span>
                <span className="text-emerald-300/90 font-bold">{(v0 * 3.6).toFixed(0)} km/h</span>
                <span>40 m/s</span>
              </div>
            </div>

            {/* Control Aceleración a: Con Caja de Texto y Deslizador */}
            <div className="p-2 rounded-2xl bg-slate-950/85 border border-rose-500/40 space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-rose-400 font-bold text-xs">Aceleración</span>
                  <LatexMath math="a" className="text-rose-300 text-xs font-bold" />
                </div>
                {/* Campo de texto numérico para escribir la aceleración */}
                <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-lg border border-rose-500/40 focus-within:border-rose-400 transition-colors">
                  <input
                    type="number"
                    min={-6}
                    max={6}
                    step={0.1}
                    value={acc}
                    disabled={isPlaying}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) setAcc(Math.max(-6, Math.min(6, val)));
                    }}
                    className="w-12 bg-transparent text-white font-mono font-bold text-xs text-right focus:outline-none"
                    title="Escribe la aceleración directamente"
                  />
                  <span className="text-[10px] text-rose-300 font-mono">m/s²</span>
                </div>
              </div>
              <input
                type="range"
                min="-6.0"
                max="6.0"
                step="0.5"
                value={acc}
                disabled={isPlaying}
                onChange={(e) => setAcc(parseFloat(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer h-1.5"
                title={`Aceleración: ${acc.toFixed(1)} m/s²`}
              />
              <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400">
                <span>-6 m/s²</span>
                <span className={`font-bold ${Math.abs(acc) < 0.01 ? 'text-cyan-400' : 'text-rose-300'}`}>
                  {Math.abs(acc) < 0.01 ? 'MRU puro' : `${acc > 0 ? '+' : ''}${acc.toFixed(1)}`}
                </span>
                <span>+6 m/s²</span>
              </div>
            </div>

            {/* Control Distancia Meta d: Con Caja de Texto y Deslizador */}
            <div className="p-2 rounded-2xl bg-slate-950/85 border border-cyan-500/40 space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold text-xs">Distancia</span>
                  <LatexMath math="d" className="text-cyan-300 text-xs font-bold" />
                </div>
                {/* Campo de texto numérico para escribir la distancia */}
                <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-lg border border-cyan-500/40 focus-within:border-cyan-400 transition-colors">
                  <input
                    type="number"
                    min={20}
                    max={400}
                    step={10}
                    value={targetDistance}
                    disabled={isPlaying}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) setTargetDistance(Math.max(20, Math.min(400, Math.round(val))));
                    }}
                    className="w-12 bg-transparent text-white font-mono font-bold text-xs text-right focus:outline-none"
                    title="Escribe la distancia meta directamente"
                  />
                  <span className="text-[10px] text-cyan-300 font-mono">m</span>
                </div>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="10"
                value={targetDistance}
                disabled={isPlaying}
                onChange={(e) => setTargetDistance(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5"
                title={`Espacio meta: ${targetDistance} m`}
              />
              <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-400">
                <span>30 m</span>
                <span className="text-cyan-300/90 font-bold">{targetDistance} m</span>
                <span>300 m</span>
              </div>
            </div>
          </div>

          {/* Presets Rápidos Didácticos */}
          <div className="md:col-span-4 flex flex-wrap sm:flex-nowrap items-center gap-1.5 justify-end">
            <button
              type="button"
              onClick={() => {
                setV0(20);
                setAcc(0);
                setTargetDistance(150);
                handleReset();
              }}
              className="flex-1 px-2 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold cursor-pointer transition-all text-center"
            >
              MRU Puro (a=0)
            </button>
            <button
              type="button"
              onClick={() => {
                setV0(0);
                setAcc(3.5);
                setTargetDistance(150);
                handleReset();
              }}
              className="flex-1 px-2 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold cursor-pointer transition-all text-center"
            >
              Acelerado (v₀=0)
            </button>
            <button
              type="button"
              onClick={() => {
                setV0(25);
                setAcc(-4.0);
                setTargetDistance(120);
                handleReset();
              }}
              className="flex-1 px-2 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[11px] font-bold cursor-pointer transition-all text-center"
            >
              Frenado (a &lt; 0)
            </button>
          </div>
        </div>

        {/* =========================================================================
            4. SECCIÓN DE GRÁFICAS DE ANÁLISIS FÍSICO CON EJES X/Y Y PUNTOS DE DATOS
            ========================================================================= */}
        {showGraphs && (
          <div className="pt-2">
            <KinematicsCharts
              telemetryLogs={telemetryLogs}
              currentTime={currentTime}
              currentDistance={currentDistance}
              currentVelocity={currentV}
              acceleration={acc}
              initialVelocity={v0}
              targetDistance={targetDistance}
            />
          </div>
        )}
      </div>

      {/* =========================================================================
          5. MODAL DE TABLA DE TELEMETRÍA EXPERIMENTAL Y DESCARGA CSV
          ========================================================================= */}
      <TelemetryModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
        dataPoints={telemetryLogs}
        x0={0}
        v0={v0}
        acc={acc}
        vehicleName={currentVehicleObj.name}
      />
    </div>
  );
};
