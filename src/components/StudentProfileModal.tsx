import React from 'react';
import { 
  User, 
  X, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  School, 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Hash, 
  Mail,
  FlaskConical,
  Award
} from 'lucide-react';
import { UserSession } from '../types';
import { TeacherCourse } from '../types/teacher';
import { getCourseSyllabus, getCourseResourceOptions } from '../lib/courseSyllabusStorage';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  activeEnrolledCourse: TeacherCourse | null;
  onLaunchAcademicChat: (course: TeacherCourse) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  session,
  activeEnrolledCourse,
  onLaunchAcademicChat,
}) => {
  if (!isOpen) return null;

  const syllabus = activeEnrolledCourse 
    ? getCourseSyllabus(activeEnrolledCourse.courseName, activeEnrolledCourse.courseCode)
    : null;

  const resourceOptions = activeEnrolledCourse
    ? getCourseResourceOptions(activeEnrolledCourse.courseName, activeEnrolledCourse.id)
    : [];

  const enabledCount = resourceOptions.filter(r => r.enabled).length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090b16] border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Institucional Perfil */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-[#0c1024] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/50">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  UNSAAC • PERFIL ESTUDIANTIL
                </span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-800">
                  ESTADO: REGULAR
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Ficha Académica del Alumno
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Cerrar perfil"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-zinc-300 text-xs">
          
          {/* Card Principal: Datos Personales */}
          <div className="p-4 rounded-2xl bg-[#0e1328] border border-zinc-800 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/60 flex-shrink-0">
              <div className="w-full h-full bg-[#0a0d1d] rounded-[14px] flex items-center justify-center text-lg font-bold text-white font-mono">
                {session.fullName ? session.fullName.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="text-sm sm:text-base font-extrabold text-white truncate">
                {session.fullName || 'Estudiante UNSAAC'}
              </h4>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-zinc-400 font-mono text-[11px]">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-cyan-400" />
                  <span className="truncate">{session.email}</span>
                </span>
                {session.code && (
                  <span className="flex items-center gap-1 text-zinc-300">
                    <Hash className="w-3 h-3 text-amber-400" />
                    <span>Cód: {session.code}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                  I Semestre Académico
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-[10px] font-mono text-indigo-300">
                  Facultad de Ciencias
                </span>
              </div>
            </div>
          </div>

          {/* Banner de Invitación Aceptada / Entorno de Cátedra Activo */}
          {activeEnrolledCourse ? (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-[#0c1322] border border-emerald-500/50 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Entorno de Clase Vinculado
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                  GRUPO {activeEnrolledCourse.group}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-sm font-extrabold text-white">
                      {activeEnrolledCourse.courseName}
                    </h5>
                    <p className="text-[11px] font-mono text-cyan-300">
                      Código: {activeEnrolledCourse.courseCode} • {activeEnrolledCourse.credits || 4} Créditos
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px]">
                    Semestre {activeEnrolledCourse.semester}
                  </span>
                </div>

                {activeEnrolledCourse.schedule && activeEnrolledCourse.schedule.length > 0 && (
                  <div className="text-[11px] text-zinc-300 flex items-center gap-1.5 font-mono pt-1 border-t border-zinc-800/80">
                    <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>
                      {activeEnrolledCourse.schedule.map(s => `${s.day} ${s.timeLabel} (${s.classroom})`).join(' • ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Sílabo del curso vinculado */}
              {syllabus && (
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sílabo Oficial Vigente:</span>
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      Semana {syllabus.currentWeek} de 16
                    </span>
                  </div>
                  <p className="text-xs text-white font-semibold">
                    {syllabus.currentTopic}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {syllabus.currentFocusPrompt}
                  </p>
                </div>
              )}

              {/* Módulos Habilitados por el Docente */}
              {resourceOptions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>RECURSOS HABILITADOS POR EL DOCENTE ({enabledCount}/{resourceOptions.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resourceOptions.map((opt) => (
                      <span
                        key={opt.key}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border flex items-center gap-1 ${
                          opt.enabled
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/80'
                            : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 line-through opacity-60'
                        }`}
                      >
                        {opt.enabled && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />}
                        <span>{opt.label}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón Destacado: Ir al Chat Académico con IA del Curso */}
              <div className="pt-2">
                <button
                  type="button"
                  id="btn-perfil-ir-al-chat-academico"
                  onClick={() => {
                    onLaunchAcademicChat(activeEnrolledCourse);
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/60 transition-all cursor-pointer hover:scale-101 active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-200" />
                  <span>INGRESAR AL CHAT ACADÉMICO ({activeEnrolledCourse.courseName})</span>
                  <ArrowRight className="w-4 h-4 text-cyan-200" />
                </button>
                <p className="text-[10px] text-center text-zinc-400 mt-1.5">
                  El agente IA se adaptará al sílabo y a los recursos habilitados por el profesor.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-dashed border-zinc-800 text-center space-y-2">
              <School className="w-8 h-8 text-zinc-500 mx-auto" />
              <h5 className="text-xs font-bold text-white">Sin cátedra activa seleccionada</h5>
              <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                Revisa tus notificaciones para aceptar invitaciones de tus docentes o solicita a tu profesor que te incorpore a su sala.
              </p>
            </div>
          )}

          {/* Resumen de Seguridad y Credenciales */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Autenticación institucional UNSAAC</span>
            </div>
            <span className="font-mono text-zinc-500">2026-I</span>
          </div>

        </div>

        {/* Footer del Modal */}
        <div className="p-3.5 border-t border-zinc-800 bg-[#0a0d1c] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
