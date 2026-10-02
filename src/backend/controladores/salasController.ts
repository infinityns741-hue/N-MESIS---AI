// ============================================================================
// NÉMESIS - IA: CONTROLADOR DE SALAS VIRTUALES, AULAS Y CENTROS DE INVESTIGACIÓN
// ============================================================================

import { CentroInvestigacionModel, SalaVirtualModel } from '../modelos';

export class SalasController {
  private static STORAGE_KEY_CENTROS = 'nemesis_custom_research_centers_v1';

  /**
   * Obtiene la lista de centros creados por el docente/usuario
   */
  static obtenerCentrosCreados(): CentroInvestigacionModel[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_CENTROS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Guarda un nuevo centro de investigación
   */
  static registrarCentro(centro: Omit<CentroInvestigacionModel, 'id' | 'createdAt'>): CentroInvestigacionModel {
    const centros = this.obtenerCentrosCreados();
    const nuevoCentro: CentroInvestigacionModel = {
      ...centro,
      id: `centro-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      isCustom: true
    };
    centros.push(nuevoCentro);
    localStorage.setItem(this.STORAGE_KEY_CENTROS, JSON.stringify(centros));
    return nuevoCentro;
  }

  /**
   * Elimina un centro propio y borra automáticamente las investigaciones concluidas
   */
  static eliminarCentroPropio(centroId: string, userEmail: string): boolean {
    const centros = this.obtenerCentrosCreados();
    const centroAEliminar = centros.find(c => c.id === centroId);
    
    if (!centroAEliminar) return false;
    
    // Solo puede eliminar el creador
    if (centroAEliminar.createdByEmail && centroAEliminar.createdByEmail.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error('Solo el autor puede eliminar este centro');
    }

    const filtrados = centros.filter(c => c.id !== centroId);
    localStorage.setItem(this.STORAGE_KEY_CENTROS, JSON.stringify(filtrados));

    // Borrado automático de proyectos concluidos asociados
    try {
      const proyectosData = localStorage.getItem('nemesis_research_projects_v1');
      if (proyectosData) {
        const proyectos = JSON.parse(proyectosData);
        const proyectosLimpios = proyectos.filter((p: any) => {
          const coincideCentro = p.labName === centroAEliminar.name;
          const estaConcluido = p.status === 'Publicación Indexada' || p.status === 'Concluido';
          // Si coincide el centro y está concluido, se elimina
          return !(coincideCentro && estaConcluido);
        });
        localStorage.setItem('nemesis_research_projects_v1', JSON.stringify(proyectosLimpios));
      }
    } catch (e) {
      console.warn('Error al limpiar proyectos concluidos:', e);
    }

    return true;
  }
}
