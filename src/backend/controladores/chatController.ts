// ============================================================================
// NÉMESIS - IA: CONTROLADOR DE CONVERSACIONES E INTELIGENCIA ARTIFICIAL
// Manejo de mensajes, memoria contextual y llamadas a Gemini
// ============================================================================

import { askGemini, AskGeminiResult } from '../servicios/geminiService';
import { ChatMessage, AttachmentInfo, AppSettings } from '../modelos';

export class ChatController {
  /**
   * Procesa la consulta académica de un alumno o docente mediante el modelo IA
   */
  static async procesarConsultaIA(
    pregunta: string,
    historial: ChatMessage[],
    adjunto?: AttachmentInfo,
    configuracion?: AppSettings
  ): Promise<AskGeminiResult> {
    return await askGemini(pregunta, historial, adjunto, configuracion as any);
  }
}
