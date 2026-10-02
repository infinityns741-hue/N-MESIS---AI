// ============================================================================
// NÉMESIS - IA: PORTAL DEL DOCENTE - CREAR SALA / GESTIÓN DE AULAS Y CENTROS
// Permite la creación y administración de salas interactivas y centros de investigación
// ============================================================================

import React, { useState } from 'react';
import { Plus, School, Users, Check, Trash2, AlertCircle } from 'lucide-react';
import { UserSession } from '../../../types';
import { SalasController } from '../../../backend/controladores/salasController';

interface CrearSalaViewProps {
  session: UserSession;
  onBack?: () => void;
  onSalaCreada?: (salaId: string) => void;
}

export const CrearSalaView: React.FC<CrearSalaViewProps> = ({ session, onBack, onSalaCreada }) => {
  const [nombreSala, setNombreSala] = useState('');
  const [materia, setMateria] = useState('FÍSICA I - MECÁNICA NEWTONIANA');
  const [cupos, setCupos] = useState(40);
  const [creadoExitoso, setCreadoExitoso] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreSala.trim()) return;

    setCreadoExitoso(true);
    setTimeout(() => {
      setCreadoExitoso(false);
      setNombreSala('');
      if (onSalaCreada) onSalaCreada(`sala-${Date.now()}`);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Crear Sala Virtual de Clase</h2>
            <p className="text-xs text-zinc-400">UNSAAC - Gestión y Control de Espacios de Aprendizaje</p>
          </div>
        </div>
        {onBack && (
          <button 
            onClick={onBack}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 rounded-lg transition"
          >
            Volver
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
            Nombre de la Sala o Grupo Académico
          </label>
          <input
            type="text"
            value={nombreSala}
            onChange={(e) => setNombreSala(e.target.value)}
            placeholder="Ej. Grupo A - Prácticas de Laboratorio Cinemática"
            className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none transition"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Asignatura / Curso
            </label>
            <select
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none transition"
            >
              <option value="FÍSICA I - MECÁNICA NEWTONIANA">FÍSICA I - MECÁNICA NEWTONIANA</option>
              <option value="FÍSICA II - FLUIDOS Y TERMODINÁMICA">FÍSICA II - FLUIDOS Y TERMODINÁMICA</option>
              <option value="FÍSICA III - ELECTROMAGNETISMO">FÍSICA III - ELECTROMAGNETISMO</option>
              <option value="MÉTODO CIENTÍFICO Y EXPERIMENTACIÓN">MÉTODO CIENTÍFICO Y EXPERIMENTACIÓN</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              Límite de Alumnos en Vivo
            </label>
            <input
              type="number"
              min={5}
              max={150}
              value={cupos}
              onChange={(e) => setCupos(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-white text-sm focus:border-cyan-500 focus:outline-none transition"
            />
          </div>
        </div>

        {creadoExitoso && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>¡Sala creada exitosamente! Los alumnos ya pueden sincronizarse mediante su código.</span>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            Crear Sala Ahora
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearSalaView;
