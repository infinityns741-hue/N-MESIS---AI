// ============================================================================
// NÉMESIS - IA: MODELOS DE DATOS (BACKEND)
// Universidad Nacional de San Antonio Abad del Cusco (UNSAAC)
// Modelos de datos para Alumnos, Docentes, Cursos, Laboratorios y Centros
// ============================================================================

export * from '../../types';
export * from '../../types/teacher';

export interface CentroInvestigacionModel {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  director: string;
  faculty: string;
  location: string;
  activeProjectsCount: number;
  completedProjectsCount: number;
  isCustom?: boolean;
  createdByEmail?: string;
  createdAt: number;
}

export interface SalaVirtualModel {
  id: string;
  code: string;
  name: string;
  teacherEmail: string;
  activeStudents: number;
  topic: string;
  createdAt: number;
}
