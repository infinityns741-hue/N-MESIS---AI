import React, { useState } from 'react';
import { X, Copy, Check, Download, Table, FileSpreadsheet, Sparkles } from 'lucide-react';
import { LatexMath } from './LatexMath';

export interface TelemetryDataPoint {
  t: number;
  x: number;
  v: number;
  a: number;
  deltaX: number;
}

interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataPoints: TelemetryDataPoint[];
  x0: number;
  v0: number;
  acc: number;
  vehicleName: string;
}

export const TelemetryModal: React.FC<TelemetryModalProps> = ({
  isOpen,
  onClose,
  dataPoints,
  x0,
  v0,
  acc,
  vehicleName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generar texto para el portapapeles
  const handleCopy = () => {
    let text = `REGISTRO CINEMÁTICO - ${vehicleName}\n`;
    text += `Condiciones Iniciales: x0=${x0}m, v0=${v0}m/s, a=${acc}m/s²\n\n`;
    text += `Tiempo (s)\tPosición (m)\tVelocidad (m/s)\tVelocidad (km/h)\tAceleración (m/s²)\tDesplazamiento (m)\n`;
    dataPoints.forEach((p) => {
      text += `${p.t.toFixed(2)}\t${p.x.toFixed(2)}\t${p.v.toFixed(2)}\t${(p.v * 3.6).toFixed(1)}\t${p.a.toFixed(2)}\t${p.deltaX.toFixed(2)}\n`;
    });
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Descargar CSV
  const handleDownloadCsv = () => {
    let csv = `Tiempo_s,Posicion_m,Velocidad_ms,Velocidad_kmh,Aceleracion_ms2,Desplazamiento_m\n`;
    dataPoints.forEach((p) => {
      csv += `${p.t.toFixed(2)},${p.x.toFixed(2)},${p.v.toFixed(2)},${(p.v * 3.6).toFixed(1)},${p.a.toFixed(2)},${p.deltaX.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `telemetria_cinematica_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl bg-[#090e24] border-2 border-cyan-500/50 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-slate-100">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-[#0c1433]/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-400 text-cyan-300">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Tabla de Telemetría y Datos Experimentales</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                  {vehicleName}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Parámetros: x₀ = {x0} m • v₀ = {v0} m/s ({(v0 * 3.6).toFixed(1)} km/h) • a = {acc.toFixed(1)} m/s²
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copiar datos */}
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
              title="Copiar datos tabulados para Excel o informe"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>

            {/* Descargar CSV */}
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-600/30"
              title="Descargar archivo CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            {/* Cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Fórmulas Guía de Cinemática en LaTeX */}
        <div className="px-5 py-2.5 bg-[#070b1a] border-b border-zinc-800 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
          <span className="text-cyan-400 font-bold text-xs">Ecuaciones de Movimiento:</span>
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
            <LatexMath math="x(t) = x_0 + v_0 t + \frac{1}{2} a t^2" className="text-sky-300 text-xs" />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
            <LatexMath math="v(t) = v_0 + a t" className="text-emerald-300 text-xs" />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
            <LatexMath math="v^2 = v_0^2 + 2a \Delta x" className="text-rose-300 text-xs" />
          </div>
        </div>

        {/* Tabla con scroll de datos */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[50vh]">
          {dataPoints.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-cyan-400/50" />
              <p className="text-sm font-semibold">No hay datos registrados aún.</p>
              <p className="text-xs text-slate-500 mt-1">Presiona "INICIAR" para comenzar a registrar los datos cinemáticos en tiempo real.</p>
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/30 text-cyan-300 bg-cyan-950/40 text-[11px] uppercase">
                  <th className="py-2.5 px-3">t (s)</th>
                  <th className="py-2.5 px-3">x (m)</th>
                  <th className="py-2.5 px-3">v (m/s)</th>
                  <th className="py-2.5 px-3">v (km/h)</th>
                  <th className="py-2.5 px-3">a (m/s²)</th>
                  <th className="py-2.5 px-3">Δx (m)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {dataPoints.map((row, idx) => (
                  <tr key={idx} className="hover:bg-cyan-950/20 transition-colors">
                    <td className="py-2 px-3 text-cyan-300 font-bold">{row.t.toFixed(2)} s</td>
                    <td className="py-2 px-3 text-white">{row.x.toFixed(2)} m</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">{row.v.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-400">{(row.v * 3.6).toFixed(1)}</td>
                    <td className="py-2 px-3 text-rose-400">{row.a.toFixed(2)}</td>
                    <td className="py-2 px-3 text-cyan-200">{row.deltaX.toFixed(2)} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pie del modal */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#080d22] flex items-center justify-between text-xs text-slate-400">
          <span>Puntos registrados: {dataPoints.length}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
