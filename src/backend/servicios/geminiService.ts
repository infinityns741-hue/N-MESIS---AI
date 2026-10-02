// ============================================================================
// NÉMESIS - IA: SERVICIOS BACKEND
// Conexión con IA Gemini y Procesamiento de Lenguaje Natural
// ============================================================================

export { 
  askGemini, 
  getStoredGeminiConfig, 
  saveStoredGeminiConfig, 
  DEFAULT_MODEL, 
  FALLBACK_MODEL 
} from '../../lib/gemini';

export type { AskGeminiResult, AskGeminiOptions } from '../../lib/gemini';
