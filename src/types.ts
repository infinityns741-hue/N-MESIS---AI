export type UserRole = 'alumno' | 'docente' | 'developer';

export interface UserSession {
  email: string;
  code: string;
  role: UserRole;
  fullName?: string;
  authenticatedWith: 'supabase' | 'demo' | 'google' | 'developer';
}

export type ActiveScreen = 'portal-select' | 'login' | 'chat' | 'developer-portal' | 'teacher-dashboard';

export interface SupabaseSettings {
  url: string;
  anonKey: string;
}

export type ThemeMode = 
  | 'system' 
  | 'black' 
  | 'light' 
  | 'beige' 
  | 'green' 
  | 'red' 
  | 'yellow' 
  | 'cyan' 
  | 'purple'
  | 'dark'
  | 'rose'
  | 'midnight'
  | 'sepia';
export type AccentColor = 'cyan' | 'white' | 'blue' | 'purple' | 'red' | 'green' | 'amber' | 'rose';
export type FontSize = 'small' | 'medium' | 'large';
export type FontFamily = 'sans' | 'serif' | 'mono' | 'rounded' | 'handwriting';
export type BackgroundEffect = 'system-grid' | 'grid-tech' | 'solid';
export type GridColor = 'default' | 'black' | 'white' | 'cyan' | 'gold';
export type TextFontColor = 'default' | 'white' | 'black' | 'yellow' | 'cyan' | 'cream' | 'green' | 'purple';
export type AiDetailMode = 'rigorous' | 'concise';

export type EmojiLevel = 'none' | 'medium' | 'high';
export type WarmthLevel = 'cold' | 'neutral' | 'warm';
export type PersonalityStyle = 'professional' | 'friendly' | 'sincere' | 'quirky' | 'cynical' | 'crazy';

export interface AcademicMemoryItem {
  id: string;
  category: 'course' | 'topic' | 'notation' | 'note';
  title: string;
  detail: string;
  createdAt: number;
}

export interface AppSettings {
  // General
  theme: ThemeMode;
  accentColor: AccentColor;
  voiceDictationEnabled: boolean;
  fontSize: FontSize;
  fontFamily: FontFamily;
  backgroundEffect: BackgroundEffect;
  gridColor?: GridColor;
  textColor?: TextFontColor;
  isBold?: boolean;
  isItalic?: boolean;
  showFormulaNumbers: boolean;
  
  // Notifications
  soundEnabled: boolean;
  soundTone?: 'crystal' | 'subtle' | 'pulse';
  visualFlashEnabled: boolean;

  // Personality
  emojiLevel: EmojiLevel;
  warmthLevel: WarmthLevel;
  personalityStyle: PersonalityStyle;
  nickname: string;
  occupation: string;
  aiDetailMode: AiDetailMode;

  // Voice Reading (TTS)
  voiceReadingEnabled: boolean;
  voiceSpeed: number; // 0.8, 1.0, 1.2

  // Academic Memory
  academicMemories: AcademicMemoryItem[];
}

export interface AttachmentInfo {
  type: 'image' | 'document';
  name: string;
  mimeType: string;
  size: number;
  base64?: string;
  textContent?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  imageUrl?: string;
  attachment?: AttachmentInfo;
  isLiveGemini?: boolean;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  isValidated?: boolean;
}

export interface ChatSessionItem {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  messages: ChatMessage[];
}
