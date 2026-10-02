import { ChatMessage, ChatSessionItem, UserSession } from '../types';

const STORAGE_CHATS_KEY_PREFIX = 'nemesis_chat_sessions_';

export function getInitialWelcomeMessage(session?: UserSession): ChatMessage {
  return {
    id: 'welcome_' + Date.now(),
    sender: 'ai',
    text: `### NEMESIS - AI`,
  };
}

export function loadUserChatSessions(userKey: string, session: UserSession): ChatSessionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_CHATS_KEY_PREFIX}${userKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading chat sessions from storage:', e);
  }

  // Initial default chat session
  const defaultChat: ChatSessionItem = {
    id: 'chat_' + Date.now(),
    title: 'Nueva conversación',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isPinned: false,
    messages: [getInitialWelcomeMessage(session)],
  };

  saveUserChatSessions(userKey, [defaultChat]);
  return [defaultChat];
}

export function saveUserChatSessions(userKey: string, sessions: ChatSessionItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_CHATS_KEY_PREFIX}${userKey}`, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving chat sessions to storage:', e);
  }
}
