import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  GraduationCap, 
  BarChart3, 
  Loader2, 
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Mail,
  ArrowRight,
  Info,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { UserRole, UserSession } from '../types';
import { loginWithGoogleOAuth, getStoredSupabaseConfig } from '../lib/supabase';
import { UNSAAC_STUDENT_DIRECTORY } from '../lib/teacherStorage';

interface LoginFormProps {
  role: UserRole;
  onBack: () => void;
  onLoginSuccess: (session: UserSession) => void;
  onOpenSupabaseModal: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  role,
  onBack,
  onLoginSuccess,
}) => {
  const isAlumno = role === 'alumno';
  const defaultEmail = isAlumno ? '212867@unsaac.edu.pe' : 'docente@unsaac.edu.pe';
  const [emailInput, setEmailInput] = useState<string>(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGoogleProviderDisabled, setIsGoogleProviderDisabled] = useState(false);
  const [showSupabaseSteps, setShowSupabaseSteps] = useState(false);

  const supabaseConfig = getStoredSupabaseConfig();

  const handleEmailLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    let cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Por favor ingrese su correo institucional @unsaac.edu.pe');
      return;
    }
    if (!cleanEmail.includes('@')) {
      cleanEmail = `${cleanEmail}@unsaac.edu.pe`;
    }
    if (!cleanEmail.endsWith('@unsaac.edu.pe')) {
      setErrorMessage('El correo debe pertenecer al dominio institucional @unsaac.edu.pe');
      return;
    }

    const code = cleanEmail.split('@')[0];
    const matchedStudent = UNSAAC_STUDENT_DIRECTORY.find(
      s => s.code === code || s.email.toLowerCase() === cleanEmail
    );
    const resolvedFullName = matchedStudent 
      ? matchedStudent.fullName 
      : (role === 'docente' ? `Dr. Docente UNSAAC (${code.toUpperCase()})` : `Estudiante UNSAAC (${code})`);

    const userSession: UserSession = {
      email: cleanEmail,
      code: code,
      role: role,
      fullName: resolvedFullName,
      authenticatedWith: 'demo'
    };
    onLoginSuccess(userSession);
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsGoogleProviderDisabled(false);
    setIsLoading(true);
    try {
      const result = await loginWithGoogleOAuth(role);
      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else if (!result.success) {
        if (result.providerDisabled) {
          setIsGoogleProviderDisabled(true);
        } else {
          setErrorMessage(result.error || 'Error al conectar con Google.');
        }
      }
    } catch {
      setErrorMessage('Error al inicializar autenticación con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Back button & Role indicator */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="btn-back-to-portals"
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Cambiar Portal</span>
        </button>

        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold font-mono-code ${
          isAlumno 
            ? 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]' 
            : 'bg-rose-950/60 border border-rose-500/30 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
        }`}>
          {isAlumno ? (
            <>
              <GraduationCap className="w-3.5 h-3.5" />
              <span>ALUMNO</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-3.5 h-3.5" />
              <span>DOCENTE</span>
            </>
          )}
        </div>
      </div>

      {/* Main Login Card with ambient glowing accents */}
      <div className={`relative rounded-3xl bg-[#0c0e16]/95 border p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden ${
        isAlumno 
          ? 'border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.18)]' 
          : 'border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.18)]'
      }`}>
        {/* Subtle decorative glow orb inside card */}
        <div className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
          isAlumno ? 'bg-cyan-500/20' : 'bg-rose-500/20'
        }`} />

        {/* Title with lighting, glow and decorative cyber effects */}
        <div className="relative text-center mb-6 select-none">
          <div className="inline-flex items-center justify-center mb-2">
            <span className={`p-2 rounded-xl border ${
              isAlumno 
                ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                : 'bg-rose-950/50 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
            }`}>
              {isAlumno ? <GraduationCap className="w-6 h-6" /> : <BarChart3 className="w-6 h-6" />}
            </span>
          </div>

          <h1 
            id="login-form-title"
            className={`text-xl sm:text-2xl font-extrabold tracking-wide uppercase font-cyber ${
              isAlumno 
                ? 'text-cyan-200 title-glow-cyan' 
                : 'text-rose-200 title-glow-rose'
            }`}
          >
            {isAlumno ? 'INICIAR SESIÓN COMO ALUMNO' : 'INICIAR SESIÓN COMO DOCENTE'}
          </h1>

          {/* Subtitle requested: INGRESAR CON CORREO INSTITUCIONAL */}
          <p className="mt-2 text-xs sm:text-[13px] font-semibold tracking-[0.2em] font-cyber uppercase text-zinc-400">
            INGRESAR CON CORREO INSTITUCIONAL
          </p>
        </div>

        {/* Provider Disabled or Error Alert Box */}
        <AnimatePresence>
          {isGoogleProviderDisabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="mb-5 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs shadow-lg space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-amber-100 text-[13px]">
                    Google OAuth no está activado en Supabase
                  </h4>
                  <p className="text-[11px] text-amber-300/90 mt-1 leading-relaxed">
                    Tu proyecto de Supabase (<span className="font-mono text-white">pzqlsyteeozlctceubdi</span>) tiene el proveedor de Google desactivado en su configuración.
                  </p>
                </div>
              </div>

              {/* Instant direct login button to bypass blocker */}
              <button
                type="button"
                onClick={() => handleEmailLogin()}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Entrar directamente como {isAlumno ? 'Alumno (212867)' : 'Docente'}</span>
              </button>

              {/* Expandable toggle for Supabase dashboard steps */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowSupabaseSteps(!showSupabaseSteps)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                >
                  {showSupabaseSteps ? 'Ocultar pasos de configuración' : '¿Cómo activar Google en Supabase? (3 pasos)'}
                </button>

                {showSupabaseSteps && (
                  <div className="mt-2.5 p-3 rounded-xl bg-black/40 border border-amber-500/30 text-[11px] text-zinc-300 space-y-2">
                    <p className="font-semibold text-white">Pasos en tu consola de Supabase:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-zinc-400">
                      <li>Abre <a href="https://supabase.com/dashboard/project/pzqlsyteeozlctceubdi/auth/providers" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">Authentication &gt; Providers <ExternalLink className="w-3 h-3" /></a></li>
                      <li>Busca <strong className="text-zinc-200">Google</strong> y cambia el interruptor a <strong className="text-emerald-400">Enabled</strong>.</li>
                      <li>Pega tu <strong className="text-zinc-200">Client ID</strong> y <strong className="text-zinc-200">Client Secret</strong> de Google Cloud.</li>
                    </ol>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {errorMessage && !isGoogleProviderDisabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email input form */}
        <form onSubmit={handleEmailLogin} className="space-y-3.5 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Correo Institucional UNSAAC
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">@unsaac.edu.pe</span>
            </div>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="ej. docente@unsaac.edu.pe"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-900/90 border text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                  isAlumno
                    ? 'border-zinc-700/80 focus:border-cyan-500'
                    : 'border-zinc-700/80 focus:border-rose-500'
                }`}
              />
            </div>

            {/* Quick prefill chips */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-zinc-500 font-mono">Prueba rápida:</span>
              <button
                type="button"
                onClick={() => setEmailInput('212867@unsaac.edu.pe')}
                className="px-2 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-[10px] font-mono text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                212867@unsaac.edu.pe
              </button>
              <button
                type="button"
                onClick={() => setEmailInput('docente@unsaac.edu.pe')}
                className="px-2 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-[10px] font-mono text-rose-300 hover:text-rose-200 transition-colors"
              >
                docente@unsaac.edu.pe
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 px-5 rounded-2xl text-white font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              isAlumno
                ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
            }`}
          >
            <span>Ingresar con Correo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">o también</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* Google Institutional Sign-In Button */}
        <div className="space-y-4 mt-2">
          <motion.button
            id="btn-login-google"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full relative flex items-center justify-center gap-3.5 py-3.5 px-6 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border text-white font-semibold text-xs sm:text-sm transition-all duration-300 shadow-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden ${
              isAlumno 
                ? 'border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]' 
                : 'border-rose-500/40 hover:border-rose-400 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {isLoading ? (
              <>
                <Loader2 className={`w-4 h-4 animate-spin ${isAlumno ? 'text-cyan-400' : 'text-rose-400'}`} />
                <span className="font-cyber tracking-wider uppercase text-xs">
                  Conectando con Google...
                </span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>

                <span className="tracking-wide">
                  Continuar con Google
                </span>
              </>
            )}
          </motion.button>
        </div>

        {/* Security badge at bottom of card */}
        <div className="mt-5 pt-3.5 border-t border-zinc-900/90 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className={`w-3.5 h-3.5 ${isAlumno ? 'text-cyan-400' : 'text-rose-400'}`} />
          <span>Acceso seguro institucional para docentes y alumnos UNSAAC</span>
        </div>
      </div>
    </motion.div>
  );
};
