import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Trash2, 
  Tag, 
  Palette, 
  Archive, 
  EyeOff, 
  Eye, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  Search, 
  Edit3, 
  X, 
  Lock, 
  Unlock,
  Sparkles,
  Volume2,
  ShieldAlert,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { UserSession } from '../types';
import { isSupabaseReady } from '../lib/supabase';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'contact';
  text?: string;
  isAudio?: boolean;
  audioDuration?: number; // in seconds
  timestamp: string;
  isDeletedForEveryone?: boolean;
  isDeletedForMe?: boolean;
}

export interface StudentContact {
  id: string;
  realName: string;
  nickname?: string;
  customTag?: string;
  role: string;
  avatarText: string;
  avatarBg: string;
  isOnline: boolean;
  isArchived?: boolean;
  isHidden?: boolean;
  messages: ChatMessageItem[];
}

interface StudentMessagesPageProps {
  session: UserSession;
  onBack: () => void;
}

const DEFAULT_CONTACTS: StudentContact[] = [
  {
    id: 'c-carlos',
    realName: 'Ing. Carlos Ramos',
    nickname: 'Docente Carlos',
    customTag: 'Docente Titular',
    role: 'Docente de Base de Datos',
    avatarText: 'CR',
    avatarBg: 'from-rose-600 to-amber-600',
    isOnline: true,
    isArchived: false,
    isHidden: false,
    messages: [
      {
        id: 'msg-1',
        sender: 'contact',
        text: 'Estimado alumno, le recuerdo revisar los índices B-Tree para la sesión de mañana.',
        timestamp: '15:30',
      },
      {
        id: 'msg-2',
        sender: 'user',
        text: 'Buenas tardes ingeniero. Sí, ya implementé el script en Supabase y funciona correctamente.',
        timestamp: '15:34',
      },
      {
        id: 'msg-3',
        sender: 'contact',
        isAudio: true,
        audioDuration: 14,
        timestamp: '15:36',
      },
    ],
  },
  {
    id: 'c-grupo',
    realName: 'Grupo Proyecto NÉMESIS',
    nickname: 'Equipo de Tesis',
    customTag: 'Compañeros',
    role: 'Proyecto de Sistemas',
    avatarText: 'GP',
    avatarBg: 'from-cyan-600 to-blue-600',
    isOnline: true,
    isArchived: false,
    isHidden: false,
    messages: [
      {
        id: 'g-1',
        sender: 'contact',
        text: 'Jhonatan: Acabo de subir las correcciones del backend.',
        timestamp: '11:00',
      },
      {
        id: 'g-2',
        sender: 'user',
        text: 'Perfecto, yo estoy probando las consultas y la conexión de Supabase.',
        timestamp: '11:15',
      },
    ],
  },
  {
    id: 'c-jhoselyn',
    realName: 'Jhoselyn Paucar Alvarez',
    nickname: 'Jhosy',
    customTag: 'Compañera de Cátedra',
    role: 'Estudiante UNSAAC',
    avatarText: 'JP',
    avatarBg: 'from-purple-600 to-pink-600',
    isOnline: false,
    isArchived: false,
    isHidden: false,
    messages: [
      {
        id: 'j-1',
        sender: 'contact',
        text: '¿Nos encontramos en la biblioteca a las 5 para resolver la guía?',
        timestamp: 'Ayer, 16:45',
      },
    ],
  },
];

type BubbleColor = 'cyan' | 'emerald' | 'pink' | 'purple' | 'amber';
type BgTheme = 'dark' | 'midnight' | 'graphite' | 'grid';

export const StudentMessagesPage: React.FC<StudentMessagesPageProps> = ({
  session,
  onBack,
}) => {
  const STORAGE_KEY_CONTACTS = `nemesis_private_contacts_v2_${session.email || session.code || 'default'}`;
  const STORAGE_KEY_SETTINGS = `nemesis_private_settings_v2_${session.email || session.code || 'default'}`;

  const [contacts, setContacts] = useState<StudentContact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CONTACTS;
  });

  const [settings, setSettings] = useState<{ bubbleColor: BubbleColor; bgTheme: BgTheme }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return { bubbleColor: 'cyan', bgTheme: 'dark' };
  });

  const [activeContactId, setActiveContactId] = useState<string>(DEFAULT_CONTACTS[0].id);
  const [inputText, setInputText] = useState('');
  const [tabView, setTabView] = useState<'active' | 'archived' | 'hidden'>('active');
  const [showHiddenLocked, setShowHiddenLocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Audio recording simulation state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioSeconds, setAudioSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio playing simulation state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Popups and Menus
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [tempTag, setTempTag] = useState('');

  // Context menu for message deletion
  const [activeMessageMenuId, setActiveMessageMenuId] = useState<string | null>(null);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Persist contacts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
    } catch {
      // ignore
    }
  }, [contacts, STORAGE_KEY_CONTACTS]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings, STORAGE_KEY_SETTINGS]);

  // Auto scroll messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeContactId, contacts]);

  // Audio recording timer
  useEffect(() => {
    if (isRecordingAudio) {
      setAudioSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setAudioSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecordingAudio]);

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];

  // Send text message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: ChatMessageItem = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: timeStr,
    };

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          return {
            ...c,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setInputText('');
  };

  // Start / Cancel / Finish Audio
  const handleStartRecording = () => {
    setIsRecordingAudio(true);
  };

  const handleCancelRecording = () => {
    setIsRecordingAudio(false);
    setAudioSeconds(0);
  };

  const handleSendAudioMessage = () => {
    setIsRecordingAudio(false);
    const duration = Math.max(audioSeconds, 2);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newAudioMsg: ChatMessageItem = {
      id: 'audio_' + Date.now(),
      sender: 'user',
      isAudio: true,
      audioDuration: duration,
      timestamp: timeStr,
    };

    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          return {
            ...c,
            messages: [...c.messages, newAudioMsg],
          };
        }
        return c;
      })
    );

    setAudioSeconds(0);
  };

  // Audio Play simulation
  const handleTogglePlayAudio = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(msgId);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 5000);
    }
  };

  // Delete message for me
  const handleDeleteForMe = (msgId: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId ? { ...m, isDeletedForMe: true } : m
            ),
          };
        }
        return c;
      })
    );
    setActiveMessageMenuId(null);
  };

  // Delete message for everyone
  const handleDeleteForEveryone = (msgId: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === activeContactId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId ? { ...m, isDeletedForEveryone: true, text: undefined, isAudio: false } : m
            ),
          };
        }
        return c;
      })
    );
    setActiveMessageMenuId(null);
  };

  // Clear / Delete entire chat
  const handleClearEntireChat = () => {
    if (window.confirm('¿Seguro que deseas vaciar todos los mensajes de este chat?')) {
      setContacts((prev) =>
        prev.map((c) => (c.id === activeContactId ? { ...c, messages: [] } : c))
      );
      setShowChatOptions(false);
    }
  };

  // Toggle archive
  const handleToggleArchiveChat = () => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId ? { ...c, isArchived: !c.isArchived, isHidden: false } : c
      )
    );
    setShowChatOptions(false);
  };

  // Toggle hide
  const handleToggleHideChat = () => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId ? { ...c, isHidden: !c.isHidden, isArchived: false } : c
      )
    );
    setShowChatOptions(false);
  };

  // Save nickname and tag
  const handleSaveNickname = () => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId
          ? { ...c, nickname: tempNickname.trim() || undefined, customTag: tempTag.trim() || undefined }
          : c
      )
    );
    setShowNicknameModal(false);
  };

  const openNicknameEditor = () => {
    setTempNickname(activeContact.nickname || '');
    setTempTag(activeContact.customTag || '');
    setShowNicknameModal(true);
    setShowChatOptions(false);
  };

  // Bubble color class resolution
  const getBubbleBgClass = () => {
    switch (settings.bubbleColor) {
      case 'cyan':
        return 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white';
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white';
      case 'pink':
        return 'bg-gradient-to-r from-rose-600 to-pink-600 text-white';
      case 'purple':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white';
      case 'amber':
        return 'bg-gradient-to-r from-amber-600 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white';
    }
  };

  // Background Theme Class
  const getBgThemeClass = () => {
    switch (settings.bgTheme) {
      case 'dark':
        return 'bg-[#07080f]';
      case 'midnight':
        return 'bg-[#0a0f24]';
      case 'graphite':
        return 'bg-[#111422]';
      case 'grid':
        return 'bg-[#080a14] bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:24px_24px]';
      default:
        return 'bg-[#07080f]';
    }
  };

  // Filtered contacts list
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.nickname && c.nickname.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (tabView === 'archived') {
      return !!c.isArchived;
    }
    if (tabView === 'hidden') {
      return !!c.isHidden;
    }
    // active: not archived and not hidden
    return !c.isArchived && !c.isHidden;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#070913] text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Main Navigation */}
      <header className="h-16 px-4 sm:px-6 bg-[#0c0f22]/90 border-b border-rose-500/30 backdrop-blur-xl flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-sm hover:border-rose-500/50"
            title="Volver al Chat Principal"
          >
            <ArrowLeft className="w-4 h-4 text-rose-400" />
            <span>Volver al Chat</span>
          </button>

          <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-950 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-wider text-white font-mono uppercase">
                  MENSAJES PRIVADOS Y TUTORÍA
                </h1>
                <span className="whitespace-nowrap px-2 py-0.5 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold">
                  Canal Institucional
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
                Docentes de cátedra y compañeros universitarios
              </p>
            </div>
          </div>
        </div>

        {/* Global Settings Trigger */}
        <div className="flex items-center gap-2">
          <div 
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-[11px] font-mono text-emerald-300"
            title="Sincronización con Supabase habilitada"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Activo</span>
          </div>

          <button
            type="button"
            onClick={() => setShowThemeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono font-semibold transition-all cursor-pointer"
            title="Personalizar Colores de Chat y Fondo"
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Personalizar Chat</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout: Contacts Sidebar & Active Chat */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Contacts Sidebar */}
        <aside className="w-full md:w-80 lg:w-88 border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0a0d1d] flex flex-col min-h-0 flex-shrink-0">
          {/* Search Box */}
          <div className="p-3 border-b border-zinc-800/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o apodo..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/60 font-mono"
              />
            </div>
          </div>

          {/* Tabs: Active, Archived, Hidden */}
          <div className="px-3 py-2 border-b border-zinc-800/80 flex items-center justify-between text-xs bg-[#080914]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTabView('active')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                  tabView === 'active'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Chats ({contacts.filter((c) => !c.isArchived && !c.isHidden).length})
              </button>

              <button
                type="button"
                onClick={() => setTabView('archived')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg font-mono font-bold transition-all flex items-center gap-1 ${
                  tabView === 'archived'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Archive className="w-3 h-3" />
                <span>Archivados ({contacts.filter((c) => c.isArchived).length})</span>
              </button>
            </div>

            {/* Hidden Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setTabView(tabView === 'hidden' ? 'active' : 'hidden');
              }}
              className={`p-1.5 rounded-lg border transition-all ${
                tabView === 'hidden'
                  ? 'bg-amber-950 border-amber-500 text-amber-300'
                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
              title="Chats Ocultos"
            >
              {tabView === 'hidden' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                No hay conversaciones en esta pestaña.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isCurrent = contact.id === activeContactId;
                const lastMsg = contact.messages[contact.messages.length - 1];

                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setActiveContactId(contact.id)}
                    className={`w-full p-2.5 rounded-2xl text-left flex items-start gap-3 transition-all cursor-pointer border ${
                      isCurrent
                        ? 'bg-rose-950/40 border-rose-500/50 shadow-md text-white'
                        : 'bg-transparent border-transparent hover:bg-zinc-900/60 text-zinc-400'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${contact.avatarBg} text-white font-mono font-bold flex items-center justify-center text-sm shadow-sm`}
                      >
                        {contact.avatarText}
                      </div>
                      {contact.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0a0d1d]" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-white truncate">
                          {contact.nickname || contact.realName}
                        </span>
                        {lastMsg && (
                          <span className="whitespace-nowrap text-[10px] font-mono text-zinc-500">
                            {lastMsg.timestamp}
                          </span>
                        )}
                      </div>

                      {/* Tag or Subtitle */}
                      <div className="flex items-center gap-1.5 mb-1">
                        {contact.customTag ? (
                          <span className="whitespace-nowrap px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-[9px] font-mono text-cyan-300">
                            {contact.customTag}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-500 truncate">
                            {contact.role}
                          </span>
                        )}
                      </div>

                      {/* Last message preview */}
                      <p className="text-[11px] text-zinc-400 truncate font-mono">
                        {lastMsg
                          ? lastMsg.isDeletedForEveryone
                            ? '🚫 Mensaje eliminado'
                            : lastMsg.isAudio
                            ? '🎤 Mensaje de voz'
                            : lastMsg.text
                          : 'Sin mensajes'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Main Active Chat Area */}
        <section className={`flex-1 flex flex-col min-h-0 ${getBgThemeClass()} relative`}>
          {/* Active Chat Header */}
          <div className="h-16 px-4 sm:px-6 bg-[#0c0f20]/90 border-b border-zinc-800/90 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-20">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${activeContact.avatarBg} text-white font-mono font-bold flex items-center justify-center text-sm`}
              >
                {activeContact.avatarText}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">
                    {activeContact.nickname || activeContact.realName}
                  </h2>
                  {activeContact.nickname && (
                    <span className="text-[10px] text-zinc-400 font-mono">
                      ({activeContact.realName})
                    </span>
                  )}
                  {activeContact.customTag && (
                    <span className="whitespace-nowrap px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[9px] font-mono font-bold">
                      {activeContact.customTag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeContact.isOnline ? 'bg-emerald-400' : 'bg-zinc-500'
                      }`}
                    />
                    <span>{activeContact.isOnline ? 'En línea' : 'Desconectado'}</span>
                  </span>
                  <span>•</span>
                  <span>{activeContact.role}</span>
                </div>
              </div>
            </div>

            {/* Chat Top Actions */}
            <div className="flex items-center gap-2 relative">
              <button
                type="button"
                onClick={openNicknameEditor}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
                title="Editar Apodo o Etiqueta"
              >
                <Tag className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Apodo / Etiqueta</span>
              </button>

              <button
                type="button"
                onClick={() => setShowChatOptions(!showChatOptions)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Opciones de conversación"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Chat Options Dropdown */}
              {showChatOptions && (
                <div className="absolute right-0 top-12 w-52 rounded-2xl bg-[#0e1124] border border-zinc-700 shadow-2xl p-1.5 space-y-1 z-30 font-mono text-xs animate-in fade-in duration-100">
                  <button
                    type="button"
                    onClick={openNicknameEditor}
                    className="w-full px-3 py-2 rounded-xl text-left text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cambiar apodo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleArchiveChat}
                    className="w-full px-3 py-2 rounded-xl text-left text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeContact.isArchived ? 'Desarchivar chat' : 'Archivar chat'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleHideChat}
                    className="w-full px-3 py-2 rounded-xl text-left text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2 cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                    <span>{activeContact.isHidden ? 'Mostrar chat' : 'Ocultar chat'}</span>
                  </button>

                  <div className="h-px bg-zinc-800 my-1" />

                  <button
                    type="button"
                    onClick={handleClearEntireChat}
                    className="w-full px-3 py-2 rounded-xl text-left text-rose-400 hover:bg-rose-950/60 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Borrar todo el chat</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 relative z-10"
          >
            {activeContact.messages.filter((m) => !m.isDeletedForMe).length === 0 ? (
              <div className="p-12 text-center text-zinc-500 font-mono text-xs">
                No hay mensajes aún en esta conversación. ¡Saluda a tu docente o compañero!
              </div>
            ) : (
              activeContact.messages
                .filter((m) => !m.isDeletedForMe)
                .map((msg) => {
                  const isSelf = msg.sender === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} group relative`}
                    >
                      {/* Message Content Container */}
                      <div className="flex items-center gap-2 max-w-[85%] sm:max-w-[75%]">
                        {/* Options trigger for self messages */}
                        {isSelf && !msg.isDeletedForEveryone && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMessageMenuId(
                                  activeMessageMenuId === msg.id ? null : msg.id
                                )
                              }
                              className="p-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                              title="Opciones de mensaje"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown to delete for me / everyone */}
                            {activeMessageMenuId === msg.id && (
                              <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[#0d1022] border border-zinc-700 shadow-2xl p-1 z-30 font-mono text-xs">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteForMe(msg.id)}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-zinc-300 hover:bg-zinc-800 text-[11px] flex items-center gap-1.5"
                                >
                                  <Trash2 className="w-3 h-3 text-zinc-400" />
                                  <span>Eliminar para mí</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteForEveryone(msg.id)}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-rose-400 hover:bg-rose-950/60 text-[11px] flex items-center gap-1.5"
                                >
                                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                                  <span>Eliminar para todos</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* The Bubble */}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                            msg.isDeletedForEveryone
                              ? 'bg-zinc-900/80 border border-zinc-800 text-zinc-500 italic flex items-center gap-1.5'
                              : isSelf
                              ? `${getBubbleBgClass()} rounded-tr-sm`
                              : 'bg-[#15192c] border border-zinc-700/80 text-zinc-200 rounded-tl-sm'
                          }`}
                        >
                          {msg.isDeletedForEveryone ? (
                            <span>🚫 Este mensaje fue eliminado</span>
                          ) : msg.isAudio ? (
                            /* Voice Audio Note Player */
                            <div className="flex items-center gap-3 py-1">
                              <button
                                type="button"
                                onClick={() => handleTogglePlayAudio(msg.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                  isSelf
                                    ? 'bg-white text-zinc-950 hover:bg-white/90 shadow'
                                    : 'bg-rose-500 text-white hover:bg-rose-400 shadow'
                                }`}
                              >
                                {playingAudioId === msg.id ? (
                                  <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                )}
                              </button>

                              {/* Sound waveform graphic */}
                              <div className="flex items-center gap-1 h-6">
                                {[40, 70, 90, 60, 100, 50, 80, 45, 85, 30].map((height, i) => (
                                  <div
                                    key={i}
                                    style={{ height: `${height}%` }}
                                    className={`w-1 rounded-full transition-all ${
                                      playingAudioId === msg.id
                                        ? 'bg-emerald-400 animate-pulse'
                                        : isSelf
                                        ? 'bg-white/70'
                                        : 'bg-zinc-400'
                                    }`}
                                  />
                                ))}
                              </div>

                              <span className="text-[11px] font-mono font-bold whitespace-nowrap pl-1">
                                0:{msg.audioDuration ? msg.audioDuration.toString().padStart(2, '0') : '10'}
                              </span>
                            </div>
                          ) : (
                            <p>{msg.text}</p>
                          )}
                        </div>
                      </div>

                      {/* Timestamp & read check */}
                      <div className="flex items-center gap-1 px-2 pt-0.5 text-[10px] font-mono text-zinc-500">
                        <span>{msg.timestamp}</span>
                        {isSelf && !msg.isDeletedForEveryone && (
                          <CheckCheck className="w-3 h-3 text-cyan-400" />
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Bottom Chat Input Bar with Audio Recorder */}
          <div className="p-3 sm:p-4 bg-[#0c0f20]/95 border-t border-zinc-800/90 relative z-20">
            {isRecordingAudio ? (
              /* Audio Recording Active Mode */
              <div className="flex items-center justify-between gap-3 p-2 bg-[#17101f] border border-rose-500/50 rounded-2xl animate-in fade-in">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping ml-2" />
                  <span className="text-xs font-mono font-bold text-rose-300">
                    Grabando nota de voz: 0:{audioSeconds.toString().padStart(2, '0')}
                  </span>
                  <div className="hidden sm:flex items-center gap-1 h-4">
                    {[30, 80, 50, 100, 70, 40, 90].map((h, idx) => (
                      <span
                        key={idx}
                        style={{ height: `${h}%` }}
                        className="w-1 bg-rose-400 rounded-full animate-pulse"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelRecording}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    title="Cancelar grabación"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span className="hidden sm:inline">Cancelar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendAudioMessage}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-950/50 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Audio</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Text + Mic Input */
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Escribe un mensaje a ${activeContact.nickname || activeContact.realName}...`}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-[#14172a] border border-zinc-700/80 focus:border-rose-500/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none font-mono"
                />

                {/* Voice Note Trigger */}
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="p-2.5 rounded-2xl bg-zinc-900 hover:bg-rose-950/60 border border-zinc-700 hover:border-rose-500 text-zinc-300 hover:text-rose-400 transition-all cursor-pointer"
                  title="Grabar y Enviar Audio"
                >
                  <Mic className="w-5 h-5" />
                </button>

                {/* Send Text Button */}
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all cursor-pointer shadow-md shadow-rose-950/40"
                  title="Enviar Mensaje"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =================================================== */}
      {/* MODAL: PERSONALIZAR COLOR DE CHAT Y FONDO          */}
      {/* =================================================== */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#0d1024] border border-cyan-500/40 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Personalización Visual
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bubble Colors */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-zinc-300 block">
                Color de las burbujas de chat:
              </span>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'cyan', label: 'Cian', bg: 'bg-cyan-500' },
                  { id: 'emerald', label: 'Verde', bg: 'bg-emerald-500' },
                  { id: 'pink', label: 'Rosa', bg: 'bg-rose-500' },
                  { id: 'purple', label: 'Púrpura', bg: 'bg-purple-500' },
                  { id: 'amber', label: 'Ámbar', bg: 'bg-amber-500' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, bubbleColor: c.id as BubbleColor }))
                    }
                    className={`h-10 rounded-xl ${c.bg} flex items-center justify-center transition-all cursor-pointer ${
                      settings.bubbleColor === c.id
                        ? 'ring-2 ring-white scale-105 shadow-md'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {settings.bubbleColor === c.id && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Theme */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono font-bold text-zinc-300 block">
                Color de fondo de la conversación:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { id: 'dark', label: 'Oscuro Profundo' },
                  { id: 'midnight', label: 'Azul Medianoche' },
                  { id: 'graphite', label: 'Pizarra Grafito' },
                  { id: 'grid', label: 'Cuadrícula Cyber' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, bgTheme: t.id as BgTheme }))
                    }
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      settings.bgTheme === t.id
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowThemeModal(false)}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs cursor-pointer transition-colors"
            >
              Guardar y Aplicar
            </button>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* MODAL: EDITAR APODO Y ETIQUETA                     */}
      {/* =================================================== */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#0d1024] border border-rose-500/40 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Apodo y Etiqueta
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNicknameModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Nombre Real:</label>
                <input
                  type="text"
                  disabled
                  value={activeContact.realName}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-zinc-200 mb-1 font-bold">
                  Apodo Personalizado (Opcional):
                </label>
                <input
                  type="text"
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  placeholder="Ej: Profe Carlos, Delegado..."
                  className="w-full px-3 py-2 rounded-xl bg-[#14182e] border border-zinc-700 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-zinc-200 mb-1 font-bold">
                  Etiqueta Especial:
                </label>
                <input
                  type="text"
                  value={tempTag}
                  onChange={(e) => setTempTag(e.target.value)}
                  placeholder="Ej: Docente Titular, Grupo 1..."
                  className="w-full px-3 py-2 rounded-xl bg-[#14182e] border border-zinc-700 text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveNickname}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs cursor-pointer transition-colors"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setShowNicknameModal(false)}
                className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-mono cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
