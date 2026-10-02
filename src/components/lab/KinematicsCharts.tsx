import React, { useMemo, useState } from 'react';
import { Activity, Maximize2, Minimize2, HelpCircle } from 'lucide-react';
import { LatexMath } from './LatexMath';

interface TelemetryPoint {
  t: number;
  x: number;
  v: number;
  a: number;
}

interface KinematicsChartsProps {
  telemetryLogs: TelemetryPoint[];
  currentTime: number;
  currentDistance: number;
  currentVelocity: number;
  acceleration: number;
  initialVelocity: number;
  targetDistance: number;
}

export const KinematicsCharts = React.memo<KinematicsChartsProps>(({
  telemetryLogs,
  currentTime,
  currentDistance,
  currentVelocity,
  acceleration,
  initialVelocity,
  targetDistance,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'x' | 'v' | 'a'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{ t: number; val: number; label: string } | null>(null);

  // Determinar los límites de los ejes según el experimento actual
  // Tiempo máximo de escala (mínimo 10 segundos, o basado en el tiempo que toma alcanzar targetDistance)
  const maxTimeScale = useMemo(() => {
    // Estimación de tiempo para meta
    let estT = 10;
    if (initialVelocity > 0 || acceleration > 0) {
      if (Math.abs(acceleration) < 0.01 && initialVelocity > 0) {
        estT = targetDistance / initialVelocity;
      } else if (acceleration > 0) {
        // v0*t + 0.5*a*t^2 = D => t = (-v0 + sqrt(v0^2 + 2*a*D)) / a
        const disc = initialVelocity * initialVelocity + 2 * acceleration * targetDistance;
        estT = (-initialVelocity + Math.sqrt(disc)) / acceleration;
      } else {
        // Frenado
        estT = initialVelocity / Math.abs(acceleration);
      }
    }
    const maxT = Math.max(10, Math.ceil(Math.max(estT * 1.15, currentTime * 1.15) / 2) * 2);
    return Math.min(60, maxT);
  }, [initialVelocity, acceleration, targetDistance, currentTime]);

  // Posición máxima de escala
  const maxXScale = useMemo(() => {
    return Math.max(50, Math.ceil((targetDistance * 1.1) / 25) * 25);
  }, [targetDistance]);

  // Velocidad máxima de escala
  const maxVScale = useMemo(() => {
    const peakV = Math.max(initialVelocity, currentVelocity, initialVelocity + acceleration * maxTimeScale);
    return Math.max(20, Math.ceil((peakV * 1.2) / 10) * 10);
  }, [initialVelocity, currentVelocity, acceleration, maxTimeScale]);

  // Rango de aceleración (-6 a +6 o proporcional)
  const maxAScale = 6;

  // Generar marcas del eje de Tiempo X (ej: 0, 2, 4, 6, 8, 10...)
  const timeTicks = useMemo(() => {
    const count = 5;
    const step = maxTimeScale / count;
    const ticks = [];
    for (let i = 0; i <= count; i++) {
      ticks.push(Number((i * step).toFixed(1)));
    }
    return ticks;
  }, [maxTimeScale]);

  // Generar puntos muestreados a intervalos regulares de tiempo para mostrar claramente en la curva
  // Con puntos como (0s, 0m), (2s, 30m), etc.
  const samplePointsX = useMemo(() => {
    const points: { t: number; x: number; isLive?: boolean }[] = [];
    const step = Math.max(1, Math.floor(maxTimeScale / 6));
    
    // Muestreo teórico hasta el tiempo actual
    for (let t = 0; t <= currentTime; t += step) {
      const x = Math.max(0, initialVelocity * t + 0.5 * acceleration * t * t);
      points.push({ t: Number(t.toFixed(1)), x: Number(x.toFixed(1)) });
    }
    
    // Si el tiempo actual no coincide exactamente con un punto de paso, agregar el punto actual
    if (currentTime > 0) {
      points.push({ t: Number(currentTime.toFixed(2)), x: Number(currentDistance.toFixed(1)), isLive: true });
    }
    return points;
  }, [currentTime, currentDistance, initialVelocity, acceleration, maxTimeScale]);

  const samplePointsV = useMemo(() => {
    const points: { t: number; v: number; isLive?: boolean }[] = [];
    const step = Math.max(1, Math.floor(maxTimeScale / 6));
    
    for (let t = 0; t <= currentTime; t += step) {
      const v = Math.max(0, initialVelocity + acceleration * t);
      points.push({ t: Number(t.toFixed(1)), v: Number(v.toFixed(1)) });
    }
    if (currentTime > 0) {
      points.push({ t: Number(currentTime.toFixed(2)), v: Number(currentVelocity.toFixed(1)), isLive: true });
    }
    return points;
  }, [currentTime, currentVelocity, initialVelocity, acceleration, maxTimeScale]);

  // Dimensiones del área de dibujo SVG
  const width = 360;
  const height = 140;
  const padLeft = 46;
  const padRight = 18;
  const padBottom = 26;
  const padTop = 14;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Transformaciones coordenadas (t -> x_px, val -> y_px)
  const mapX = (t: number) => padLeft + (Math.min(t, maxTimeScale) / maxTimeScale) * plotW;
  const mapY_Pos = (x: number) => padTop + plotH - (Math.min(x, maxXScale) / maxXScale) * plotH;
  const mapY_Vel = (v: number) => padTop + plotH - (Math.min(v, maxVScale) / maxVScale) * plotH;
  const mapY_Acc = (a: number) => padTop + (plotH / 2) - (Math.max(-maxAScale, Math.min(maxAScale, a)) / (2 * maxAScale)) * plotH;

  // Generar trayectorias SVG continuas
  const pathPos = useMemo(() => {
    if (currentTime <= 0) return `M ${mapX(0)} ${mapY_Pos(0)}`;
    const steps = 30;
    let d = `M ${mapX(0)} ${mapY_Pos(0)}`;
    for (let i = 1; i <= steps; i++) {
      const t = (i / steps) * currentTime;
      const x = Math.max(0, initialVelocity * t + 0.5 * acceleration * t * t);
      d += ` L ${mapX(t).toFixed(1)} ${mapY_Pos(x).toFixed(1)}`;
    }
    return d;
  }, [currentTime, initialVelocity, acceleration, maxTimeScale, maxXScale]);

  const pathVel = useMemo(() => {
    const t0 = 0;
    const v0Val = initialVelocity;
    const tCurrent = currentTime;
    const vCurrent = currentVelocity;
    return `M ${mapX(t0)} ${mapY_Vel(v0Val)} L ${mapX(tCurrent)} ${mapY_Vel(vCurrent)}`;
  }, [currentTime, initialVelocity, currentVelocity, maxTimeScale, maxVScale]);

  const pathAcc = useMemo(() => {
    return `M ${mapX(0)} ${mapY_Acc(acceleration)} L ${mapX(currentTime)} ${mapY_Acc(acceleration)}`;
  }, [currentTime, acceleration, maxTimeScale]);

  // CÁLCULO DE ÁREAS BAJO LAS CURVAS (PINTADO DE ÁREA FÍSICA)
  // 1. Área bajo x(t)
  const areaPos = useMemo(() => {
    if (currentTime <= 0) return '';
    const y0 = mapY_Pos(0);
    const steps = 30;
    let d = `M ${mapX(0).toFixed(1)} ${y0.toFixed(1)}`;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * currentTime;
      const x = Math.max(0, initialVelocity * t + 0.5 * acceleration * t * t);
      d += ` L ${mapX(t).toFixed(1)} ${mapY_Pos(x).toFixed(1)}`;
    }
    d += ` L ${mapX(currentTime).toFixed(1)} ${y0.toFixed(1)} Z`;
    return d;
  }, [currentTime, initialVelocity, acceleration, maxTimeScale, maxXScale]);

  // 2. Área bajo v(t): Corresponde exactamente a la distancia recorrida Δx = ∫ v dt
  const areaVel = useMemo(() => {
    if (currentTime <= 0) return '';
    const y0 = mapY_Vel(0);
    const x0 = mapX(0).toFixed(1);
    const xt = mapX(currentTime).toFixed(1);
    const yv0 = mapY_Vel(initialVelocity).toFixed(1);
    const yvt = mapY_Vel(currentVelocity).toFixed(1);
    return `M ${x0} ${y0.toFixed(1)} L ${x0} ${yv0} L ${xt} ${yvt} L ${xt} ${y0.toFixed(1)} Z`;
  }, [currentTime, initialVelocity, currentVelocity, maxTimeScale, maxVScale]);

  // 3. Área bajo a(t): Corresponde al cambio de velocidad Δv = ∫ a dt
  const areaAcc = useMemo(() => {
    if (currentTime <= 0 || Math.abs(acceleration) < 0.01) return '';
    const yZero = mapY_Acc(0).toFixed(1);
    const x0 = mapX(0).toFixed(1);
    const xt = mapX(currentTime).toFixed(1);
    const yAcc = mapY_Acc(acceleration).toFixed(1);
    return `M ${x0} ${yZero} L ${x0} ${yAcc} L ${xt} ${yAcc} L ${xt} ${yZero} Z`;
  }, [currentTime, acceleration, maxTimeScale]);

  return (
    <div className="w-full flex flex-col gap-2 rounded-2xl bg-[#040817] border border-cyan-500/30 p-2 sm:p-3 shadow-2xl">
      {/* Barra superior de pestañas de gráficas */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-cyan-400 font-mono font-bold text-xs">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>GRÁFICAS DE CINEMÁTICA CON PARÁMETROS EN EJES (X, Y)</span>
          </div>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            Puntos y Coordenadas (t, x, v, a)
          </span>
        </div>

        {/* Selector de Vista: Todas / Individual */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2 py-0.8 rounded-lg font-mono font-bold cursor-pointer transition-all ${
              activeTab === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Las 3 Gráficas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('x')}
            className={`px-2 py-0.8 rounded-lg font-mono font-bold cursor-pointer transition-all ${
              activeTab === 'x' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            x(t)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('v')}
            className={`px-2 py-0.8 rounded-lg font-mono font-bold cursor-pointer transition-all ${
              activeTab === 'v' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            v(t)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('a')}
            className={`px-2 py-0.8 rounded-lg font-mono font-bold cursor-pointer transition-all ${
              activeTab === 'a' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            a(t)
          </button>
        </div>
      </div>

      {/* Grid de Gráficas */}
      <div className={`grid gap-2.5 ${activeTab === 'all' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
        {/* =========================================================================
            GRÁFICA 1: POSICIÓN vs TIEMPO x(t)
            ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'x') && (
          <div className="rounded-xl bg-[#020510] border border-sky-500/30 p-2 flex flex-col justify-between shadow-inner relative overflow-hidden">
            {/* Header con Parámetros */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-1 mb-1">
              <span className="text-sky-300 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
                <span>Posición x(t)</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[10px]">Actual:</span>
                <span className="text-white font-black bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-500/40">
                  {currentDistance.toFixed(2)} m
                </span>
              </div>
            </div>

            {/* SVG con Ejes X e Y Graduados, Cuadrícula y Puntos */}
            <div className="relative w-full h-36 flex items-center justify-center">
              <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
                {/* Cuadrícula horizontal (Marcas de Posición Y en metros) */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const val = Math.round(ratio * maxXScale);
                  const y = padTop + plotH - ratio * plotH;
                  return (
                    <g key={`gy-${idx}`}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={padLeft + plotW}
                        y2={y}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray={ratio === 0 ? undefined : '2,2'}
                      />
                      {/* Parámetro numérico en el eje Y */}
                      <text
                        x={padLeft - 6}
                        y={y}
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                        dominantBaseline="central"
                      >
                        {val}m
                      </text>
                    </g>
                  );
                })}

                {/* Cuadrícula vertical (Marcas de Tiempo X en segundos) */}
                {timeTicks.map((t, idx) => {
                  const x = mapX(t);
                  return (
                    <g key={`gx-${idx}`}>
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + plotH}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray={idx === 0 ? undefined : '2,2'}
                      />
                      {/* Parámetro numérico en el eje X */}
                      <text
                        x={x}
                        y={padTop + plotH + 12}
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {t}s
                      </text>
                    </g>
                  );
                })}

                {/* Eje X y Eje Y principales con flechas */}
                <line
                  x1={padLeft}
                  y1={padTop + plotH}
                  x2={padLeft + plotW + 10}
                  y2={padTop + plotH}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <line
                  x1={padLeft}
                  y1={padTop + plotH}
                  x2={padLeft}
                  y2={padTop - 6}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                {/* Rótulo de Ejes */}
                <text x={padLeft + plotW + 14} y={padTop + plotH + 3} fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  t (s)
                </text>
                <text x={padLeft - 4} y={padTop - 7} fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  x (m)
                </text>

                {/* DEFINICIÓN DE GRADIENTES PARA PINTAR EL ÁREA BAJO LA CURVA */}
                <defs>
                  <linearGradient id="posAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* 1. ÁREA PINTADA BAJO LA CURVA DE POSICIÓN */}
                {areaPos && (
                  <path
                    d={areaPos}
                    fill="url(#posAreaGrad)"
                    stroke="#38bdf8"
                    strokeWidth="0.8"
                    strokeDasharray="3,3"
                    strokeOpacity="0.6"
                  />
                )}

                {/* Curva de Trayectoria x(t) */}
                <path
                  d={pathPos}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* PUNTOS DE DATOS REGISTRADOS A LO LARGO DE LA CURVA (ej: t=0, t=2, t=4...) */}
                {samplePointsX.map((pt, i) => {
                  const cx = mapX(pt.t);
                  const cy = mapY_Pos(pt.x);
                  if (pt.isLive) {
                    return (
                      <g key={`pt-live-${i}`}>
                        {/* Halo pulsante en el punto actual */}
                        <circle cx={cx} cy={cy} r="6" fill="#38bdf8" fillOpacity="0.3" className="animate-ping" />
                        <circle cx={cx} cy={cy} r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                        {/* Etiqueta de coordenadas viva */}
                        <g transform={`translate(${Math.min(cx, width - 60)}, ${Math.max(padTop + 14, cy - 10)})`}>
                          <rect x="-2" y="-10" width="56" height="12" rx="3" fill="#0369a1" fillOpacity="0.9" />
                          <text x="26" y="-2" fill="#ffffff" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            ({pt.t}s, {pt.x}m)
                          </text>
                        </g>
                      </g>
                    );
                  }
                  return (
                    <g
                      key={`pt-${i}`}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredPoint({ t: pt.t, val: pt.x, label: 'x' })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <circle cx={cx} cy={cy} r="3" fill="#38bdf8" stroke="#040817" strokeWidth="1" />
                      {/* Coordenadas visibles en cada punto de muestra */}
                      <text
                        x={cx}
                        y={Math.max(padTop + 12, cy - 6)}
                        fill="#bae6fd"
                        fontSize="7.5"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="opacity-80"
                      >
                        ({pt.t}s, {pt.x}m)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Pie de gráfica con Fórmula en LaTeX y Leyenda */}
            <div className="flex items-center justify-between text-[10px] font-mono text-sky-400/90 pt-1.5 border-t border-slate-800/80">
              <span className="text-[9px] text-slate-400">
                {Math.abs(acceleration) < 0.05 ? 'MRU: Recta lineal' : 'MRUV: Parábola'}
              </span>
              <div className="bg-sky-950/70 px-2 py-0.5 rounded border border-sky-500/30 flex items-center">
                <LatexMath 
                  math={Math.abs(acceleration) < 0.05 ? "x(t) = v_0 t" : "x(t) = v_0 t + \\frac{1}{2} a t^2"} 
                  className="text-sky-200 text-xs" 
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            GRÁFICA 2: VELOCIDAD vs TIEMPO v(t)
            ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'v') && (
          <div className="rounded-xl bg-[#020510] border border-emerald-500/30 p-2 flex flex-col justify-between shadow-inner relative overflow-hidden">
            {/* Header con Parámetros */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-1 mb-1">
              <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span>Velocidad v(t)</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[10px]">Actual:</span>
                <span className="text-white font-black bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/40">
                  {currentVelocity.toFixed(2)} m/s
                </span>
              </div>
            </div>

            {/* SVG con Ejes X e Y Graduados, Cuadrícula y Puntos */}
            <div className="relative w-full h-36 flex items-center justify-center">
              <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
                {/* Cuadrícula horizontal (Marcas de Velocidad Y en m/s) */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const val = Math.round(ratio * maxVScale);
                  const y = padTop + plotH - ratio * plotH;
                  return (
                    <g key={`gvy-${idx}`}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={padLeft + plotW}
                        y2={y}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray={ratio === 0 ? undefined : '2,2'}
                      />
                      <text
                        x={padLeft - 6}
                        y={y}
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                        dominantBaseline="central"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Cuadrícula vertical (Tiempo X en segundos) */}
                {timeTicks.map((t, idx) => {
                  const x = mapX(t);
                  return (
                    <g key={`gvx-${idx}`}>
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + plotH}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray={idx === 0 ? undefined : '2,2'}
                      />
                      <text
                        x={x}
                        y={padTop + plotH + 12}
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {t}s
                      </text>
                    </g>
                  );
                })}

                {/* Ejes con flechas */}
                <line
                  x1={padLeft}
                  y1={padTop + plotH}
                  x2={padLeft + plotW + 10}
                  y2={padTop + plotH}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <line
                  x1={padLeft}
                  y1={padTop + plotH}
                  x2={padLeft}
                  y2={padTop - 6}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <text x={padLeft + plotW + 14} y={padTop + plotH + 3} fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  t (s)
                </text>
                <text x={padLeft - 4} y={padTop - 7} fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  v (m/s)
                </text>

                {/* GRADIENTE PARA EL ÁREA BAJO LA CURVA DE VELOCIDAD */}
                <defs>
                  <linearGradient id="velAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.06" />
                  </linearGradient>
                </defs>

                {/* 2. ÁREA PINTADA BAJO LA CURVA v(t) - REPRESENTA FÍSICAMENTE EL ESPACIO RECORRIDO Δx */}
                {areaVel && (
                  <g>
                    <path
                      d={areaVel}
                      fill="url(#velAreaGrad)"
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeDasharray="4,3"
                      strokeOpacity="0.75"
                    />
                    {currentTime > 0.6 && (
                      <text
                        x={(mapX(0) + mapX(currentTime)) / 2}
                        y={padTop + plotH - 6}
                        fill="#6ee7b7"
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Área = Δx ({currentDistance.toFixed(1)}m)
                      </text>
                    )}
                  </g>
                )}

                {/* Recta de Velocidad v(t) */}
                <path
                  d={pathVel}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* PUNTOS DE DATOS REGISTRADOS EN v(t) */}
                {samplePointsV.map((pt, i) => {
                  const cx = mapX(pt.t);
                  const cy = mapY_Vel(pt.v);
                  if (pt.isLive) {
                    return (
                      <g key={`ptv-live-${i}`}>
                        <circle cx={cx} cy={cy} r="6" fill="#10b981" fillOpacity="0.3" className="animate-ping" />
                        <circle cx={cx} cy={cy} r="4" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
                        <g transform={`translate(${Math.min(cx, width - 65)}, ${Math.max(padTop + 14, cy - 10)})`}>
                          <rect x="-2" y="-10" width="60" height="12" rx="3" fill="#047857" fillOpacity="0.9" />
                          <text x="28" y="-2" fill="#ffffff" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                            ({pt.t}s, {pt.v}m/s)
                          </text>
                        </g>
                      </g>
                    );
                  }
                  return (
                    <g key={`ptv-${i}`}>
                      <circle cx={cx} cy={cy} r="3" fill="#34d399" stroke="#040817" strokeWidth="1" />
                      <text
                        x={cx}
                        y={Math.max(padTop + 12, cy - 6)}
                        fill="#a7f3d0"
                        fontSize="7.5"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="opacity-80"
                      >
                        ({pt.t}s, {pt.v})
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Pie de gráfica con Fórmula en LaTeX y Significado del Área */}
            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400/90 pt-1.5 border-t border-slate-800/80">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-400">Área:</span>
                <LatexMath math="\Delta x = \int v\,dt" className="text-emerald-300 text-[10px]" />
              </div>
              <div className="bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center">
                <LatexMath 
                  math="v(t) = v_0 + a t" 
                  className="text-emerald-200 text-xs" 
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            GRÁFICA 3: ACELERACIÓN vs TIEMPO a(t)
            ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'a') && (
          <div className="rounded-xl bg-[#020510] border border-rose-500/30 p-2 flex flex-col justify-between shadow-inner relative overflow-hidden">
            {/* Header con Parámetros */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800 pb-1 mb-1">
              <span className="text-rose-300 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]" />
                <span>Aceleración a(t)</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-[10px]">Actual:</span>
                <span className="text-white font-black bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-500/40">
                  {acceleration.toFixed(2)} m/s²
                </span>
              </div>
            </div>

            {/* SVG con Ejes X e Y Graduados, Cuadrícula y Puntos */}
            <div className="relative w-full h-36 flex items-center justify-center">
              <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
                {/* Marcas de aceleración en eje Y: -6, -3, 0, +3, +6 m/s² */}
                {[-6, -3, 0, 3, 6].map((aTick, idx) => {
                  const y = mapY_Acc(aTick);
                  const isZero = aTick === 0;
                  return (
                    <g key={`gay-${idx}`}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={padLeft + plotW}
                        y2={y}
                        stroke={isZero ? '#475569' : '#1e293b'}
                        strokeWidth={isZero ? '1.5' : '1'}
                        strokeDasharray={isZero ? undefined : '2,2'}
                      />
                      <text
                        x={padLeft - 6}
                        y={y}
                        fill={isZero ? '#e2e8f0' : '#94a3b8'}
                        fontSize="9"
                        fontWeight={isZero ? 'bold' : 'normal'}
                        fontFamily="monospace"
                        textAnchor="end"
                        dominantBaseline="central"
                      >
                        {aTick > 0 ? `+${aTick}` : aTick}
                      </text>
                    </g>
                  );
                })}

                {/* Cuadrícula vertical (Tiempo X) */}
                {timeTicks.map((t, idx) => {
                  const x = mapX(t);
                  return (
                    <g key={`gax-${idx}`}>
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + plotH}
                        stroke="#1e293b"
                        strokeWidth="1"
                        strokeDasharray={idx === 0 ? undefined : '2,2'}
                      />
                      <text
                        x={x}
                        y={padTop + plotH + 12}
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {t}s
                      </text>
                    </g>
                  );
                })}

                {/* Ejes principales */}
                <line
                  x1={padLeft}
                  y1={padTop + plotH}
                  x2={padLeft + plotW + 10}
                  y2={padTop + plotH}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <line
                  x1={padLeft}
                  y1={padTop + plotH}
                  x2={padLeft}
                  y2={padTop - 6}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <text x={padLeft + plotW + 14} y={padTop + plotH + 3} fill="#f43f5e" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  t (s)
                </text>
                <text x={padLeft - 4} y={padTop - 7} fill="#f43f5e" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  a (m/s²)
                </text>

                {/* GRADIENTE PARA EL ÁREA BAJO LA CURVA DE ACELERACIÓN */}
                <defs>
                  <linearGradient id="accAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.06" />
                  </linearGradient>
                </defs>

                {/* 3. ÁREA PINTADA BAJO LA CURVA a(t) - REPRESENTA EL CAMBIO DE VELOCIDAD Δv */}
                {areaAcc && (
                  <g>
                    <path
                      d={areaAcc}
                      fill="url(#accAreaGrad)"
                      stroke="#f43f5e"
                      strokeWidth="1"
                      strokeDasharray="4,3"
                      strokeOpacity="0.75"
                    />
                    {currentTime > 0.6 && (
                      <text
                        x={(mapX(0) + mapX(currentTime)) / 2}
                        y={acceleration >= 0 ? mapY_Acc(0) - 5 : mapY_Acc(0) + 12}
                        fill="#fda4af"
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Área = Δv ({(acceleration * currentTime).toFixed(1)} m/s)
                      </text>
                    )}
                  </g>
                )}

                {/* Línea horizontal constante de aceleración */}
                <path
                  d={pathAcc}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Punto actual de aceleración */}
                {currentTime > 0 && (
                  <g>
                    <circle
                      cx={mapX(currentTime)}
                      cy={mapY_Acc(acceleration)}
                      r="4"
                      fill="#e11d48"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <g transform={`translate(${Math.min(mapX(currentTime), width - 70)}, ${Math.max(padTop + 14, mapY_Acc(acceleration) - 10)})`}>
                      <rect x="-2" y="-10" width="66" height="12" rx="3" fill="#be123c" fillOpacity="0.9" />
                      <text x="31" y="-2" fill="#ffffff" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        ({currentTime.toFixed(1)}s, {acceleration.toFixed(1)}m/s²)
                      </text>
                    </g>
                  </g>
                )}
              </svg>
            </div>

            {/* Pie de gráfica con Fórmula en LaTeX */}
            <div className="flex items-center justify-between text-[10px] font-mono text-rose-400/90 pt-1.5 border-t border-slate-800/80">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-400">Área:</span>
                <LatexMath math="\Delta v = \int a\,dt" className="text-rose-300 text-[10px]" />
              </div>
              <div className="bg-rose-950/70 px-2 py-0.5 rounded border border-rose-500/30 flex items-center">
                <LatexMath 
                  math={Math.abs(acceleration) < 0.05 ? "a(t) = 0" : "a(t) = \\text{cte}"} 
                  className="text-rose-200 text-xs" 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
