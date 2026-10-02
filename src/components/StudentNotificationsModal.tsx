import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  DoorOpen, 
  GraduationCap, 
  CheckCheck, 
  Calendar, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { UserSession } from '../types';

export interface StudentNotification {
  id: string;
  type: 'invitation' | 'academic' | 'system';
  title: string;
  description: string;
  teacherName?: string;
  courseName?: string;
  courseId?: string;
  classroom?: string;
  schedule?: string;
  timestamp: string;
  isRead: boolean;
  invitationStatus?: 'pending' | 'accepted' | 'declined';
}

interface StudentNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onEnterCourseRoom?: (courseName: string, courseId?: string) => void;
  onAcceptAndRedirectToProfile?: (course: any) => void;
}

const DEFAULT_NOTIFICATIONS: StudentNotification[] = [
  {
    id: 'notif-inv-1',
    type: 'invitation',
    title: 'Invitación a Curso y Sala de Cátedra',
    description: 'El docente Ing. Carlos Ramos te ha enviado una invitación para incorporarte a su sala de cátedra en vivo.',
    teacherName: 'Ing. Carlos Ramos',
    courseName: 'Base de Datos II (Grupo A)',
    courseId: 'BD-201-A',
    classroom: 'Aula 302 • Pabellón Sistemas',
    schedule: 'Lun y Mié 09:00 - 11:00',
    timestamp: 'Hace 10 min',
    isRead: false,
    invitationStatus: 'pending',
  },
  {
    id: 'notif-inv-2',
    type: 'invitation',
    title: 'Invitación a Taller de Laboratorio Especializado',
    description: 'Invitación del Departamento Académico de Informática para el Taller de Cloud Computing y Supabase.',
    teacherName: 'Mg. Ana Lucía Mendoza',
    courseName: 'Laboratorio de DevOps y Cloud (Grupo B)',
    courseId: 'CLOUD-LAB-B',
    classroom: 'Laboratorio LAB-04',
    schedule: 'Viernes 14:00 - 16:00',
    timestamp: 'Hace 1 hora',
    isRead: false,
    invitationStatus: 'pending',
  },
  {
    id: 'notif-pc-3',
    type: 'academic',
    title: 'Práctica Calificada 03 Aperturada',
    description: 'Se ha habilitado la entrega de la PC03 de Normalización y Consultas SQL Avanzadas.',
    timestamp: 'Hace 3 horas',
    isRead: false,
  },
  {
    id: 'notif-asist-4',
    type: 'academic',
    title: 'Asistencia Registrada con Éxito',
    description: 'Asistencia PUNTUAL confirmada por el docente en la sesión matutina.',
    timestamp: 'Hoy, 08:02',
    isRead: true,
  },
];

export const StudentNotificationsModal: React.FC<StudentNotificationsModalProps> = ({
  isOpen,
  onClose,
  session,
  onEnterCourseRoom,
  onAcceptAndRedirectToProfile,
}) => {
  const STORAGE_KEY = `nemesis_notifs_v2_${session.email || session.code || 'default'}`;

  const [notifications, setNotifications] = useState<StudentNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [filter, setFilter] = useState<'all' | 'invitations' | 'unread'>('all');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications, STORAGE_KEY]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClearAll = () => {
    setNotifications([]);
    setConfirmClearAll(false);
  };

  const handleDeleteSingle = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleAcceptInvitation = (id: string) => {
    const targetNotif = notifications.find((n) => n.id === id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, isRead: true, invitationStatus: 'accepted' as const }
          : n
      )
    );

    if (targetNotif && targetNotif.courseName) {
      const courseObj = {
        id: targetNotif.courseId || `crs-${Date.now()}`,
        courseName: targetNotif.courseName.replace(/\s*\(Grupo.*?\)/i, '').trim(),
        courseCode: targetNotif.courseId || 'MEG01AFI',
        semester: 1,
        group: 'A',
        department: 'Cátedra Universitaria',
        curricula: 'PLAN CURRICULAR 2024',
        credits: 4,
        schedule: [
          {
            day: 'LUNES',
            startTime: '08:00',
            endTime: '10:00',
            timeLabel: targetNotif.schedule || '08:00 - 10:00',
            type: 'Teoría',
            classroom: targetNotif.classroom || 'Aula C-117',
            hours: 2,
          },
        ],
        students: [],
      };

      try {
        const studentKey = `nemesis_active_student_course_${(session.email || session.code || 'default').toLowerCase()}`;
        localStorage.setItem(studentKey, JSON.stringify(courseObj));
      } catch {}

      if (onAcceptAndRedirectToProfile) {
        onAcceptAndRedirectToProfile(courseObj);
      }
    }
  };

  const handleDeclineInvitation = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, isRead: true, invitationStatus: 'declined' as const }
          : n
      )
    );
  };

  const handleEnterCourse = (notif: StudentNotification) => {
    if (onEnterCourseRoom && notif.courseName) {
      onEnterCourseRoom(notif.courseName, notif.courseId);
      onClose();
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'invitations') return n.type === 'invitation';
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#090b18] border border-amber-500/40 shadow-2xl shadow-amber-950/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-[#0c0f22] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white font-mono uppercase tracking-wide">
                  NOTIFICACIONES Y AVISOS
                </h3>
                {unreadCount > 0 && (
                  <span className="whitespace-nowrap px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Cátedras, invitaciones docentes y avisos académicos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                {confirmClearAll ? (
                  <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-600/60 p-1 rounded-xl">
                    <span className="text-[10px] text-rose-300 font-mono px-1">¿Eliminar todas?</span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="px-1.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] cursor-pointer"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-rose-950/60 border border-zinc-700/80 hover:border-rose-500/50 text-zinc-300 hover:text-rose-300 text-xs font-mono font-semibold transition-all cursor-pointer"
                    title="Eliminar todas las notificaciones"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Eliminar todo</span>
                  </button>
                )}

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Leídas</span>
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-2 bg-[#060812] border-b border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`whitespace-nowrap px-3 py-1 rounded-xl font-mono font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('invitations')}
            className={`whitespace-nowrap px-3 py-1 rounded-xl font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'invitations'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Invitaciones de Docentes</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`whitespace-nowrap px-3 py-1 rounded-xl font-mono font-bold transition-all cursor-pointer ${
              filter === 'unread'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            No leídas ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-400">Bandeja limpia</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-mono">
                No tienes notificaciones pendientes en esta categoría.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  notif.type === 'invitation'
                    ? notif.invitationStatus === 'accepted'
                      ? 'bg-[#0b1718] border-emerald-500/40'
                      : notif.invitationStatus === 'declined'
                      ? 'bg-zinc-900/30 border-zinc-800/80 opacity-60'
                      : 'bg-[#18130b] border-amber-500/50 shadow-lg shadow-amber-950/20'
                    : notif.isRead
                    ? 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                    : 'bg-[#121424] border-cyan-500/40 text-zinc-200'
                }`}
              >
                {/* Header of the notification */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {notif.type === 'invitation' ? (
                      <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {notif.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Single Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSingle(notif.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Eliminar notificación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Description Body */}
                <p className="text-xs text-zinc-300 leading-relaxed pl-10">
                  {notif.description}
                </p>

                {/* Specific Card for Teacher Invitations */}
                {notif.type === 'invitation' && (
                  <div className="ml-10 p-3 rounded-xl bg-black/40 border border-amber-500/20 space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono">
                      <span className="text-amber-300 font-bold">
                        Docente: {notif.teacherName}
                      </span>
                      <span className="text-zinc-400">
                        {notif.classroom}
                      </span>
                    </div>
                    <div className="text-white font-bold text-xs sm:text-sm">
                      {notif.courseName}
                    </div>
                    {notif.schedule && (
                      <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-cyan-400" />
                        <span>Horario: {notif.schedule}</span>
                      </div>
                    )}

                    {/* Invitation Action Buttons */}
                    <div className="pt-2 flex items-center gap-2 flex-wrap">
                      {notif.invitationStatus === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAcceptInvitation(notif.id)}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-950/40"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aceptar Invitación</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeclineInvitation(notif.id)}
                            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer border border-zinc-700"
                          >
                            Rechazar
                          </button>
                        </>
                      )}

                      {notif.invitationStatus === 'accepted' && (
                        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/40">
                          <span className="text-xs text-emerald-300 font-mono font-bold flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>¡Invitación aceptada! Estás matriculado en la sala.</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleEnterCourse(notif)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <DoorOpen className="w-3.5 h-3.5" />
                            <span>Entrar a la Sala del Docente</span>
                          </button>
                        </div>
                      )}

                      {notif.invitationStatus === 'declined' && (
                        <div className="text-xs text-zinc-500 font-mono italic">
                          Invitación rechazada por el alumno.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
