import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Database, 
  Check, 
  ExternalLink, 
  Copy, 
  Terminal, 
  Shield, 
  Sparkles, 
  GitBranch, 
  Globe,
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Key,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, getSupabaseClient } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export interface AuthDiagnosticReport {
  status: 'idle' | 'running' | 'success' | 'warning' | 'error';
  cause?: 'invalid_api_key' | 'provider_disabled' | 'network_error' | 'none';
  title: string;
  summary: string;
  details?: string;
  recommendation?: string;
  timestamp?: string;
  checks: {
    endpointReached: boolean | null;
    apiKeyValid: boolean | null;
    providerEnabled: boolean | null;
  };
  rawResponse?: string;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const DETECTED_PROJECT_URL = 'https://pzqlsyteeozlctceubdi.supabase.co';
  const [url, setUrl] = useState(currentConfig.url || DETECTED_PROJECT_URL);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'keys' | 'diagnostics' | 'sql'>('keys');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<AuthDiagnosticReport | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    saveStoredSupabaseConfig(url, anonKey);
    onConfigUpdated();
    setTestStatus('Configuración guardada exitosamente.');
    setTimeout(() => setTestStatus(null), 3000);
  };

  const handleTestConnection = async () => {
    setTestStatus('Probando conexión con Supabase...');
    saveStoredSupabaseConfig(url, anonKey);
    const client = getSupabaseClient();
    if (!client) {
      setTestStatus('Error: Ingrese una URL y Anon Key válidas de Supabase.');
      return;
    }

    try {
      const { error } = await client.auth.getSession();
      if (error) {
        setTestStatus(`Error de Supabase: ${error.message}`);
      } else {
        setTestStatus('¡Conexión básica exitosa con tu proyecto de Supabase!');
      }
    } catch {
      setTestStatus('No se pudo establecer conexión. Verifica tu URL y API Key.');
    }
  };

  /**
   * Diagnóstico a fondo de la API de Autenticación de Supabase.
   * Realiza una petición simple a /auth/v1/settings y /auth/v1/authorize
   * para distinguir si el error proviene de:
   * 1. Clave de API incorrecta (401 / UNAUTHORIZED_INVALID_API_KEY)
   * 2. Proveedor de autenticación deshabilitado (400 / Unsupported provider: provider is not enabled)
   * 3. Error de red o URL
   */
  const runAuthDiagnostics = async () => {
    setIsDiagnosing(true);
    const cleanUrl = url.trim().replace(/\/$/, '');
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      setDiagnosticReport({
        status: 'error',
        cause: 'invalid_api_key',
        title: 'Credenciales Incompletas',
        summary: 'Debes ingresar tanto la Project URL como la clave Anon Key.',
        details: 'No es posible evaluar la API de autenticación sin una URL y una API Key.',
        recommendation: 'Ingresa la URL y la Anon Key en los campos superiores y vuelve a ejecutar el diagnóstico.',
        timestamp: new Date().toLocaleTimeString(),
        checks: {
          endpointReached: false,
          apiKeyValid: false,
          providerEnabled: null,
        }
      });
      setIsDiagnosing(false);
      return;
    }

    setDiagnosticReport({
      status: 'running',
      title: 'Ejecutando diagnóstico...',
      summary: 'Contactando el endpoint /auth/v1/settings y validando la clave de API...',
      checks: {
        endpointReached: null,
        apiKeyValid: null,
        providerEnabled: null,
      }
    });

    try {
      // 1. Petición simple a la API de autenticación (/auth/v1/settings)
      const settingsRes = await fetch(`${cleanUrl}/auth/v1/settings`, {
        method: 'GET',
        headers: {
          'apikey': cleanKey,
          'Authorization': `Bearer ${cleanKey}`,
        }
      });

      // CASO 1: Error 401 / 403 -> La clave de API es incorrecta o inválida
      if (settingsRes.status === 401 || settingsRes.status === 403) {
        let errorDetail = 'Invalid API key (No autorizada)';
        try {
          const errJson = await settingsRes.json();
          errorDetail = errJson.message || errJson.hint || errJson.msg || errorDetail;
        } catch {}

        setDiagnosticReport({
          status: 'error',
          cause: 'invalid_api_key',
          title: 'Origen del Error: Clave de API Incorrecta',
          summary: 'La petición a la API de autenticación fue rechazada por Supabase debido a una clave de API (Anon Key) incorrecta o expirada.',
          details: `El servidor respondió con código HTTP ${settingsRes.status}: "${errorDetail}".`,
          recommendation: 'Revisa tu panel de Supabase en Settings (⚙️) > API y asegúrate de copiar la clave "anon public" exacta (comienza con "eyJhbGciOi..." o "sb_publishable_...").',
          timestamp: new Date().toLocaleTimeString(),
          checks: {
            endpointReached: true,
            apiKeyValid: false,
            providerEnabled: null,
          },
          rawResponse: JSON.stringify({ status: settingsRes.status, message: errorDetail })
        });
        setIsDiagnosing(false);
        return;
      }

      // CASO 2: La API Key es válida (HTTP 200) -> Comprobar el estado del proveedor de autenticación
      if (settingsRes.ok) {
        let externalProviders: Record<string, boolean> = {};
        try {
          const settingsData = await settingsRes.json();
          externalProviders = settingsData?.external || {};
        } catch {}

        const isGoogleConfiguredInSettings = externalProviders.google === true;
        let providerProbePassed = isGoogleConfiguredInSettings;
        let providerProbeMsg = '';

        // Sonda directa al endpoint de autorización del proveedor Google
        try {
          const authProbe = await fetch(`${cleanUrl}/auth/v1/authorize?provider=google`, {
            method: 'GET',
            redirect: 'manual',
            headers: {
              'apikey': cleanKey,
              'Authorization': `Bearer ${cleanKey}`,
            }
          });

          if (authProbe.status === 400) {
            const probeJson = await authProbe.json().catch(() => ({}));
            if (
              probeJson.code === 400 || 
              probeJson.error_code === 'validation_failed' ||
              probeJson.msg?.includes('provider is not enabled') ||
              probeJson.message?.includes('provider is not enabled')
            ) {
              providerProbePassed = false;
              providerProbeMsg = probeJson.msg || probeJson.message || 'Unsupported provider: provider is not enabled';
            }
          } else if (authProbe.status === 302 || authProbe.status === 200 || authProbe.type === 'opaqueredirect') {
            providerProbePassed = true;
          }
        } catch {
          // El navegador puede gestionar opacamente el redirect, nos apoyamos en isGoogleConfiguredInSettings
        }

        // Sub-caso 2.1: El error proviene de un proveedor de autenticación deshabilitado
        if (!providerProbePassed) {
          setDiagnosticReport({
            status: 'warning',
            cause: 'provider_disabled',
            title: 'Origen del Error: Proveedor de Autenticación Deshabilitado',
            summary: 'Tu Clave de API es CORRECTA y válida, pero el proveedor de autenticación de Google está DESHABILITADO en tu proyecto de Supabase.',
            details: providerProbeMsg 
              ? `Supabase reportó: "${providerProbeMsg}" (código 400 validation_failed).`
              : 'El proveedor Google está configurado como falso ("external.google: false") en el servidor de autenticación.',
            recommendation: 'Para habilitarlo, ve a tu panel de Supabase: Authentication > Providers > Google, activa el interruptor "Enable Sign in with Google", ingresa el Client ID / Client Secret y guarda los cambios.',
            timestamp: new Date().toLocaleTimeString(),
            checks: {
              endpointReached: true,
              apiKeyValid: true,
              providerEnabled: false,
            },
            rawResponse: JSON.stringify({ 
              code: 400, 
              error_code: 'validation_failed', 
              msg: providerProbeMsg || 'Unsupported provider: provider is not enabled' 
            })
          });
          setIsDiagnosing(false);
          return;
        }

        // Sub-caso 2.2: Ambos correctos (API Key válida y Proveedor Google habilitado)
        setDiagnosticReport({
          status: 'success',
          cause: 'none',
          title: 'Diagnóstico Exitoso: Todo Operativo',
          summary: 'La clave de API es válida y el proveedor de autenticación Google se encuentra habilitado y respondiendo.',
          details: 'El servidor de autenticación GoTrue autorizó la petición (HTTP 200) y el endpoint OAuth redirige exitosamente.',
          recommendation: 'La configuración de autenticación está lista para su uso tanto con Google OAuth como con correo institucional.',
          timestamp: new Date().toLocaleTimeString(),
          checks: {
            endpointReached: true,
            apiKeyValid: true,
            providerEnabled: true,
          }
        });
        setIsDiagnosing(false);
        return;
      }

      // Código de respuesta inusual
      setDiagnosticReport({
        status: 'error',
        cause: 'network_error',
        title: 'Respuesta Inesperada del Servidor',
        summary: `El endpoint respondió con código HTTP ${settingsRes.status}.`,
        details: 'Verifica la URL del proyecto o el estado de la infraestructura en Supabase.',
        timestamp: new Date().toLocaleTimeString(),
        checks: {
          endpointReached: true,
          apiKeyValid: null,
          providerEnabled: null,
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error de red o conexión';
      setDiagnosticReport({
        status: 'error',
        cause: 'network_error',
        title: 'Error de Red o URL Inaccesible',
        summary: 'No se pudo contactar el servidor de autenticación de Supabase.',
        details: `Detalle del fallo: ${msg}. Verifica que la URL esté bien escrita (ej. https://pzqlsyteeozlctceubdi.supabase.co) y haya conexión a internet.`,
        recommendation: 'Asegúrate de que la URL inicie con "https://" y no tenga caracteres adicionales.',
        timestamp: new Date().toLocaleTimeString(),
        checks: {
          endpointReached: false,
          apiKeyValid: null,
          providerEnabled: null,
        },
        rawResponse: msg
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const copyEnvSnippet = () => {
    const snippet = `VITE_SUPABASE_URL="${url || DETECTED_PROJECT_URL}"\nVITE_SUPABASE_ANON_KEY="${anonKey || 'tu-anon-key'}"`;
    navigator.clipboard.writeText(snippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const SQL_SCHEMA = `-- Tablas de NÉMESIS UNSAAC para Supabase
-- Ejecuta este código en Supabase > SQL Editor (>_)

create table if not exists public.courses (
  id text primary key,
  course_code text not null,
  name text not null,
  group_letter text not null,
  semester text,
  classroom text,
  schedule text,
  teacher_email text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.students (
  id uuid default gen_random_uuid() primary key,
  course_id text references public.courses(id) on delete cascade,
  student_code text not null,
  full_name text not null,
  email text not null,
  attendance_percent integer default 95,
  estimated_grade numeric(4,2) default 16.5,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.pedagogical_notes (
  id uuid default gen_random_uuid() primary key,
  student_code text not null,
  course_id text references public.courses(id) on delete cascade,
  note_content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habilitar lectura pública/anon
alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.pedagogical_notes enable row level security;

create policy "Permitir lectura general" on public.courses for all using (true);
create policy "Permitir lectura alumnos" on public.students for all using (true);
create policy "Permitir notas docentes" on public.pedagogical_notes for all using (true);`;

  const copySqlSnippet = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#0d0f17] border border-cyan-500/30 p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-zinc-100 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-cyber tracking-wide text-white">
                CONEXIÓN CON SUPABASE
              </h2>
              <p className="text-xs text-zinc-400">
                Backend NÉMESIS • Base de datos y Autenticación
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 mb-4 p-1 rounded-xl bg-[#090a12] border border-zinc-800 text-xs">
            <button
              id="tab-supabase-keys"
              type="button"
              onClick={() => setActiveTab('keys')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg font-mono-code font-bold transition-all ${
                activeTab === 'keys'
                  ? 'bg-cyan-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              1. Credenciales
            </button>
            <button
              id="tab-supabase-diagnostics"
              type="button"
              onClick={() => {
                setActiveTab('diagnostics');
                if (!diagnosticReport) {
                  runAuthDiagnostics();
                }
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-lg font-mono-code font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'diagnostics'
                  ? 'bg-cyan-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>2. Diagnóstico</span>
              {diagnosticReport?.status === 'error' && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              )}
              {diagnosticReport?.status === 'warning' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
            <button
              id="tab-supabase-sql"
              type="button"
              onClick={() => setActiveTab('sql')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg font-mono-code font-bold transition-all ${
                activeTab === 'sql'
                  ? 'bg-cyan-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              3. Tablas SQL
            </button>
          </div>

          {activeTab === 'keys' && (
            <>
              {/* Instructions note based on user screenshot */}
              <div className="mb-4 p-3 rounded-2xl bg-zinc-900/90 border border-cyan-500/30 text-xs space-y-2 text-zinc-300">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300 font-mono-code">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>¿DÓNDE ENCONTRAR ESTOS DATOS EN TU PANTALLA?</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-zinc-300 text-[11px] leading-relaxed">
                  <li>
                    <strong>Opción Rápida:</strong> Haz clic en el botón verde <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold font-mono">Connect</span> que tienes arriba al centro de tu pantalla en Supabase.
                  </li>
                  <li>
                    <strong>Opción Ajustes:</strong> En la barra lateral izquierda ve al engranaje <span className="text-zinc-100 font-semibold">Settings (⚙️)</span> → <span className="text-zinc-100 font-semibold">API</span> → copia tu <strong className="text-cyan-300">anon public</strong> key.
                  </li>
                </ol>
              </div>

              {/* Inputs */}
              <div className="space-y-4 mb-5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono-code font-semibold text-zinc-300">
                      Project URL (VITE_SUPABASE_URL)
                    </label>
                    <button
                      type="button"
                      onClick={() => setUrl(DETECTED_PROJECT_URL)}
                      className="text-[10px] text-cyan-400 hover:underline font-mono-code cursor-pointer"
                    >
                      Restaurar URL de tu proyecto
                    </button>
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full bg-[#141724] border border-zinc-700/80 focus:border-cyan-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl text-white font-mono-code placeholder-zinc-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-code font-semibold text-zinc-300 mb-1">
                    Anon / Public Key (VITE_SUPABASE_ANON_KEY)
                  </label>
                  <input
                    type="text"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="Pega aquí tu clave anon (empieza con eyJhbGciOi... o sb_publishable_...)"
                    className="w-full bg-[#141724] border border-zinc-700/80 focus:border-cyan-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl text-white font-mono-code placeholder-zinc-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Es la clave pública "anon public" segura para clientes web.
                  </span>
                </div>
              </div>

              {testStatus && (
                <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-cyan-500/40 text-xs text-cyan-300 font-mono-code flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>{testStatus}</span>
                </div>
              )}

              {/* Actions Grid */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2">
                  <button
                    id="btn-save-supabase-config"
                    type="button"
                    onClick={handleSave}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold font-cyber text-xs tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Guardar Credenciales
                  </button>
                  <button
                    id="btn-test-connection"
                    type="button"
                    onClick={handleTestConnection}
                    className="py-2.5 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Probar Ping
                  </button>
                </div>

                {/* Primary Diagnostic Button */}
                <button
                  id="btn-run-auth-diagnostics"
                  type="button"
                  onClick={runAuthDiagnostics}
                  disabled={isDiagnosing}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-950 via-zinc-900 to-cyan-950 hover:from-indigo-900 hover:to-cyan-900 border border-indigo-500/40 hover:border-cyan-400 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isDiagnosing ? (
                    <>
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                      <span>Diagnosticando API de Autenticación...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span>Diagnosticar API de Autenticación (Clave vs Proveedor)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Diagnostic Preview Card if already executed */}
              {diagnosticReport && (
                <div className={`mb-5 p-3.5 rounded-2xl border text-xs space-y-2 ${
                  diagnosticReport.status === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : diagnosticReport.status === 'warning'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-red-950/40 border-red-500/50 text-red-200'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold">
                      {diagnosticReport.status === 'success' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      {diagnosticReport.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                      {diagnosticReport.status === 'error' && <ShieldAlert className="w-4 h-4 text-red-400" />}
                      <span className="text-[13px]">{diagnosticReport.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('diagnostics')}
                      className="text-[10px] underline font-mono cursor-pointer"
                    >
                      Ver reporte completo &rarr;
                    </button>
                  </div>

                  <p className="text-[11px] leading-relaxed opacity-90">
                    {diagnosticReport.summary}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span>
                      {diagnosticReport.cause === 'invalid_api_key' && '🚨 Causa: Clave de API Incorrecta'}
                      {diagnosticReport.cause === 'provider_disabled' && '⚠️ Causa: Proveedor OAuth Deshabilitado'}
                      {diagnosticReport.cause === 'none' && '✅ Causa: Sin anomalías detectadas'}
                      {diagnosticReport.cause === 'network_error' && '🌐 Causa: Conexión o URL'}
                    </span>
                    <span className="opacity-70">{diagnosticReport.timestamp}</span>
                  </div>
                </div>
              )}

              {/* Deployment guide for VS Code, GitHub & Vercel */}
              <div className="border-t border-zinc-800 pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-code font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Variables para archivo .env</span>
                  </span>
                  <button
                    onClick={copyEnvSnippet}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-[10px] font-mono-code cursor-pointer"
                  >
                    {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEnv ? 'Copiado' : 'Copiar .env'}</span>
                  </button>
                </div>
                <pre className="bg-[#090b12] p-2.5 rounded-lg text-cyan-300/90 font-mono-code text-[10px] overflow-x-auto">
{`VITE_SUPABASE_URL="${url || DETECTED_PROJECT_URL}"
VITE_SUPABASE_ANON_KEY="${anonKey || 'tu-anon-key'}"`}
                </pre>
              </div>
            </>
          )}

          {/* TAB 2: DIAGNÓSTICO PROFUNDO DE AUTENTICACIÓN */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-indigo-500/30 text-xs text-zinc-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 font-mono-code flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>Diagnóstico de Autenticación de Supabase</span>
                  </span>
                  <button
                    type="button"
                    onClick={runAuthDiagnostics}
                    disabled={isDiagnosing}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDiagnosing ? (
                      <Loader2 className="w-3 h-3 animate-spin text-indigo-300" />
                    ) : (
                      <RefreshCw className="w-3 h-3 text-indigo-300" />
                    )}
                    <span>Re-ejecutar</span>
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Esta herramienta envía una petición HTTP real a la API de autenticación (<code className="text-cyan-300">/auth/v1/settings</code>) y comprueba el origen específico de cualquier falla:
                </p>
              </div>

              {/* Diagnostic Report Display */}
              {isDiagnosing ? (
                <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <h4 className="font-bold text-white text-sm">Analizando API de Supabase...</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Verificando si la petición responde con clave válida o si algún proveedor OAuth está apagado.
                  </p>
                </div>
              ) : diagnosticReport ? (
                <div className="space-y-3.5">
                  {/* Main Diagnostic Verdict Banner */}
                  <div className={`p-4 rounded-2xl border ${
                    diagnosticReport.status === 'success'
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                      : diagnosticReport.status === 'warning'
                      ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                      : 'bg-red-950/30 border-red-500/50 text-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {diagnosticReport.status === 'success' && (
                          <div className="w-8 h-8 rounded-xl bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          </div>
                        )}
                        {diagnosticReport.status === 'warning' && (
                          <div className="w-8 h-8 rounded-xl bg-amber-900/60 border border-amber-500/50 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                          </div>
                        )}
                        {diagnosticReport.status === 'error' && (
                          <div className="w-8 h-8 rounded-xl bg-red-900/60 border border-red-500/50 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-white font-cyber">
                            {diagnosticReport.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            diagnosticReport.cause === 'invalid_api_key'
                              ? 'bg-red-950 text-red-300 border border-red-500/50'
                              : diagnosticReport.cause === 'provider_disabled'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                              : diagnosticReport.cause === 'none'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {diagnosticReport.cause === 'invalid_api_key' && 'Error: Clave API'}
                            {diagnosticReport.cause === 'provider_disabled' && 'Error: Proveedor Deshabilitado'}
                            {diagnosticReport.cause === 'none' && 'Estado: Operativo'}
                            {diagnosticReport.cause === 'network_error' && 'Error: Red / URL'}
                          </span>
                        </div>

                        <p className="text-xs mt-1.5 leading-relaxed text-zinc-300">
                          {diagnosticReport.summary}
                        </p>

                        {diagnosticReport.details && (
                          <p className="text-[11px] mt-2 font-mono text-zinc-400 bg-black/40 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                            {diagnosticReport.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Checklist of Individual Probes */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                    <span className="text-xs font-mono font-bold text-zinc-300 block">
                      Resultado de Verificaciones Individuales:
                    </span>

                    <div className="space-y-2 text-xs font-mono">
                      {/* Check 1: Reachability */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          {diagnosticReport.checks.endpointReached === true ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span>1. Servidor Supabase Auth (/auth/v1)</span>
                        </div>
                        <span className={diagnosticReport.checks.endpointReached ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                          {diagnosticReport.checks.endpointReached ? 'Alcanzable' : 'Inaccesible'}
                        </span>
                      </div>

                      {/* Check 2: API Key Validity */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          {diagnosticReport.checks.apiKeyValid === true ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : diagnosticReport.checks.apiKeyValid === false ? (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-zinc-600" />
                          )}
                          <span>2. Clave de API (Anon Public Key)</span>
                        </div>
                        <span className={
                          diagnosticReport.checks.apiKeyValid === true
                            ? 'text-emerald-400 font-bold'
                            : diagnosticReport.checks.apiKeyValid === false
                            ? 'text-red-400 font-bold'
                            : 'text-zinc-500'
                        }>
                          {diagnosticReport.checks.apiKeyValid === true && 'Válida (200 OK)'}
                          {diagnosticReport.checks.apiKeyValid === false && 'Incorrecta (401)'}
                          {diagnosticReport.checks.apiKeyValid === null && 'No Verificada'}
                        </span>
                      </div>

                      {/* Check 3: OAuth Provider Status */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-zinc-800/80">
                        <div className="flex items-center gap-2">
                          {diagnosticReport.checks.providerEnabled === true ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : diagnosticReport.checks.providerEnabled === false ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-zinc-600" />
                          )}
                          <span>3. Proveedor OAuth (Google)</span>
                        </div>
                        <span className={
                          diagnosticReport.checks.providerEnabled === true
                            ? 'text-emerald-400 font-bold'
                            : diagnosticReport.checks.providerEnabled === false
                            ? 'text-amber-400 font-bold'
                            : 'text-zinc-500'
                        }>
                          {diagnosticReport.checks.providerEnabled === true && 'Habilitado'}
                          {diagnosticReport.checks.providerEnabled === false && 'Deshabilitado'}
                          {diagnosticReport.checks.providerEnabled === null && 'No Verificado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation & Action Box */}
                  {diagnosticReport.recommendation && (
                    <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-xs space-y-2">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Acción Recomendada:</span>
                      </span>
                      <p className="text-zinc-300 leading-relaxed text-[11px]">
                        {diagnosticReport.recommendation}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        {diagnosticReport.cause === 'invalid_api_key' && (
                          <a
                            href="https://supabase.com/dashboard/project/pzqlsyteeozlctceubdi/settings/api"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[11px] transition-colors"
                          >
                            <span>Ir a Supabase &gt; Settings &gt; API</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {diagnosticReport.cause === 'provider_disabled' && (
                          <a
                            href="https://supabase.com/dashboard/project/pzqlsyteeozlctceubdi/auth/providers"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-[11px] transition-colors"
                          >
                            <span>Ir a Supabase &gt; Authentication &gt; Providers</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setActiveTab('keys')}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Modificar Credenciales
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
                  <Activity className="w-8 h-8 text-zinc-500 mx-auto" />
                  <h4 className="font-semibold text-white text-xs">Sin diagnóstico reciente</h4>
                  <p className="text-[11px] text-zinc-400">
                    Haz clic en el botón inferior para realizar la comprobación automática.
                  </p>
                  <button
                    type="button"
                    onClick={runAuthDiagnostics}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs cursor-pointer shadow-md transition-all"
                  >
                    Iniciar Diagnóstico Ahora
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <span className="font-bold text-cyan-300 font-mono-code flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>¿Dónde ejecutar este código SQL?</span>
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  En el menú lateral izquierdo de tu Supabase, haz clic en el ícono <strong className="text-white">&gt;_ (SQL Editor)</strong>, crea una nueva consulta ("New Query"), pega este bloque y presiona <strong>RUN</strong>.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between pb-1.5">
                  <span className="text-xs font-mono-code text-zinc-400">Esquema de Cursos, Alumnos y Notas:</span>
                  <button
                    onClick={copySqlSnippet}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono-code hover:bg-cyan-500/30 cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? '¡Copiado!' : 'Copiar Script SQL'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#080a12] border border-zinc-800 text-cyan-300 font-mono-code text-[10px] max-h-52 overflow-y-auto leading-relaxed">
                  {SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
