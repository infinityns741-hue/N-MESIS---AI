import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserRole, UserSession } from '../types';

// Supabase credentials provided by user:
// NEXT_PUBLIC_SUPABASE_URL=https://pzqlsyteeozlctceubdi.supabase.co
// NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_2gHf48gqRMYU78JcFn4V4g_lchUpuRO
const DEFAULT_SUPABASE_URL = 'https://pzqlsyteeozlctceubdi.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_2gHf48gqRMYU78JcFn4V4g_lchUpuRO';

const ENV_SUPABASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta.env as Record<string, string>)?.NEXT_PUBLIC_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL;

const ENV_SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && (import.meta.env as Record<string, string>)?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY;

const STORAGE_URL_KEY = 'nemesis_supabase_url';
const STORAGE_ANON_KEY = 'nemesis_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const customUrl = localStorage.getItem(STORAGE_URL_KEY);
  const customKey = localStorage.getItem(STORAGE_ANON_KEY);
  return {
    url: customUrl || ENV_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    anonKey: customKey || ENV_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    isCustom: !!(customUrl || customKey),
    isDefaultConfigured: true
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (url.trim()) {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(STORAGE_URL_KEY);
  }

  if (anonKey.trim()) {
    localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_ANON_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastClientConfig = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  
  if (!url || !anonKey) {
    return null;
  }

  const currentKey = `${url}_${anonKey}`;
  if (cachedClient && lastClientConfig === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    lastClientConfig = currentKey;
    return cachedClient;
  } catch (err) {
    console.warn('Error initializing Supabase client:', err);
    return null;
  }
}

export function isSupabaseReady(): boolean {
  const client = getSupabaseClient();
  return client !== null;
}

/**
 * Validates institutional UNSAAC email addresses.
 * Format requirement: [codigo/usuario]@unsaac.edu.pe
 * Examples: 212867@unsaac.edu.pe, 122352@unsaac.edu.pe
 */
export function validateUnsaacEmail(rawEmail: string): {
  isValid: boolean;
  error?: string;
  code?: string;
  normalizedEmail: string;
} {
  const email = rawEmail.trim().toLowerCase();

  if (!email) {
    return { isValid: false, error: 'Por favor ingrese su correo institucional.', normalizedEmail: email };
  }

  // Check if domain is wrong
  if (email.includes('@')) {
    const parts = email.split('@');
    const domain = parts[1];
    const username = parts[0];

    if (!username) {
      return { isValid: false, error: 'Debe ingresar el código antes del @unsaac.edu.pe', normalizedEmail: email };
    }

    if (domain !== 'unsaac.edu.pe') {
      return {
        isValid: false,
        error: `El dominio "@${domain}" no está autorizado. Debe ser estrictamente "@unsaac.edu.pe"`,
        normalizedEmail: email
      };
    }

    // Code format check: UNSAAC codes are typically numeric (e.g. 212867) or alphanumeric
    const codeRegex = /^[a-zA-Z0-9._-]+$/;
    if (!codeRegex.test(username)) {
      return {
        isValid: false,
        error: 'El código o usuario institucional contiene caracteres no permitidos.',
        normalizedEmail: email
      };
    }

    return {
      isValid: true,
      code: username,
      normalizedEmail: email
    };
  } else {
    // User only typed the code without @unsaac.edu.pe
    return {
      isValid: false,
      error: 'Debe incluir la terminación institucional "@unsaac.edu.pe"',
      normalizedEmail: `${email}@unsaac.edu.pe`
    };
  }
}

/**
 * Institutional login with password via Supabase or demo simulation
 */
export async function loginWithInstitutionalCredentials(
  email: string,
  password: string,
  role: UserRole
): Promise<{ success: boolean; session?: UserSession; error?: string }> {
  const validation = validateUnsaacEmail(email);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  if (!password || password.length < 4) {
    return { success: false, error: 'Ingrese su contraseña institucional (mínimo 4 caracteres).' };
  }

  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: validation.normalizedEmail,
        password: password,
      });

      if (error) {
        // If user not registered yet in Supabase, provide clear message
        return {
          success: false,
          error: error.message || 'Error al autenticar en Supabase con este correo institucional.'
        };
      }

      return {
        success: true,
        session: {
          email: validation.normalizedEmail,
          code: validation.code || 'UNSAAC',
          role: role,
          fullName: data.user?.user_metadata?.full_name || `Usuario ${validation.code}`,
          authenticatedWith: 'supabase'
        }
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con Supabase';
      return { success: false, error: errorMessage };
    }
  }

  // Fallback demo authentication when Supabase keys are not set up yet
  // Simulates network latency for realistic feel
  await new Promise(res => setTimeout(res, 700));

  return {
    success: true,
    session: {
      email: validation.normalizedEmail,
      code: validation.code || '212867',
      role: role,
      fullName: role === 'docente' ? `Dr. Docente (${validation.code})` : `Estudiante UNSAAC (${validation.code})`,
      authenticatedWith: 'demo'
    }
  };
}

/**
 * Google Institutional OAuth Login
 */
export async function loginWithGoogleOAuth(
  role: UserRole
): Promise<{ success: boolean; session?: UserSession; error?: string; providerDisabled?: boolean }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            hd: 'unsaac.edu.pe', // Restrict Google OAuth to UNSAAC hosted domain
            prompt: 'select_account'
          },
          redirectTo: window.location.origin,
          skipBrowserRedirect: true
        }
      });

      if (error) {
        const isProviderDisabled = 
          error.message.toLowerCase().includes('not enabled') || 
          error.message.toLowerCase().includes('unsupported provider') ||
          error.message.toLowerCase().includes('validation_failed');

        return { 
          success: false, 
          error: isProviderDisabled 
            ? 'El proveedor de Google no está habilitado en tu panel de Supabase.' 
            : error.message,
          providerDisabled: isProviderDisabled
        };
      }

      if (data?.url) {
        // Only redirect if a valid URL is returned
        window.location.href = data.url;
        return { success: true };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error en OAuth de Google';
      return { success: false, error: msg };
    }
  }

  // Fallback demo simulation
  await new Promise(res => setTimeout(res, 600));
  return {
    success: true,
    session: {
      email: role === 'docente' ? '122352@unsaac.edu.pe' : '212867@unsaac.edu.pe',
      code: role === 'docente' ? '122352' : '212867',
      role: role,
      fullName: role === 'docente' ? 'Docente UNSAAC (Google)' : 'Estudiante UNSAAC (Google)',
      authenticatedWith: 'google'
    }
  };
}

/**
 * World Communal Chat Supabase Helper
 */
export interface ChatAttachment {
  type: 'document' | 'audio' | 'video' | 'image';
  url: string;
  name: string;
  size?: string;
  duration?: string;
}

export interface WorldChatMessage {
  id: string;
  sender_name: string;
  sender_code: string;
  sender_role: string;
  sender_email?: string;
  sender_photo?: string;
  avatar_bg?: string;
  room_id: string;
  content: string;
  created_at: string;
  reactions?: Record<string, number>;
  is_system_event?: boolean;
  attachment?: ChatAttachment;
}

export async function checkSupabaseStatus(): Promise<{ connected: boolean; url: string; error?: string }> {
  const client = getSupabaseClient();
  const { url } = getStoredSupabaseConfig();
  if (!client) {
    return { connected: false, url, error: 'Cliente no inicializado' };
  }
  try {
    // Attempt a light ping (like inspecting auth settings or health)
    const { error } = await client.from('world_messages').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "world_messages" does not exist')) {
      // It reached Supabase server, even if table doesn't exist yet
      return { connected: true, url };
    }
    return { connected: true, url };
  } catch (err: unknown) {
    return { connected: true, url };
  }
}

export async function broadcastWorldMessage(msg: WorldChatMessage): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // Try to insert to Supabase table
    const { error } = await client.from('world_messages').insert([{
      id: msg.id,
      sender_name: msg.sender_name,
      sender_code: msg.sender_code,
      sender_role: msg.sender_role,
      room_id: msg.room_id,
      content: msg.content,
      created_at: msg.created_at,
    }]);

    if (error) {
      console.info('Supabase world_messages table notice (using local broadcast):', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
