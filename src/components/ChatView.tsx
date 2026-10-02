import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  X, 
  PanelLeft,
  FileText,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Cpu,
  FolderOpen,
  ClipboardList,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { UserSession, ChatMessage, ChatSessionItem, AttachmentInfo, AppSettings } from '../types';
import { TeacherCourse } from '../types/teacher';
import { FormattedMessage } from './FormattedMessage';
import { askGemini } from '../lib/gemini';
import { 
  loadUserChatSessions, 
  saveUserChatSessions, 
  getInitialWelcomeMessage 
} from '../lib/chatStorage';
import { loadAppSettings, saveAppSettings, applyThemeToDocument } from '../lib/settingsStorage';
import { processSelectedFile, formatFileSize } from '../lib/fileParser';
import { getAccent } from '../lib/accentUtils';
import { ChatHistoryDrawer } from './ChatHistoryDrawer';
import { SettingsModal } from './SettingsModal';
import { ProgressDashboardModal } from './ProgressDashboardModal';
import { FluidWaterGrid } from './FluidWaterGrid';
import { StudentCommunityMenu } from './StudentCommunityMenu';
import { analyzeChatSessionsForProgress } from '../lib/progressStorage';
import { StudentVirtualLabPage } from './StudentVirtualLabPage';
import { 
  getActiveAcademicCourseForStudent, 
  getCourseSyllabus, 
  getCourseResourceOptions, 
  setActiveAcademicCourseForStudent,
  saveCourseSyllabus
} from '../lib/courseSyllabusStorage';

interface ChatViewProps {
  session: UserSession;
  onLogout: () => void;
  onOpenDevPortal?: () => void;
  onOpenTeacherDashboard?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  session, 
  onLogout, 
  onOpenDevPortal,
  onOpenTeacherDashboard
}) => {
  const userStorageKey = session.email || session.code || 'default';

  // App Settings state (Theme, Accent Color, Font size, Personality, Voice, Memory, etc.)
  const [appSettings, setAppSettings] = useState<AppSettings>(loadAppSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Multi-chat sessions state
  const [sessions, setSessions] = useState<ChatSessionItem[]>(() => 
    loadUserChatSessions(userStorageKey, session)
  );

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const loaded = loadUserChatSessions(userStorageKey, session);
    return loaded[0]?.id || 'chat_' + Date.now();
  });

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Document and Image attachment state
  const [selectedAttachment, setSelectedAttachment] = useState<AttachmentInfo | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Active academic course context (enrolled course from notifications or teacher invitation)
  const [academicCourse, setAcademicCourse] = useState<TeacherCourse | null>(() => 
    getActiveAcademicCourseForStudent(session.email || session.code || 'default')
  );
  const [isSyllabusDrawerOpen, setIsSyllabusDrawerOpen] = useState(false);
  const [isVirtualLabOpen, setIsVirtualLabOpen] = useState(false);

  // Derived syllabus & enabled resources for active course
  const academicSyllabus = academicCourse 
    ? getCourseSyllabus(academicCourse.courseName, academicCourse.courseCode)
    : null;

  const academicResourceOptions = academicCourse
    ? getCourseResourceOptions(academicCourse.courseName, academicCourse.id).filter(r => r.enabled)
    : [];

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mainScrollContainerRef = useRef<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Accent configuration
  const currentAccent = getAccent(appSettings.accentColor || 'cyan');

  // Apply theme to document on mount and whenever settings change
  useEffect(() => {
    applyThemeToDocument(appSettings.theme);
  }, [appSettings.theme]);

  // Continuously analyze sessions to calibrate cognitive and academic progress
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      analyzeChatSessionsForProgress(userStorageKey, sessions);
    }
  }, [sessions, userStorageKey]);

  // Audio chime player for AI completions
  const playSuccessChime = () => {
    if (!appSettings.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const tone = appSettings.soundTone || 'crystal';
      if (tone === 'pulse') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (tone === 'subtle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else {
        // crystal bell default
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.14); // A5
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Ignore audio restriction safely
    }
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    saveAppSettings(newSettings);
  };

  // Get current active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  // Dedicated container scroll (NEVER scroll entire document to avoid shifting upwards)
  const scrollToBottom = (instant = false) => {
    if (mainScrollContainerRef.current) {
      const container = mainScrollContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: instant ? 'auto' : 'smooth',
      });
    }
  };

  // Scroll only when new messages are received or when AI is typing
  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, isTyping]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      const attachment = await processSelectedFile(file);
      setSelectedAttachment(attachment);
    } catch (err) {
      console.error('Error processing file:', err);
      alert('No se pudo procesar el archivo seleccionado. Intenta con otro formato.');
    } finally {
      setIsProcessingFile(false);
      e.target.value = '';
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if ((!textToSend && !selectedAttachment) || isTyping) return;

    let userMessageText = textToSend;
    if (!userMessageText && selectedAttachment) {
      userMessageText = selectedAttachment.type === 'document'
        ? `Por favor analiza y resuelve los enunciados del documento adjunto (${selectedAttachment.name}).`
        : 'Por favor analiza y resuelve el ejercicio en la imagen adjunta.';
    }

    const currentSessionId = activeSessionId;
    const attachmentToSend = selectedAttachment;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      imageUrl: attachmentToSend?.type === 'image' ? attachmentToSend.base64 : undefined,
      attachment: attachmentToSend || undefined,
    };

    const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
    const currentMessages = currentSession ? currentSession.messages : [];

    // Check if this is the first user message in this chat to set the chat title
    const hasPriorUserMsg = currentMessages.some((m) => m.sender === 'user');
    let updatedTitle = currentSession?.title || 'Nueva conversación';
    if (!hasPriorUserMsg || updatedTitle === 'Nueva conversación') {
      const cleanTitle = (attachmentToSend?.name || userMessageText).trim().replace(/\n+/g, ' ');
      updatedTitle = cleanTitle.length > 38 ? cleanTitle.slice(0, 38) + '...' : cleanTitle;
    }

    // Update active chat with user message
    const updatedMessagesWithUser = [...currentMessages, userMessage];

    setSessions((prev) => {
      const next = prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            title: updatedTitle,
            updatedAt: Date.now(),
            messages: updatedMessagesWithUser,
          };
        }
        return s;
      });
      saveUserChatSessions(userStorageKey, next);
      return next;
    });

    setInputText('');
    setSelectedAttachment(null);
    setIsTyping(true);

    // Reset textarea height and ensure no scrollbar is shown
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflowY = 'hidden';
    }

    try {
      const attachmentInput = attachmentToSend ? {
        base64: attachmentToSend.base64,
        mimeType: attachmentToSend.mimeType,
        fileName: attachmentToSend.name,
        textContent: attachmentToSend.textContent,
      } : undefined;

      const courseContext = academicCourse && academicSyllabus ? {
        courseName: academicCourse.courseName,
        courseCode: academicCourse.courseCode,
        currentWeek: academicSyllabus.currentWeek,
        currentTopic: academicSyllabus.currentTopic,
        currentFocusPrompt: academicSyllabus.currentFocusPrompt,
        competencies: academicSyllabus.competencies,
        enabledResources: academicResourceOptions.map(r => r.label),
      } : undefined;

      const aiResult = await askGemini(
        userMessageText, 
        currentMessages, 
        attachmentInput,
        { 
          aiDetailMode: appSettings.aiDetailMode,
          emojiLevel: appSettings.emojiLevel,
          warmthLevel: appSettings.warmthLevel,
          personalityStyle: appSettings.personalityStyle,
          nickname: appSettings.nickname,
          occupation: appSettings.occupation,
          academicMemories: appSettings.academicMemories,
          courseContext,
        }
      );

      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        sender: 'ai',
        text: aiResult.text,
        isLiveGemini: aiResult.isLiveGemini,
      };

      setSessions((prev) => {
        const next = prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, aiMessage],
            };
          }
          return s;
        });
        saveUserChatSessions(userStorageKey, next);
        return next;
      });

      playSuccessChime();
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Ocurrió un inconveniente al procesar la solicitud. Por favor formula tu pregunta nuevamente o verifica tu conexión a internet.',
        isLiveGemini: false,
      };

      setSessions((prev) => {
        const next = prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, errorMessage],
            };
          }
          return s;
        });
        saveUserChatSessions(userStorageKey, next);
        return next;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Multi-chat handlers
  const handleCreateNewChat = () => {
    const newChatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const newChat: ChatSessionItem = {
      id: newChatId,
      title: 'Nueva conversación',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
      messages: [getInitialWelcomeMessage(session)],
    };

    setSessions((prev) => {
      const updated = [newChat, ...prev];
      saveUserChatSessions(userStorageKey, updated);
      return updated;
    });
    setActiveSessionId(newChatId);
    setInputText('');
    setSelectedAttachment(null);
    setIsTyping(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setTimeout(() => {
      if (mainScrollContainerRef.current) {
        mainScrollContainerRef.current.scrollTop = 0;
      }
    }, 20);
  };

  const handleSelectChat = (id: string) => {
    setActiveSessionId(id);
    setInputText('');
    setSelectedAttachment(null);
    setIsTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setTimeout(() => scrollToBottom(true), 50);
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setSessions((prev) => {
      const next = prev.map((s) => {
        if (s.id === id) {
          return { ...s, title: newTitle, updatedAt: Date.now() };
        }
        return s;
      });
      saveUserChatSessions(userStorageKey, next);
      return next;
    });
  };

  const handleDeleteChat = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const freshChat: ChatSessionItem = {
          id: 'chat_' + Date.now(),
          title: 'Nueva conversación',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isPinned: false,
          messages: [getInitialWelcomeMessage(session)],
        };
        setActiveSessionId(freshChat.id);
        saveUserChatSessions(userStorageKey, [freshChat]);
        return [freshChat];
      } else {
        if (activeSessionId === id) {
          setActiveSessionId(filtered[0].id);
        }
        saveUserChatSessions(userStorageKey, filtered);
        return filtered;
      }
    });
  };

  const handleTogglePinChat = (id: string) => {
    setSessions((prev) => {
      const next = prev.map((s) => {
        if (s.id === id) {
          return { ...s, isPinned: !s.isPinned };
        }
        return s;
      });
      saveUserChatSessions(userStorageKey, next);
      return next;
    });
  };

  // Export chat backup to JSON
  const handleExportHistory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nemesis_historial_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Clear all chats safely
  const handleClearAllHistory = () => {
    const freshChat: ChatSessionItem = {
      id: 'chat_' + Date.now(),
      title: 'Nueva conversación',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPinned: false,
      messages: [getInitialWelcomeMessage(session)],
    };
    setSessions([freshChat]);
    setActiveSessionId(freshChat.id);
    saveUserChatSessions(userStorageKey, [freshChat]);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    const nextH = Math.min(e.target.scrollHeight, 160);
    e.target.style.height = `${nextH}px`;
    e.target.style.overflowY = e.target.scrollHeight > 160 ? 'auto' : 'hidden';
  };

  // Theme-dependent styling helpers (System, Negro, Blanco, Crema #F2A65A, Verde #0b5e42, Rojo #BB2528, Amarillo #FFB400, Celeste #00C2CB, Morado #7A3E9D)
  const isLight = appSettings.theme === 'light';
  const isBeige = appSettings.theme === 'beige' || appSettings.theme === 'sepia';
  const isYellow = appSettings.theme === 'yellow';
  const isCyan = appSettings.theme === 'cyan';
  const isRose = appSettings.theme === 'rose';
  const isPurple = appSettings.theme === 'purple';
  const isGreen = appSettings.theme === 'green';
  const isRed = appSettings.theme === 'red';
  const isBlack = appSettings.theme === 'black';

  const containerBg = isBeige 
    ? 'bg-[#F2A65A] text-stone-950' 
    : isYellow
    ? 'bg-[#FFB400] text-stone-950'
    : isCyan
    ? 'bg-[#00C2CB] text-slate-950'
    : isLight 
    ? 'bg-[#ffffff] text-slate-900' 
    : isRose
    ? 'bg-[#fef2f6] text-rose-950'
    : isPurple
    ? 'bg-[#7A3E9D] text-white'
    : isGreen
    ? 'bg-[#0b5e42] text-white'
    : isRed
    ? 'bg-[#BB2528] text-white'
    : isBlack 
    ? 'bg-[#0c0d12] text-zinc-100' 
    : 'bg-[#060810] text-zinc-100';

  const inputFormBg = isBeige
    ? 'bg-[#f8b674] border-[#d98532] focus-within:border-amber-950 text-stone-950 shadow-md'
    : isYellow
    ? 'bg-[#ffc229] border-[#d49200] focus-within:border-amber-950 text-stone-950 shadow-md'
    : isCyan
    ? 'bg-[#24d1d9] border-[#009da5] focus-within:border-cyan-950 text-slate-950 shadow-md'
    : isLight
    ? 'bg-slate-100/95 border-slate-300 focus-within:border-slate-500 text-slate-900 shadow-md'
    : isRose
    ? 'bg-white border-[#f4c6d6] focus-within:border-rose-500 text-rose-950 shadow-md'
    : isPurple
    ? 'bg-[#8c46b5] border-[#5e2b7c] focus-within:border-purple-200 text-white shadow-md'
    : isGreen
    ? 'bg-[#0d7351] border-[#074731] focus-within:border-emerald-300 text-white shadow-md'
    : isRed
    ? 'bg-[#cc2b2e] border-[#911a1d] focus-within:border-red-200 text-white shadow-md'
    : isBlack
    ? 'bg-[#161822] border-zinc-800 focus-within:border-zinc-600 text-white shadow-[0_0_20px_rgba(0,0,0,0.8)]'
    : 'bg-[#121624]/95 border-zinc-700/80 focus-within:border-cyan-500 text-white shadow-[0_0_25px_rgba(0,0,0,0.6)]';

  const floatingBtnBg = isBeige
    ? 'bg-[#e09446] border-[#cf8030] text-stone-950 hover:bg-[#c97d2e] shadow-md'
    : isYellow
    ? 'bg-[#e6a200] border-[#d49200] text-stone-950 hover:bg-[#cc8f00] shadow-md'
    : isCyan
    ? 'bg-[#00adb5] border-[#009ea6] text-slate-950 hover:bg-[#00979e] shadow-md'
    : isLight
    ? 'bg-white/95 border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-md'
    : isRose
    ? 'bg-[#fae3ec] border-[#f4c6d6] text-rose-950 hover:bg-[#f5d5e2] shadow-md'
    : isPurple
    ? 'bg-[#6b318d] border-[#5d2a7c] text-white hover:bg-[#7e3aa4] shadow-md'
    : isGreen
    ? 'bg-[#0e6f4e] border-[#074731] text-white hover:bg-[#11825c] shadow-md'
    : isRed
    ? 'bg-[#a61c1f] border-[#8e1719] text-white hover:bg-[#c42327] shadow-md'
    : isBlack
    ? 'bg-[#151722] border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 shadow-lg'
    : 'bg-[#121624]/90 border-zinc-700/80 text-zinc-300 hover:text-white hover:border-cyan-500/60 shadow-lg';

  const currentFontClass = `font-style-${appSettings.fontFamily || 'sans'}`;

  const getUserTextColorStyle = (): React.CSSProperties => {
    if (appSettings.textColor && appSettings.textColor !== 'default') {
      switch (appSettings.textColor) {
        case 'black': return { color: '#000000' };
        case 'white': return { color: '#ffffff' };
        case 'yellow': return { color: '#fcd34d' };
        case 'cyan': return { color: '#38bdf8' };
        case 'cream': return { color: '#fef3c7' };
        case 'green': return { color: '#86efac' };
        case 'purple': return { color: '#d8b4fe' };
      }
    }
    return {};
  };

  return (
    <div 
      id="nemesis-fullscreen-chat"
      data-theme={appSettings.theme}
      className={`fixed inset-0 w-full h-full ${containerBg} flex flex-col overflow-hidden z-50 select-text transition-colors`}
    >
      {/* Dynamic Background Layer: In 'black' theme it stays solid black unless gridColor is explicitly set to 'black'; in other themes it displays the reactive water grid with selected gridColor */}
      {((appSettings.theme === 'system' || appSettings.gridColor === 'black' || (appSettings.theme !== 'black' && appSettings.backgroundEffect !== 'solid'))) && (
        <FluidWaterGrid 
          theme={appSettings.theme} 
          gridColor={appSettings.gridColor || 'default'}
          className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-75" 
        />
      )}
      {appSettings.backgroundEffect === 'grid-tech' && appSettings.theme !== 'black' && (
        <div 
          className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-25 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:24px_24px]" 
        />
      )}

      {/* Top-Left Floating Control: History button and Docente quick switch button */}
      <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-30 flex items-center gap-2">
        <button
          id="btn-open-chat-history"
          type="button"
          onClick={() => setIsHistoryDrawerOpen(true)}
          className={`p-2.5 rounded-2xl border backdrop-blur-md transition-all cursor-pointer group ${floatingBtnBg}`}
          title="Historial de chats y configuración"
          aria-label="Historial de chats"
        >
          <PanelLeft className="w-5 h-5 transition-colors group-hover:scale-105" />
        </button>

        {session.role === 'docente' && onOpenTeacherDashboard && (
          <button
            type="button"
            onClick={onOpenTeacherDashboard}
            className="px-3 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 border border-rose-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/40 cursor-pointer transition-all"
            title="Volver a Dictar Curso"
          >
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Dictar Curso</span>
          </button>
        )}
      </div>

      {/* Top-Center Floating Badge: Active Enrolled Academic Course */}
      {academicCourse && academicSyllabus && (
        <div className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-30 max-w-[90vw] sm:max-w-md w-full px-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-2xl bg-[#0b1020]/95 backdrop-blur-md border border-cyan-500/40 shadow-xl shadow-cyan-950/40 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex-shrink-0">
                <GraduationCap className="w-3.5 h-3.5" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white truncate text-[11px] sm:text-xs">
                    {academicCourse.courseName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono text-[9px] font-bold flex-shrink-0">
                    Sem {academicSyllabus.currentWeek}
                  </span>
                </div>
                <p className="text-[10px] text-cyan-300/80 truncate">
                  {academicSyllabus.currentTopic}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsSyllabusDrawerOpen(true)}
                className="px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[10px] font-mono font-bold transition-all cursor-pointer hover:scale-102"
                title="Ver temas del sílabo y cronograma oficial de exámenes"
              >
                Sílabo
              </button>
              <button
                type="button"
                onClick={() => {
                  setAcademicCourse(null);
                  try {
                    localStorage.removeItem(`nemesis_active_student_course_${(session.email || session.code || 'default').toLowerCase()}`);
                  } catch {}
                }}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                title="Salir de cátedra y volver al modo general"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top-Right Floating Control: Student Community & Options (Entrar al mundo, Notificaciones, Mensajes privados) */}
      <StudentCommunityMenu 
        session={session} 
        floatingBtnBg={floatingBtnBg} 
        onSelectAcademicCourse={(course) => {
          setAcademicCourse(course);
          setActiveAcademicCourseForStudent(session.email || session.code || 'default', course);
        }}
      />

      {/* Main Chat Conversation Body */}
      <main 
        ref={mainScrollContainerRef}
        className="flex-1 min-h-0 w-full overflow-y-auto px-4 sm:px-6 md:px-8 pt-16 sm:pt-16 pb-6 space-y-6 overscroll-contain relative z-10"
      >
        <div className="max-w-3xl mx-auto w-full space-y-7">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'user' ? (
                /* USER MESSAGE: Styled with dynamic solid accent color, bold contour border, and custom font style/color */
                <div 
                  className={`max-w-[88%] sm:max-w-[80%] rounded-3xl px-5 py-3.5 border-2 border-stone-950/80 shadow-sm ${currentAccent.userBubbleGradient} ${currentFontClass}`}
                  style={getUserTextColorStyle()}
                >
                  {/* Image attachment display */}
                  {msg.imageUrl && (
                    <div className="mb-2.5 overflow-hidden rounded-2xl border border-white/20">
                      <img
                        src={msg.imageUrl}
                        alt="Archivo adjunto"
                        className="max-h-64 w-auto object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {/* Document attachment card display */}
                  {msg.attachment?.type === 'document' && (
                    <div className="mb-2.5 flex items-center gap-3 p-2.5 rounded-2xl bg-black/20 border border-white/20 text-white">
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{msg.attachment.name}</p>
                        <p className="text-[10px] text-white/70">{formatFileSize(msg.attachment.size)}</p>
                      </div>
                    </div>
                  )}

                  <div 
                    className={`leading-relaxed whitespace-pre-wrap ${currentFontClass} ${
                      appSettings.fontSize === 'small' ? 'text-xs sm:text-sm' :
                      appSettings.fontSize === 'large' ? 'text-base sm:text-lg' :
                      'text-sm sm:text-base'
                    } ${appSettings.isBold ? 'font-bold' : ''} ${appSettings.isItalic ? 'italic' : ''}`}
                    style={getUserTextColorStyle()}
                  >
                    <FormattedMessage 
                      content={msg.text} 
                      isUser={true} 
                      theme={appSettings.theme}
                      fontSize={appSettings.fontSize}
                      fontFamily={appSettings.fontFamily}
                      textColor={appSettings.textColor}
                      isBold={appSettings.isBold}
                      isItalic={appSettings.isItalic}
                    />
                  </div>
                </div>
              ) : (
                /* AI MESSAGE: Pure typography with TTS audio controls */
                <div className={`w-full leading-relaxed ${currentFontClass} pr-2 space-y-2`}>
                  <FormattedMessage 
                    content={msg.text} 
                    isUser={false} 
                    theme={appSettings.theme}
                    fontSize={appSettings.fontSize}
                    fontFamily={appSettings.fontFamily}
                    textColor={appSettings.textColor}
                    isBold={appSettings.isBold}
                    isItalic={appSettings.isItalic}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Processing / Generating Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 py-2 text-sm opacity-80">
              <span 
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: currentAccent.hex }}
              />
              <span 
                className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.2s]"
                style={{ backgroundColor: currentAccent.hex }}
              />
              <span 
                className="w-2 h-2 rounded-full animate-bounce [animation-delay:0.4s]"
                style={{ backgroundColor: currentAccent.hex }}
              />
              <span className="text-xs font-mono-code ml-1">
                NÉMESIS analizando...
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Floating Input Bar with Voice Dictation & File Attachments - Completely transparent footer (no black box) */}
      <footer className="w-full px-3 sm:px-4 pb-3 sm:pb-4 pt-1 flex-shrink-0 z-20 bg-transparent border-0">
        <div className="max-w-3xl mx-auto w-full">
          {/* Attachment Preview Badge before sending */}
          {selectedAttachment && (
            <div className={`mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs shadow-sm ${
              isLight 
                ? 'bg-slate-100 border-slate-300 text-slate-800' 
                : isBeige || isYellow || isCyan
                ? 'bg-white/90 border-black/20 text-stone-900' 
                : 'bg-[#121524] border-zinc-700 text-zinc-200'
            }`}>
              {selectedAttachment.type === 'image' ? (
                <img
                  src={selectedAttachment.base64}
                  alt="Miniatura"
                  className="w-7 h-7 object-cover rounded-lg border border-white/20"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              )}
              
              <div className="max-w-[200px] sm:max-w-xs truncate">
                <span className="font-semibold">{selectedAttachment.name}</span>
                <span className="opacity-70 text-[10px] ml-1.5 font-mono-code">({formatFileSize(selectedAttachment.size)})</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAttachment(null)}
                className="p-1 hover:text-rose-400 transition-colors cursor-pointer rounded-md"
                title="Quitar archivo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Barra Dinámica de Recursos Habilitados por el Docente (Prácticas, Laboratorio, Biblioteca, Simulador, Guía, Libro) */}
          {academicCourse && academicSyllabus && academicResourceOptions.length > 0 && (
            <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 px-1 no-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-200">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex-shrink-0 mr-1">
                Recursos del Curso:
              </span>
              {academicResourceOptions.map((opt) => {
                const isLab = opt.key.includes('lab');
                const isSim = opt.key.includes('sim');
                const isBook = opt.key.includes('book') || opt.key.includes('lib');
                const isGuide = opt.key.includes('guia');
                const isBib = opt.key.includes('bib');

                let promptForThisResource = '';
                if (opt.key.includes('prac')) {
                  promptForThisResource = `Por favor genera una práctica de 3 problemas sobre ${academicSyllabus.currentTopic} según las directrices del sílabo oficial, con solución detallada paso a paso.`;
                } else if (isLab) {
                  promptForThisResource = `Explícame el procedimiento experimental y simulación para el laboratorio virtual de ${academicSyllabus.currentTopic}.`;
                } else if (isBib) {
                  promptForThisResource = `Indícame la bibliografía especializada, autores y textos universitarios recomendados en el sílabo para ${academicSyllabus.currentTopic}.`;
                } else if (isGuide) {
                  promptForThisResource = `Proporcióname la guía de cátedra con resumen de fórmulas y conceptos clave sobre ${academicSyllabus.currentTopic}.`;
                } else if (isSim) {
                  promptForThisResource = `Inicia la simulación de parámetros y comportamiento matemático/gráfico para ${academicSyllabus.currentTopic}.`;
                } else if (isBook) {
                  promptForThisResource = `Sintetiza los capítulos y demostraciones fundamentales del libro de texto oficial para ${academicSyllabus.currentTopic}.`;
                } else {
                  promptForThisResource = `Consulta académica sobre ${opt.label} para el tema ${academicSyllabus.currentTopic}.`;
                }

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      if (isLab) {
                        setIsVirtualLabOpen(true);
                      } else {
                        handleSendMessage(promptForThisResource);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer shadow-sm hover:scale-102 active:scale-98 ${
                      isLab 
                        ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-300 hover:bg-emerald-900' 
                        : isSim
                        ? 'bg-purple-950/70 border-purple-700/80 text-purple-300 hover:bg-purple-900'
                        : isBook
                        ? 'bg-amber-950/70 border-amber-700/80 text-amber-300 hover:bg-amber-900'
                        : isGuide
                        ? 'bg-sky-950/70 border-sky-700/80 text-sky-300 hover:bg-sky-900'
                        : isBib
                        ? 'bg-indigo-950/70 border-indigo-700/80 text-indigo-300 hover:bg-indigo-900'
                        : 'bg-rose-950/70 border-rose-700/80 text-rose-300 hover:bg-rose-900'
                    }`}
                    title={opt.description}
                  >
                    {isLab ? (
                      <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isSim ? (
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    ) : isBook ? (
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    ) : isGuide ? (
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                    ) : isBib ? (
                      <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <ClipboardList className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>{opt.label.replace(/^Habilitar\s+/i, '')}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Form input container - reduced height, sleek rounded pill */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`relative flex items-center gap-1.5 sm:gap-2 rounded-2xl sm:rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 transition-all border ${inputFormBg}`}
          >
            {/* Hidden file input for images & documents (PDF, Word, TXT, CSV, etc.) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.docx,.txt,.md,.csv,.json,.py,.c,.cpp,.java,.js,.ts,.tex"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Universal Attachment Button (Documents + Images) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFile}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer flex-shrink-0 ${
                isProcessingFile 
                  ? 'opacity-50 cursor-wait' 
                  : isLight || isBeige || isYellow || isCyan
                  ? 'text-stone-700 hover:text-stone-950 hover:bg-black/5'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title="Adjuntar documento (PDF, Word .docx, TXT) o foto de ejercicio"
              aria-label="Adjuntar archivo"
            >
              {isProcessingFile ? (
                <Loader2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              )}
            </button>

            {/* Expanding Textarea without premature scrollbar */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedAttachment
                  ? 'Escribe instrucciones sobre el archivo o presiona Enviar...'
                  : 'Presiona para escribir'
              }
              rows={1}
              style={{ 
                overflowY: 'hidden',
                ...(appSettings.textColor && appSettings.textColor !== 'default' ? getUserTextColorStyle() : {})
              }}
              className={`flex-1 bg-transparent px-2 py-1 focus:outline-none resize-none max-h-40 overflow-hidden leading-snug scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${currentFontClass} ${
                appSettings.isBold ? 'font-bold' : ''
              } ${
                appSettings.isItalic ? 'italic' : ''
              } ${
                appSettings.textColor && appSettings.textColor !== 'default'
                  ? appSettings.textColor === 'black' ? 'text-stone-950 placeholder-stone-600'
                    : appSettings.textColor === 'white' ? 'text-white placeholder-zinc-400'
                    : appSettings.textColor === 'yellow' ? 'text-amber-300 placeholder-amber-500/70'
                    : appSettings.textColor === 'cyan' ? 'text-cyan-300 placeholder-cyan-500/70'
                    : appSettings.textColor === 'cream' ? 'text-[#fef3c7] placeholder-amber-300/60'
                    : appSettings.textColor === 'green' ? 'text-emerald-300 placeholder-emerald-500/70'
                    : 'text-purple-200 placeholder-purple-400/60'
                  : isLight 
                  ? 'text-slate-900 placeholder-slate-400' 
                  : isBeige || isYellow
                  ? 'text-stone-950 placeholder-stone-700' 
                  : isCyan
                  ? 'text-slate-950 placeholder-slate-700'
                  : isRose
                  ? 'text-rose-950 placeholder-rose-400'
                  : 'text-white placeholder-zinc-400'
              } ${
                appSettings.fontSize === 'small' ? 'text-xs sm:text-sm' :
                appSettings.fontSize === 'large' ? 'text-base sm:text-lg' :
                'text-sm sm:text-base'
              }`}
            />

            {/* Send Button with custom Accent Color */}
            <button
              id="btn-send-message"
              type="submit"
              disabled={(!inputText.trim() && !selectedAttachment) || isTyping || isProcessingFile}
              className={`p-2 sm:p-2.5 rounded-xl sm:rounded-full font-bold disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer flex-shrink-0 ${currentAccent.sendBtnClass}`}
              title="Enviar mensaje"
              aria-label="Enviar mensaje"
            >
              <Send className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${currentAccent.sendIconClass}`} />
            </button>
          </form>
        </div>
      </footer>

      {/* Chat History Drawer */}
      <ChatHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectChat}
        onNewChat={handleCreateNewChat}
        onRenameSession={handleRenameChat}
        onDeleteSession={handleDeleteChat}
        onTogglePinSession={handleTogglePinChat}
        userSession={session}
        onLogout={onLogout}
        onOpenDevPortal={onOpenDevPortal}
        onOpenSettings={() => {
          setIsHistoryDrawerOpen(false);
          setIsSettingsOpen(true);
        }}
        onOpenProgress={() => {
          setIsHistoryDrawerOpen(false);
          setIsProgressModalOpen(true);
        }}
        onOpenTeacherDashboard={() => {
          setIsHistoryDrawerOpen(false);
          if (onOpenTeacherDashboard) onOpenTeacherDashboard();
        }}
      />

      {/* Settings Modal (General, Notificaciones, Personalidad, Memoria) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={appSettings}
        onUpdateSettings={handleUpdateSettings}
        onExportHistory={handleExportHistory}
        onClearAllHistory={handleClearAllHistory}
      />

      {/* Mi Progreso & Cognitive Dashboard Modal */}
      <ProgressDashboardModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        userSession={session}
        sessions={sessions}
      />

      {/* Modal / Visor Interactivo de Sílabo del Curso Activo */}
      {isSyllabusDrawerOpen && academicCourse && academicSyllabus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-[#090b16] border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 bg-[#0c1024] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-md">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                    SÍLABO OFICIAL UNSAAC • 16 SEMANAS
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    {academicCourse.courseName} ({academicCourse.courseCode})
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSyllabusDrawerOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Sílabo */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
              {/* Cronograma Exámenes */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Cronograma de Evaluaciones Oficiales:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                    <span className="text-[9px] font-mono text-cyan-400 block font-bold">1er Parcial</span>
                    <span className="text-white font-bold">{academicSyllabus.examDates?.firstPartialExam || 'Semana 8'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                    <span className="text-[9px] font-mono text-cyan-400 block font-bold">2do Parcial</span>
                    <span className="text-white font-bold">{academicSyllabus.examDates?.secondPartialExam || 'Semana 15'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
                    <span className="text-[9px] font-mono text-amber-400 block font-bold">Sustitutorio</span>
                    <span className="text-white font-bold">{academicSyllabus.examDates?.substituteExam || 'Semana 17'}</span>
                  </div>
                </div>
              </div>

              {/* Lista de Semanas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Semanas Académicas (Toca una semana para cambiar el foco tutor de NÉMESIS):
                  </span>
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {academicSyllabus.weeks.map((w) => {
                    const isCurrent = w.week === academicSyllabus.currentWeek;
                    return (
                      <div
                        key={w.week}
                        onClick={() => {
                          const updated = {
                            ...academicSyllabus,
                            currentWeek: w.week,
                            currentUnit: w.unit,
                            currentTopic: w.topic,
                            currentFocusPrompt: w.methodsOrSubtopics.join('; '),
                          };
                          saveCourseSyllabus(academicCourse.courseName, academicCourse.courseCode, updated);
                          setIsSyllabusDrawerOpen(false);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          isCurrent
                            ? 'bg-cyan-950/70 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30'
                            : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                              isCurrent ? 'bg-cyan-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              Semana {w.week}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">{w.unit}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1">{w.topic}</h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{w.methodsOrSubtopics.join(' • ')}</p>
                        </div>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 font-mono text-[9px] font-bold flex-shrink-0">
                            SELECCIONADO
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-[#0c1024] flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400">
                Semana activa de tutoría: <strong className="text-cyan-300">Semana {academicSyllabus.currentWeek}</strong> ({academicSyllabus.currentTopic})
              </span>
              <button
                type="button"
                onClick={() => setIsSyllabusDrawerOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-950/40"
              >
                Cerrar Sílabo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Laboratorio Virtual Universitario (Método Científico, Sistema Internacional, MRU) */}
      {isVirtualLabOpen && (
        <StudentVirtualLabPage
          session={session}
          onBack={() => setIsVirtualLabOpen(false)}
        />
      )}
    </div>
  );
};
