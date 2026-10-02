import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Send, 
  Paperclip,
  FileText,
  Mic,
  MicOff,
  Video as VideoIcon,
  Image as ImageIcon,
  Play,
  Pause,
  Download,
  Smile,
  X,
  Check,
  CheckCheck,
  Search,
  Lock,
  CheckCircle2,
  Atom,
  Volume2,
  VolumeX,
  UserPlus,
  LogOut,
  Phone,
  Sparkles,
  MessageSquare,
  PlusCircle,
  Clock,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Trash2,
  Edit3,
  MoreVertical,
  FlaskConical,
  FolderArchive,
  UserCheck
} from 'lucide-react';
import { UserSession } from '../types';
import { getSupabaseClient, WorldChatMessage, ChatAttachment } from '../lib/supabase';
import { UNSAAC_STUDENT_DIRECTORY } from '../lib/teacherStorage';
import { FormattedMessage } from './FormattedMessage';
import { CosmosBackground } from './CosmosBackground';
import { UserAvatar } from './UserAvatar';
import { ChatWallpaperTexture } from './ChatWallpaperTexture';
import { ResearchProjectsPage } from './ResearchProjectsPage';

interface StudentWorldPageProps {
  session: UserSession;
  onBack: () => void;
  onOpenLibrary?: () => void;
}

export interface RealParticipant {
  name: string;
  code: string;
  email: string;
  role: 'docente' | 'estudiante';
  specialty: string;
  avatarBg: string;
  photoUrl?: string;
  isCurrentUser?: boolean;
}

export interface ChatConversation {
  id: string;
  type: 'group' | 'direct';
  title: string;
  originalTitle?: string;
  subtitle: string;
  isGroup?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  participant?: RealParticipant;
  unreadCount?: number;
  lastMessageSnippet?: string;
  lastMessageTime?: string;
  avatarBg?: string;
  photoUrl?: string;
}

/**
 * Extracts first name and first surname for clean WhatsApp-style display.
 * Examples:
 * - "Lucía Farfán Cárdenas" -> "Lucía Farfán"
 * - "Dr. Leoncio Mendoza Flores" -> "Leoncio Mendoza"
 * - "Jhonas Mendoza Huamán" -> "Jhonas Mendoza"
 * - "Camila Quispe Almirón" -> "Camila Quispe"
 */
export function getShortDisplayName(fullName: string): string {
  if (!fullName) return 'Estudiante';
  const clean = fullName.replace(/^(Dr\.|Ing\.|Prof\.|Mg\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Estudiante';
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} ${parts[1]}`;
  // 1st name + 1st surname
  return `${parts[0]} ${parts[1]}`;
}

// 7 constant members so that 7 + current user = EXACTLY 8 real online members
const BASE_REAL_MEMBERS: RealParticipant[] = [
  {
    name: 'Dr. Leoncio Mendoza Flores',
    code: '109923',
    email: '109923@unsaac.edu.pe',
    role: 'docente',
    specialty: 'Cátedra de Física Universitaria',
    avatarBg: 'bg-emerald-800'
  },
  {
    name: 'Dr. Juvenal Valdivia Quispe',
    code: '112890',
    email: '112890@unsaac.edu.pe',
    role: 'docente',
    specialty: 'Laboratorio de Mecánica y Ondas',
    avatarBg: 'bg-teal-800'
  },
  {
    name: 'Camila Quispe Almirón',
    code: '211902',
    email: '211902@unsaac.edu.pe',
    role: 'estudiante',
    specialty: 'Ing. Informática y de Sistemas',
    avatarBg: 'bg-indigo-700'
  },
  {
    name: 'Renato Condori Huallpa',
    code: '201481',
    email: '201481@unsaac.edu.pe',
    role: 'estudiante',
    specialty: 'Física Pura',
    avatarBg: 'bg-sky-700'
  },
  {
    name: 'Álvaro Huamán Ttito',
    code: '210542',
    email: '210542@unsaac.edu.pe',
    role: 'estudiante',
    specialty: 'Ing. Electrónica',
    avatarBg: 'bg-blue-700'
  },
  {
    name: 'Lucía Farfán Cárdenas',
    code: '194021',
    email: '194021@unsaac.edu.pe',
    role: 'estudiante',
    specialty: 'Ing. Civil',
    avatarBg: 'bg-purple-700'
  },
  {
    name: 'Marco Antonio Álvarez Miranda',
    code: '221490',
    email: '221490@unsaac.edu.pe',
    role: 'estudiante',
    specialty: 'Ing. Mecánica',
    avatarBg: 'bg-amber-700'
  }
];

const BACKUP_PARTICIPANT: RealParticipant = {
  name: 'Katherine Soto Cárdenas',
  code: '210118',
  email: '210118@unsaac.edu.pe',
  role: 'estudiante',
  specialty: 'Ing. Química',
  avatarBg: 'bg-rose-700'
};

const INITIAL_FISICA_MESSAGES: WorldChatMessage[] = [
  {
    id: 'wm-fis-1',
    sender_name: 'Dr. Leoncio Mendoza Flores',
    sender_code: '109923',
    sender_email: '109923@unsaac.edu.pe',
    sender_role: 'docente',
    avatar_bg: 'bg-emerald-800',
    room_id: 'fisica-unsaac',
    content: 'Estimados estudiantes de Física UNSAAC, sean bienvenidos al grupo oficial. Recuerden que este viernes revisaremos Cinemática, gráficas de velocidad vs. tiempo y cálculo de áreas bajo la curva. Tengan a la mano sus calculadoras y apuntes.',
    created_at: '09:15 AM',
    reactions: { '👍': 8, '👏': 5 }
  },
  {
    id: 'wm-sys-1',
    sender_name: 'Sistema',
    sender_code: 'system',
    sender_email: 'sistema@unsaac.edu.pe',
    sender_role: 'system',
    room_id: 'fisica-unsaac',
    content: '— Camila Quispe se unió al grupo',
    created_at: '09:18 AM',
    is_system_event: true
  },
  {
    id: 'wm-fis-2',
    sender_name: 'Camila Quispe Almirón',
    sender_code: '211902',
    sender_email: '211902@unsaac.edu.pe',
    sender_role: 'estudiante',
    avatar_bg: 'bg-indigo-700',
    room_id: 'fisica-unsaac',
    content: 'Buenos días Dr. Mendoza, ¿la guía de ejercicios de cinemática con aceleración constante ya está disponible para descargar?',
    created_at: '09:20 AM',
    reactions: { '💡': 3 }
  },
  {
    id: 'wm-fis-3',
    sender_name: 'Dr. Leoncio Mendoza Flores',
    sender_code: '109923',
    sender_email: '109923@unsaac.edu.pe',
    sender_role: 'docente',
    avatar_bg: 'bg-emerald-800',
    room_id: 'fisica-unsaac',
    content: 'Sí Camila, aquí les comparto la guía oficial en PDF para que puedan repasar:',
    created_at: '09:23 AM',
    attachment: {
      type: 'document',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      name: 'Guía_Cinemática_UNSAAC_Semana3.pdf',
      size: '2.4 MB'
    },
    reactions: { '👍': 6 }
  },
  {
    id: 'wm-sys-2',
    sender_name: 'Sistema',
    sender_code: 'system',
    sender_email: 'sistema@unsaac.edu.pe',
    sender_role: 'system',
    room_id: 'fisica-unsaac',
    content: '— Renato Condori se unió al grupo',
    created_at: '09:25 AM',
    is_system_event: true
  },
  {
    id: 'wm-fis-4',
    sender_name: 'Renato Condori Huallpa',
    sender_code: '201481',
    sender_email: '201481@unsaac.edu.pe',
    sender_role: 'estudiante',
    avatar_bg: 'bg-sky-700',
    room_id: 'fisica-unsaac',
    content: 'Dr. Mendoza, en el problema 3 sobre la distancia recorrida con aceleración constante, ¿tomamos la velocidad inicial en reposo o con $v_0 = 10\\text{ m/s}$?',
    created_at: '09:28 AM',
    reactions: { '🤔': 2 }
  },
  {
    id: 'wm-fis-5',
    sender_name: 'Dr. Leoncio Mendoza Flores',
    sender_code: '109923',
    sender_email: '109923@unsaac.edu.pe',
    sender_role: 'docente',
    avatar_bg: 'bg-emerald-800',
    room_id: 'fisica-unsaac',
    content: 'Tomen $v_0 = 10\\text{ m/s}$ y calculen el área bajo la curva de la gráfica $v(t)$. Quien termine el cálculo puede compartir su procedimiento aquí.',
    created_at: '09:31 AM',
    reactions: { '🔥': 4, '👍': 5 }
  },
  {
    id: 'wm-sys-3',
    sender_name: 'Sistema',
    sender_code: 'system',
    sender_email: 'sistema@unsaac.edu.pe',
    sender_role: 'system',
    room_id: 'fisica-unsaac',
    content: '— Lucía Farfán se unió al grupo',
    created_at: '09:34 AM',
    is_system_event: true
  },
  {
    id: 'wm-fis-6',
    sender_name: 'Lucía Farfán Cárdenas',
    sender_code: '194021',
    sender_email: '194021@unsaac.edu.pe',
    sender_role: 'estudiante',
    avatar_bg: 'bg-purple-700',
    room_id: 'fisica-unsaac',
    content: 'A mí me dio un desplazamiento total de 125 m integrando $\\int_0^5 v(t)\\,dt$. La gráfica en el laboratorio interactivo coincide perfectamente con el área bajo la curva.',
    created_at: '09:37 AM',
    reactions: { '🚀': 6, '❤️': 3 }
  }
];

// Initial messages for direct chats
const INITIAL_DIRECT_MESSAGES: Record<string, WorldChatMessage[]> = {
  'chat-109923@unsaac.edu.pe': [
    {
      id: 'dm-mendoza-1',
      sender_name: 'Dr. Leoncio Mendoza Flores',
      sender_code: '109923',
      sender_email: '109923@unsaac.edu.pe',
      sender_role: 'docente',
      avatar_bg: 'bg-emerald-800',
      room_id: 'chat-109923@unsaac.edu.pe',
      content: 'Estimado estudiante, si tienes alguna consulta sobre la práctica calificada de cinemática y laboratorio de física, puedes escribirme por este canal personal.',
      created_at: '08:50 AM'
    }
  ],
  'chat-194021@unsaac.edu.pe': [
    {
      id: 'dm-lucia-1',
      sender_name: 'Lucía Farfán Cárdenas',
      sender_code: '194021',
      sender_email: '194021@unsaac.edu.pe',
      sender_role: 'estudiante',
      avatar_bg: 'bg-purple-700',
      room_id: 'chat-194021@unsaac.edu.pe',
      content: '¡Hola! ¿Estudiamos juntos para la sustentación del informe de física este jueves?',
      created_at: '09:10 AM'
    }
  ],
  'chat-211902@unsaac.edu.pe': [
    {
      id: 'dm-camila-1',
      sender_name: 'Camila Quispe Almirón',
      sender_code: '211902',
      sender_email: '211902@unsaac.edu.pe',
      sender_role: 'estudiante',
      avatar_bg: 'bg-indigo-700',
      room_id: 'chat-211902@unsaac.edu.pe',
      content: 'Hola compañero, acabo de subir las notas de la clase de vectores y cinemática.',
      created_at: '09:12 AM'
    }
  ]
};

export const StudentWorldPage: React.FC<StudentWorldPageProps> = ({
  session,
  onBack,
}) => {
  // Resolve current user's full name and email
  const resolvedFullName = useMemo(() => {
    if (session.fullName && !session.fullName.startsWith('Estudiante UNSAAC (')) {
      return session.fullName;
    }
    const match = UNSAAC_STUDENT_DIRECTORY.find(
      (s) => s.code === session.code || s.email.toLowerCase() === session.email.toLowerCase()
    );
    if (match) return match.fullName;
    return session.fullName || (session.role === 'docente' ? 'Docente UNSAAC' : 'Estudiante UNSAAC');
  }, [session]);

  const userInstitutionalEmail = useMemo(() => {
    if (session.email && session.email.includes('@')) return session.email.toLowerCase();
    return `${session.code || '212867'}@unsaac.edu.pe`;
  }, [session]);

  const userCode = session.code || userInstitutionalEmail.split('@')[0];

  // Storage key for group join state
  const joinStorageKey = `unsaac_joined_group_fisica_${userInstitutionalEmail}`;

  const [hasJoinedGroup, setHasJoinedGroup] = useState<boolean>(() => {
    try {
      return localStorage.getItem(joinStorageKey) === 'true';
    } catch {
      return false;
    }
  });

  // Active Chat: 'fisica-unsaac' by default
  const [activeChatId, setActiveChatId] = useState<string>('fisica-unsaac');

  // WhatsApp Layout: on mobile, whether we are viewing the chat or the sidebar list
  const [mobileShowChat, setMobileShowChat] = useState<boolean>(false);

  // Search filter for chats
  const [chatSearch, setChatSearch] = useState('');

  // View: Research Projects / Laboratory page
  const [showResearchProjects, setShowResearchProjects] = useState(false);

  // Chat management state (pinned, archived, custom contact names)
  const [pinnedChatIds, setPinnedChatIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('unsaac_pinned_chats_v1');
      return saved ? JSON.parse(saved) : ['fisica-unsaac'];
    } catch {
      return ['fisica-unsaac'];
    }
  });

  const [archivedChatIds, setArchivedChatIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('unsaac_archived_chats_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customContactNames, setCustomContactNames] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('unsaac_custom_contact_names_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeSidebarTab, setActiveSidebarTab] = useState<'all' | 'archived'>('all');
  const [chatMenuOpenId, setChatMenuOpenId] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<{ id: string; currentName: string; originalName: string } | null>(null);
  const [customNameInput, setCustomNameInput] = useState('');
  const [confirmDeleteChatId, setConfirmDeleteChatId] = useState<string | null>(null);

  // Input & attachments state
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showUsersDrawer, setShowUsersDrawer] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatEmailInput, setNewChatEmailInput] = useState('');
  const [newChatSearchQuery, setNewChatSearchQuery] = useState('');

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Messages database for all rooms
  const [allMessages, setAllMessages] = useState<Record<string, WorldChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('unsaac_all_world_messages_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading saved world messages', e);
    }
    return {
      'fisica-unsaac': INITIAL_FISICA_MESSAGES,
      ...INITIAL_DIRECT_MESSAGES
    };
  });

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-resize textarea according to text length and line breaks
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollH, 120)}px`;
    }
  }, [inputText]);

  // Real 8 online members: Current user + 7 others
  const realOnlineUsers: RealParticipant[] = useMemo(() => {
    const currentUserParticipant: RealParticipant = {
      name: resolvedFullName,
      code: userCode,
      email: userInstitutionalEmail,
      role: session.role === 'docente' ? 'docente' : 'estudiante',
      specialty: session.role === 'docente' ? 'Docente UNSAAC' : 'Ingeniería y Ciencias',
      avatarBg: session.role === 'docente' ? 'bg-emerald-700' : 'bg-cyan-700',
      isCurrentUser: true,
      photoUrl: session.avatarUrl
    };

    let filteredBase = BASE_REAL_MEMBERS.filter(
      (m) => m.email.toLowerCase() !== userInstitutionalEmail && m.code !== userCode
    );

    if (filteredBase.length < 7) {
      filteredBase.push(BACKUP_PARTICIPANT);
    }

    return [currentUserParticipant, ...filteredBase.slice(0, 7)];
  }, [resolvedFullName, userCode, userInstitutionalEmail, session.role, session.avatarUrl]);

  // Chat management actions
  const handleTogglePinChat = (chatId: string) => {
    setPinnedChatIds((prev) => {
      const next = prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId];
      try {
        localStorage.setItem('unsaac_pinned_chats_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    setChatMenuOpenId(null);
  };

  const handleToggleArchiveChat = (chatId: string) => {
    setArchivedChatIds((prev) => {
      const next = prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId];
      try {
        localStorage.setItem('unsaac_archived_chats_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    setChatMenuOpenId(null);
  };

  const handleSaveCustomContactName = (chatId: string, customName: string) => {
    setCustomContactNames((prev) => {
      const next = { ...prev };
      if (customName.trim()) {
        next[chatId] = customName.trim();
      } else {
        delete next[chatId];
      }
      try {
        localStorage.setItem('unsaac_custom_contact_names_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    setEditingContact(null);
    setChatMenuOpenId(null);
  };

  const handleDeleteChat = (chatId: string) => {
    setAllMessages((prev) => {
      const next = { ...prev };
      if (chatId === 'fisica-unsaac') {
        next[chatId] = [];
      } else {
        delete next[chatId];
      }
      try {
        localStorage.setItem('unsaac_all_world_messages_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    setConfirmDeleteChatId(null);
    setChatMenuOpenId(null);
    if (activeChatId === chatId) {
      setActiveChatId('fisica-unsaac');
    }
  };

  // Helper to start or open a direct chat
  const openOrCreateDirectChat = (email: string, participantName?: string, specialty?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const targetRoomId = `chat-${cleanEmail}`;

    if (!allMessages[targetRoomId]) {
      const studentMatch = UNSAAC_STUDENT_DIRECTORY.find(
        (s) => s.email.toLowerCase() === cleanEmail || s.code === cleanEmail.split('@')[0]
      );
      const nameToUse = participantName || studentMatch?.fullName || cleanEmail;

      const initMsg: WorldChatMessage = {
        id: `init-${Date.now()}`,
        sender_name: 'Sistema',
        sender_code: 'system',
        sender_email: 'sistema@unsaac.edu.pe',
        sender_role: 'system',
        room_id: targetRoomId,
        content: `Conversación iniciada con ${getShortDisplayName(nameToUse)}`,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_system_event: true
      };

      setAllMessages((prev) => ({
        ...prev,
        [targetRoomId]: [initMsg]
      }));
    }

    setActiveChatId(targetRoomId);
    setMobileShowChat(true);
    setShowNewChatModal(false);
    setChatSearch('');
  };

  // List of chat conversations
  const conversations: ChatConversation[] = useMemo(() => {
    const fisicaRoomMsgs = allMessages['fisica-unsaac'] || [];
    const lastFisica = fisicaRoomMsgs[fisicaRoomMsgs.length - 1];

    const fisicaTitle = customContactNames['fisica-unsaac'] || 'FÍSICA UNSAAC';
    const isFisicaPinned = pinnedChatIds.includes('fisica-unsaac');
    const isFisicaArchived = archivedChatIds.includes('fisica-unsaac');

    const list: ChatConversation[] = [
      {
        id: 'fisica-unsaac',
        type: 'group',
        title: fisicaTitle,
        originalTitle: 'FÍSICA UNSAAC',
        subtitle: 'Alumnos y docentes',
        isGroup: true,
        isPinned: isFisicaPinned,
        isArchived: isFisicaArchived,
        lastMessageSnippet: lastFisica ? (lastFisica.attachment ? `📎 ${lastFisica.attachment.name}` : lastFisica.content) : 'Grupo oficial de cátedra',
        lastMessageTime: lastFisica ? lastFisica.created_at : '09:37 AM',
        unreadCount: 0,
        avatarBg: 'bg-cyan-900'
      }
    ];

    const knownEmails = new Set<string>();

    // Add friends / teachers from online directory
    BASE_REAL_MEMBERS.forEach((member) => {
      if (member.email.toLowerCase() === userInstitutionalEmail.toLowerCase()) return;
      const roomId = `chat-${member.email.toLowerCase()}`;
      knownEmails.add(member.email.toLowerCase());
      const dMsgs = allMessages[roomId] || [];
      const lastMsg = dMsgs[dMsgs.length - 1];
      const defaultShortName = getShortDisplayName(member.name);
      const finalTitle = customContactNames[roomId] || defaultShortName;

      list.push({
        id: roomId,
        type: 'direct',
        title: finalTitle,
        originalTitle: defaultShortName,
        subtitle: member.role === 'docente' ? 'Catedrático' : member.specialty,
        participant: member,
        isPinned: pinnedChatIds.includes(roomId),
        isArchived: archivedChatIds.includes(roomId),
        lastMessageSnippet: lastMsg ? (lastMsg.attachment ? `📎 ${lastMsg.attachment.name}` : lastMsg.content) : 'Toca para chatear',
        lastMessageTime: lastMsg ? lastMsg.created_at : 'En línea',
        avatarBg: member.avatarBg,
        photoUrl: member.photoUrl
      });
    });

    // Also include any other active chats from allMessages
    Object.keys(allMessages).forEach((roomId) => {
      if (roomId === 'fisica-unsaac' || !roomId.startsWith('chat-')) return;
      const email = roomId.replace('chat-', '').toLowerCase();
      if (knownEmails.has(email) || email === userInstitutionalEmail.toLowerCase()) return;

      const dMsgs = allMessages[roomId] || [];
      const lastMsg = dMsgs[dMsgs.length - 1];
      const studentMatch = UNSAAC_STUDENT_DIRECTORY.find(
        (s) => s.email.toLowerCase() === email
      );

      const defaultShortName = studentMatch ? getShortDisplayName(studentMatch.fullName) : email.split('@')[0];
      const finalTitle = customContactNames[roomId] || defaultShortName;

      list.push({
        id: roomId,
        type: 'direct',
        title: finalTitle,
        originalTitle: defaultShortName,
        subtitle: studentMatch ? studentMatch.career : 'Estudiante UNSAAC',
        participant: {
          name: studentMatch ? studentMatch.fullName : email,
          code: studentMatch ? studentMatch.code : email.split('@')[0],
          email,
          role: 'estudiante',
          specialty: studentMatch ? studentMatch.career : 'UNSAAC',
          avatarBg: 'bg-indigo-800'
        },
        isPinned: pinnedChatIds.includes(roomId),
        isArchived: archivedChatIds.includes(roomId),
        lastMessageSnippet: lastMsg ? (lastMsg.attachment ? `📎 ${lastMsg.attachment.name}` : lastMsg.content) : 'Conversación iniciada',
        lastMessageTime: lastMsg ? lastMsg.created_at : 'Reciente',
        avatarBg: 'bg-indigo-800'
      });
    });

    // Sort pinned to the top
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [allMessages, userInstitutionalEmail, pinnedChatIds, archivedChatIds, customContactNames]);

  // Filtered conversations by tab (Todos / Archivados) and search
  const filteredConversations = useMemo(() => {
    let base = conversations;
    if (activeSidebarTab === 'archived') {
      base = base.filter((c) => c.isArchived);
    } else {
      base = base.filter((c) => !c.isArchived);
    }

    if (!chatSearch.trim()) return base;
    const term = chatSearch.toLowerCase();
    return base.filter(
      (c) => c.title.toLowerCase().includes(term) || c.subtitle.toLowerCase().includes(term)
    );
  }, [conversations, activeSidebarTab, chatSearch]);

  // Suggested people from UNSAAC_STUDENT_DIRECTORY: "Personas que quizá conozcas"
  const suggestedPeople = useMemo(() => {
    if (!chatSearch.trim()) return [];
    const term = chatSearch.toLowerCase();
    return UNSAAC_STUDENT_DIRECTORY.filter((student) => {
      if (
        student.email.toLowerCase() === userInstitutionalEmail.toLowerCase() ||
        student.code === userCode
      ) {
        return false;
      }
      return (
        student.fullName.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.code.includes(term) ||
        student.career.toLowerCase().includes(term)
      );
    });
  }, [chatSearch, userInstitutionalEmail, userCode]);

  // Current active conversation
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || conversations[0];
  }, [conversations, activeChatId]);

  // Current messages
  const activeMessages = useMemo(() => {
    return allMessages[activeChatId] || [];
  }, [allMessages, activeChatId]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('unsaac_all_world_messages_v2', JSON.stringify(allMessages));
    } catch (e) {
      console.warn('Could not persist messages', e);
    }
  }, [allMessages]);

  // Auto-scroll when messages change or chat changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeChatId]);

  // Realtime multi-email listener (Supabase Realtime + Browser BroadcastChannel + Window Storage)
  useEffect(() => {
    // 1. Browser Native BroadcastChannel for 100% instant sync between tabs / windows
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('unsaac_realtime_chat_v2');
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_WORLD_MESSAGE') {
          const incoming = event.data.message as WorldChatMessage;
          setAllMessages((prev) => {
            const roomList = prev[incoming.room_id] || [];
            if (roomList.some((m) => m.id === incoming.id)) return prev;
            return {
              ...prev,
              [incoming.room_id]: [...roomList, incoming]
            };
          });
        }
      };
    } catch (err) {
      console.info('BroadcastChannel fallback', err);
    }

    // 2. Storage event listener across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'unsaac_all_world_messages_v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setAllMessages(parsed);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Supabase Realtime Channel
    const client = getSupabaseClient();
    let supabaseChannel: ReturnType<typeof client.channel> | null = null;
    if (client) {
      try {
        supabaseChannel = client.channel('world_room_global_chat')
          .on('broadcast', { event: 'new_message' }, (payload) => {
            if (payload.payload) {
              const incoming = payload.payload as WorldChatMessage;
              setAllMessages((prev) => {
                const roomList = prev[incoming.room_id] || [];
                if (roomList.some((m) => m.id === incoming.id)) return prev;
                return {
                  ...prev,
                  [incoming.room_id]: [...roomList, incoming]
                };
              });
            }
          })
          .subscribe();
      } catch (err) {
        console.info('Supabase realtime fallback', err);
      }
    }

    return () => {
      broadcastChannel?.close();
      window.removeEventListener('storage', handleStorageChange);
      if (client && supabaseChannel) {
        client.removeChannel(supabaseChannel);
      }
    };
  }, []);

  // Broadcast helper
  const broadcastNewMessage = (msg: WorldChatMessage) => {
    // 1. Native BroadcastChannel
    try {
      const bc = new BroadcastChannel('unsaac_realtime_chat_v2');
      bc.postMessage({ type: 'NEW_WORLD_MESSAGE', message: msg });
      bc.close();
    } catch {
      // ignore
    }

    // 2. Supabase Realtime
    const client = getSupabaseClient();
    if (client) {
      try {
        client.channel('world_room_global_chat').send({
          type: 'broadcast',
          event: 'new_message',
          payload: msg
        });
      } catch (err) {
        console.warn('Could not broadcast to Supabase', err);
      }
    }
  };

  // Join group FÍSICA UNSAAC
  const handleJoinFisicaGroup = () => {
    const shortName = getShortDisplayName(resolvedFullName);
    const joinEventContent = `— ${shortName} se unió al grupo`;

    const joinMsg: WorldChatMessage = {
      id: `wm-join-${Date.now()}`,
      sender_name: 'Sistema',
      sender_code: 'system',
      sender_email: 'sistema@unsaac.edu.pe',
      sender_role: 'system',
      room_id: 'fisica-unsaac',
      content: joinEventContent,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_system_event: true
    };

    setAllMessages((prev) => ({
      ...prev,
      'fisica-unsaac': [...(prev['fisica-unsaac'] || []), joinMsg]
    }));

    setHasJoinedGroup(true);
    try {
      localStorage.setItem(joinStorageKey, 'true');
    } catch {
      // ignore
    }

    broadcastNewMessage(joinMsg);
  };

  // Send message
  const handleSendMessage = (attachment?: ChatAttachment) => {
    const text = inputText.trim();
    if (!text && !attachment) return;

    const newMsg: WorldChatMessage = {
      id: `wm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender_name: resolvedFullName,
      sender_code: userCode,
      sender_email: userInstitutionalEmail,
      sender_role: session.role === 'docente' ? 'docente' : 'estudiante',
      sender_photo: session.avatarUrl,
      avatar_bg: session.role === 'docente' ? 'bg-emerald-700' : 'bg-cyan-700',
      room_id: activeChatId,
      content: text,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
      attachment
    };

    setAllMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMsg]
    }));

    setInputText('');
    setShowAttachMenu(false);
    broadcastNewMessage(newMsg);
  };

  // Form submit handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add reaction
  const handleAddReaction = (msgId: string, emoji: string) => {
    setAllMessages((prev) => {
      const currentList = prev[activeChatId] || [];
      const updated = currentList.map((m) => {
        if (m.id === msgId) {
          const reactions = { ...(m.reactions || {}) };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...m, reactions };
        }
        return m;
      });
      return { ...prev, [activeChatId]: updated };
    });
  };

  // Handle Document Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      handleSendMessage({
        type: 'document',
        name: file.name,
        size: sizeStr,
        url: url || URL.createObjectURL(file)
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const videoUrl = URL.createObjectURL(file);
    handleSendMessage({
      type: 'video',
      name: file.name,
      size: sizeStr,
      url: videoUrl
    });
    e.target.value = '';
  };

  // Handle Audio File Upload
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const audioUrl = URL.createObjectURL(file);
    handleSendMessage({
      type: 'audio',
      name: file.name || 'Nota_de_voz.mp3',
      size: sizeStr,
      duration: '0:35',
      url: audioUrl
    });
    e.target.value = '';
  };

  // Live Audio Recording (Microphone)
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const mins = Math.floor(recordingSeconds / 60);
        const secs = recordingSeconds % 60;
        const durStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        handleSendMessage({
          type: 'audio',
          name: `Mensaje_de_voz_${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.webm`,
          duration: durStr || '0:05',
          size: `${Math.round(audioBlob.size / 1024)} KB`,
          url: audioUrl
        });

        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setRecordingSeconds(0);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission blocked or unavailable', err);
      // Friendly fallback: send sample voice note
      handleSendMessage({
        type: 'audio',
        name: 'Nota_de_voz_Física_UNSAAC.mp3',
        size: '120 KB',
        duration: '0:18',
        url: 'https://actions.google.com/sounds/v1/science/radiation_monitor.ogg'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Play audio attachment
  const handleTogglePlayAudio = (audioId: string, url: string) => {
    if (playingAudioId === audioId) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      audio.onended = () => setPlayingAudioId(null);
      audio.play().catch(() => setPlayingAudioId(null));
      setPlayingAudioId(audioId);
    }
  };

  // Quick sample documents
  const handleSendSampleDoc = (docName: string, size: string) => {
    handleSendMessage({
      type: 'document',
      name: docName,
      size,
      url: '#'
    });
  };

  // Quick sample video
  const handleSendSampleVideo = () => {
    handleSendMessage({
      type: 'video',
      name: 'Experimento_Laboratorio_Cinematica.mp4',
      size: '8.4 MB',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4'
    });
  };

  // Start new direct chat with email
  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatEmailInput.trim()) return;
    const cleanEmail = newChatEmailInput.trim().toLowerCase();
    const targetRoomId = `chat-${cleanEmail}`;

    if (!allMessages[targetRoomId]) {
      setAllMessages((prev) => ({
        ...prev,
        [targetRoomId]: [
          {
            id: `init-${Date.now()}`,
            sender_name: 'Sistema',
            sender_code: 'system',
            sender_email: 'sistema@unsaac.edu.pe',
            sender_role: 'system',
            room_id: targetRoomId,
            content: `Conversación iniciada con ${cleanEmail}`,
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            is_system_event: true
          }
        ]
      }));
    }

    setActiveChatId(targetRoomId);
    setMobileShowChat(true);
    setShowNewChatModal(false);
    setNewChatEmailInput('');
  };

  // If viewing Research Projects / Laboratory page
  if (showResearchProjects) {
    return (
      <ResearchProjectsPage
        session={session}
        onBack={() => setShowResearchProjects(false)}
        onOpenChatWithAdvisor={(advisorEmail) => {
          setShowResearchProjects(false);
          openOrCreateDirectChat(advisorEmail);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#060814] text-white flex flex-col overflow-hidden animate-in fade-in duration-200 font-sans select-none">
      {/* Hidden File Inputs for WhatsApp-like attachments */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleVideoUpload}
        className="hidden"
        accept="video/*"
      />
      <input
        type="file"
        ref={audioInputRef}
        onChange={handleAudioFileUpload}
        className="hidden"
        accept="audio/*"
      />

      {/* Top Header Bar */}
      <header className="h-16 px-3 sm:px-6 bg-[#0a0d22]/95 border-b border-cyan-500/25 backdrop-blur-xl flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Button 'Volver' as explicitly requested */}
          <button
            id="btn-volver-world"
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-sm hover:border-cyan-500/50 flex-shrink-0"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Volver</span>
          </button>

          <div className="h-5 w-px bg-zinc-800 hidden sm:block flex-shrink-0" />

          {/* Group Header Info: FÍSICA UNSAAC */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex-shrink-0">
              <Atom className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-black tracking-wider text-white font-mono uppercase truncate">
                FÍSICA UNSAAC
              </h1>
              {/* Only 'Alumnos y docentes' as explicitly requested */}
              <p className="text-[11px] text-zinc-400 font-mono truncate">
                Alumnos y docentes
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Laboratorio: Buscar centros de investigación */}
          <button
            id="btn-laboratorio-proyectos"
            type="button"
            onClick={() => setShowResearchProjects(true)}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 border border-cyan-400/50 text-white text-xs font-mono font-bold shadow-md shadow-cyan-950/60 transition-all cursor-pointer hover:scale-[1.02] flex-shrink-0 group"
            title="Buscar centros de investigación en laboratorios UNSAAC"
          >
            <FlaskConical className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline">Buscar centros de investigación</span>
            <span className="md:hidden">Centros</span>
          </button>

          {/* User Name Badge (e.g. JHONATAN QUISPE) */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <UserAvatar
              name={resolvedFullName}
              email={userInstitutionalEmail}
              photoUrl={session.avatarUrl}
              size="sm"
            />
            <div className="text-left leading-tight hidden lg:block">
              <span className="text-xs font-bold text-white uppercase block truncate max-w-[130px]">
                {resolvedFullName}
              </span>
              <span className="text-[9px] font-mono text-cyan-400 block">
                {session.role === 'docente' ? 'Catedrático' : 'Estudiante'}
              </span>
            </div>
          </div>

          {/* Real Online Count: En línea (8) */}
          <button
            id="btn-en-linea-count"
            type="button"
            onClick={() => setShowUsersDrawer(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/30 text-xs font-mono text-emerald-300 cursor-pointer transition-all shadow-sm hover:border-emerald-500/60"
            title="Ver los 8 integrantes reales conectados"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">En línea (8)</span>
          </button>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              soundEnabled ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Sonido de notificaciones"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* WhatsApp 2-Panel Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* PANEL IZQUIERDO: Lista de Chats (WhatsApp Sidebar) */}
        <aside
          className={`w-full md:w-80 lg:w-96 bg-[#090d1f]/95 border-r border-cyan-500/20 flex flex-col flex-shrink-0 z-20 transition-all ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Sidebar Header: Current user profile & search */}
          <div className="p-3.5 border-b border-zinc-800/80 space-y-3 bg-[#0c1026]/90">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar
                  name={resolvedFullName}
                  email={userInstitutionalEmail}
                  photoUrl={session.avatarUrl}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {getShortDisplayName(resolvedFullName)}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">(Tú)</span>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    session.role === 'docente' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                  }`}>
                    {session.role === 'docente' ? 'CATEDRÁTICO' : 'Estudiante'}
                  </span>
                </div>
              </div>

              {/* Button: Nuevo chat con correo */}
              <button
                type="button"
                onClick={() => setShowNewChatModal(true)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-cyan-300 hover:text-white transition-all cursor-pointer"
                title="Iniciar chat con otro correo UNSAAC"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                placeholder="Buscar o iniciar nuevo chat..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              />
              {chatSearch && (
                <button
                  type="button"
                  onClick={() => setChatSearch('')}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tabs: Todos / Archivados */}
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/60">
              <button
                type="button"
                onClick={() => setActiveSidebarTab('all')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer text-center ${
                  activeSidebarTab === 'all'
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                Todos los chats
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab('archived')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  activeSidebarTab === 'archived'
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Archivados</span>
                {archivedChatIds.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-cyan-300 text-[10px]">
                    {archivedChatIds.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Conversations List & Suggestions */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40 relative">
            {/* If in 'all' tab and there are archived chats and no search query */}
            {activeSidebarTab === 'all' && !chatSearch.trim() && archivedChatIds.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveSidebarTab('archived')}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-900/60 transition-colors border-b border-zinc-800/50 cursor-pointer"
              >
                <div className="flex items-center gap-3 text-zinc-300 text-xs font-mono">
                  <Archive className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">Chats Archivados</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-700/50">
                  {archivedChatIds.length}
                </span>
              </button>
            )}

            {/* When in 'archived' view */}
            {activeSidebarTab === 'archived' && (
              <div className="p-2.5 bg-cyan-950/30 border-b border-cyan-800/40 flex items-center justify-between text-xs font-mono text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>Viendo chats archivados</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSidebarTab('all')}
                  className="text-zinc-400 hover:text-white underline cursor-pointer"
                >
                  Ver todos
                </button>
              </div>
            )}

            {/* List of matching active conversations */}
            {filteredConversations.map((chat) => {
              const isSelected = activeChatId === chat.id;
              const isMenuOpen = chatMenuOpenId === chat.id;

              return (
                <div
                  key={chat.id}
                  className={`w-full p-3 flex items-center gap-3 transition-colors text-left relative group cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 border-l-4 border-cyan-400'
                      : 'hover:bg-zinc-900/70 border-l-4 border-transparent'
                  }`}
                >
                  {/* Click area to select chat */}
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => {
                      setActiveChatId(chat.id);
                      setMobileShowChat(true);
                      setChatMenuOpenId(null);
                    }}
                  >
                    {/* Chat Avatar */}
                    {chat.isGroup ? (
                      <div className="w-11 h-11 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-md flex-shrink-0">
                        <Atom className="w-6 h-6 animate-spin-slow" />
                      </div>
                    ) : (
                      <UserAvatar
                        name={chat.title}
                        email={chat.participant?.email}
                        photoUrl={chat.photoUrl}
                        avatarBg={chat.avatarBg}
                        size="lg"
                      />
                    )}

                    {/* Chat Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-white truncate">
                            {chat.title}
                          </span>
                          {chat.isPinned && (
                            <Pin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          )}
                          {chat.isArchived && (
                            <Archive className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 flex-shrink-0">
                          {chat.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[11px] text-zinc-400 truncate max-w-[170px]">
                          {chat.lastMessageSnippet}
                        </p>
                        {chat.participant?.role === 'docente' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase flex-shrink-0">
                            Catedrático
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3-dots actions menu button */}
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatMenuOpenId(isMenuOpen ? null : chat.id);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Opciones del chat"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Options Popup */}
                    {isMenuOpen && (
                      <div
                        className="absolute right-0 top-8 z-50 w-52 rounded-2xl bg-[#0e1329] border border-cyan-500/40 shadow-2xl p-1.5 space-y-1 text-xs font-mono animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Pin/Unpin */}
                        <button
                          type="button"
                          onClick={() => handleTogglePinChat(chat.id)}
                          className="w-full px-3 py-2 rounded-xl text-left hover:bg-zinc-800/90 text-zinc-200 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          {chat.isPinned ? (
                            <>
                              <PinOff className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Desfijar chat</span>
                            </>
                          ) : (
                            <>
                              <Pin className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Fijar chat</span>
                            </>
                          )}
                        </button>

                        {/* Archive/Unarchive */}
                        <button
                          type="button"
                          onClick={() => handleToggleArchiveChat(chat.id)}
                          className="w-full px-3 py-2 rounded-xl text-left hover:bg-zinc-800/90 text-zinc-200 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          {chat.isArchived ? (
                            <>
                              <ArchiveRestore className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Desarchivar chat</span>
                            </>
                          ) : (
                            <>
                              <Archive className="w-3.5 h-3.5 text-zinc-300" />
                              <span>Archivar chat</span>
                            </>
                          )}
                        </button>

                        {/* Customize name */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingContact({
                              id: chat.id,
                              currentName: chat.title,
                              originalName: chat.originalTitle || chat.title
                            });
                            setCustomNameInput(chat.title);
                            setChatMenuOpenId(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left hover:bg-zinc-800/90 text-zinc-200 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Personalizar nombre</span>
                        </button>

                        {/* Delete Chat */}
                        <div className="border-t border-zinc-800 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteChatId(chat.id);
                            setChatMenuOpenId(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl text-left hover:bg-red-950/80 text-red-300 hover:text-red-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          <span>Borrar chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredConversations.length === 0 && activeSidebarTab === 'archived' && (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono space-y-2">
                <FolderArchive className="w-8 h-8 mx-auto text-zinc-600" />
                <p>No tienes chats archivados</p>
              </div>
            )}

            {/* SECCIÓN: "Personas que quizá conozcas" (Matching students from UNSAAC directory) */}
            {chatSearch.trim() && (
              <div className="p-3 space-y-2 bg-[#060814]/80 border-t-2 border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-mono font-bold">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span>Personas que quizá conozcas</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                    {suggestedPeople.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {suggestedPeople.map((student) => (
                    <div
                      key={student.id}
                      className="p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                          name={student.fullName}
                          email={student.email}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {getShortDisplayName(student.fullName)}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400 truncate">
                            {student.email}
                          </p>
                          <p className="text-[9px] font-mono text-cyan-400 truncate">
                            {student.career}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openOrCreateDirectChat(student.email, student.fullName, student.career)}
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-[11px] font-mono font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                      >
                        Iniciar chat
                      </button>
                    </div>
                  ))}

                  {suggestedPeople.length === 0 && (
                    <p className="text-[11px] text-zinc-500 font-mono text-center py-2">
                      No se encontraron otros estudiantes con "{chatSearch}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer Notice */}
          <div className="p-3 bg-[#080b1a] border-t border-zinc-800/80 text-center">
            <p className="text-[10px] font-mono text-zinc-500">
              Chat universitario entre correos @unsaac.edu.pe
            </p>
          </div>
        </aside>

        {/* PANEL DERECHO: Contenido del Chat Seleccionado (WhatsApp Main Chat) */}
        <main
          className={`flex-1 flex flex-col bg-[#080d1a] relative overflow-hidden ${
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Authentic WhatsApp-Style Academic Wallpaper Texture */}
          <ChatWallpaperTexture opacity={0.12} />
          {/* Animated Cosmos Background with moving stars */}
          <CosmosBackground opacity={0.35} interactive={false} />

          {/* If looking at FÍSICA UNSAAC and not joined yet */}
          {activeChatId === 'fisica-unsaac' && !hasJoinedGroup ? (
            <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <div className="w-full max-w-md rounded-3xl bg-[#0d1127]/95 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl shadow-cyan-950/70 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative mx-auto w-16 h-16 rounded-2xl bg-cyan-950/80 border-2 border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.35)]">
                  <Atom className="w-8 h-8 animate-spin-slow" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                    FÍSICA UNSAAC
                  </h2>
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
                    Espacio universitario para resolver problemas de cinemática y laboratorio de física en tiempo real con docentes y alumnos.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left space-y-2">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={resolvedFullName}
                      email={userInstitutionalEmail}
                      photoUrl={session.avatarUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-white truncate">
                        {getShortDisplayName(resolvedFullName)}
                      </h3>
                      <p className="text-[11px] text-cyan-300 font-mono truncate">
                        {userInstitutionalEmail}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase ${
                      session.role === 'docente' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {session.role === 'docente' ? 'CATEDRÁTICO' : 'Estudiante'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-300/90 bg-amber-950/30 border border-amber-500/30 py-2 px-3 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Debes unirte al grupo para ver los mensajes.</span>
                </div>

                <button
                  id="btn-unirse-al-grupo-fisica"
                  type="button"
                  onClick={handleJoinFisicaGroup}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/80 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Unirse al grupo</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-14 px-4 bg-[#0a0d22]/90 border-b border-zinc-800/90 flex items-center justify-between flex-shrink-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button (returns to chat list on small screens) */}
                  <button
                    type="button"
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                    title="Volver a la lista de chats"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* Active Chat Avatar */}
                  {activeConversation.isGroup ? (
                    <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 flex-shrink-0">
                      <Atom className="w-5 h-5 animate-spin-slow" />
                    </div>
                  ) : (
                    <UserAvatar
                      name={activeConversation.title}
                      email={activeConversation.participant?.email}
                      photoUrl={activeConversation.photoUrl}
                      avatarBg={activeConversation.avatarBg}
                      size="md"
                    />
                  )}

                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                      {activeConversation.title}
                    </h2>
                    {/* Strictly 'Alumnos y docentes' or online status */}
                    <p className="text-[10px] text-zinc-400 font-mono truncate">
                      {activeConversation.isGroup ? 'Alumnos y docentes' : (activeConversation.subtitle || 'En línea')}
                    </p>
                  </div>
                </div>

                {/* Right options */}
                <div className="flex items-center gap-1.5 text-zinc-400">
                  {activeConversation.isGroup && (
                    <button
                      type="button"
                      onClick={() => setShowUsersDrawer(true)}
                      className="px-2.5 py-1 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 cursor-pointer"
                      title="Ver los 8 miembros del grupo"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">8 miembros</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Feed */}
              <div className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
                {activeMessages.map((msg) => {
                  // System event announcement (like: — Camila Quispe se unió al grupo)
                  if (msg.is_system_event) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 text-xs font-mono font-semibold shadow-sm flex items-center gap-2">
                          <span>{msg.content}</span>
                          <span className="text-[10px] text-cyan-400/60 font-mono">{msg.created_at}</span>
                        </div>
                      </div>
                    );
                  }

                  const isMe = 
                    msg.sender_code === userCode || 
                    (msg.sender_email && msg.sender_email.toLowerCase() === userInstitutionalEmail.toLowerCase());

                  // 1st name and 1st surname only as requested!
                  const displayName = getShortDisplayName(msg.sender_name);

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Avatar for other people (or for both) */}
                      {!isMe && (
                        <UserAvatar
                          name={msg.sender_name}
                          email={msg.sender_email}
                          photoUrl={msg.sender_photo}
                          avatarBg={msg.avatar_bg}
                          size="md"
                          className="mt-1"
                        />
                      )}

                      {/* Message Bubble Container: ADAPTS TO TEXT SIZE (w-fit max-w-[85%]) */}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* Header above bubble: ONLY 1er nombre y 1er apellido, NO EMAIL! */}
                        {!isMe && (
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-xs font-bold text-zinc-100">
                              {displayName}
                            </span>

                            {/* Role Badge: CATEDRÁTICO (distinct gold/amber) or Estudiante */}
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                              msg.sender_role === 'docente' 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' 
                                : 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-medium'
                            }`}>
                              {msg.sender_role === 'docente' ? 'CATEDRÁTICO' : 'Estudiante'}
                            </span>
                          </div>
                        )}

                        {/* WhatsApp Message Box - Width fits the content length! */}
                        <div
                          className={`w-fit max-w-[88%] sm:max-w-[75%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed border shadow-md transition-all ${
                            isMe
                              ? 'bg-gradient-to-r from-[#0d3b4c] to-[#0a2e3a] text-cyan-50 border-cyan-500/40 rounded-tr-none'
                              : 'bg-[#10152b]/95 text-zinc-100 border-zinc-800/90 rounded-tl-none'
                          }`}
                        >
                          {/* ATTACHMENT RENDERING (Document, Audio, Video, Image) */}
                          {msg.attachment && (
                            <div className="mb-2">
                              {/* 1. Document Attachment */}
                              {msg.attachment.type === 'document' && (
                                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-white truncate">
                                      {msg.attachment.name}
                                    </p>
                                    <span className="text-[10px] font-mono text-zinc-400">
                                      {msg.attachment.size || 'Archivo PDF'}
                                    </span>
                                  </div>
                                  <a
                                    href={msg.attachment.url}
                                    download={msg.attachment.name}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                                    title="Descargar documento"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                </div>
                              )}

                              {/* 2. Audio Attachment / Voice Note */}
                              {msg.attachment.type === 'audio' && (
                                <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3 min-w-[200px] sm:min-w-[240px]">
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePlayAudio(msg.id, msg.attachment!.url)}
                                    className="w-9 h-9 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer flex-shrink-0"
                                    title={playingAudioId === msg.id ? 'Pausar nota de voz' : 'Reproducir nota de voz'}
                                  >
                                    {playingAudioId === msg.id ? (
                                      <Pause className="w-4 h-4 fill-white" />
                                    ) : (
                                      <Play className="w-4 h-4 fill-white ml-0.5" />
                                    )}
                                  </button>

                                  <div className="min-w-0 flex-1 space-y-1">
                                    {/* Audio wave simulation */}
                                    <div className="h-4 flex items-center gap-1">
                                      {[40, 70, 30, 90, 60, 80, 45, 95, 30, 60, 85, 40].map((h, i) => (
                                        <div
                                          key={i}
                                          className={`w-1 rounded-full ${
                                            playingAudioId === msg.id ? 'bg-cyan-400 animate-pulse' : 'bg-zinc-500'
                                          }`}
                                          style={{ height: `${h}%` }}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                      <span className="flex items-center gap-1">
                                        <Mic className="w-3 h-3 text-cyan-400" />
                                        Nota de voz
                                      </span>
                                      <span>{msg.attachment.duration || '0:15'}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 3. Video Attachment */}
                              {msg.attachment.type === 'video' && (
                                <div className="rounded-xl overflow-hidden bg-black border border-white/10 max-w-sm">
                                  <video
                                    src={msg.attachment.url}
                                    controls
                                    className="w-full max-h-56 rounded-lg object-contain bg-black"
                                  />
                                  <div className="p-1.5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                    <span className="truncate">{msg.attachment.name}</span>
                                    <span>{msg.attachment.size}</span>
                                  </div>
                                </div>
                              )}

                              {/* 4. Image Attachment */}
                              {msg.attachment.type === 'image' && (
                                <div className="rounded-xl overflow-hidden border border-white/10 max-w-xs">
                                  <img
                                    src={msg.attachment.url}
                                    alt="Adjunto"
                                    className="w-full max-h-60 object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* TEXT CONTENT (If any) */}
                          {msg.content && (
                            <div className="whitespace-pre-wrap break-words">
                              <FormattedMessage content={msg.content} />
                            </div>
                          )}

                          {/* Bubble Footer: Timestamp & Checkmarks */}
                          <div className={`flex items-center gap-1 text-[10px] font-mono mt-1 ${isMe ? 'justify-end text-cyan-300/80' : 'justify-end text-zinc-400'}`}>
                            <span>{msg.created_at}</span>
                            {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
                          </div>
                        </div>

                        {/* Message Reactions */}
                        <div className="flex items-center gap-1 pt-0.5 px-1">
                          {msg.reactions && Object.entries(msg.reactions).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleAddReaction(msg.id, emoji)}
                              className="px-1.5 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 text-[10px] font-mono flex items-center gap-1 hover:border-cyan-500 cursor-pointer"
                            >
                              <span>{emoji}</span>
                              <span className="text-zinc-400">{count}</span>
                            </button>
                          ))}

                          {/* Quick reaction trigger on hover */}
                          <div className="flex items-center gap-0.5 opacity-0 hover:opacity-100 transition-opacity">
                            {['👍', '❤️', '🔥', '💡'].map((em) => (
                              <button
                                key={em}
                                type="button"
                                onClick={() => handleAddReaction(msg.id, em)}
                                className="p-0.5 rounded hover:bg-zinc-800 text-xs cursor-pointer"
                              >
                                {em}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar (WhatsApp Style with Auto-resizing Box & Attachments) */}
              <div className="p-3 sm:p-4 bg-[#0a0d22]/95 border-t border-zinc-800/90 relative z-20 backdrop-blur-md">
                {/* Attachment Menu Popup */}
                {showAttachMenu && (
                  <div className="absolute bottom-18 left-4 p-3 rounded-2xl bg-[#0e122b] border border-cyan-500/30 shadow-2xl shadow-cyan-950/80 grid grid-cols-3 gap-2.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {/* Document option */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-rose-500/50 text-rose-300 transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-rose-400" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-zinc-200">Documento</span>
                    </button>

                    {/* Audio option */}
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/50 text-cyan-300 transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
                        <Mic className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-zinc-200">Audio / Voz</span>
                    </button>

                    {/* Video option */}
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/50 text-purple-300 transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center">
                        <VideoIcon className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-zinc-200">Video</span>
                    </button>

                    {/* Quick sample guides shortcut */}
                    <div className="col-span-3 pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>Plantillas:</span>
                      <button
                        type="button"
                        onClick={() => handleSendSampleDoc('Guía_Laboratorio_Física_UNSAAC.pdf', '3.1 MB')}
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        + Guía Física PDF
                      </button>
                      <button
                        type="button"
                        onClick={handleSendSampleVideo}
                        className="text-purple-400 hover:underline cursor-pointer"
                      >
                        + Video Demo
                      </button>
                    </div>
                  </div>
                )}

                {/* Input row */}
                <form onSubmit={handleFormSubmit} className="flex items-end gap-2 max-w-5xl mx-auto">
                  {/* Clip / Attachment Trigger */}
                  <button
                    id="btn-attach-media"
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex-shrink-0 ${
                      showAttachMenu 
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' 
                        : 'bg-zinc-900/90 text-zinc-400 hover:text-white border-zinc-700/80 hover:border-zinc-600'
                    }`}
                    title="Adjuntar documento, audio o video"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  {/* Active Recording Bar or Textarea */}
                  {isRecording ? (
                    <div className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-mono animate-pulse">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                        <span className="font-bold">Grabando nota de voz... ({recordingSeconds}s)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={cancelRecording}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white text-xs cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 relative flex items-end bg-zinc-900/90 border border-zinc-700/80 focus-within:border-cyan-500 rounded-2xl transition-colors">
                      {/* Auto-adapting textarea */}
                      <textarea
                        id="input-world-chat-message"
                        ref={textareaRef}
                        rows={1}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Escribe un mensaje a ${activeConversation.title}...`}
                        className="w-full px-4 py-2.5 bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed font-sans max-h-32"
                      />

                      {/* Quick emojis */}
                      <div className="p-2 flex items-center gap-1 text-zinc-400">
                        {['👍', '🔥', '🚀'].map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => setInputText((t) => (t ? `${t} ${em}` : em))}
                            className="p-1 rounded hover:bg-zinc-800 text-xs cursor-pointer"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Microphone or Send Button */}
                  {!inputText.trim() && !isRecording ? (
                    <button
                      id="btn-voice-record"
                      type="button"
                      onClick={startRecording}
                      className="p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer flex-shrink-0"
                      title="Grabar nota de voz"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      id="btn-send-world-message"
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-cyan-600/30 transition-all cursor-pointer flex-shrink-0"
                      title="Enviar mensaje"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                </form>
              </div>
            </>
          )}
        </main>

        {/* Real Online Users Drawer: "En línea (8)" */}
        {showUsersDrawer && (
          <aside className="w-72 sm:w-80 bg-[#090c1e] border-l border-cyan-500/20 p-4 flex flex-col justify-between flex-shrink-0 animate-in slide-in-from-right duration-150 z-40 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <div>
                    <h3 className="text-xs font-black text-white font-mono uppercase">
                      EN LÍNEA (8)
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Grupo FÍSICA UNSAAC
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUsersDrawer(false)}
                  className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Members List */}
              <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1">
                {realOnlineUsers.map((user, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!user.isCurrentUser) {
                        setActiveChatId(`chat-${user.email.toLowerCase()}`);
                        setMobileShowChat(true);
                        setShowUsersDrawer(false);
                      }
                    }}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      user.isCurrentUser
                        ? 'bg-cyan-950/60 border-cyan-500/50 shadow-md shadow-cyan-950/30'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <UserAvatar
                        name={user.name}
                        email={user.email}
                        photoUrl={user.photoUrl}
                        avatarBg={user.avatarBg}
                        size="md"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-white truncate">
                            {getShortDisplayName(user.name)} {user.isCurrentUser && <span className="text-cyan-300 font-mono">(Tú)</span>}
                          </p>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                        </div>

                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-zinc-800/50 text-[9px] font-mono">
                          <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                            user.role === 'docente' 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-zinc-800 text-cyan-300'
                          }`}>
                            {user.role === 'docente' ? 'CATEDRÁTICO' : 'Estudiante'}
                          </span>
                          <span className="text-zinc-400 truncate max-w-[120px]">
                            {user.specialty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 text-center">
              <span className="text-[10px] font-mono text-emerald-400/90 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                8 usuarios activos en tiempo real
              </span>
            </div>
          </aside>
        )}
      </div>

      {/* Modal: Personalizar Nombre de Contacto */}
      {editingContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0c1026] border border-cyan-500/50 p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Personalizar Nombre de Contacto</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingContact(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-zinc-400 font-mono">Nombre registrado original:</p>
              <p className="text-white font-bold bg-zinc-900/90 px-3 py-2 rounded-xl border border-zinc-800">
                {editingContact.originalName}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cyan-300">
                Nombre o apodo personalizado:
              </label>
              <input
                type="text"
                value={customNameInput}
                onChange={(e) => setCustomNameInput(e.target.value)}
                placeholder="ej. Colega de Laboratorio, Profe Juan..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleSaveCustomContactName(editingContact.id, '')}
                className="text-xs font-mono text-zinc-400 hover:text-amber-300 underline cursor-pointer"
              >
                Restablecer original
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-mono hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCustomContactName(editingContact.id, customNameInput)}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-mono font-bold shadow-md cursor-pointer"
                >
                  Guardar Nombre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Borrar Chat */}
      {confirmDeleteChatId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e122b] border border-red-500/40 p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-red-400">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-sm font-bold font-mono text-white">¿Borrar conversación?</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Esta acción vaciará o eliminará los mensajes de este chat. Esta operación no se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteChatId(null)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-mono hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteChat(confirmDeleteChatId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold shadow-md cursor-pointer"
              >
                Borrar definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Iniciar chat directo con directorio UNSAAC */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0c1026] border border-cyan-500/40 p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Buscar o Iniciar Nuevo Chat</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatSearchQuery('');
                  setNewChatEmailInput('');
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search in Directory */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={newChatSearchQuery}
                onChange={(e) => setNewChatSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, código o carrera (ej. Juan, 214781)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>

            {/* Student Directory List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-64 divide-y divide-zinc-800/60">
              <div className="pb-1 text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Estudiantes y docentes registrados en la plataforma:</span>
              </div>

              {UNSAAC_STUDENT_DIRECTORY.filter((student) => {
                if (student.email.toLowerCase() === userInstitutionalEmail.toLowerCase()) return false;
                if (!newChatSearchQuery.trim()) return true;
                const q = newChatSearchQuery.toLowerCase();
                return (
                  student.fullName.toLowerCase().includes(q) ||
                  student.email.toLowerCase().includes(q) ||
                  student.code.includes(q) ||
                  student.career.toLowerCase().includes(q)
                );
              }).map((student) => (
                <div
                  key={student.id}
                  className="pt-2 flex items-center justify-between gap-3 hover:bg-zinc-900/60 p-2 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      name={student.fullName}
                      email={student.email}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {getShortDisplayName(student.fullName)}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400 truncate">
                        {student.email}
                      </p>
                      <p className="text-[9px] font-mono text-cyan-400 truncate">
                        {student.career}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openOrCreateDirectChat(student.email, student.fullName, student.career)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-md cursor-pointer whitespace-nowrap"
                  >
                    Chatear
                  </button>
                </div>
              ))}
            </div>

            {/* Manual Email Input Option */}
            <div className="border-t border-zinc-800 pt-3">
              <p className="text-[11px] font-mono text-zinc-400 mb-2">
                O escribe directamente cualquier correo institucional @unsaac.edu.pe:
              </p>
              <form onSubmit={handleCreateNewChat} className="flex gap-2">
                <input
                  type="email"
                  value={newChatEmailInput}
                  onChange={(e) => setNewChatEmailInput(e.target.value)}
                  placeholder="ej. colega@unsaac.edu.pe"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!newChatEmailInput.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-mono font-bold shadow-md cursor-pointer"
                >
                  Abrir
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
