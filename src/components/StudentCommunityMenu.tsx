import React, { useState, useEffect, useRef } from 'react';
import { 
  Bug, 
  Globe, 
  Bell, 
  BookOpen,
  User,
  FlaskConical,
  X
} from 'lucide-react';
import { UserSession } from '../types';
import { TeacherCourse } from '../types/teacher';
import { StudentWorldPage } from './StudentWorldPage';
import { StudentNotificationsModal } from './StudentNotificationsModal';
import { StudentLibraryPage } from './StudentLibraryPage';
import { StudentProfileModal } from './StudentProfileModal';
import { StudentVirtualLabPage } from './StudentVirtualLabPage';
import { getActiveAcademicCourseForStudent } from '../lib/courseSyllabusStorage';

interface StudentCommunityMenuProps {
  session: UserSession;
  floatingBtnBg: string;
  onSelectAcademicCourse?: (course: TeacherCourse) => void;
}

export const StudentCommunityMenu: React.FC<StudentCommunityMenuProps> = ({
  session,
  floatingBtnBg,
  onSelectAcademicCourse,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'none' | 'world' | 'notifications' | 'library' | 'profile' | 'laboratory'>('none');
  const [enrolledCourse, setEnrolledCourse] = useState<TeacherCourse | null>(() => 
    getActiveAcademicCourseForStudent(session.email || session.code || 'default')
  );

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Alert counters
  const notifCount = 3;
  const totalAlerts = notifCount;

  return (
    <>
      <div ref={menuRef} className="fixed top-3 right-3 sm:top-4 sm:right-4 z-30">
        {/* Botón Flotante Superior Derecho con ícono de oruga/cucaracha (Bug) */}
        <button
          id="btn-student-community-worm"
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`p-2.5 rounded-2xl border backdrop-blur-md transition-all cursor-pointer group relative shadow-lg ${floatingBtnBg}`}
          title="Opciones: Entrar al mundo, Notificaciones, Mensajes privados"
          aria-label="Menú de comunidad (Mundo, Notificaciones, Mensajes)"
          aria-expanded={isMenuOpen}
        >
          {/* Ícono de oruga / cucaracha */}
          <Bug className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 group-hover:scale-110 group-hover:rotate-12 transition-all" />

          {/* Badge de alertas */}
          {totalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-black">
              {totalAlerts > 9 ? '9+' : totalAlerts}
            </span>
          )}
        </button>

        {/* Popover Menú con las 3 opciones */}
        {isMenuOpen && (
          <div 
            id="popover-student-community-options"
            className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-3xl bg-[#0c0f1e]/98 backdrop-blur-2xl border border-emerald-500/40 shadow-2xl shadow-emerald-950/70 p-3.5 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Cabecera del Menú: 'COMUNIDAD Y MUNDO' (sin &, sin 'Estudiante UNSAAC (Google)') */}
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-800/90 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/90 border border-emerald-500/50 flex items-center justify-center shadow-sm">
                  <Bug className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white tracking-wider font-mono uppercase">
                    COMUNIDAD Y MUNDO
                  </h4>
                  <p className="text-[10px] font-mono text-zinc-400">
                    Opciones de campus y comunicación
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Cerrar opciones"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Opción 1: Entrar al mundo (Abre página nueva limpia sin contenido viejo) */}
            <button
              id="btn-option-entrar-al-mundo"
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setActiveView('world');
              }}
              className="w-full p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-cyan-500/20 hover:border-cyan-500/60 flex items-center justify-between gap-3 group transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block group-hover:text-cyan-300 transition-colors truncate">
                    Entrar al mundo
                  </span>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    Campus virtual 3D, salas 24/7 y avatares
                  </span>
                </div>
              </div>

              {/* Badge En vivo sin salto de línea (whitespace-nowrap flex-shrink-0) */}
              <span className="whitespace-nowrap flex-shrink-0 px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-700/80 shadow-sm">
                En vivo
              </span>
            </button>

            {/* Opción 2: Notificaciones (Abre modal con eliminar todo, invitaciones docentes y aceptar/rechazar) */}
            <button
              id="btn-option-notificaciones"
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setActiveView('notifications');
              }}
              className="w-full p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-amber-500/20 hover:border-amber-500/60 flex items-center justify-between gap-3 group transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-950/70 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform flex-shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors truncate">
                    Notificaciones
                  </span>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    Alertas de cátedra, notas y avisos
                  </span>
                </div>
              </div>

              {/* Badge 3 nuevas sin salto de línea (whitespace-nowrap flex-shrink-0) */}
              <span className="whitespace-nowrap flex-shrink-0 px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 text-[10px] font-mono font-bold border border-amber-700/80 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>3 nuevas</span>
              </span>
            </button>

            {/* Opción 3: Biblioteca (Abre repositorio de libros PDF por categorías y lector digital) */}
            <button
              id="btn-option-biblioteca"
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setActiveView('library');
              }}
              className="w-full p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-indigo-500/20 hover:border-indigo-500/60 flex items-center justify-between gap-3 group transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block group-hover:text-indigo-300 transition-colors truncate">
                    Biblioteca
                  </span>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    Categorías de libros PDF, visor y descargas
                  </span>
                </div>
              </div>

              <span className="whitespace-nowrap flex-shrink-0 px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-700/80 shadow-sm">
                PDFs
              </span>
            </button>

            {/* Opción 5: Laboratorio (Laboratorio Virtual de Física I y Ciencias Experimentales) */}
            <button
              id="btn-option-laboratorio"
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setActiveView('laboratory');
              }}
              className="w-full p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-emerald-500/20 hover:border-emerald-500/60 flex items-center justify-between gap-3 group transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform flex-shrink-0">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block group-hover:text-emerald-300 transition-colors truncate">
                    Laboratorio
                  </span>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    Física I: Método Científico, SI & Cinemática MRU
                  </span>
                </div>
              </div>

              <span className="whitespace-nowrap flex-shrink-0 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-700/80 shadow-sm">
                Virtual
              </span>
            </button>

            {/* Opción 6: Mi Perfil Estudiantil */}
            <button
              id="btn-option-mi-perfil"
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setActiveView('profile');
              }}
              className="w-full p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/95 border border-cyan-500/20 hover:border-cyan-500/60 flex items-center justify-between gap-3 group transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block group-hover:text-cyan-300 transition-colors truncate">
                    Mi Perfil Estudiantil
                  </span>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    Ficha académica, cursos activos y cátedras
                  </span>
                </div>
              </div>

              <span className="whitespace-nowrap flex-shrink-0 px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-700/80 shadow-sm">
                UNSAAC
              </span>
            </button>
          </div>
        )}
      </div>

      {/* VISTA EN PÁGINA NUEVA: Laboratorio Virtual Universitario (Método Científico, SI, MRU) */}
      {activeView === 'laboratory' && (
        <StudentVirtualLabPage
          session={session}
          onBack={() => setActiveView('none')}
        />
      )}

      {/* VISTA EN PÁGINA NUEVA: Entrar al Mundo (Donde todos pueden chatear en tiempo real) */}
      {activeView === 'world' && (
        <StudentWorldPage
          session={session}
          onBack={() => setActiveView('none')}
          onOpenLibrary={() => setActiveView('library')}
        />
      )}

      {/* VISTA EN PÁGINA NUEVA: Biblioteca Digital Universitaria (Libros PDF, categorías, visor y descargas) */}
      {activeView === 'library' && (
        <StudentLibraryPage
          session={session}
          onBack={() => setActiveView('none')}
        />
      )}

      {/* MODAL: Notificaciones (Eliminar todo, invitaciones a cátedras docentes, aceptar y entrar al curso) */}
      <StudentNotificationsModal
        isOpen={activeView === 'notifications'}
        onClose={() => setActiveView('none')}
        session={session}
        onEnterCourseRoom={(courseName) => {
          setActiveView('world');
        }}
        onAcceptAndRedirectToProfile={(course) => {
          setEnrolledCourse(course);
          setActiveView('profile');
        }}
      />

      {/* MODAL: Perfil del Alumno (Redirigido tras aceptar invitación de cátedra) */}
      <StudentProfileModal
        isOpen={activeView === 'profile'}
        onClose={() => setActiveView('none')}
        session={session}
        activeEnrolledCourse={enrolledCourse}
        onLaunchAcademicChat={(course) => {
          setEnrolledCourse(course);
          setActiveView('none');
          if (onSelectAcademicCourse) {
            onSelectAcademicCourse(course);
          }
        }}
      />
    </>
  );
};
