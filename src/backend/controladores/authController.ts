// ============================================================================
// NÉMESIS - IA: CONTROLADOR DE AUTENTICACIÓN Y SESIONES
// Validación de credenciales y roles para Alumnos y Docentes UNSAAC
// ============================================================================

import { UserSession, UserRole } from '../modelos';

export class AuthController {
  /**
   * Valida credenciales de acceso para alumnos y docentes
   */
  static autenticarUsuario(email: string, codigo: string, rol: UserRole): UserSession {
    const esEmailValido = email.trim().length > 0;
    const esCodigoValido = codigo.trim().length > 0;

    if (!esEmailValido || !esCodigoValido) {
      throw new Error('Debe ingresar un correo y código institucional válido');
    }

    return {
      email: email.trim().toLowerCase(),
      code: codigo.trim().toUpperCase(),
      role: rol,
      fullName: rol === 'docente' ? `Docente UNSAAC (${codigo})` : `Estudiante UNSAAC (${codigo})`,
      authenticatedWith: 'demo'
    };
  }

  /**
   * Determina si la sesión actual cuenta con permisos de docente
   */
  static esDocente(session: UserSession | null): boolean {
    return session?.role === 'docente';
  }

  /**
   * Determina si la sesión actual cuenta con permisos de alumno
   */
  static esAlumno(session: UserSession | null): boolean {
    return session?.role === 'alumno';
  }
}
