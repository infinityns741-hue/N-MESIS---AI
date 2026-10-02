import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  MoreHorizontal, 
  Pin, 
  PinOff, 
  Pencil, 
  Trash2, 
  MessageSquare, 
  LogOut, 
  Settings, 
  User, 
  Check,
  TrendingUp,
  Terminal,
  GraduationCap
} from 'lucide-react';
import { ChatSessionItem, UserSession } from '../types';

interface ChatHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSessionItem[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  userSession: UserSession;
  onLogout: () => void;
  onOpenDevPortal?: () => void;
  onOpenSettings?: () => void;
  onOpenProgress?: () => void;
  onOpenTeacherDashboard?: () => void;
}

export const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  onTogglePinSession,
  userSession,
  onLogout,
  onOpenDevPortal,
  onOpenSettings,
  onOpenProgress,
  onOpenTeacherDashboard,
}) => {
  // Menu state for chat actions (•••)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [modalType, setModalType] = useState<'profile' | 'settings' | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute initials and display name
  const getUserDisplayName = () => {
    if (userSession.fullName && userSession.fullName.trim()) {
      return userSession.fullName;
    }
    if (userSession.email) {
      const prefix = userSession.email.split('@')[0];
      return prefix;
    }
    if (userSession.code) return `Alumno ${userSession.code}`;
    return 'Estudiante UNSAAC';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.split(/[\s._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'UN';
  };

  const handleStartRename = (session: ChatSessionItem) => {
    setEditingId(session.id);
    setEditTitle(session.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  // Sort sessions: pinned first, then newest updated
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Sliding Panel from Left */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 h-[100dvh] w-full max-w-[320px] sm:max-w-[340px] bg-[#090b10] border-r border-zinc-800/80 z-50 flex flex-col justify-between shadow-[10px_0_35px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* 1. Header with New Chat & Close */}
            <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between gap-2 flex-shrink-0 bg-[#0c0e16]">
              <button
                type="button"
                onClick={() => {
                  onNewChat();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 hover:border-cyan-500/40 text-xs font-medium text-white transition-all cursor-pointer shadow-sm group"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-90 transition-transform" />
                <span>Nuevo chat</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Cerrar panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Scrollable Chat History List */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 select-none">
              <div className="px-3 pb-2 pt-1 text-[11px] font-mono-code uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                <span>Historial de chats</span>
                <span className="text-[10px] text-zinc-400">{sortedSessions.length}</span>
              </div>

              {sortedSessions.length === 0 ? (
                <div className="text-center py-10 px-4 text-zinc-500 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-60" />
                  <p>No tienes chats anteriores.</p>
                </div>
              ) : (
                sortedSessions.map((s) => {
                  const isActive = s.id === activeSessionId;
                  const isEditing = editingId === s.id;
                  const isMenuOpen = activeMenuId === s.id;

                  return (
                    <div
                      key={s.id}
                      className={`group relative rounded-xl transition-all flex items-center ${
                        isActive 
                          ? 'bg-zinc-800/90 text-white font-medium shadow-sm' 
                          : 'text-zinc-300 hover:bg-zinc-900/90 hover:text-white'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 w-full p-1.5">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(s.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="flex-1 bg-zinc-950 text-white text-xs px-2.5 py-1.5 rounded-lg border border-cyan-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(s.id)}
                            className="p-1.5 rounded-lg bg-cyan-500 text-zinc-950 hover:bg-cyan-400 cursor-pointer"
                            title="Guardar"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectSession(s.id);
                              onClose();
                            }}
                            className="flex-1 text-left px-3 py-2.5 text-xs truncate flex items-center gap-2 cursor-pointer"
                            title={s.title}
                          >
                            {s.isPinned ? (
                              <Pin className="w-3 h-3 text-cyan-400 flex-shrink-0 fill-cyan-400/20" />
                            ) : (
                              <MessageSquare className="w-3 h-3 text-zinc-500 group-hover:text-zinc-400 flex-shrink-0" />
                            )}
                            <span className="truncate pr-7">{s.title}</span>
                          </button>

                          {/* 3-dots button (•••) on hover or when menu is active */}
                          <div className={`absolute right-1.5 flex items-center transition-opacity ${
                            isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : s.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-zinc-700/80 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              title="Opciones de chat"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>

                          {/* 3-dots Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              ref={menuRef}
                              className="absolute right-2 top-9 w-44 rounded-xl bg-[#141724] border border-zinc-700/80 shadow-2xl py-1 z-30 text-xs backdrop-blur-md"
                            >
                              <button
                                type="button"
                                onClick={() => handleStartRename(s)}
                                className="w-full px-3 py-2 text-left text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Cambiar nombre</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onTogglePinSession(s.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                {s.isPinned ? (
                                  <>
                                    <PinOff className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>Desfijar chat</span>
                                  </>
                                ) : (
                                  <>
                                    <Pin className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Fijar chat</span>
                                  </>
                                )}
                              </button>

                              <div className="my-1 border-t border-zinc-800" />

                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteSession(s.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar chat</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* 3. Bottom User Profile Section (Matching the uploaded image) */}
            <div className="p-3 border-t border-zinc-800/80 bg-[#080a11] relative">
              {/* Profile Popup Menu (opens upward) */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    ref={profileMenuRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-3 right-3 bottom-16 rounded-2xl bg-[#141724] border border-zinc-700/80 shadow-2xl p-1.5 z-40 text-xs backdrop-blur-xl"
                  >
                    <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                      <p className="font-semibold text-white truncate">{getUserDisplayName()}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{userSession.email}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setModalType('profile');
                      }}
                      className="w-full px-3 py-2 text-left text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Perfil</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onClose();
                        if (onOpenProgress) {
                          onOpenProgress();
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-zinc-300 hover:text-cyan-300 hover:bg-zinc-800/80 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Mi progreso</span>
                    </button>

                    {userSession.role === 'docente' && onOpenTeacherDashboard && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onClose();
                          onOpenTeacherDashboard();
                        }}
                        className="w-full px-3 py-2 text-left text-rose-300 hover:text-white hover:bg-rose-950/60 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-rose-400" />
                        <span>Dictar curso</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onClose();
                        if (onOpenSettings) {
                          onOpenSettings();
                        } else {
                          setModalType('settings');
                        }
                      }}
                      className="w-full px-3 py-2 text-left text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Configuración</span>
                    </button>

                    <div className="my-1 border-t border-zinc-800/80" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onClose();
                        onLogout();
                      }}
                      className="w-full px-3 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar sesión</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User profile pill matching user's image */}
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-2xl bg-[#171922] hover:bg-[#202433] border border-zinc-800/80 hover:border-zinc-700 text-left transition-all cursor-pointer group"
              >
                {/* Yellow/Orange Avatar Circle */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                  {getUserInitials()}
                </div>

                {/* Name & Subtitle */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
                    {getUserDisplayName()}
                  </h4>
                  <p className="text-[11px] text-zinc-400">Gratis</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Simple Modal for Perfil / Configuración placeholders as requested */}
          <AnimatePresence>
            {modalType && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-sm rounded-3xl bg-[#0f121d] border border-zinc-800 p-6 shadow-2xl text-zinc-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2 font-cyber tracking-wider uppercase">
                      {modalType === 'profile' ? (
                        <>
                          <User className="w-4 h-4 text-cyan-400" />
                          <span>Perfil de Usuario</span>
                        </>
                      ) : (
                        <>
                          <Settings className="w-4 h-4 text-cyan-400" />
                          <span>Configuración</span>
                        </>
                      )}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {modalType === 'profile' ? (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                        <p className="text-zinc-500 font-mono-code text-[10px]">CORREO INSTITUCIONAL</p>
                        <p className="text-white font-medium mt-0.5">{userSession.email}</p>
                      </div>
                      {userSession.code && (
                        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                          <p className="text-zinc-500 font-mono-code text-[10px]">CÓDIGO UNIVERSITARIO</p>
                          <p className="text-white font-medium mt-0.5">{userSession.code}</p>
                        </div>
                      )}
                      <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                        <p className="text-zinc-500 font-mono-code text-[10px]">ROL ACTIVO</p>
                        <p className="text-cyan-300 font-medium capitalize mt-0.5">{userSession.role}</p>
                      </div>

                      {onOpenProgress && (
                        <button
                          type="button"
                          onClick={() => {
                            setModalType(null);
                            onClose();
                            onOpenProgress();
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-cyan-950/60 border border-cyan-800 hover:bg-cyan-900/60 text-cyan-300 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span>Ver Mi Progreso Académico</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                        <p className="text-zinc-500 font-mono-code text-[10px]">TEMA</p>
                        <p className="text-white font-medium mt-0.5">Oscuro (Predeterminado NÉMESIS)</p>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                        <p className="text-zinc-500 font-mono-code text-[10px]">RENDERIZADOR MATEMÁTICO</p>
                        <p className="text-white font-medium mt-0.5">KaTeX / LaTeX en tiempo real</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="w-full mt-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
                  >
                    Cerrar
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};
