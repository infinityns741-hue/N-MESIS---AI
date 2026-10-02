// ============================================================================
// NÉMESIS - IA: SERVIDOR BACKEND (EXPRESS + NODE.JS)
// Universidad Nacional de San Antonio Abad del Cusco (UNSAAC)
// Endpoints API REST para Autenticación, Chat Tutor IA, Salas y Laboratorios
// ============================================================================

import express from 'express';
import { AuthController } from '../controladores/authController';
import { LaboratoriosController } from '../controladores/laboratoriosController';

export function createBackendApp() {
  const app = express();
  app.use(express.json());

  // Estado del sistema
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'online',
      system: 'NÉMESIS - IA UNSAAC',
      timestamp: new Date().toISOString(),
      modules: ['Tutoría IA', 'Laboratorio Virtual 3D', 'Portal Docente', 'Portal Alumno', 'Supabase Cloud']
    });
  });

  // Autenticación de alumno y docente
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, code, role } = req.body;
      const session = AuthController.autenticarUsuario(email, code, role);
      res.json({ success: true, session });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Cálculo cinemático para telemetría
  app.post('/api/laboratorios/cinematica', (req, res) => {
    const { x0 = 0, v0 = 10, a = 0, t = 1 } = req.body;
    const telemetria = LaboratoriosController.generarTelemetria(Number(x0), Number(v0), Number(a), Number(t));
    res.json(telemetria);
  });

  return app;
}

// Si se ejecuta directamente con node o tsx
if (process.env.NODE_ENV !== 'test' && !process.env.VITE) {
  const app = createBackendApp();
  const PORT = process.env.BACKEND_PORT || 3001;
  app.listen(PORT, () => {
    console.log(`[NÉMESIS-AI] Servidor backend escuchando en http://localhost:${PORT}`);
  });
}
