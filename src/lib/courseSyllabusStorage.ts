import { TeacherCourse, StudentDirectoryEntry } from '../types/teacher';
import { UserSession } from '../types';

export interface CourseResourceOption {
  key: string;
  label: string;
  description: string;
  icon: string; // 'book' | 'guide' | 'lab' | 'library' | 'practice' | 'simulator'
  enabled: boolean;
}

export interface CourseSyllabusWeek {
  week: number;
  unit: string;
  topic: string;
  methodsOrSubtopics: string[];
  isCurrent?: boolean;
}

export interface CourseSyllabus {
  courseCode: string;
  courseName: string;
  curricula: string;
  credits: number;
  department: string;
  competencies: string;
  currentWeek: number;
  currentUnit: string;
  currentTopic: string;
  currentFocusPrompt: string;
  examDates: {
    firstPartialExam: string;
    secondPartialExam: string;
    substituteExam?: string;
  };
  weeks: CourseSyllabusWeek[];
  uploadedFileName?: string;
  uploadedAt?: number;
}

export type CourseTypeCategory = 
  | 'fisica'
  | 'quimica'
  | 'algebra'
  | 'calculo'
  | 'ecologia'
  | 'historia'
  | 'linguistica'
  | 'general';

export function detectCourseCategory(courseName: string): CourseTypeCategory {
  const normalized = courseName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes('fisica')) return 'fisica';
  if (normalized.includes('quimica')) return 'quimica';
  if (normalized.includes('algebra') || normalized.includes('geometria')) return 'algebra';
  if (normalized.includes('calculo')) return 'calculo';
  if (normalized.includes('ecologia') || normalized.includes('medio ambiente')) return 'ecologia';
  if (normalized.includes('historia')) return 'historia';
  if (normalized.includes('linguistica') || normalized.includes('comunicacion')) return 'linguistica';
  return 'general';
}

/**
 * Retorna las opciones de gestión requeridas para cada curso del primer semestre
 * según especificaciones precisas del usuario:
 * - Química General: Habilitar libro, habilitar guía, habilitar laboratorio virtual, habilitar biblioteca especializada
 * - Álgebra: Habilitar biblioteca específica, habilitar prácticas, habilitar simulador
 * - Cálculo I: Habilitar biblioteca especializada, habilitar simulador, habilitar prácticas
 * - Ecología y Medio Ambiente: Habilitar biblioteca especializada, habilitar guía de laboratorio, habilitar simulador
 * - Historia Crítica del Perú: Habilitar biblioteca especializada, habilitar prácticas
 * - Lingüística y Comunicación Humana: Habilitar biblioteca especializada, habilitar prácticas
 */
export function getDefaultResourceOptions(courseName: string): CourseResourceOption[] {
  const category = detectCourseCategory(courseName);

  switch (category) {
    case 'fisica':
      return [
        {
          key: 'habilitarLaboratorioVirtual',
          label: 'Habilitar Laboratorio Virtual',
          description: 'Simuladores interactivos: Método Científico, Sistema Internacional (SI) y Cinemática MRU',
          icon: 'lab',
          enabled: true,
        },
        {
          key: 'habilitarBibliotecaEspecializada',
          label: 'Habilitar Biblioteca Especializada',
          description: 'Tratados de Física Universitaria (Sears-Zemansky, Serway, Tipler-Mosca)',
          icon: 'library',
          enabled: true,
        },
        {
          key: 'habilitarGuiaLaboratorio',
          label: 'Habilitar Guía de Laboratorio',
          description: 'Protocolos de prácticas experimentales de cinemática, teoría de errores y mediciones',
          icon: 'guide',
          enabled: true,
        },
        {
          key: 'habilitarPracticas',
          label: 'Habilitar Prácticas',
          description: 'Banco de problemas resueltos de MRU, vectores y cinemática en una dimensión',
          icon: 'practice',
          enabled: true,
        },
        {
          key: 'habilitarSimulador',
          label: 'Habilitar Simulador',
          description: 'Pista interactiva de cinemática, gráficas x vs t y v vs t en tiempo real',
          icon: 'simulator',
          enabled: true,
        },
      ];

    case 'quimica':
      return [
        {
          key: 'habilitarLibro',
          label: 'Habilitar Libro',
          description: 'Libro de texto universitario de Química General (Chang, Brown, Petrucci)',
          icon: 'book',
          enabled: true,
        },
        {
          key: 'habilitarGuia',
          label: 'Habilitar Guía',
          description: 'Guía oficial de cátedra y problemas resueltos de estequiometría y soluciones',
          icon: 'guide',
          enabled: true,
        },
        {
          key: 'habilitarLaboratorioVirtual',
          label: 'Habilitar Laboratorio Virtual',
          description: 'Simulador 3D de reacciones químicas, titulaciones ácido-base y balance redox',
          icon: 'lab',
          enabled: true,
        },
        {
          key: 'habilitarBibliotecaEspecializada',
          label: 'Habilitar Biblioteca Especializada',
          description: 'Artículos científicos, tablas periódicas IUPAC y bibliografía indexada',
          icon: 'library',
          enabled: true,
        },
      ];

    case 'algebra':
      return [
        {
          key: 'habilitarBibliotecaEspecifica',
          label: 'Habilitar Biblioteca Específica',
          description: 'Textos de Álgebra y Geometría Analítica (Lehmann, Venero, Espinoza Ramos)',
          icon: 'library',
          enabled: true,
        },
        {
          key: 'habilitarPracticas',
          label: 'Habilitar Prácticas',
          description: 'Banco de ejercicios guiados de ecuaciones, matrices y vectores en el espacio',
          icon: 'practice',
          enabled: true,
        },
        {
          key: 'habilitarSimulador',
          label: 'Habilitar Simulador',
          description: 'Graficador 2D/3D vectorial, extractor de raíces polinómicas y cónicas',
          icon: 'simulator',
          enabled: true,
        },
      ];

    case 'calculo':
      return [
        {
          key: 'habilitarBibliotecaEspecializada',
          label: 'Habilitar Biblioteca Especializada',
          description: 'Tratados de Cálculo Infinitesimal (Stewart, Larson, Thomas Cálculo)',
          icon: 'library',
          enabled: true,
        },
        {
          key: 'habilitarSimulador',
          label: 'Habilitar Simulador',
          description: 'Graficador interactivo de funciones, límites dinámicos y cálculo de derivadas',
          icon: 'simulator',
          enabled: true,
        },
        {
          key: 'habilitarPracticas',
          label: 'Habilitar Prácticas',
          description: 'Prácticas calificadas y problemas de optimización matemática paso a paso',
          icon: 'practice',
          enabled: true,
        },
      ];

    case 'ecologia':
      return [
        {
          key: 'habilitarBibliotecaEspecializada',
          label: 'Habilitar Biblioteca Especializada',
          description: 'Compendios de biodiversidad andina, ecología general y cambio climático',
          icon: 'library',
          enabled: true,
        },
        {
          key: 'habilitarGuiaLaboratorio',
          label: 'Habilitar Guía de Laboratorio',
          description: 'Protocolos de muestreo ambiental, calidad de agua y biomasa vegetal',
          icon: 'guide',
          enabled: true,
        },
        {
          key: 'habilitarSimulador',
          label: 'Habilitar Simulador',
          description: 'Modelos de crecimiento poblacional (Lotka-Volterra) y cadenas tróficas',
          icon: 'simulator',
          enabled: true,
        },
      ];

    case 'historia':
      return [
        {
          key: 'habilitarBibliotecaEspecializada',
          label: 'Habilitar Biblioteca Especializada',
          description: 'Colección de ensayos de Mariátegui, Jorge Basadre y crónicas de Indias',
          icon: 'library',
          enabled: true,
        },
        {
          key: 'habilitarPracticas',
          label: 'Habilitar Prácticas',
          description: 'Análisis crítico de fuentes históricas, talleres de debate y ensayos',
          icon: 'practice',
          enabled: true,
        },
      ];

    case 'linguistica':
      return [
        {
          key: 'habilitarBibliotecaEspecializada',
          label: 'Habilitar Biblioteca Especializada',
          description: 'Manual de Gramática RAE, lingüística andina y sociolingüística aplicada',
          icon: 'library',
          enabled: true,
        },
        {
          key: 'habilitarPracticas',
          label: 'Habilitar Prácticas',
          description: 'Talleres de redacción científica, análisis del discurso y normas APA',
          icon: 'practice',
          enabled: true,
        },
      ];

    default:
      return [
        {
          key: 'habilitarBibliotecaEspecializada',
          label: 'Habilitar Biblioteca Especializada',
          description: 'Repositorio de bibliografía y lecturas seleccionadas del curso',
          icon: 'library',
          enabled: true,
        },
        {
          key: 'habilitarPracticas',
          label: 'Habilitar Prácticas',
          description: 'Ejercicios guiados y evaluaciones formativas del semestre',
          icon: 'practice',
          enabled: true,
        },
        {
          key: 'habilitarSimulador',
          label: 'Habilitar Simulador',
          description: 'Entorno interactivo para pruebas y experimentación',
          icon: 'simulator',
          enabled: true,
        },
      ];
  }
}

/**
 * Base de datos de Sílabos Oficiales UNSAAC estructurados por curso
 */
export const DEFAULT_UNSAAC_SYLLABI: Record<CourseTypeCategory, CourseSyllabus> = {
  fisica: {
    courseCode: 'FSG01AFI',
    courseName: 'FÍSICA I',
    curricula: 'PLAN CURRICULAR 2024 (SEGUNDO SEMESTRE)',
    credits: 4,
    department: 'Departamento Académico de Física',
    competencies: 'Aplica el método científico y las leyes de la mecánica clásica para modelar, experimentar y resolver problemas de cinemática (MRU, MRUV, tiro parabólico), magnitudes y el Sistema Internacional de Unidades (SI), estática y dinámica newtoniana en laboratorio.',
    currentWeek: 6,
    currentUnit: 'Unidad II: Cinemática en una Dimensión y Leyes del Movimiento',
    currentTopic: 'Movimiento Rectilíneo Uniforme (MRU): Modelado, Ecuación x(t) = x0 + v·t y Gráficas de Posición y Velocidad',
    currentFocusPrompt: 'El sílabo de Física I se encuentra en la unidad de Cinemática Unidimensional. Prioriza la comprensión física y matemática del Movimiento Rectilíneo Uniforme (MRU): velocidad constante v = dx/dt, ecuación horaria x(t) = x0 + v·t, interpretación geométrica de la pendiente en la gráfica posición vs tiempo (m = v) y del área bajo la curva en la gráfica velocidad vs tiempo (área = desplazamiento Δx), contrastando datos teóricos con simulaciones de laboratorio.',
    examDates: {
      firstPartialExam: 'Semana 8: 14 de Octubre de 2026 (Laboratorio A-202)',
      secondPartialExam: 'Semana 16: 16 de Diciembre de 2026 (Laboratorio A-202)',
      substituteExam: 'Semana 17: 22 de Diciembre de 2026',
    },
    weeks: [
      { week: 1, unit: 'Unidad I', topic: 'El Método Científico en la Física: Observación, hipótesis, experimentación y formulación de leyes', methodsOrSubtopics: ['Etapas del método científico', 'Experimentos de Galileo', 'Variables controladas y dependientes'] },
      { week: 2, unit: 'Unidad I', topic: 'Magnitudes Físicas y Sistema Internacional de Unidades (SI): Unidades fundamentales y derivadas', methodsOrSubtopics: ['Kilogramo, metro, segundo, kelvin', 'Patrones de medida y constantes fundamentales (h, c, ΔνCs)'] },
      { week: 3, unit: 'Unidad I', topic: 'Análisis Dimensional y Teoría de Errores e Incertidumbres en Mediciones', methodsOrSubtopics: ['Ecuaciones dimensionales', 'Propagación de errores de laboratorio', 'Cifras significativas'] },
      { week: 4, unit: 'Unidad I', topic: 'Álgebra Vectorial aplicada a la Física Mecánica', methodsOrSubtopics: ['Vectores unitarios cartesianos', 'Producto escalar y trabajo', 'Producto vectorial y momento'] },
      { week: 5, unit: 'Unidad II', topic: 'Cinemática 1D: Sistema de referencia, posición, desplazamiento y velocidad media', methodsOrSubtopics: ['Vector posición r(t)', 'Velocidad instantánea como derivada dx/dt'] },
      { week: 6, unit: 'Unidad II', topic: 'Movimiento Rectilíneo Uniforme (MRU): Ecuaciones, telemetría y gráficas x vs t y v vs t', methodsOrSubtopics: ['Velocidad constante', 'Ecuación x(t) = x0 + v·t', 'Interpretación gráfica del área y la pendiente', 'Simulador de móviles'], isCurrent: true },
      { week: 7, unit: 'Unidad II', topic: 'Movimiento Rectilíneo Uniformemente Variado (MRUV) y Aceleración Constante', methodsOrSubtopics: ['Ecuaciones del MRUV', 'Gráfica a vs t y parábola x vs t', 'Cálculo de distancias de frenado'] },
      { week: 8, unit: 'Evaluación', topic: 'PRIMER EXAMEN PARCIAL DE FÍSICA I', methodsOrSubtopics: ['Evaluación teórico-práctica y reporte de laboratorio de cinemática'] },
      { week: 9, unit: 'Unidad III', topic: 'Movimiento Vertical de Caída Libre y Aceleración Gravitatoria g', methodsOrSubtopics: ['Tubo de Newton en el vacío', 'Lanzamiento vertical hacia arriba y altura máxima'] },
      { week: 10, unit: 'Unidad III', topic: 'Cinemática 2D: Movimiento Parabólico de Proyectiles', methodsOrSubtopics: ['Independencia de movimientos', 'Alcance horizontal máximo y tiempo de vuelo'] },
      { week: 11, unit: 'Unidad III', topic: 'Movimiento Circular Uniforme (MCU) y Uniformemente Variado (MCUV)', methodsOrSubtopics: ['Velocidad angular ω', 'Aceleración centrípeta ac', 'Transmisión por engranajes'] },
      { week: 12, unit: 'Unidad IV', topic: 'Dinámica Clásica: Primera y Segunda Ley de Newton', methodsOrSubtopics: ['Inercia', 'Fuerza neta F = m·a', 'Diagrama de Cuerpo Libre (DCL)'] },
      { week: 13, unit: 'Unidad IV', topic: 'Tercera Ley de Newton y Fuerzas de Rozamiento (Estático y Cinético)', methodsOrSubtopics: ['Acción y reacción', 'Coeficientes μs y μk', 'Plano inclinado'] },
      { week: 14, unit: 'Unidad IV', topic: 'Trabajo Mecánico, Potencia y Teorema del Trabajo y la Energía Cinética', methodsOrSubtopics: ['W = F · d · cos(θ)', 'Teorema Wneto = ΔEc'] },
      { week: 15, unit: 'Unidad IV', topic: 'Energía Potencial Gravitatoria y Conservación de la Energía Mecánica', methodsOrSubtopics: ['Fuerzas conservativas y no conservativas', 'Sistemas elásticos y ley de Hooke'] },
      { week: 16, unit: 'Evaluación', topic: 'SEGUNDO EXAMEN PARCIAL FINAL DE FÍSICA I', methodsOrSubtopics: ['Evaluación integral sobre cinemática, dinámica y leyes de conservación'] },
    ],
  },
  algebra: {
    courseCode: 'MEG01AFI',
    courseName: 'ÁLGEBRA Y GEOMETRÍA ANALÍTICA',
    curricula: 'PLAN CURRICULAR 2024',
    credits: 4,
    department: 'Departamento Académico de Matemática y Estadística',
    competencies: 'Domina los fundamentos del álgebra lineal, teoría de polinomios y ecuaciones polinómicas, vectores en R2 y R3, matrices, determinantes y geometría analítica vectorial para modelar y resolver problemas científicos.',
    currentWeek: 6,
    currentUnit: 'Unidad II: Teoría de Ecuaciones y Raíces Polinómicas',
    currentTopic: 'Ecuaciones Cuadráticas y Diversos Métodos de Extracción de Raíces',
    currentFocusPrompt: 'El sílabo exige profundizar en el análisis riguroso de los diversos métodos de extracción de raíces de una ecuación cuadrática: 1) Método de Factorización y Aspa Simple, 2) Método de Completación de Cuadrados, 3) Deducción y aplicación de la Fórmula General Cuadrática x = (-b ± √(b² - 4ac)) / (2a) con análisis del Discriminante Δ, y 4) Teorema de Cardano-Vieta sobre propiedades de las raíces (suma y producto). Explicar paso a paso respetando la notación formal.',
    examDates: {
      firstPartialExam: 'Semana 8: 14 de Octubre de 2026 (Aula C-117)',
      secondPartialExam: 'Semana 16: 16 de Diciembre de 2026 (Aula C-117)',
      substituteExam: 'Semana 17: 22 de Diciembre de 2026',
    },
    weeks: [
      { week: 1, unit: 'Unidad I', topic: 'Lógica matemática, conectivos y tablas de verdad', methodsOrSubtopics: ['Leyes lógicas', 'Circuitos lógicos'] },
      { week: 2, unit: 'Unidad I', topic: 'Teoría de conjuntos, relaciones binarias y funciones', methodsOrSubtopics: ['Dominio y rango', 'Función inyectiva y biyectiva'] },
      { week: 3, unit: 'Unidad I', topic: 'Sistemas numéricos: Los números reales R y axiomas de orden', methodsOrSubtopics: ['Desigualdades', 'Inecuaciones lineales'] },
      { week: 4, unit: 'Unidad II', topic: 'Inecuaciones racionales y con valor absoluto', methodsOrSubtopics: ['Método de puntos críticos', 'Propiedades de valor absoluto'] },
      { week: 5, unit: 'Unidad II', topic: 'Polinomios, algoritmo de la división y Teorema del Resto', methodsOrSubtopics: ['Método de Ruffini', 'Método de Horner', 'Ceros racionales'] },
      { week: 6, unit: 'Unidad II', topic: 'Ecuaciones cuadráticas y métodos de extracción de raíces', methodsOrSubtopics: ['Método de Aspa Simple', 'Completación de cuadrados', 'Fórmula General Cuadrática', 'Discriminante Δ y naturaleza de raíces', 'Relaciones de Cardano-Vieta'], isCurrent: true },
      { week: 7, unit: 'Unidad II', topic: 'Ecuaciones polinómicas de grado superior y fraccionarias', methodsOrSubtopics: ['Raíces múltiples', 'Transformaciones polinómicas'] },
      { week: 8, unit: 'Evaluación', topic: 'PRIMER EXAMEN PARCIAL DE ÁLGEBRA', methodsOrSubtopics: ['Evaluación escrita presencial sobre Unidades I y II'] },
      { week: 9, unit: 'Unidad III', topic: 'Matrices: Operaciones elementales y álgebra matricial', methodsOrSubtopics: ['Suma, producto matricial', 'Matriz transpuesta y simétrica'] },
      { week: 10, unit: 'Unidad III', topic: 'Determinantes y cálculo de la matriz inversa', methodsOrSubtopics: ['Regla de Sarrus', 'Desarrollo por cofactores', 'Método de Gauss-Jordan'] },
      { week: 11, unit: 'Unidad III', topic: 'Sistemas de ecuaciones lineales (SEL)', methodsOrSubtopics: ['Regla de Cramer', 'Teorema de Rouché-Frobenius'] },
      { week: 12, unit: 'Unidad IV', topic: 'Vectores en el plano R2 y en el espacio R3', methodsOrSubtopics: ['Producto escalar', 'Producto vectorial', 'Proyección ortogonal'] },
      { week: 13, unit: 'Unidad IV', topic: 'La recta en R2 y R3: Ecuaciones vectoriales y paramétricas', methodsOrSubtopics: ['Distancia de un punto a una recta', 'Ángulo entre rectas'] },
      { week: 14, unit: 'Unidad IV', topic: 'El plano en R3 y posiciones relativas', methodsOrSubtopics: ['Ecuación general del plano', 'Intersección de planos'] },
      { week: 15, unit: 'Unidad IV', topic: 'Cónicas: Circunferencia, parábola, elipse e hipérbola', methodsOrSubtopics: ['Ecuaciones canónicas', 'Focos, directrices y asíntotas'] },
      { week: 16, unit: 'Evaluación', topic: 'SEGUNDO EXAMEN PARCIAL FINAL', methodsOrSubtopics: ['Evaluación integral sobre Unidades III y IV'] },
    ],
  },

  quimica: {
    courseCode: 'QUG01AFI',
    courseName: 'QUÍMICA GENERAL',
    curricula: 'PLAN CURRICULAR 2024',
    credits: 4,
    department: 'Departamento Académico de Química',
    competencies: 'Comprende los fundamentos atómicos, moleculares y termodinámicos de la materia. Desarrolla destreza experimental en laboratorio, balance de reacciones químicas complejas y análisis estequiométrico.',
    currentWeek: 6,
    currentUnit: 'Unidad II: Reacciones Químicas y Estequiometría',
    currentTopic: 'Balance de Ecuaciones Químicas Redox y Estequiometría',
    currentFocusPrompt: 'El sílabo de Química General prioriza el balance de ecuaciones de óxido-reducción mediante el método del ión-electrón (tanto en medio ácido como en medio básico), determinación de reactivo limitante y rendimiento porcentual en laboratorio.',
    examDates: {
      firstPartialExam: 'Semana 8: 15 de Octubre de 2026',
      secondPartialExam: 'Semana 16: 17 de Diciembre de 2026',
      substituteExam: 'Semana 17: 23 de Diciembre de 2026',
    },
    weeks: [
      { week: 1, unit: 'Unidad I', topic: 'Materia, energía y medición en laboratorio químico', methodsOrSubtopics: ['Propiedades físicas y químicas', 'Cifras significativas'] },
      { week: 2, unit: 'Unidad I', topic: 'Estructura atómica, teoría cuántica y configuración electrónica', methodsOrSubtopics: ['Números cuánticos', 'Principio de Aufbau y regla de Hund'] },
      { week: 3, unit: 'Unidad I', topic: 'Tabla periódica y periodicidad química', methodsOrSubtopics: ['Radio atómico', 'Energía de ionización', 'Electronegatividad'] },
      { week: 4, unit: 'Unidad I', topic: 'Enlace químico y geometría molecular', methodsOrSubtopics: ['Enlace iónico y covalente', 'Estructuras de Lewis', 'Teoría RPECV'] },
      { week: 5, unit: 'Unidad II', topic: 'Nomenclatura química inorgánica (IUPAC, clásica y stock)', methodsOrSubtopics: ['Óxidos, hidróxidos, ácidos y sales'] },
      { week: 6, unit: 'Unidad II', topic: 'Reacciones redox y estequiometría de reacción', methodsOrSubtopics: ['Método del ión-electrón en medio ácido/básico', 'Reactivo limitante y en exceso', 'Rendimiento porcentual de laboratorio'], isCurrent: true },
      { week: 7, unit: 'Unidad II', topic: 'Gases ideales y leyes de los gases', methodsOrSubtopics: ['Ecuación de estado PV=nRT', 'Ley de Dalton de presiones parciales'] },
      { week: 8, unit: 'Evaluación', topic: 'PRIMER EXAMEN PARCIAL DE QUÍMICA', methodsOrSubtopics: ['Teoría y resolución de problemas de laboratorio'] },
      { week: 9, unit: 'Unidad III', topic: 'Líquidos, sólidos y fuerzas intermoleculares', methodsOrSubtopics: ['Puentes de hidrógeno', 'Diagramas de fase'] },
      { week: 10, unit: 'Unidad III', topic: 'Disoluciones y unidades de concentración química', methodsOrSubtopics: ['Molaridad, normalidad, molalidad y fracción molar'] },
      { week: 11, unit: 'Unidad III', topic: 'Propiedades coligativas de las disoluciones', methodsOrSubtopics: ['Presión osmótica', 'Descenso crioscópico'] },
      { week: 12, unit: 'Unidad IV', topic: 'Termoquímica y primera ley de la termodinámica', methodsOrSubtopics: ['Entalpía de reacción', 'Ley de Hess'] },
      { week: 13, unit: 'Unidad IV', topic: 'Cinética química y velocidad de reacción', methodsOrSubtopics: ['Ecuación de velocidad', 'Energía de activación de Arrhenius'] },
      { week: 14, unit: 'Unidad IV', topic: 'Equilibrio químico y principio de Le Châtelier', methodsOrSubtopics: ['Constantes Kc y Kp', 'Factores que alteran el equilibrio'] },
      { week: 15, unit: 'Unidad IV', topic: 'Equilibrio ácido-base y cálculo de pH', methodsOrSubtopics: ['Teorías de Arrhenius y Brønsted-Lowry', 'Soluciones amortiguadoras / buffer'] },
      { week: 16, unit: 'Evaluación', topic: 'SEGUNDO EXAMEN PARCIAL FINAL', methodsOrSubtopics: ['Evaluación integral de química teórica y experimental'] },
    ],
  },

  calculo: {
    courseCode: 'MEG02AFI',
    courseName: 'CÁLCULO I',
    curricula: 'PLAN CURRICULAR 2024',
    credits: 4,
    department: 'Departamento Académico de Matemática y Estadística',
    competencies: 'Domina los conceptos fundamentales de límites, continuidad, cálculo diferencial de una variable real y sus aplicaciones directas a problemas de razones de cambio y optimización.',
    currentWeek: 6,
    currentUnit: 'Unidad II: La Derivada y Reglas de Derivación',
    currentTopic: 'Cálculo de Derivadas, Regla de la Cadena y Derivación Implícita',
    currentFocusPrompt: 'El sílabo de Cálculo I se encuentra en la unidad de derivación. Exige explicar la definición formal de derivada por límite, la regla de la cadena para funciones compuestas y la derivación implícita con aplicaciones geométricas a rectas tangentes y normales.',
    examDates: {
      firstPartialExam: 'Semana 8: 13 de Octubre de 2026',
      secondPartialExam: 'Semana 16: 15 de Diciembre de 2026',
      substituteExam: 'Semana 17: 21 de Diciembre de 2026',
    },
    weeks: [
      { week: 1, unit: 'Unidad I', topic: 'Funciones reales de variable real: Modelación y gráficas', methodsOrSubtopics: ['Dominio, rango y álgebra de funciones'] },
      { week: 2, unit: 'Unidad I', topic: 'Límites de funciones: Definición intuitiva y formal (ε-δ)', methodsOrSubtopics: ['Propiedades de límites', 'Límites laterales'] },
      { week: 3, unit: 'Unidad I', topic: 'Cálculo de límites algebraicos y formas indeterminadas 0/0', methodsOrSubtopics: ['Factorización', 'Racionalización y cambio de variable'] },
      { week: 4, unit: 'Unidad I', topic: 'Límites trigonométricos y notables', methodsOrSubtopics: ['Límite sen(x)/x cuando x tiende a 0', 'Teorema del emparedado'] },
      { week: 5, unit: 'Unidad I', topic: 'Límites al infinito, infinitos y asíntotas de curvas', methodsOrSubtopics: ['Asíntotas verticales, horizontales y oblicuas'] },
      { week: 6, unit: 'Unidad II', topic: 'La Derivada: Definición como razón de cambio y reglas de derivación', methodsOrSubtopics: ['Límite del cociente de Fermat', 'Regla de la cadena', 'Derivación implícita'], isCurrent: true },
      { week: 7, unit: 'Unidad II', topic: 'Derivadas de funciones trigonométricas, exponenciales y logarítmicas', methodsOrSubtopics: ['Derivación logarítmica', 'Derivadas de orden superior'] },
      { week: 8, unit: 'Evaluación', topic: 'PRIMER EXAMEN PARCIAL DE CÁLCULO I', methodsOrSubtopics: ['Evaluación de límites, continuidad y derivadas básicas'] },
      { week: 9, unit: 'Unidad III', topic: 'Teoremas del valor medio: Rolle, Lagrange y Cauchy', methodsOrSubtopics: ['Demostraciones e interpretación geométrica'] },
      { week: 10, unit: 'Unidad III', topic: 'Regla de L’Hôpital para cálculo de indeterminaciones', methodsOrSubtopics: ['Formas 0/0, ∞/∞, 0·∞, 1^∞'] },
      { week: 11, unit: 'Unidad III', topic: 'Análisis de curvas: Criterios de la primera y segunda derivada', methodsOrSubtopics: ['Crecimiento, decrecimiento, extremos locales y puntos de inflexión'] },
      { week: 12, unit: 'Unidad III', topic: 'Trazado riguroso de curvas y concavidad', methodsOrSubtopics: ['Gráfica completa con asíntotas y puntos críticos'] },
      { week: 13, unit: 'Unidad IV', topic: 'Problemas de optimización en ciencias e ingeniería', methodsOrSubtopics: ['Maximización y minimización con restricciones'] },
      { week: 14, unit: 'Unidad IV', topic: 'Problemas de razones de cambio relacionadas en el tiempo', methodsOrSubtopics: ['Variación temporal dy/dt y dx/dt'] },
      { week: 15, unit: 'Unidad IV', topic: 'Diferenciales y aproximaciones lineales locales', methodsOrSubtopics: ['Estimación de errores con diferenciales'] },
      { week: 16, unit: 'Evaluación', topic: 'SEGUNDO EXAMEN PARCIAL FINAL', methodsOrSubtopics: ['Evaluación comprensiva de aplicaciones de la derivada'] },
    ],
  },

  ecologia: {
    courseCode: 'CBG01AFI',
    courseName: 'ECOLOGÍA Y MEDIO AMBIENTE',
    curricula: 'PLAN CURRICULAR 2024',
    credits: 3,
    department: 'Departamento Académico de Biología y Ecología',
    competencies: 'Analiza los ecosistemas andinos, la estructura biótica y abiótica, la dinámica de poblaciones, ciclos de nutrientes y formula soluciones a la crisis ambiental y el cambio climático.',
    currentWeek: 6,
    currentUnit: 'Unidad II: Dinámica de Ecosistemas y Ciclos Biogeoquímicos',
    currentTopic: 'Flujo de Energía, Redes Tróficas y Ciclos Biogeoquímicos Andinos',
    currentFocusPrompt: 'El sílabo de Ecología y Medio Ambiente se centra en el flujo de energía (ley del 10%), cadenas y pirámides tróficas, ciclos biogeoquímicos (Carbono, Nitrógeno, Fósforo y Agua) y la vulnerabilidad ecológica de los Andes peruanos.',
    examDates: {
      firstPartialExam: 'Semana 8: 16 de Octubre de 2026',
      secondPartialExam: 'Semana 16: 18 de Diciembre de 2026',
    },
    weeks: [
      { week: 1, unit: 'Unidad I', topic: 'Introducción a la ciencia ecológica y niveles de organización', methodsOrSubtopics: ['Ecosistema, comunidad y biósfera'] },
      { week: 2, unit: 'Unidad I', topic: 'Factores abióticos: Clima, radiación solar, suelo y agua', methodsOrSubtopics: ['Leyes de la tolerancia de Shelford'] },
      { week: 3, unit: 'Unidad I', topic: 'Ecosistemas del Perú: Las 8 regiones naturales y las 11 ecorregiones de Brack', methodsOrSubtopics: ['Puna, yunga y selva'] },
      { week: 4, unit: 'Unidad I', topic: 'Poblaciones ecológicas: Densidad, natalidad, mortalidad y dispersión', methodsOrSubtopics: ['Tablas de vida y curvas de supervivencia'] },
      { week: 5, unit: 'Unidad I', topic: 'Crecimiento poblacional: Modelos exponencial y logístico', methodsOrSubtopics: ['Capacidad de carga K'] },
      { week: 6, unit: 'Unidad II', topic: 'Flujo de energía, redes tróficas y ciclos biogeoquímicos', methodsOrSubtopics: ['Productividad primaria', 'Ley del diezmo ecológico', 'Ciclos del N, C, P y H2O'], isCurrent: true },
      { week: 7, unit: 'Unidad II', topic: 'Sucesión ecológica y resiliencia de ecosistemas', methodsOrSubtopics: ['Sucesión primaria, secundaria y clímax'] },
      { week: 8, unit: 'Evaluación', topic: 'PRIMER EXAMEN PARCIAL DE ECOLOGÍA', methodsOrSubtopics: ['Evaluación escrita y de casos ambientales'] },
      { week: 9, unit: 'Unidad III', topic: 'Biodiversidad y áreas naturales protegidas (ANP) en el Perú', methodsOrSubtopics: ['Parques nacionales, santuarios históricos'] },
      { week: 10, unit: 'Unidad III', topic: 'Contaminación ambiental: Aire, agua y suelos', methodsOrSubtopics: ['Eutrofización, metales pesados y lluvia ácida'] },
      { week: 11, unit: 'Unidad III', topic: 'Cambio climático global y efecto invernadero', methodsOrSubtopics: ['Gases GEI y retroceso de glaciares andinos'] },
      { week: 12, unit: 'Unidad IV', topic: 'Gestión integral de residuos sólidos y economía circular', methodsOrSubtopics: ['Normativa peruana Ley 1278'] },
      { week: 13, unit: 'Unidad IV', topic: 'Evaluación de impacto ambiental (EIA)', methodsOrSubtopics: ['Matriz de Leopold y mitigación'] },
      { week: 14, unit: 'Unidad IV', topic: 'Desarrollo sostenible y Agenda 2030 (ODS)', methodsOrSubtopics: ['Sostenibilidad económica, social y ambiental'] },
      { week: 15, unit: 'Unidad IV', topic: 'Legislación ambiental peruana y fiscalización (OEFA, MINAM)', methodsOrSubtopics: ['Delitos ambientales y fiscalización'] },
      { week: 16, unit: 'Evaluación', topic: 'SEGUNDO EXAMEN PARCIAL FINAL', methodsOrSubtopics: ['Presentación de proyecto de investigación ambiental'] },
    ],
  },

  historia: {
    courseCode: 'HIG01AFI',
    courseName: 'HISTORIA CRÍTICA DEL PERÚ E IDENTIDAD NACIONAL',
    curricula: 'PLAN CURRICULAR 2024',
    credits: 3,
    department: 'Departamento Académico de Humanidades y Ciencias Sociales',
    competencies: 'Analiza críticamente los procesos económicos, sociales y políticos del Perú desde sus orígenes andinos hasta la república actual, forjando conciencia ciudadana e identidad plurinacional.',
    currentWeek: 6,
    currentUnit: 'Unidad II: La Conquista, Régimen Colonial y Resistencia Andina',
    currentTopic: 'El Sistema Colonial, la Mita Minera y las Rebeliones Indígenas del Siglo XVIII',
    currentFocusPrompt: 'El sílabo exige analizar críticamente la estructura colonial en los Andes, el impacto de las Reformas Borbónicas, la insurrección de Túpac Amaru II y Micaela Bastidas en 1780, y sus implicancias en la construcción de la identidad nacional.',
    examDates: {
      firstPartialExam: 'Semana 8: 14 de Octubre de 2026',
      secondPartialExam: 'Semana 16: 16 de Diciembre de 2026',
    },
    weeks: [
      { week: 1, unit: 'Unidad I', topic: 'El estudio científico de la historia y categorías de análisis social', methodsOrSubtopics: ['Fuentes históricas y metodología crítica'] },
      { week: 2, unit: 'Unidad I', topic: 'Formaciones económico-sociales en el Perú prehispánico: Civilización Caral y Chavín', methodsOrSubtopics: ['Origen de la civilización andina'] },
      { week: 3, unit: 'Unidad I', topic: 'El Tawantinsuyu: Organización social, económica y territorial andina', methodsOrSubtopics: ['Ayni, minka y redistribución'] },
      { week: 4, unit: 'Unidad I', topic: 'Crisis del Imperio Inka y la invasión europea de 1532', methodsOrSubtopics: ['Guerra civil inkaica y factores de la caída'] },
      { week: 5, unit: 'Unidad II', topic: 'Instauración del Virreinato del Perú: Las reformas toledanas y la mita', methodsOrSubtopics: ['Mita minera de Potosí y Huancavelica'] },
      { week: 6, unit: 'Unidad II', topic: 'Reformas borbónicas y la gran rebelión de Túpac Amaru II (1780)', methodsOrSubtopics: ['Causas económicas, ideario tupacamarista y repercusión continental'], isCurrent: true },
      { week: 7, unit: 'Unidad II', topic: 'El proceso independentista peruano: Corrientes libertadoras y participación popular', methodsOrSubtopics: ['San Martín, Bolívar y las guerrillas indígenas'] },
      { week: 8, unit: 'Evaluación', topic: 'PRIMER EXAMEN PARCIAL DE HISTORIA', methodsOrSubtopics: ['Análisis crítico de fuentes primarias y ensayo'] },
      { week: 9, unit: 'Unidad III', topic: 'Inicios de la República y caudillismo militar (1821-1845)', methodsOrSubtopics: ['Tributo indígena persistente y fragmentación'] },
      { week: 10, unit: 'Unidad III', topic: 'La era del Guano y la prosperidad falaz', methodsOrSubtopics: ['Consignatarios, modernización limeña y ferrocarriles'] },
      { week: 11, unit: 'Unidad III', topic: 'La Guerra del Salitre y del Pacífico (1879-1883)', methodsOrSubtopics: ['Resistencia de la Breña con Andrés Avelino Cáceres'] },
      { week: 12, unit: 'Unidad IV', topic: 'La República Aristocrática y el modelo primario exportador', methodsOrSubtopics: ['Civilismo, gamonalismo andino y movimiento obrero'] },
      { week: 13, unit: 'Unidad IV', topic: 'El Oncenio de Leguía y el debate ideológico: Mariátegui y Haya de la Torre', methodsOrSubtopics: ['7 Ensayos de interpretación de la realidad peruana'] },
      { week: 14, unit: 'Unidad IV', topic: 'Crisis del estado oligárquico y el gobierno revolucionario de Velasco Alvarado', methodsOrSubtopics: ['Reforma agraria de 1969 y nacionalizaciones'] },
      { week: 15, unit: 'Unidad IV', topic: 'El conflicto armado interno (1980-2000) y el informe de la CVR', methodsOrSubtopics: ['Memoria histórica, democracia e institucionalidad'] },
      { week: 16, unit: 'Evaluación', topic: 'SEGUNDO EXAMEN PARCIAL FINAL', methodsOrSubtopics: ['Defensa de ensayo histórico sobre identidad nacional'] },
    ],
  },

  linguistica: {
    courseCode: 'LCG01AFI',
    courseName: 'LINGÜÍSTICA Y COMUNICACIÓN HUMANA',
    curricula: 'PLAN CURRICULAR 2024',
    credits: 4,
    department: 'Departamento Académico de Lingüística y Literatura',
    competencies: 'Desarrolla competencias comunicativas avanzadas, análisis del lenguaje como fenómeno social y cognitivo, comprensión crítica de textos y redacción académica de rigor universitario.',
    currentWeek: 6,
    currentUnit: 'Unidad II: La Comunicación Académica y el Texto Científico',
    currentTopic: 'El Ensayo Argumentativo: Estructura, Tesis y Mecanismos de Cohesión',
    currentFocusPrompt: 'El sílabo de Lingüística y Comunicación Humana se enfoca en la redacción de textos argumentativos de nivel superior: planteamiento claro de la tesis, construcción de argumentos lógicos, refutación de contraargumentos y normas internacionales de citación (APA 7ma edición).',
    examDates: {
      firstPartialExam: 'Semana 8: 12 de Octubre de 2026',
      secondPartialExam: 'Semana 16: 14 de Diciembre de 2026',
    },
    weeks: [
      { week: 1, unit: 'Unidad I', topic: 'El lenguaje humano como facultad biológica y social', methodsOrSubtopics: ['Lenguaje, lengua y habla (Saussure)'] },
      { week: 2, unit: 'Unidad I', topic: 'El signo lingüístico y funciones del lenguaje de Jakobson', methodsOrSubtopics: ['Arbitrariedad, linealidad y doble articulación'] },
      { week: 3, unit: 'Unidad I', topic: 'Variación lingüística en el Perú: Dialectos, sociolectos y multilingüismo', methodsOrSubtopics: ['Quechua, aimara y lenguas amazónicas'] },
      { week: 4, unit: 'Unidad I', topic: 'Niveles del análisis lingüístico: Fonética, fonología, morfología y sintaxis', methodsOrSubtopics: ['Estructura de la cláusula oracional'] },
      { week: 5, unit: 'Unidad II', topic: 'Propiedades del texto: Adecuación, coherencia y cohesión textual', methodsOrSubtopics: ['Conectores lógicos, anáfora y catáfora'] },
      { week: 6, unit: 'Unidad II', topic: 'El ensayo argumentativo: Tesis, tipos de argumentos y contraargumentación', methodsOrSubtopics: ['Argumentos de autoridad, causa-efecto y analogía', 'Normas APA 7'], isCurrent: true },
      { week: 7, unit: 'Unidad II', topic: 'Técnicas de lectura crítica y niveles de comprensión', methodsOrSubtopics: ['Nivel literal, inferencial y crítico-valorativo'] },
      { week: 8, unit: 'Evaluación', topic: 'PRIMER EXAMEN PARCIAL DE LINGÜÍSTICA', methodsOrSubtopics: ['Redacción de artículo de opinión argumentado'] },
      { week: 9, unit: 'Unidad III', topic: 'Semántica y pragmática: El significado en contexto', methodsOrSubtopics: ['Actos de habla de Austin y Searle', 'Implicaturas conversacionales'] },
      { week: 10, unit: 'Unidad III', topic: 'Ortografía normativa de la RAE: Acentuación y puntuación', methodsOrSubtopics: ['Tildación diacrítica, enfática y uso del punto y coma'] },
      { week: 11, unit: 'Unidad III', topic: 'Vicios del lenguaje: Ambigüedad, pleonasmo, dequeísmo y barbarismos', methodsOrSubtopics: ['Corrección de estilo idiomático'] },
      { week: 12, unit: 'Unidad IV', topic: 'Comunicación oral efectiva: Oratoria académica y debate', methodsOrSubtopics: ['Comunicación no verbal y kinésica'] },
      { week: 13, unit: 'Unidad IV', topic: 'El artículo científico: Estructura IMRyD', methodsOrSubtopics: ['Introducción, metodología, resultados y discusión'] },
      { week: 14, unit: 'Unidad IV', topic: 'Ética de la investigación y prevención del plagio', methodsOrSubtopics: ['Parafraseo profesional y citación rigurosa'] },
      { week: 15, unit: 'Unidad IV', topic: 'Análisis crítico del discurso mediático y redes sociales', methodsOrSubtopics: ['Ideología y poder en el discurso'] },
      { week: 16, unit: 'Evaluación', topic: 'SEGUNDO EXAMEN PARCIAL FINAL', methodsOrSubtopics: ['Defensa oral y entrega de ensayo académico final'] },
    ],
  },

  general: {
    courseCode: 'GEN01AFI',
    courseName: 'CURSO UNIVERSITARIO GENERAL',
    curricula: 'PLAN CURRICULAR 2024',
    credits: 4,
    department: 'Cátedra Universitaria',
    competencies: 'Desarrollo de competencias analíticas y científicas orientadas a la formación profesional integral.',
    currentWeek: 6,
    currentUnit: 'Unidad II: Fundamentos Aplicados',
    currentTopic: 'Desarrollo Teórico y Práctico de la Asignatura',
    currentFocusPrompt: 'Orientar las respuestas según el plan de estudios universitario, con fundamentación teórica, ejemplos resueltos paso a paso y rigor metodológico.',
    examDates: {
      firstPartialExam: 'Semana 8',
      secondPartialExam: 'Semana 16',
    },
    weeks: [
      { week: 1, unit: 'Unidad I', topic: 'Introducción a la materia', methodsOrSubtopics: ['Fundamentos básicos'] },
      { week: 6, unit: 'Unidad II', topic: 'Unidad en desarrollo', methodsOrSubtopics: ['Aplicaciones prácticas'], isCurrent: true },
      { week: 8, unit: 'Evaluación', topic: 'Primer Examen Parcial', methodsOrSubtopics: ['Evaluación'] },
      { week: 16, unit: 'Evaluación', topic: 'Segundo Examen Parcial', methodsOrSubtopics: ['Evaluación final'] },
    ],
  },
};

/**
 * Obtener o generar el sílabo para un curso dado
 */
export function getCourseSyllabus(courseName: string, courseCode?: string): CourseSyllabus {
  const category = detectCourseCategory(courseName);
  const key = `nemesis_syllabus_${(courseCode || courseName).toLowerCase().replace(/\s+/g, '_')}`;

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}

  // Plantilla por defecto según categoría
  const defaultSyllabus = DEFAULT_UNSAAC_SYLLABI[category] || DEFAULT_UNSAAC_SYLLABI.general;
  return {
    ...defaultSyllabus,
    courseName: courseName,
    courseCode: courseCode || defaultSyllabus.courseCode,
  };
}

/**
 * Guardar el sílabo de un curso (ej. tras ser subido o modificado por el docente)
 */
export function saveCourseSyllabus(courseName: string, courseCode: string, syllabus: CourseSyllabus): void {
  const key = `nemesis_syllabus_${(courseCode || courseName).toLowerCase().replace(/\s+/g, '_')}`;
  try {
    localStorage.setItem(key, JSON.stringify(syllabus));
  } catch {}
}

/**
 * Obtener configuración de recursos habilitados de un curso
 */
export function getCourseResourceOptions(courseName: string, courseId?: string): CourseResourceOption[] {
  const key = `nemesis_res_opts_${(courseId || courseName).toLowerCase().replace(/\s+/g, '_')}`;
  const defaults = getDefaultResourceOptions(courseName);

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed: Record<string, boolean> = JSON.parse(stored);
      return defaults.map(opt => ({
        ...opt,
        enabled: parsed[opt.key] !== undefined ? parsed[opt.key] : opt.enabled,
      }));
    }
  } catch {}

  return defaults;
}

/**
 * Guardar opciones de recursos de un curso
 */
export function saveCourseResourceOptions(courseName: string, courseId: string, options: CourseResourceOption[]): void {
  const key = `nemesis_res_opts_${(courseId || courseName).toLowerCase().replace(/\s+/g, '_')}`;
  const map: Record<string, boolean> = {};
  options.forEach(o => { map[o.key] = o.enabled; });
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {}
}

/**
 * Envío de invitación docente a un alumno
 */
export function sendStudentCourseInvitation(
  teacherName: string,
  teacherEmail: string,
  course: TeacherCourse,
  student: StudentDirectoryEntry | { id: string; code: string; fullName: string; email: string }
): void {
  const studentStorageKey = `nemesis_notifs_v2_${student.email || student.code || 'default'}`;
  
  const scheduleText = course.schedule && course.schedule.length > 0
    ? course.schedule.map(s => `${s.day} ${s.timeLabel} (${s.classroom})`).join(' • ')
    : 'Horario oficial de cátedra';

  const newInvitation = {
    id: `inv-${course.id}-${Date.now()}`,
    type: 'invitation' as const,
    title: `Invitación a Cátedra: ${course.courseName}`,
    description: `El docente ${teacherName} te invita a unirte a su sala y entorno académico de ${course.courseName} (Grupo ${course.group}).`,
    teacherName: teacherName,
    courseName: course.courseName,
    courseId: course.id,
    classroom: course.schedule[0]?.classroom || 'Aula Virtual',
    schedule: scheduleText,
    timestamp: 'Hace un momento',
    isRead: false,
    invitationStatus: 'pending' as const,
  };

  try {
    const existingRaw = localStorage.getItem(studentStorageKey);
    let list = [];
    if (existingRaw) {
      list = JSON.parse(existingRaw);
    }
    // Evitar duplicados no resueltos
    list = list.filter((item: any) => !(item.courseId === course.id && item.type === 'invitation'));
    list.unshift(newInvitation);
    localStorage.setItem(studentStorageKey, JSON.stringify(list));
  } catch {}
}

/**
 * Guardar curso activo del estudiante
 */
export function setActiveAcademicCourseForStudent(studentEmailOrCode: string, course: TeacherCourse): void {
  const key = `nemesis_active_student_course_${studentEmailOrCode.toLowerCase()}`;
  try {
    localStorage.setItem(key, JSON.stringify(course));
  } catch {}
}

/**
 * Obtener curso activo del estudiante
 */
export function getActiveAcademicCourseForStudent(studentEmailOrCode: string): TeacherCourse | null {
  const key = `nemesis_active_student_course_${studentEmailOrCode.toLowerCase()}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
