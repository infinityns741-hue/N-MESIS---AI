// ============================================================================
// NÉMESIS - IA: ÍNDICE GENERAL DEL BACKEND
// Exportación centralizada de Controladores, Modelos, Servidor y Servicios
// ============================================================================

export * from './modelos';
export * from './controladores/authController';
export * from './controladores/chatController';
export * from './controladores/salasController';
export * from './controladores/laboratoriosController';
export * from './servicios/geminiService';
export * from './servicios/supabaseService';
export * from './servicios/almacenamientoService';
export { createBackendApp } from './servidor/server';
