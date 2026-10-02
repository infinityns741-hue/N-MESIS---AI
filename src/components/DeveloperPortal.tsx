import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Key, 
  Lock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  Trash2,
  Zap,
  Check
} from 'lucide-react';
import { 
  getStoredGeminiConfig, 
  saveStoredGeminiConfig, 
  clearStoredGeminiConfig, 
  testGeminiApiKey,
  DEFAULT_MODEL 
} from '../lib/gemini';
import { UserSession } from '../types';

interface DeveloperPortalProps {
  onBack: () => void;
  onLaunchChatAsStudent: (session: UserSession) => void;
}

export const DeveloperPortal: React.FC<DeveloperPortalProps> = ({ 
  onBack, 
  onLaunchChatAsStudent 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [devUser, setDevUser] = useState('');
  const [devPass, setDevPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // API Config State
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [hasSavedKey, setHasSavedKey] = useState(false);

  useEffect(() => {
    const config = getStoredGeminiConfig();
    if (config.apiKey) {
      setApiKey(config.apiKey);
      setHasSavedKey(true);
    }
  }, []);

  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const userClean = devUser.trim();
    const passClean = devPass.trim();

    // Secret developer authentication
    if (userClean === 'EuFraTeS' && passClean === 'EuFraTeS12') {
      setIsAuthenticated(true);
    } else {
      setAuthError('Credenciales incorrectas. Acceso denegado.');
    }
  };

  const handleTestKey = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest) {
      setTestResult({ success: false, message: 'Por favor ingresa tu API Key antes de probar.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testGeminiApiKey(keyToTest);
    setTestResult(res);
    setIsTesting(false);

    if (res.success) {
      saveStoredGeminiConfig(keyToTest);
      setHasSavedKey(true);
    }
  };

  const handleSave = async () => {
    const keyToSave = apiKey.trim();
    if (!keyToSave) {
      setTestResult({ success: false, message: 'Por favor ingresa tu API Key.' });
      return;
    }
    
    // Save to storage immediately
    saveStoredGeminiConfig(keyToSave);
    setHasSavedKey(true);
    
    // Verify with Google automatically
    setIsTesting(true);
    const res = await testGeminiApiKey(keyToSave);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      setSaveNotification('¡API Key guardada y verificada con Google! El chat de alumno ya está respondiendo en vivo.');
    } else {
      setSaveNotification('API Key guardada localmente, pero Google reportó una observación. Revisa el resultado.');
    }

    setTimeout(() => setSaveNotification(null), 5000);
  };

  const handleClear = () => {
    clearStoredGeminiConfig();
    setApiKey('');
    setHasSavedKey(false);
    setTestResult(null);
    setSaveNotification('API Key eliminada del almacenamiento local.');
    setTimeout(() => setSaveNotification(null), 3000);
  };

  const handleStartTestingChat = () => {
    if (apiKey.trim()) {
      saveStoredGeminiConfig(apiKey.trim());
    }
    // Launch chat as student session with active API key
    const session: UserSession = {
      email: '212867@unsaac.edu.pe',
      code: '212867',
      role: 'alumno',
      authenticatedWith: 'developer',
      fullName: 'Alumno UNSAAC',
    };
    onLaunchChatAsStudent(session);
  };

  const getMaskedKey = (key: string) => {
    if (!key || key.length < 10) return '';
    return `${key.slice(0, 7)}${'•'.repeat(16)}${key.slice(-4)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl mx-auto"
    >
      {/* Top Bar navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Portal</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono-code font-bold">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>PORTAL DESARROLLADOR</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative rounded-3xl bg-[#0a0c14]/95 border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.18)] backdrop-blur-2xl overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {!isAuthenticated ? (
          /* Step 1: Secret Developer Login */
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold font-cyber tracking-wider text-white uppercase">
                ACCESO DE DESARROLLADOR
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Portal reservado para administración del sistema NÉMESIS
              </p>
            </div>

            <AnimatePresence>
              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleDevLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 font-mono-code flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Usuario Desarrollador</span>
                </label>
                <input
                  type="text"
                  value={devUser}
                  onChange={(e) => setDevUser(e.target.value)}
                  placeholder="Usuario"
                  autoComplete="username"
                  required
                  className="w-full bg-[#121420] text-white placeholder-zinc-500 text-sm px-4 py-3 rounded-xl border border-zinc-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 font-mono-code flex items-center gap-1.5 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Contraseña</span>
                </label>
                <input
                  type="password"
                  value={devPass}
                  onChange={(e) => setDevPass(e.target.value)}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#121420] text-white placeholder-zinc-500 text-sm px-4 py-3 rounded-xl border border-zinc-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-cyber font-bold text-sm tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-teal-400 text-zinc-950 hover:from-cyan-400 hover:to-teal-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              >
                INGRESAR AL PANEL
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: Verified API Key Panel */
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <h2 className="text-lg font-bold font-cyber tracking-wider text-white uppercase flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-400" />
                  <span>CONEXIÓN GOOGLE GEMINI</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Gestiona la API Key para activar la inteligencia artificial oficial en tiempo real
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAuthenticated(false)}
                className="text-xs font-mono-code text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>

            {/* Current Active Status Indicator Card */}
            <div className={`p-4 rounded-2xl border transition-all ${
              hasSavedKey 
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    hasSavedKey ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-zinc-600'
                  }`} />
                  <div>
                    <h4 className="text-xs font-bold font-cyber tracking-wider uppercase text-white">
                      {hasSavedKey ? 'ESTADO: GEMINI OFICIAL CONECTADO' : 'ESTADO: SIN API KEY CONECTADA'}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-mono-code">
                      {hasSavedKey 
                        ? `Clave activa: ${getMaskedKey(apiKey)}` 
                        : 'El sistema usará simulador académico hasta que ingreses tu API Key'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono-code text-[11px] font-bold">
                    {DEFAULT_MODEL}
                  </span>
                </div>
              </div>
            </div>

            {/* Notification alert */}
            <AnimatePresence>
              {saveNotification && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{saveNotification}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Test Result alert */}
            <AnimatePresence>
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/40 border-red-500/40 text-red-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.success && (
                      <p className="mt-1 text-[11px] text-emerald-400/90 font-mono-code">
                        ✓ Tu clave responde en vivo a las consultas y ejercicios de física y cálculo.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* API Key Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-300 font-mono-code flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tu API Key de Google Gemini</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showKey ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#121420] text-white placeholder-zinc-600 text-sm px-4 py-3 rounded-xl border border-zinc-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono-code tracking-wider"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-400">
                Tu clave se almacena de forma segura en tu navegador y se comunica directamente con Google.
              </p>
            </div>

            {/* Definitive Free Model Info Card (No confusing dropdowns) */}
            <div className="p-3.5 rounded-xl bg-[#111422] border border-cyan-500/20 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-bold font-cyber uppercase tracking-wider text-xs">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Modelo Definitivo: {DEFAULT_MODEL}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono-code font-bold">
                  Versión Gratuita Oficial
                </span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                El sistema está pre-calibrado con la versión gratuita más rápida y estable de Google AI Studio, optimizada para resolución de ejercicios con fórmulas en LaTeX y análisis de fotos adjuntas.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTesting || !apiKey.trim()}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 font-medium text-xs font-mono-code transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verificando con Google...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Probar Conexión en Vivo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isTesting || !apiKey.trim()}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-zinc-950 font-bold text-xs font-cyber tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:brightness-110 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Guardar y Activar</span>
              </button>
            </div>

            {/* Clear Button */}
            {hasSavedKey && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-mono-code transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Desconectar y borrar clave</span>
                </button>
              </div>
            )}

            {/* Launch Chat Button */}
            <div className="pt-4 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={handleStartTestingChat}
                className="w-full py-3.5 px-4 rounded-xl bg-[#141824] hover:bg-[#1a2032] border border-cyan-500/30 hover:border-cyan-400 text-white font-medium text-xs font-mono-code flex items-center justify-center gap-2 transition-all cursor-pointer group"
              >
                <span>Entrar al Chat de Alumno con esta API Key</span>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
