import { AppSettings, ThemeMode, AcademicMemoryItem } from '../types';

const STORAGE_SETTINGS_KEY = 'nemesis_app_settings';

export const DEFAULT_ACADEMIC_MEMORIES: AcademicMemoryItem[] = [
  {
    id: 'mem_1',
    category: 'course',
    title: 'Física Universitaria & Dinámica',
    detail: 'Enfoque en Diagramas de Cuerpo Libre (DCL), leyes de Newton y trabajo-energía.',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'mem_2',
    category: 'notation',
    title: 'Sistema Internacional (SI) y LaTeX',
    detail: 'Preferencia por unidades del SI explícitas y notación matemática formal.',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'mem_3',
    category: 'topic',
    title: 'Cálculo Diferencial e Integral',
    detail: 'Deducciones analíticas paso a paso sin omitir pasos algebraicos esenciales.',
    createdAt: Date.now() - 86400000,
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  // General
  theme: 'system',
  accentColor: 'cyan',
  voiceDictationEnabled: false,
  fontSize: 'medium',
  fontFamily: 'sans',
  backgroundEffect: 'system-grid',
  gridColor: 'default',
  textColor: 'default',
  isBold: false,
  isItalic: false,
  showFormulaNumbers: true,

  // Notifications
  soundEnabled: false,
  soundTone: 'crystal',
  visualFlashEnabled: true,

  // Personality
  emojiLevel: 'none',
  warmthLevel: 'neutral',
  personalityStyle: 'professional',
  nickname: '',
  occupation: '',
  aiDetailMode: 'rigorous',

  // Voice Reading (TTS)
  voiceReadingEnabled: false,
  voiceSpeed: 1.0,

  // Academic Memory
  academicMemories: DEFAULT_ACADEMIC_MEMORIES,
};

export function loadAppSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { 
        ...DEFAULT_SETTINGS, 
        ...parsed,
        academicMemories: parsed.academicMemories || DEFAULT_ACADEMIC_MEMORIES,
      };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveAppSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    applyThemeToDocument(settings.theme);
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function applyThemeToDocument(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  
  // Normalize classes
  root.classList.remove(
    'theme-system',
    'theme-black', 
    'theme-dark', 
    'theme-light', 
    'theme-beige', 
    'theme-purple', 
    'theme-rose', 
    'theme-green', 
    'theme-red',
    'theme-yellow',
    'theme-cyan',
    'light-theme', 
    'sepia-theme', 
    'midnight-theme'
  );

  root.classList.add(`theme-${theme}`);
  if (theme === 'light') {
    root.classList.add('light-theme');
  } else if (theme === 'beige' || theme === 'sepia') {
    root.classList.add('sepia-theme');
  }
}
