// ============================================================================
// NÉMESIS - IA: CONTROLADOR DE LABORATORIOS Y FÍSICA EXPERIMENTAL
// Cálculos cinemáticos, método científico y conversión de unidades
// ============================================================================

export interface TelemetriaMRU {
  tiempo: number;
  posicionInicial: number;
  velocidad: number;
  aceleracion: number;
  posicionFinal: number;
}

export class LaboratoriosController {
  /**
   * Calcula la cinemática de una partícula en MRU/MRUV: x = x0 + v0*t + 0.5*a*t^2
   */
  static calcularPosicion(x0: number, v0: number, a: number, t: number): number {
    return x0 + v0 * t + 0.5 * a * Math.pow(t, 2);
  }

  /**
   * Genera el vector de telemetría experimental para visualización en tiempo real
   */
  static generarTelemetria(x0: number, v0: number, a: number, t: number): TelemetriaMRU {
    const x = this.calcularPosicion(x0, v0, a, t);
    return {
      tiempo: t,
      posicionInicial: x0,
      velocidad: v0 + a * t,
      aceleracion: a,
      posicionFinal: x
    };
  }

  /**
   * Valida conversión de unidades del Sistema Internacional
   */
  static convertirUnidades(valor: number, origen: 'km/h' | 'm/s' | 'mph', destino: 'km/h' | 'm/s' | 'mph'): number {
    // Pasar a m/s primero
    let ms = valor;
    if (origen === 'km/h') ms = valor / 3.6;
    if (origen === 'mph') ms = valor * 0.44704;

    // Convertir de m/s al destino
    if (destino === 'm/s') return ms;
    if (destino === 'km/h') return ms * 3.6;
    if (destino === 'mph') return ms / 0.44704;
    return valor;
  }
}
