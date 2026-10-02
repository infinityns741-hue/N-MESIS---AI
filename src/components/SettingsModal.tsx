import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  X, 
  Palette, 
  Bell, 
  Sparkles, 
  Brain, 
  Mic, 
  Volume2, 
  VolumeX, 
  Check, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  User, 
  Briefcase, 
  Smile, 
  Zap, 
  RotateCcw,
  Sliders,
  Type,
  Grid,
  Layers,
  Bold,
  Italic
} from 'lucide-react';
import { 
  AppSettings, 
  ThemeMode, 
  AccentColor, 
  FontSize, 
  FontFamily,
  BackgroundEffect,
  GridColor,
  TextFontColor,
  EmojiLevel, 
  WarmthLevel, 
  PersonalityStyle,
  AcademicMemoryItem
} from '../types';
import { ACCENT_PALETTES, getAccent } from '../lib/accentUtils';
import { DEFAULT_ACADEMIC_MEMORIES } from '../lib/settingsStorage';
import { FONT_OPTIONS } from '../lib/fontUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onExportHistory?: () => void;
  onClearAllHistory?: () => void;
}

type TabType = 'general' | 'notifications' | 'personality' | 'memory';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportHistory,
  onClearAllHistory,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  // New academic memory form state
  const [newMemTitle, setNewMemTitle] = useState('');
  const [newMemDetail, setNewMemDetail] = useState('');
  const [newMemCategory, setNewMemCategory] = useState<'course' | 'topic' | 'notation' | 'note'>('course');
  const [showAddMemForm, setShowAddMemForm] = useState(false);

  if (!isOpen) return null;

  const currentAccent = getAccent(settings.accentColor || 'cyan');

  // Handlers for General
  const handleThemeChange = (theme: ThemeMode) => {
    if (theme === 'system') {
      // Restore everything to default when selecting System
      onUpdateSettings({ 
        ...settings, 
        theme: 'system',
        gridColor: 'default',
        textColor: 'default',
        isBold: false,
        isItalic: false,
        backgroundEffect: 'system-grid'
      });
    } else {
      onUpdateSettings({ ...settings, theme });
    }
  };

  const handleGridColorChange = (gridColor: GridColor) => {
    onUpdateSettings({ ...settings, gridColor });
  };

  const handleTextColorChange = (textColor: TextFontColor) => {
    onUpdateSettings({ ...settings, textColor });
  };

  const handleToggleBold = () => {
    onUpdateSettings({ ...settings, isBold: !settings.isBold });
  };

  const handleToggleItalic = () => {
    onUpdateSettings({ ...settings, isItalic: !settings.isItalic });
  };

  const handleAccentChange = (accentColor: AccentColor) => {
    onUpdateSettings({ ...settings, accentColor });
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    onUpdateSettings({ ...settings, fontSize });
  };

  const handleFontFamilyChange = (fontFamily: FontFamily) => {
    onUpdateSettings({ ...settings, fontFamily });
  };

  const handleBackgroundEffectChange = (backgroundEffect: BackgroundEffect) => {
    onUpdateSettings({ ...settings, backgroundEffect });
  };

  // Handlers for Notifications
  const handleToggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const handleToneChange = (soundTone: 'crystal' | 'subtle' | 'pulse') => {
    onUpdateSettings({ ...settings, soundTone });
  };

  const handleToggleVisualFlash = () => {
    onUpdateSettings({ ...settings, visualFlashEnabled: !settings.visualFlashEnabled });
  };

  // Handlers for Personality
  const handleEmojiChange = (emojiLevel: EmojiLevel) => {
    onUpdateSettings({ ...settings, emojiLevel });
  };

  const handleWarmthChange = (warmthLevel: WarmthLevel) => {
    onUpdateSettings({ ...settings, warmthLevel });
  };

  const handleStyleChange = (personalityStyle: PersonalityStyle) => {
    onUpdateSettings({ ...settings, personalityStyle });
  };

  const handleNicknameChange = (nickname: string) => {
    onUpdateSettings({ ...settings, nickname });
  };

  const handleOccupationChange = (occupation: string) => {
    onUpdateSettings({ ...settings, occupation });
  };

  // Handlers for Memory
  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemTitle.trim() || !newMemDetail.trim()) return;

    const newMem: AcademicMemoryItem = {
      id: 'mem_' + Date.now(),
      category: newMemCategory,
      title: newMemTitle.trim(),
      detail: newMemDetail.trim(),
      createdAt: Date.now(),
    };

    const updated = [newMem, ...(settings.academicMemories || [])];
    onUpdateSettings({ ...settings, academicMemories: updated });
    setNewMemTitle('');
    setNewMemDetail('');
    setShowAddMemForm(false);
  };

  const handleDeleteMemory = (id: string) => {
    const updated = (settings.academicMemories || []).filter(m => m.id !== id);
    onUpdateSettings({ ...settings, academicMemories: updated });
  };

  const handleResetMemories = () => {
    onUpdateSettings({ ...settings, academicMemories: DEFAULT_ACADEMIC_MEMORIES });
  };

  // Theme-dependent modal frame styling
  const isLight = settings.theme === 'light';
  const isBeige = settings.theme === 'beige' || settings.theme === 'sepia';
  const isYellow = settings.theme === 'yellow';
  const isCyan = settings.theme === 'cyan';
  const isRose = settings.theme === 'rose';
  const isPurple = settings.theme === 'purple';
  const isGreen = settings.theme === 'green';
  const isRed = settings.theme === 'red';
  const isBlack = settings.theme === 'black';

  const modalBg = isBeige
    ? 'bg-[#F2A65A] border-[#cf8030] text-stone-950 shadow-amber-950/20'
    : isYellow
    ? 'bg-[#FFB400] border-[#d49200] text-stone-950 shadow-amber-950/20'
    : isCyan
    ? 'bg-[#00C2CB] border-[#009ea6] text-slate-950 shadow-cyan-950/20'
    : isLight
    ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-400/20'
    : isRose
    ? 'bg-[#fef2f6] border-[#f4c6d6] text-rose-950 shadow-rose-900/10'
    : isPurple
    ? 'bg-[#7A3E9D] border-[#5d2a7c] text-white shadow-purple-950/80'
    : isGreen
    ? 'bg-[#0b5e42] border-[#074731] text-white shadow-emerald-950/80'
    : isRed
    ? 'bg-[#BB2528] border-[#8e1719] text-white shadow-red-950/80'
    : isBlack
    ? 'bg-[#0c0d12] border-zinc-800 text-zinc-100 shadow-black'
    : 'bg-[#0e111a] border-zinc-800 text-zinc-100 shadow-black/80';

  const headerBg = isBeige
    ? 'border-[#cf8030] bg-[#e59543]'
    : isYellow
    ? 'border-[#d49200] bg-[#e6a200]'
    : isCyan
    ? 'border-[#009ea6] bg-[#00adb5]'
    : isLight
    ? 'border-zinc-200 bg-zinc-50'
    : isRose
    ? 'border-[#f4c6d6] bg-[#fae3ec]'
    : isPurple
    ? 'border-[#5d2a7c] bg-[#6c338e]'
    : isGreen
    ? 'border-[#074731] bg-[#094d36]'
    : isRed
    ? 'border-[#8e1719] bg-[#a31c1f]'
    : isBlack
    ? 'border-zinc-850 bg-[#12141c]'
    : 'border-zinc-800/80 bg-[#121624]';

  const cardBg = isBeige
    ? 'bg-[#e59543] border-[#cf8030] text-stone-950'
    : isYellow
    ? 'bg-[#e6a200] border-[#d49200] text-stone-950'
    : isCyan
    ? 'bg-[#00adb5] border-[#009ea6] text-slate-950'
    : isLight
    ? 'bg-zinc-50/90 border-zinc-200 text-slate-900'
    : isRose
    ? 'bg-[#fae3ec] border-[#f4c6d6] text-rose-950'
    : isPurple
    ? 'bg-[#6c338e] border-[#5d2a7c] text-white'
    : isGreen
    ? 'bg-[#094d36] border-[#074731] text-white'
    : isRed
    ? 'bg-[#a31c1f] border-[#8e1719] text-white'
    : isBlack
    ? 'bg-[#151722] border-zinc-800 text-zinc-100'
    : 'bg-[#121622] border-zinc-800/80 text-zinc-100';

  const inputBg = isBeige
    ? 'bg-[#fad5b1] border-[#cf8030] text-stone-950 placeholder-stone-700 focus:border-amber-950'
    : isYellow
    ? 'bg-[#ffe499] border-[#d49200] text-stone-950 placeholder-stone-700 focus:border-amber-950'
    : isCyan
    ? 'bg-[#80e5eb] border-[#009ea6] text-slate-950 placeholder-cyan-900 focus:border-cyan-950'
    : isLight
    ? 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-cyan-600'
    : isRose
    ? 'bg-white border-[#e9afc2] text-rose-950 placeholder-rose-500 focus:border-rose-500'
    : isPurple
    ? 'bg-[#5c287a] border-[#481d60] text-white placeholder-purple-200 focus:border-purple-300'
    : isGreen
    ? 'bg-[#073d2a] border-[#052b1e] text-white placeholder-emerald-200 focus:border-emerald-300'
    : isRed
    ? 'bg-[#8c1719] border-[#690e10] text-white placeholder-red-200 focus:border-red-300'
    : isBlack
    ? 'bg-[#0a0c10] border-zinc-800 text-white placeholder-zinc-500 focus:border-cyan-500'
    : 'bg-[#0a0d16] border-zinc-750 text-white placeholder-zinc-500 focus:border-cyan-500';

  return (
    <AnimatePresence>
      <div 
        id="settings-modal-overlay"
        className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] transition-colors ${modalBg}`}
        >
          {/* Header */}
          <div className={`p-4 sm:p-5 border-b flex items-center justify-between flex-shrink-0 ${headerBg}`}>
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors"
                style={{
                  backgroundColor: `${currentAccent.hex}18`,
                  borderColor: `${currentAccent.hex}40`,
                  color: currentAccent.hex,
                }}
              >
                <Settings className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">Configuración</h3>
                <p className="text-[11px] opacity-70">Personaliza apariencia, voz, personalidad y memoria</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:opacity-80 transition-colors cursor-pointer border border-transparent hover:border-zinc-500/20"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5 opacity-70" />
            </button>
          </div>

          {/* 4 Tabs: General | Notificaciones | Personalidad | Memoria */}
          <div className={`flex border-b overflow-x-auto no-scrollbar flex-shrink-0 ${headerBg}`}>
            {[
              { id: 'general', label: 'General', icon: Palette },
              { id: 'notifications', label: 'Notificaciones', icon: Bell },
              { id: 'personality', label: 'Personalidad', icon: Sparkles },
              { id: 'memory', label: 'Memoria', icon: Brain },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 py-3 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'font-bold opacity-100' 
                      : 'border-transparent opacity-60 hover:opacity-90'
                  }`}
                  style={{
                    borderColor: isActive ? currentAccent.hex : 'transparent',
                    color: isActive ? currentAccent.hex : undefined,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            
            {/* ========================================================
                TAB 1: GENERAL (Apariencia, Fondos, Realce, Fuentes, Dictado)
               ======================================================== */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                
                {/* 1. Apariencia: Negro, Blanco, Oscuro, Crema/Beige, Morado, Rosado, Verde */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5" />
                      Apariencia & Tema
                    </label>
                    <span className="text-[11px] opacity-60 font-mono">
                      {settings.theme === 'system' ? 'Predeterminado del Sistema' :
                       settings.theme === 'black' ? 'Negro Profundo' :
                       settings.theme === 'light' ? 'Blanco Puro' :
                       settings.theme === 'beige' || settings.theme === 'sepia' ? 'Crema Cálido (#F2A65A)' :
                       settings.theme === 'green' ? 'Verde Esmeralda (#0b5e42)' :
                       settings.theme === 'red' ? 'Rojo Carmesí (#BB2528)' :
                       settings.theme === 'yellow' ? 'Amarillo (#FFB400)' :
                       settings.theme === 'cyan' ? 'Celeste (#00C2CB)' :
                       settings.theme === 'purple' ? 'Morado (#7A3E9D)' : 'Sistema'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { 
                        id: 'system', 
                        label: 'Sistema', 
                        sub: 'Predeterminado', 
                        bg: 'bg-[#0a0d16] border-cyan-800/60 text-zinc-100 hover:border-cyan-500',
                        previewDot: '#00e5ff'
                      },
                      { 
                        id: 'black', 
                        label: 'Negro', 
                        sub: 'Profundo (no 000)', 
                        bg: 'bg-[#0c0d12] border-zinc-800 text-white hover:border-zinc-600',
                        previewDot: '#0c0d12'
                      },
                      { 
                        id: 'light', 
                        label: 'Blanco', 
                        sub: 'Puro (#ffffff)', 
                        bg: 'bg-white border-zinc-300 text-zinc-900 hover:border-zinc-400',
                        previewDot: '#ffffff'
                      },
                      { 
                        id: 'beige', 
                        label: 'Crema', 
                        sub: 'Saturado (#F2A65A)', 
                        bg: 'bg-[#F2A65A] border-[#d98b3f] text-stone-950 hover:border-[#b86f26]',
                        previewDot: '#F2A65A'
                      },
                      { 
                        id: 'green', 
                        label: 'Verde', 
                        sub: 'Saturado (#0b5e42)', 
                        bg: 'bg-[#0b5e42] border-emerald-700 text-white hover:border-emerald-500',
                        previewDot: '#0b5e42'
                      },
                      { 
                        id: 'red', 
                        label: 'Rojo', 
                        sub: 'UNSAAC (#BB2528)', 
                        bg: 'bg-[#BB2528] border-red-700 text-white hover:border-red-500',
                        previewDot: '#BB2528'
                      },
                      { 
                        id: 'yellow', 
                        label: 'Amarillo', 
                        sub: 'Dorado (#FFB400)', 
                        bg: 'bg-[#FFB400] border-amber-600 text-stone-950 hover:border-amber-700',
                        previewDot: '#FFB400'
                      },
                      { 
                        id: 'cyan', 
                        label: 'Celeste', 
                        sub: 'Turquesa (#00C2CB)', 
                        bg: 'bg-[#00C2CB] border-cyan-600 text-slate-950 hover:border-cyan-700',
                        previewDot: '#00C2CB'
                      },
                      { 
                        id: 'purple', 
                        label: 'Morado', 
                        sub: 'Violeta (#7A3E9D)', 
                        bg: 'bg-[#7A3E9D] border-purple-700 text-white hover:border-purple-500',
                        previewDot: '#7A3E9D'
                      },
                    ].map((t) => {
                      const isSelected = settings.theme === t.id || (t.id === 'beige' && settings.theme === 'sepia');
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleThemeChange(t.id as ThemeMode)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 relative ${t.bg} ${
                            isSelected ? 'ring-2 ring-offset-2' : ''
                          }`}
                          style={{
                            boxShadow: isSelected ? `0 0 15px ${currentAccent.hex}40` : undefined,
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm"
                              style={{ backgroundColor: t.previewDot }}
                            />
                            {isSelected && (
                              <Check className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-tight">{t.label}</p>
                            <p className="text-[10px] opacity-70 leading-tight">{t.sub}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Fondo & Efectos del Sistema (Cuadriculado con efectos, Malla técnica, Liso) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                      <Grid className="w-3.5 h-3.5" />
                      Fondo del Sistema & Efectos
                    </label>
                    <span className="text-[11px] opacity-60 font-mono">
                      {settings.backgroundEffect === 'system-grid' ? 'Cuadriculado Activo' :
                       settings.backgroundEffect === 'grid-tech' ? 'Malla Técnica' : 'Liso Plano'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'system-grid',
                        label: 'Fondo del Sistema',
                        sub: 'Cuadriculado interactivo',
                        desc: 'Efectos fluidos reactivos de NÉMESIS',
                        icon: Layers,
                      },
                      {
                        id: 'grid-tech',
                        label: 'Malla Técnica',
                        sub: 'Blueprint matemático',
                        desc: 'Cuadrícula milimetrada sobria',
                        icon: Grid,
                      },
                      {
                        id: 'solid',
                        label: 'Liso / Plano',
                        sub: 'Sin cuadrícula',
                        desc: 'Color uniforme y minimalista',
                        icon: Palette,
                      },
                    ].map((bg) => {
                      const isSelected = (settings.backgroundEffect || 'system-grid') === bg.id;
                      const Icon = bg.icon;
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => handleBackgroundEffectChange(bg.id as BackgroundEffect)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${cardBg} ${
                            isSelected ? 'ring-2' : 'hover:opacity-90'
                          }`}
                          style={{
                            borderColor: isSelected ? currentAccent.hex : undefined,
                          }}
                        >
                          <div className="flex items-center justify-between w-full mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5 opacity-80" />
                              <span className="text-xs font-bold">{bg.label}</span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />
                            )}
                          </div>
                          <p className="text-[11px] opacity-80 font-medium">{bg.sub}</p>
                          <p className="text-[10px] opacity-60 mt-0.5">{bg.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2.1 Color de la Cuadrícula / Malla (Predeterminado, Negro, Blanco, Cian, Dorado) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                      <Grid className="w-3.5 h-3.5" />
                      Color de la Malla / Cuadrícula
                    </label>
                    <span className="text-[11px] opacity-60 font-mono">
                      {settings.gridColor === 'black' ? 'Negro' :
                       settings.gridColor === 'white' ? 'Blanco' :
                       settings.gridColor === 'cyan' ? 'Cian Neón' :
                       settings.gridColor === 'gold' ? 'Dorado Ámbar' : 'Predeterminado'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-70 mb-2.5">
                    Elige el tono de las líneas fluidas de la malla (al seleccionar "Sistema" se restablece al original):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        id: 'default',
                        label: 'Predeterminado',
                        sub: 'Líneas reactivas',
                        colorDot: currentAccent.hex,
                      },
                      {
                        id: 'black',
                        label: 'Negro',
                        sub: 'Trazos en negro',
                        colorDot: '#000000',
                      },
                      {
                        id: 'white',
                        label: 'Blanco',
                        sub: 'Líneas blancas',
                        colorDot: '#ffffff',
                      },
                      {
                        id: 'cyan',
                        label: 'Cian Neón',
                        sub: 'Líneas cian',
                        colorDot: '#00d8e6',
                      },
                      {
                        id: 'gold',
                        label: 'Dorado Ámbar',
                        sub: 'Líneas doradas',
                        colorDot: '#f59e0b',
                      }
                    ].map((gc) => {
                      const isSelected = (settings.gridColor || 'default') === gc.id;
                      return (
                        <button
                          key={gc.id}
                          type="button"
                          onClick={() => handleGridColorChange(gc.id as GridColor)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${cardBg} ${
                            isSelected ? 'ring-2' : 'hover:opacity-90'
                          }`}
                          style={{
                            borderColor: isSelected ? currentAccent.hex : undefined,
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span 
                              className="w-4 h-4 rounded-full border border-black/20 shadow-sm flex-shrink-0"
                              style={{ backgroundColor: gc.colorDot }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate">{gc.label}</p>
                              <p className="text-[10px] opacity-60 truncate">{gc.sub}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 flex-shrink-0 ml-1" style={{ color: currentAccent.hex }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Color de Realce (Accent Color) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      Color de Realce (Sólido)
                    </label>
                    <span className="text-[11px] opacity-60 font-mono">
                      {currentAccent.name}
                    </span>
                  </div>

                  <p className="text-[11px] opacity-70 mb-3">
                    Cambia el color sólido del botón de envío, tus burbujas de mensaje y acentos interactivos:
                  </p>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((acc) => {
                      const pal = ACCENT_PALETTES[acc];
                      const isSelected = (settings.accentColor || 'cyan') === acc;
                      return (
                        <button
                          key={acc}
                          type="button"
                          onClick={() => handleAccentChange(acc)}
                          className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected ? 'ring-2' : 'hover:scale-105'
                          } ${cardBg}`}
                          style={{
                            borderColor: isSelected ? pal.hex : undefined,
                          }}
                          title={pal.name}
                        >
                          <span 
                            className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: pal.hex }}
                          >
                            {isSelected && (
                              <Check className={`w-3 h-3 ${acc === 'white' ? 'text-black' : 'text-white'}`} />
                            )}
                          </span>
                          <span className="text-[10px] font-semibold truncate max-w-[50px]">
                            {acc === 'cyan' ? 'Cian' :
                             acc === 'white' ? 'Blanco' :
                             acc === 'blue' ? 'Azul' :
                             acc === 'purple' ? 'Morado' :
                             acc === 'red' ? 'Rojo' :
                             acc === 'green' ? 'Verde' :
                             acc === 'amber' ? 'Ámbar' : 'Rosa'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Vista previa de la burbuja de mensajes del usuario */}
                  <div className={`mt-3 p-3 rounded-2xl border flex items-center justify-between ${cardBg}`}>
                    <div className="min-w-0 pr-2">
                      <p className="text-[11px] font-bold">Burbuja de tus Mensajes</p>
                      <p className="text-[10px] opacity-60">Con contorno negrita y color de texto activo</p>
                    </div>
                    <div 
                      className={`rounded-2xl px-4 py-2 border-2 border-stone-950/80 shadow-sm ${currentAccent.userBubbleGradient} text-sm`}
                      style={{
                        color: settings.textColor === 'black' ? '#000000' :
                               settings.textColor === 'white' ? '#ffffff' :
                               settings.textColor === 'yellow' ? '#fcd34d' :
                               settings.textColor === 'cyan' ? '#38bdf8' :
                               settings.textColor === 'cream' ? '#fef3c7' :
                               settings.textColor === 'green' ? '#86efac' :
                               settings.textColor === 'purple' ? '#d8b4fe' : undefined,
                        fontWeight: settings.isBold ? 700 : undefined,
                        fontStyle: settings.isItalic ? 'italic' : undefined,
                      }}
                    >
                      Hola DANAEL
                    </div>
                  </div>
                </div>

                {/* 3.1 Color de Fuente (Texto de Lectura & Chat) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                      <Type className="w-3.5 h-3.5" />
                      Color de Fuente (Texto)
                    </label>
                    <span className="text-[11px] opacity-60 font-mono">
                      {settings.textColor === 'white' ? 'Blanco' :
                       settings.textColor === 'black' ? 'Negro' :
                       settings.textColor === 'yellow' ? 'Amarillo' :
                       settings.textColor === 'cyan' ? 'Celeste' :
                       settings.textColor === 'cream' ? 'Crema' :
                       settings.textColor === 'green' ? 'Verde' :
                       settings.textColor === 'purple' ? 'Morado' : 'Automático'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-70 mb-2.5">
                    Personaliza el color del texto si usas apariencias oscuras o de color (como el morado) y deseas una mejor combinación:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'default', label: 'Automático', sub: 'Por tema', dot: '#94a3b8' },
                      { id: 'white', label: 'Blanco', sub: '#FFFFFF', dot: '#ffffff' },
                      { id: 'black', label: 'Negro', sub: '#000000', dot: '#000000' },
                      { id: 'yellow', label: 'Amarillo', sub: '#FCD34D', dot: '#fcd34d' },
                      { id: 'cyan', label: 'Celeste', sub: '#38BDF8', dot: '#38bdf8' },
                      { id: 'cream', label: 'Crema', sub: '#FEF3C7', dot: '#fef3c7' },
                      { id: 'green', label: 'Verde', sub: '#86EFAC', dot: '#86efac' },
                      { id: 'purple', label: 'Morado', sub: '#D8B4FE', dot: '#d8b4fe' },
                    ].map((tc) => {
                      const isSelected = (settings.textColor || 'default') === tc.id;
                      return (
                        <button
                          key={tc.id}
                          type="button"
                          onClick={() => handleTextColorChange(tc.id as TextFontColor)}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${cardBg} ${
                            isSelected ? 'ring-2' : 'hover:scale-[1.02]'
                          }`}
                          style={{
                            borderColor: isSelected ? currentAccent.hex : undefined,
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span 
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-sm flex-shrink-0"
                              style={{ backgroundColor: tc.dot }}
                            />
                            <div className="truncate">
                              <p className="text-xs font-semibold truncate">{tc.label}</p>
                              <p className="text-[10px] opacity-60 truncate">{tc.sub}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 flex-shrink-0 ml-1" style={{ color: currentAccent.hex }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3.2 Formato Tipográfico Global (Negrita & Cursiva) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                      <Bold className="w-3.5 h-3.5" />
                      Formato de Texto Global
                    </label>
                    <span className="text-[11px] opacity-60 font-mono">
                      {settings.isBold && settings.isItalic ? 'Negrita + Cursiva' :
                       settings.isBold ? 'Negrita' :
                       settings.isItalic ? 'Cursiva' : 'Normal'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-70 mb-2.5">
                    Activa negrita o cursiva en todo el chat (puedes activar ambas a la vez):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
                    <button
                      type="button"
                      onClick={handleToggleBold}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${cardBg} ${
                        settings.isBold ? 'ring-2' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: settings.isBold ? currentAccent.hex : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base border"
                          style={{
                            backgroundColor: settings.isBold ? `${currentAccent.hex}25` : 'transparent',
                            borderColor: settings.isBold ? currentAccent.hex : 'rgba(128,128,128,0.2)',
                            color: settings.isBold ? currentAccent.hex : 'inherit'
                          }}
                        >
                          <Bold className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">Todo en Negrita</p>
                          <p className="text-[10px] opacity-60">Aplica texto con mayor peso</p>
                        </div>
                      </div>
                      {settings.isBold && (
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: currentAccent.hex }} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleItalic}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${cardBg} ${
                        settings.isItalic ? 'ring-2' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: settings.isItalic ? currentAccent.hex : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center italic text-base border"
                          style={{
                            backgroundColor: settings.isItalic ? `${currentAccent.hex}25` : 'transparent',
                            borderColor: settings.isItalic ? currentAccent.hex : 'rgba(128,128,128,0.2)',
                            color: settings.isItalic ? currentAccent.hex : 'inherit'
                          }}
                        >
                          <Italic className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold italic">Todo en Cursiva</p>
                          <p className="text-[10px] opacity-60">Aplica estilo inclinado itálico</p>
                        </div>
                      </div>
                      {settings.isItalic && (
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: currentAccent.hex }} />
                      )}
                    </button>
                  </div>

                  {/* Live preview banner */}
                  <div className={`p-3 rounded-2xl border ${cardBg} opacity-95`}>
                    <p className="text-[10px] uppercase font-mono opacity-50 mb-1">Vista Previa en Vivo:</p>
                    <p 
                      className={`text-sm leading-relaxed ${settings.isBold ? 'font-bold' : ''} ${settings.isItalic ? 'italic' : ''}`}
                      style={{
                        color: settings.textColor === 'white' ? '#ffffff' :
                               settings.textColor === 'black' ? '#000000' :
                               settings.textColor === 'yellow' ? '#fcd34d' :
                               settings.textColor === 'cyan' ? '#38bdf8' :
                               settings.textColor === 'cream' ? '#fef3c7' :
                               settings.textColor === 'green' ? '#86efac' :
                               settings.textColor === 'purple' ? '#d8b4fe' : undefined
                      }}
                    >
                      "E = mc² — Todo el texto del chat se mostrará con este formato exacto :3"
                    </p>
                  </div>
                </div>

                {/* 4. Estilo de Fuente (Tipografía compartida Usuario + IA) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                      <Type className="w-3.5 h-3.5" />
                      Estilo de Fuente
                    </label>
                    <span className="text-[11px] opacity-60 font-mono">
                      {FONT_OPTIONS.find(f => f.id === (settings.fontFamily || 'sans'))?.name || 'Moderna'}
                    </span>
                  </div>

                  <p className="text-[11px] opacity-70 mb-3">
                    Tus mensajes enviados y las respuestas de NÉMESIS se formatearán en este estilo tipográfico:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {FONT_OPTIONS.map((f) => {
                      const isSelected = (settings.fontFamily || 'sans') === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleFontFamilyChange(f.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${cardBg} ${
                            isSelected ? 'ring-2' : 'hover:opacity-90'
                          }`}
                          style={{
                            borderColor: isSelected ? currentAccent.hex : undefined,
                          }}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold">{f.name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />}
                            </div>
                            <p className="text-[10px] opacity-60">{f.description}</p>
                          </div>
                          <div className={`text-xs mt-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 ${f.className}`}>
                            <span className="opacity-90">{f.sample}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Tamaño de Letra */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2 mb-3">
                    <Type className="w-3.5 h-3.5" />
                    Tamaño de Letra & Fórmulas
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'small', label: 'Pequeña', desc: '14px' },
                      { id: 'medium', label: 'Normal', desc: '16px' },
                      { id: 'large', label: 'Grande', desc: '18px' },
                    ].map((fs) => (
                      <button
                        key={fs.id}
                        type="button"
                        onClick={() => handleFontSizeChange(fs.id as FontSize)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${cardBg} ${
                          settings.fontSize === fs.id ? 'ring-2 font-bold' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          borderColor: settings.fontSize === fs.id ? currentAccent.hex : undefined,
                        }}
                      >
                        <p className="text-xs">{fs.label}</p>
                        <p className="text-[10px] opacity-60 font-mono">{fs.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================
                TAB 2: NOTIFICACIONES (Sonido, Tonos, Destello)
               ======================================================== */}
            {activeTab === 'notifications' && (
              <div className="space-y-5">
                {/* Sonido al responder */}
                <div className={`p-4 rounded-2xl border ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center border"
                        style={{
                          backgroundColor: `${currentAccent.hex}15`,
                          borderColor: `${currentAccent.hex}40`,
                          color: currentAccent.hex,
                        }}
                      >
                        {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold">Sonido al responder</p>
                        <p className="text-[11px] opacity-70">Emite una campana discreta al terminar de generar la solución</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleSound}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        settings.soundEnabled ? 'bg-emerald-500' : 'bg-zinc-600/60'
                      }`}
                      aria-label="Alternar sonido de notificación"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.soundEnabled && (
                    <div className="mt-4 pt-3 border-t border-zinc-700/30">
                      <p className="text-[11px] font-semibold mb-2 opacity-80">Tono de la campana:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'crystal', label: 'Cristalina' },
                          { id: 'subtle', label: 'Suave' },
                          { id: 'pulse', label: 'Pulso Sintético' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleToneChange(t.id as any)}
                            className={`py-1.5 px-2 rounded-xl text-xs border transition-all cursor-pointer ${
                              settings.soundTone === t.id ? 'font-bold' : 'opacity-60'
                            }`}
                            style={{
                              borderColor: settings.soundTone === t.id ? currentAccent.hex : 'transparent',
                              backgroundColor: settings.soundTone === t.id ? `${currentAccent.hex}18` : undefined,
                              color: settings.soundTone === t.id ? currentAccent.hex : undefined,
                            }}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Destello visual en pantalla */}
                <div className={`p-4 rounded-2xl border ${cardBg}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center border"
                        style={{
                          backgroundColor: `${currentAccent.hex}15`,
                          borderColor: `${currentAccent.hex}40`,
                          color: currentAccent.hex,
                        }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Destello visual de finalización</p>
                        <p className="text-[11px] opacity-70">Ilumina suavemente el contorno de la respuesta al completarse</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleVisualFlash}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        settings.visualFlashEnabled !== false ? 'bg-emerald-500' : 'bg-zinc-600/60'
                      }`}
                      aria-label="Alternar destello visual"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.visualFlashEnabled !== false ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Notificaciones de escritorio */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${cardBg}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-zinc-700/50 bg-zinc-800/40">
                      <Bell className="w-5 h-5 opacity-80" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Avisos en segundo plano</p>
                      <p className="text-[11px] opacity-70">Avisarte si cambias de pestaña mientras resuelve un cálculo largo</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && 'Notification' in window) {
                        Notification.requestPermission().then((perm) => {
                          alert(`Permiso de notificaciones: ${perm === 'granted' ? 'Activado correctamente' : 'No autorizado por el navegador'}`);
                        });
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border text-xs font-semibold hover:opacity-80 transition-all cursor-pointer"
                    style={{ borderColor: `${currentAccent.hex}50`, color: currentAccent.hex }}
                  >
                    Permitir
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================
                TAB 3: PERSONALIDAD (Emojis, Calidez, Estilos, Apodo, Ocupación, TTS)
               ======================================================== */}
            {activeTab === 'personality' && (
              <div className="space-y-6">
                
                {/* Apodo y Ocupación (Cajas no obligatorias) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold opacity-80 flex items-center gap-1.5 mb-1.5">
                      <User className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />
                      ¿Cómo quieres que te llame?
                    </label>
                    <input
                      type="text"
                      value={settings.nickname || ''}
                      onChange={(e) => handleNicknameChange(e.target.value)}
                      placeholder="Ej: Zetzy, Doc, Compañero (Opcional)"
                      className={`w-full px-3 py-2 text-xs rounded-xl border outline-none transition-all ${inputBg}`}
                      maxLength={32}
                    />
                    <p className="text-[10px] opacity-50 mt-1">NÉMESIS usará este apodo al dirigirse a ti.</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold opacity-80 flex items-center gap-1.5 mb-1.5">
                      <Briefcase className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />
                      Ocupación o Carrera
                    </label>
                    <input
                      type="text"
                      value={settings.occupation || ''}
                      onChange={(e) => handleOccupationChange(e.target.value)}
                      placeholder="Ej: Estudiante de Física UNSAAC (Opcional)"
                      className={`w-full px-3 py-2 text-xs rounded-xl border outline-none transition-all ${inputBg}`}
                      maxLength={48}
                    />
                    <p className="text-[10px] opacity-50 mt-1">Adapta los ejemplos y analogías a tu campo.</p>
                  </div>
                </div>

                {/* 1. Emojis: SIN EMOJIS, INTERMEDIO, AVANZADO */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                      <Smile className="w-3.5 h-3.5" />
                      Uso de Emojis
                    </label>
                    <span className="text-[11px] font-mono opacity-60">
                      {settings.emojiLevel === 'none' ? 'Sin Emojis (0%)' :
                       settings.emojiLevel === 'high' ? 'Avanzado (Expresivo)' : 'Intermedio (Moderado)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'SIN EMOJIS', desc: '100% formal y sobrio' },
                      { id: 'medium', label: 'INTERMEDIO', desc: 'Pedagógico y medido' },
                      { id: 'high', label: 'AVANZADO', desc: 'Dinámico con íconos 🔬' },
                    ].map((em) => (
                      <button
                        key={em.id}
                        type="button"
                        onClick={() => handleEmojiChange(em.id as EmojiLevel)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${cardBg} ${
                          settings.emojiLevel === em.id ? 'ring-2 font-bold' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          borderColor: settings.emojiLevel === em.id ? currentAccent.hex : undefined,
                        }}
                      >
                        <p className="text-xs font-bold">{em.label}</p>
                        <p className="text-[10px] opacity-60 mt-0.5">{em.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Calidad / Calidez: Fría, Intermedio, Cálida */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5" />
                      Calidez de Trato
                    </label>
                    <span className="text-[11px] font-mono opacity-60">
                      {settings.warmthLevel === 'cold' ? 'Fría / Distante' :
                       settings.warmthLevel === 'warm' ? 'Cálida / Empática' : 'Intermedio / Neutra'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cold', label: 'Fría', desc: 'Distante, directa al cálculo' },
                      { id: 'neutral', label: 'Intermedio', desc: 'Equilibrada y cordial' },
                      { id: 'warm', label: 'Cálida', desc: 'Empática y motivadora' },
                    ].map((wl) => (
                      <button
                        key={wl.id}
                        type="button"
                        onClick={() => handleWarmthChange(wl.id as WarmthLevel)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${cardBg} ${
                          settings.warmthLevel === wl.id ? 'ring-2 font-bold' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          borderColor: settings.warmthLevel === wl.id ? currentAccent.hex : undefined,
                        }}
                      >
                        <p className="text-xs font-bold">{wl.label}</p>
                        <p className="text-[10px] opacity-60 mt-0.5">{wl.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Estilos: Profesional, Amigable, Sincero, Peculiar, Cínico, Loco */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Estilo de Respuesta
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'professional', label: 'Profesional', desc: 'Profesor emérito y riguroso' },
                      { id: 'friendly', label: 'Amigable', desc: 'Compañero de estudio brillante' },
                      { id: 'sincere', label: 'Sincero', desc: 'Ultra directo, sin filtros' },
                      { id: 'quirky', label: 'Peculiar', desc: 'Genio excéntrico y curioso' },
                      { id: 'cynical', label: 'Cínico', desc: 'Sarcasmo mordaz e inteligente' },
                      { id: 'crazy', label: 'Loco', desc: 'Físico caótico y eufórico ⚡' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleStyleChange(st.id as PersonalityStyle)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${cardBg} ${
                          settings.personalityStyle === st.id ? 'ring-2 font-bold' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          borderColor: settings.personalityStyle === st.id ? currentAccent.hex : undefined,
                        }}
                      >
                        <p className="text-xs font-bold">{st.label}</p>
                        <p className="text-[10px] opacity-60 mt-0.5">{st.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================
                TAB 4: MEMORIA (Solo Cosas Académicas, Nada Personal)
               ======================================================== */}
            {activeTab === 'memory' && (
              <div className="space-y-4">
                {/* Academic Privacy Guarantee Banner */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-300">Memoria 100% Académica y Segura</p>
                    <p className="opacity-80 mt-0.5 text-[11px] leading-relaxed">
                      NÉMESIS solo retiene conceptos científicos, materias universitarias, fórmulas y preferencias de notación matemática. 
                      <strong> Jamás almacena información personal privada ni datos sensibles.</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5" style={{ color: currentAccent.hex }} />
                      Lo que NÉMESIS recuerda sobre tus estudios
                    </h4>
                    <p className="text-[11px] opacity-60">
                      {(settings.academicMemories || []).length} temas registrados en tu memoria neuronal
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMemForm(!showAddMemForm)}
                      className="px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer hover:opacity-90"
                      style={{
                        backgroundColor: `${currentAccent.hex}18`,
                        borderColor: `${currentAccent.hex}40`,
                        color: currentAccent.hex,
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir tema
                    </button>

                    <button
                      type="button"
                      onClick={handleResetMemories}
                      className="p-1.5 rounded-xl border border-zinc-700/50 hover:border-zinc-500 text-zinc-400 hover:text-white transition-all cursor-pointer"
                      title="Restablecer memoria académica por defecto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Add new memory inline form */}
                {showAddMemForm && (
                  <form 
                    onSubmit={handleAddMemory}
                    className={`p-3.5 rounded-2xl border space-y-3 ${cardBg}`}
                  >
                    <p className="text-xs font-bold">Registrar nueva memoria académica</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newMemTitle}
                        onChange={(e) => setNewMemTitle(e.target.value)}
                        placeholder="Materia o concepto (ej: Termodinámica)"
                        className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${inputBg}`}
                        required
                      />
                      <select
                        value={newMemCategory}
                        onChange={(e) => setNewMemCategory(e.target.value as any)}
                        className={`w-full px-3 py-2 text-xs rounded-xl border outline-none ${inputBg}`}
                      >
                        <option value="course">Curso Universitario</option>
                        <option value="topic">Tema o Ley Física</option>
                        <option value="notation">Notación Matemática</option>
                        <option value="note">Nota de Estudio</option>
                      </select>
                    </div>

                    <textarea
                      value={newMemDetail}
                      onChange={(e) => setNewMemDetail(e.target.value)}
                      placeholder="Detalle académico (ej: Estoy viendo ciclo de Carnot y entropía; pedir DCL en cada ejercicio)..."
                      rows={2}
                      className={`w-full px-3 py-2 text-xs rounded-xl border outline-none resize-none ${inputBg}`}
                      required
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddMemForm(false)}
                        className="px-3 py-1.5 text-xs rounded-xl border border-transparent opacity-70 hover:opacity-100 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-black transition-all cursor-pointer"
                        style={{ backgroundColor: currentAccent.hex }}
                      >
                        Guardar en Memoria
                      </button>
                    </div>
                  </form>
                )}

                {/* List of active academic memories */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {(settings.academicMemories || []).length === 0 ? (
                    <div className="p-6 text-center opacity-60 text-xs rounded-2xl border border-dashed border-zinc-700">
                      No hay memorias académicas registradas. Puedes añadir tus cursos y fórmulas arriba.
                    </div>
                  ) : (
                    (settings.academicMemories || []).map((mem) => {
                      const badgeLabel = 
                        mem.category === 'course' ? 'Curso' :
                        mem.category === 'topic' ? 'Concepto' :
                        mem.category === 'notation' ? 'Notación' : 'Nota';

                      return (
                        <div
                          key={mem.id}
                          className={`p-3 rounded-2xl border flex items-start justify-between gap-3 transition-all ${cardBg}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span 
                                className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold border"
                                style={{
                                  backgroundColor: `${currentAccent.hex}15`,
                                  borderColor: `${currentAccent.hex}30`,
                                  color: currentAccent.hex,
                                }}
                              >
                                {badgeLabel}
                              </span>
                              <h5 className="text-xs font-bold truncate">{mem.title}</h5>
                            </div>
                            <p className="text-xs opacity-75 leading-relaxed">{mem.detail}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteMemory(mem.id)}
                            className="p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Eliminar de la memoria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Footer with Done button */}
          <div className={`p-4 border-t flex items-center justify-between flex-shrink-0 ${headerBg}`}>
            <span className="text-[11px] opacity-60">
              NÉMESIS UNSAAC • Ajustes guardados automáticamente
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md hover:brightness-110 text-zinc-950"
              style={{ backgroundColor: currentAccent.hex }}
            >
              Listo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
