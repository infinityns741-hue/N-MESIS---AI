import React, { useMemo } from 'react';
import { Gauge, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SpeedometerGaugeProps {
  velocityMs: number; // Velocidad en m/s
  accelerationMs2: number; // Aceleración en m/s²
  maxSpeedKmh?: number; // Escala máxima en km/h (default: 140)
  compact?: boolean;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  velocityMs,
  accelerationMs2,
  maxSpeedKmh = 140,
  compact = false,
}) => {
  // Conversión m/s a km/h: 1 m/s = 3.6 km/h
  const speedKmh = Math.max(0, velocityMs * 3.6);
  const clampedKmh = Math.min(maxSpeedKmh, speedKmh);

  // Rango angular del velocímetro: de -130° a +130° (260° totales)
  const startAngle = -130;
  const endAngle = 130;
  const totalAngle = endAngle - startAngle;
  const needleAngle = startAngle + (clampedKmh / maxSpeedKmh) * totalAngle;

  // Marcas de la escala (cada 20 km/h marca mayor, cada 10 km/h marca menor)
  const ticks = useMemo(() => {
    const list = [];
    const step = 20;
    for (let speed = 0; speed <= maxSpeedKmh; speed += 10) {
      const isMajor = speed % step === 0;
      const angleDeg = startAngle + (speed / maxSpeedKmh) * totalAngle;
      const angleRad = (angleDeg - 90) * (Math.PI / 180);
      
      const outerR = 88;
      const innerR = isMajor ? 74 : 80;
      const textR = 62;

      const x1 = 100 + outerR * Math.cos(angleRad);
      const y1 = 100 + outerR * Math.sin(angleRad);
      const x2 = 100 + innerR * Math.cos(angleRad);
      const y2 = 100 + innerR * Math.sin(angleRad);
      const tx = 100 + textR * Math.cos(angleRad);
      const ty = 100 + textR * Math.sin(angleRad);

      list.push({
        speed,
        isMajor,
        x1,
        y1,
        x2,
        y2,
        tx,
        ty,
        color: speed > 110 ? '#ef4444' : speed > 80 ? '#f59e0b' : '#38bdf8',
      });
    }
    return list;
  }, [maxSpeedKmh, startAngle, totalAngle]);

  // Estado de aceleración
  const accState = useMemo(() => {
    if (Math.abs(accelerationMs2) < 0.05) {
      return {
        label: 'MRU CTE',
        icon: <Minus className="w-3 h-3 text-cyan-400" />,
        color: 'text-cyan-300 border-cyan-500/40 bg-cyan-950/60',
      };
    }
    if (accelerationMs2 > 0) {
      return {
        label: `+${accelerationMs2.toFixed(1)} m/s²`,
        icon: <TrendingUp className="w-3 h-3 text-emerald-400" />,
        color: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/60',
      };
    }
    return {
      label: `${accelerationMs2.toFixed(1)} m/s²`,
      icon: <TrendingDown className="w-3 h-3 text-rose-400" />,
      color: 'text-rose-300 border-rose-500/40 bg-rose-950/60',
    };
  }, [accelerationMs2]);

  return (
    <div className={`flex flex-col items-center rounded-xl bg-gradient-to-b from-[#090f23]/95 via-[#060a18]/95 to-[#02050f]/95 border border-cyan-500/35 p-1.5 shadow-xl backdrop-blur-md select-none ${compact ? 'w-24' : 'w-28 sm:w-32'}`}>
      {/* Encabezado compacto del instrumento */}
      <div className="w-full flex items-center justify-between pb-0.5 mb-0.5 border-b border-cyan-500/20 text-[9px] font-mono">
        <span className="flex items-center gap-1 text-slate-300 font-bold tracking-tight">
          <Gauge className="w-2.5 h-2.5 text-cyan-400" />
          SPEED
        </span>
        <span className="text-[7.5px] px-1 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-bold">
          KM/H
        </span>
      </div>

      {/* Cuadrante Analógico Circular Compacto SVG (80x80) */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            <linearGradient id="speedArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="60%" stopColor="#10b981" />
              <stop offset="85%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Anillo exterior con textura de bisel */}
          <circle cx="100" cy="100" r="96" fill="url(#bezelGrad)" stroke="#1e293b" strokeWidth="2" />
          <circle cx="100" cy="100" r="92" fill="#040816" stroke="#0ea5e9" strokeWidth="1" strokeOpacity="0.4" />

          {/* Arco guía de velocidad de fondo */}
          <path
            d="M 33.6 157.8 A 86 86 0 1 1 166.4 157.8"
            fill="none"
            stroke="#1e293b"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Arco activo coloreado de velocidad */}
          <path
            d="M 33.6 157.8 A 86 86 0 1 1 166.4 157.8"
            fill="none"
            stroke="url(#speedArcGrad)"
            strokeWidth="4"
            strokeDasharray="390"
            strokeDashoffset={390 - (clampedKmh / maxSpeedKmh) * 390}
            strokeLinecap="round"
          />

          {/* Marcas de graduación compactas (números cada 40 km/h para máxima legibilidad) */}
          {ticks.map((t) => (
            <g key={t.speed}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.color}
                strokeWidth={t.isMajor ? '2' : '1'}
                strokeOpacity={t.isMajor ? '0.9' : '0.5'}
              />
              {t.speed % 40 === 0 && (
                <text
                  x={t.tx}
                  y={t.ty}
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {t.speed}
                </text>
              )}
            </g>
          ))}

          {/* Círculo concéntrico interno */}
          <circle cx="100" cy="100" r="42" fill="#030712" stroke="#1e293b" strokeWidth="1.5" />

          {/* Aguja dinámica del velocímetro con respuesta inmediata */}
          <g
            transform={`rotate(${needleAngle} 100 100)`}
            filter="url(#needleGlow)"
          >
            <line x1="100" y1="100" x2="100" y2="114" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <polygon points="98,100 100,18 102,100" fill="#ef4444" />
            <line x1="100" y1="20" x2="100" y2="40" stroke="#fecaca" strokeWidth="1.5" />
          </g>

          {/* Centro del velocímetro (perno cromado) */}
          <circle cx="100" cy="100" r="7" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="3.5" fill="#ef4444" />
        </svg>

        {/* Display digital central compacto */}
        <div className="absolute top-[67%] flex flex-col items-center pointer-events-none">
          <div className="flex items-baseline gap-0.5">
            <span className="font-mono font-black text-xs text-white tracking-tight leading-none drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]">
              {speedKmh.toFixed(1)}
            </span>
            <span className="text-[7px] font-mono text-cyan-400 font-bold">km/h</span>
          </div>
          <div className="flex items-center gap-0.5 text-[8px] font-mono text-slate-300">
            <span className="text-emerald-400 font-black">{velocityMs.toFixed(1)}</span>
            <span className="text-[6.5px]">m/s</span>
          </div>
        </div>
      </div>

      {/* Chip de Estado Dinámico de Cinemática ultracompacto */}
      <div className={`w-full mt-0.5 px-1.5 py-0.5 rounded-md border flex items-center justify-between text-[8px] font-mono font-bold ${accState.color}`}>
        <div className="flex items-center gap-0.5 truncate">
          {accState.icon}
          <span className="truncate">{accState.label}</span>
        </div>
      </div>
    </div>
  );
};
