import { AccentColor } from '../types';

export interface AccentThemeConfig {
  name: string;
  hex: string;
  sendBtnClass: string;
  sendIconClass: string;
  textClass: string;
  borderClass: string;
  bgSubtleClass: string;
  ringClass: string;
  userBubbleGradient: string;
  badgeClass: string;
}

export const ACCENT_PALETTES: Record<AccentColor, AccentThemeConfig> = {
  cyan: {
    name: 'Cian Neón',
    hex: '#00d8e6',
    sendBtnClass: 'bg-[#00d8e6] text-zinc-950 hover:bg-[#00c2cf]',
    sendIconClass: 'text-zinc-950',
    textClass: 'text-[#00d8e6]',
    borderClass: 'border-[#00d8e6]',
    bgSubtleClass: 'bg-[#00d8e6]/10',
    ringClass: 'ring-[#00d8e6]/30',
    userBubbleGradient: 'bg-[#00d8e6] text-zinc-950',
    badgeClass: 'bg-[#00d8e6] text-zinc-950',
  },
  blue: {
    name: 'Azul Real',
    hex: '#2563eb',
    sendBtnClass: 'bg-blue-600 text-white hover:bg-blue-700',
    sendIconClass: 'text-white',
    textClass: 'text-blue-500',
    borderClass: 'border-blue-600',
    bgSubtleClass: 'bg-blue-600/10',
    ringClass: 'ring-blue-600/30',
    userBubbleGradient: 'bg-blue-600 text-white',
    badgeClass: 'bg-blue-600 text-white',
  },
  purple: {
    name: 'Morado Eléctrico',
    hex: '#9333ea',
    sendBtnClass: 'bg-purple-600 text-white hover:bg-purple-700',
    sendIconClass: 'text-white',
    textClass: 'text-purple-500',
    borderClass: 'border-purple-600',
    bgSubtleClass: 'bg-purple-600/10',
    ringClass: 'ring-purple-600/30',
    userBubbleGradient: 'bg-purple-600 text-white',
    badgeClass: 'bg-purple-600 text-white',
  },
  red: {
    name: 'Rojo Carmín',
    hex: '#dc2626',
    sendBtnClass: 'bg-red-600 text-white hover:bg-red-700',
    sendIconClass: 'text-white',
    textClass: 'text-red-500',
    borderClass: 'border-red-600',
    bgSubtleClass: 'bg-red-600/10',
    ringClass: 'ring-red-600/30',
    userBubbleGradient: 'bg-red-600 text-white',
    badgeClass: 'bg-red-600 text-white',
  },
  green: {
    name: 'Verde Esmeralda',
    hex: '#059669',
    sendBtnClass: 'bg-emerald-600 text-white hover:bg-emerald-700',
    sendIconClass: 'text-white',
    textClass: 'text-emerald-500',
    borderClass: 'border-emerald-600',
    bgSubtleClass: 'bg-emerald-600/10',
    ringClass: 'ring-emerald-600/30',
    userBubbleGradient: 'bg-emerald-600 text-white',
    badgeClass: 'bg-emerald-600 text-white',
  },
  white: {
    name: 'Blanco Platino',
    hex: '#ffffff',
    sendBtnClass: 'bg-white text-zinc-950 hover:bg-zinc-200',
    sendIconClass: 'text-zinc-950',
    textClass: 'text-white',
    borderClass: 'border-white',
    bgSubtleClass: 'bg-white/10',
    ringClass: 'ring-white/30',
    userBubbleGradient: 'bg-white text-zinc-950',
    badgeClass: 'bg-white text-zinc-950',
  },
  amber: {
    name: 'Ámbar Dorado',
    hex: '#d97706',
    sendBtnClass: 'bg-amber-500 text-zinc-950 hover:bg-amber-600',
    sendIconClass: 'text-zinc-950',
    textClass: 'text-amber-500',
    borderClass: 'border-amber-500',
    bgSubtleClass: 'bg-amber-500/10',
    ringClass: 'ring-amber-500/30',
    userBubbleGradient: 'bg-amber-500 text-zinc-950',
    badgeClass: 'bg-amber-500 text-zinc-950',
  },
  rose: {
    name: 'Rosa Fucsia',
    hex: '#f43f5e',
    sendBtnClass: 'bg-rose-500 text-white hover:bg-rose-600',
    sendIconClass: 'text-white',
    textClass: 'text-rose-500',
    borderClass: 'border-rose-500',
    bgSubtleClass: 'bg-rose-500/10',
    ringClass: 'ring-rose-500/30',
    userBubbleGradient: 'bg-rose-500 text-white',
    badgeClass: 'bg-rose-500 text-white',
  },
};

export function getAccent(accent: AccentColor = 'cyan'): AccentThemeConfig {
  return ACCENT_PALETTES[accent] || ACCENT_PALETTES.cyan;
}
