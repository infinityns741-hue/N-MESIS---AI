// ============================================================================
// NÉMESIS - IA: SERVICIO DE BASE DE DATOS EN LA NUBE (SUPABASE)
// Conexión y sincronización en tiempo real para UNSAAC
// ============================================================================

export { 
  getSupabaseClient, 
  isSupabaseReady, 
  saveStoredSupabaseConfig, 
  getStoredSupabaseConfig,
  validateUnsaacEmail,
  loginWithInstitutionalCredentials,
  loginWithGoogleOAuth
} from '../../lib/supabase';
