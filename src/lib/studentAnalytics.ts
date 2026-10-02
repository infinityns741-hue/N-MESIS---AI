import { EnrolledStudent } from '../types/teacher';

export interface StudentTopicMastery {
  topic: string;
  level: 'Dominado' | 'Avanzado' | 'Consolidado';
  percentage: number;
  evidence: string;
}

export interface StudentWeaknessTopic {
  topic: string;
  severity: 'Atención Requerida' | 'En Proceso' | 'Dificultad Media';
  issue: string;
  recommendedAction: string;
}

export interface StudentDoubt {
  id: string;
  question: string;
  context: string;
  date: string;
  status: 'Respondida en clase' | 'Pendiente de asesoría' | 'Aclarada en tutoría';
}

export interface StudentPracticeRecord {
  title: string;
  type: 'Práctica Calificada' | 'Laboratorio' | 'Guía de Ejercicios' | 'Proyecto';
  score: number;
  maxScore: number;
  status: 'Entregado a tiempo' | 'Entregado con retraso' | 'No presentado';
  date: string;
}

export interface StudentAnalyticsProfile {
  student: EnrolledStudent;
  courseName: string;
  courseCode: string;
  group: string;
  overallAttendance: number;
  participationLevel: 'Alta y Proactiva' | 'Media constante' | 'Requiere estímulo';
  estimatedGrade: number;
  // "que cosas domina"
  masteredTopics: StudentTopicMastery[];
  // "que cosas no domina"
  weakTopics: StudentWeaknessTopic[];
  // "dudas"
  frequentDoubts: StudentDoubt[];
  // "si hace practicas etc..."
  practicesSummary: {
    doesPractices: boolean;
    verbalStatus: string;
    submittedCount: number;
    totalAssigned: number;
    submissionRate: number; // e.g. 100%
    labAttendance: number;  // e.g. 95%
    avgPracticeScore: number;
    records: StudentPracticeRecord[];
  };
  pedagogicalRecommendation: string;
}

// Generate tailored pedagogical profile based on course subject and student code
export function getStudentAnalyticsProfile(
  student: EnrolledStudent,
  courseName: string,
  courseCode: string,
  group: string
): StudentAnalyticsProfile {
  const normalizedCourse = courseName.toLowerCase();
  
  // Deterministic seed from student code to keep consistent data
  let seed = 0;
  for (let i = 0; i < student.code.length; i++) {
    seed += student.code.charCodeAt(i);
  }

  // Attendance and grades based on seed
  const attendanceValues = [92, 95, 88, 97, 90, 85, 96];
  const gradesValues = [16.8, 17.5, 15.2, 18.0, 16.0, 14.5, 17.2];
  const attendance = attendanceValues[seed % attendanceValues.length];
  const estimatedGrade = gradesValues[seed % gradesValues.length];

  // Specific domain profiles
  if (normalizedCourse.includes('pensamiento') || normalizedCourse.includes('inteligencia') || normalizedCourse.includes('algoritmo') || normalizedCourse.includes('computacional')) {
    return {
      student,
      courseName,
      courseCode,
      group,
      overallAttendance: attendance,
      participationLevel: seed % 2 === 0 ? 'Alta y Proactiva' : 'Media constante',
      estimatedGrade,
      masteredTopics: [
        {
          topic: 'Descomposición de problemas y pensamiento lógico',
          level: 'Consolidado',
          percentage: 95,
          evidence: 'Resuelve diagramas de flujo y pseudocódigo con estructuración impecable.'
        },
        {
          topic: 'Estructuras de control condicionales (If-Else / Switch)',
          level: 'Dominado',
          percentage: 92,
          evidence: 'Aplica lógica booleana compleja sin redundancias de evaluación.'
        },
        {
          topic: 'Fundamentos de Inteligencia Artificial y Reglas de Inferencia',
          level: 'Avanzado',
          percentage: 88,
          evidence: 'Comprende el ciclo de agentes inteligentes, sensores y actuadores.'
        }
      ],
      weakTopics: [
        {
          topic: 'Bucles anidados y optimización de iteraciones',
          severity: 'Atención Requerida',
          issue: 'Suele cometer errores de límite off-by-one en bucles anidados tipo matriz.',
          recommendedAction: 'Proponerle ejercicios de recorrido bidimensional con trazado paso a paso.'
        },
        {
          topic: 'Manejo de colecciones dinámicas y listas por comprensión',
          severity: 'En Proceso',
          issue: 'Requiere más práctica en la manipulación funcional de secuencias de datos.',
          recommendedAction: 'Proporcionarle la guía de ejercicios prácticos #3 con soluciones comentadas.'
        }
      ],
      frequentDoubts: [
        {
          id: 'd1',
          question: '¿Cuándo conviene utilizar un ciclo While en lugar de un bucle For para búsquedas dinámicas?',
          context: 'Semana 2 • Clase práctica de Algoritmos',
          date: '02/09/2026',
          status: 'Respondida en clase'
        },
        {
          id: 'd2',
          question: '¿De qué forma los árboles de decisión en IA previenen el sobreajuste (overfitting)?',
          context: 'Semana 3 • Introducción a IA',
          date: '04/09/2026',
          status: 'Pendiente de asesoría'
        },
        {
          id: 'd3',
          question: '¿Puedo estructurar el código de las prácticas utilizando modularización con funciones personalizadas?',
          context: 'Semana 1 • Entrega de laboratorio',
          date: '28/08/2026',
          status: 'Aclarada en tutoría'
        }
      ],
      practicesSummary: {
        doesPractices: true,
        verbalStatus: 'Sí, cumple activamente con todas las prácticas asignadas',
        submittedCount: 4,
        totalAssigned: 4,
        submissionRate: 100,
        labAttendance: 96,
        avgPracticeScore: 17.0,
        records: [
          {
            title: 'Práctica Calificada 1: Lógica y Pseudocódigo',
            type: 'Práctica Calificada',
            score: 18,
            maxScore: 20,
            status: 'Entregado a tiempo',
            date: '25/08/2026'
          },
          {
            title: 'Laboratorio 1: Estructuras Secuenciales',
            type: 'Laboratorio',
            score: 17,
            maxScore: 20,
            status: 'Entregado a tiempo',
            date: '28/08/2026'
          },
          {
            title: 'Laboratorio 2: Bifurcaciones y Condiciones',
            type: 'Laboratorio',
            score: 16,
            maxScore: 20,
            status: 'Entregado a tiempo',
            date: '01/09/2026'
          },
          {
            title: 'Guía de Ejercicios: Agentes Inteligentes Básicos',
            type: 'Guía de Ejercicios',
            score: 17,
            maxScore: 20,
            status: 'Entregado a tiempo',
            date: '04/09/2026'
          }
        ]
      },
      pedagogicalRecommendation:
        'El estudiante demuestra gran motivación y pensamiento analítico claro. Estimularlo con retos algorítmicos de mayor complejidad e integrarlo como líder técnico en dinámicas grupales.'
    };
  } else if (normalizedCourse.includes('álgebra') || normalizedCourse.includes('algebra') || normalizedCourse.includes('geometría') || normalizedCourse.includes('geometria')) {
    return {
      student,
      courseName,
      courseCode,
      group,
      overallAttendance: attendance,
      participationLevel: 'Alta y Proactiva',
      estimatedGrade,
      masteredTopics: [
        {
          topic: 'Ecuaciones de la recta en el plano (R2)',
          level: 'Consolidado',
          percentage: 94,
          evidence: 'Calcula pendientes, formas vectoriales y paramétricas con gran precisión.'
        },
        {
          topic: 'Matrices y determinantes de orden 2 y 3',
          level: 'Dominado',
          percentage: 90,
          evidence: 'Domina el método de Gauss-Jordan y la regla de Cramer para sistemas lineales.'
        },
        {
          topic: 'Distancia entre puntos y rectas',
          level: 'Avanzado',
          percentage: 86,
          evidence: 'Interpreta geométricamente la fórmula del valor absoluto y proyecciones ortogonales.'
        }
      ],
      weakTopics: [
        {
          topic: 'Lugares geométricos y traslación de cónicas (Parábola / Elipse)',
          severity: 'Atención Requerida',
          issue: 'Presenta confusión al completar cuadrados para llevar la ecuación general a la canónica.',
          recommendedAction: 'Recomendarle la ficha gráfica de cónicas y práctica de completación de trinomios.'
        },
        {
          topic: 'Vectores en el espacio tridimensional (R3)',
          severity: 'En Proceso',
          issue: 'Dificultad para visualizar el producto vectorial ortogonal a ambos vectores.',
          recommendedAction: 'Utilizar simuladores 3D interactivos en la sesión de práctica del jueves.'
        }
      ],
      frequentDoubts: [
        {
          id: 'd1',
          question: '¿Por qué en la distancia de un punto a una recta siempre se toma el valor absoluto en el numerador?',
          context: 'Semana 2 • Clase teórica',
          date: '01/09/2026',
          status: 'Respondida en clase'
        },
        {
          id: 'd2',
          question: '¿Cuándo una matriz cuadrada no tiene inversa sin necesidad de calcular todo el determinante?',
          context: 'Semana 3 • Taller de ejercicios',
          date: '03/09/2026',
          status: 'Aclarada en tutoría'
        }
      ],
      practicesSummary: {
        doesPractices: true,
        verbalStatus: 'Sí, realiza y entrega todas sus prácticas de aula',
        submittedCount: 3,
        totalAssigned: 3,
        submissionRate: 100,
        labAttendance: 95,
        avgPracticeScore: 16.5,
        records: [
          {
            title: 'Guía de Práctica 1: Vectores y Geometría en R2',
            type: 'Guía de Ejercicios',
            score: 18,
            maxScore: 20,
            status: 'Entregado a tiempo',
            date: '26/08/2026'
          },
          {
            title: 'Práctica Calificada 1: La Recta y Cónicas',
            type: 'Práctica Calificada',
            score: 16,
            maxScore: 20,
            status: 'Entregado a tiempo',
            date: '31/08/2026'
          },
          {
            title: 'Taller Grupal: Sistemas Lineales y Matrices',
            type: 'Proyecto',
            score: 16,
            maxScore: 20,
            status: 'Entregado a tiempo',
            date: '04/09/2026'
          }
        ]
      },
      pedagogicalRecommendation:
        'Buen dominio del rigor matemático formal. Fortalecer el andamiaje en geometría analítica del espacio y completación de cuadrados.'
    };
  } else {
    // Generic high quality template for any other course
    return {
      student,
      courseName,
      courseCode,
      group,
      overallAttendance: attendance,
      participationLevel: seed % 2 === 0 ? 'Alta y Proactiva' : 'Media constante',
      estimatedGrade,
      masteredTopics: [
        {
          topic: 'Conceptos fundamentales y teoría base del curso',
          level: 'Consolidado',
          percentage: 92,
          evidence: 'Demuestra comprensión sólida de los postulados y metodología del sílabo.'
        },
        {
          topic: 'Aplicación práctica de casos de estudio',
          level: 'Dominado',
          percentage: 88,
          evidence: 'Estructura soluciones coherentes en talleres y dinámicas de grupo.'
        }
      ],
      weakTopics: [
        {
          topic: 'Resolución de problemas de alta complejidad bajo presión',
          severity: 'En Proceso',
          issue: 'Tiende a apresurarse en los pasos intermedios de demostración o cálculo.',
          recommendedAction: 'Sugerirle esquematizar el procedimiento antes de redactar la solución final.'
        }
      ],
      frequentDoubts: [
        {
          id: 'd1',
          question: '¿Qué bibliografía complementaria recomienda para profundizar los temas de la unidad actual?',
          context: 'Semana 1 • Asesoría de Cátedra',
          date: '27/08/2026',
          status: 'Respondida en clase'
        },
        {
          id: 'd2',
          question: '¿Los entregables de avance tienen ponderación en la evaluación continua del primer parcial?',
          context: 'Semana 2 • Coordinación',
          date: '02/09/2026',
          status: 'Aclarada en tutoría'
        }
      ],
      practicesSummary: {
        doesPractices: true,
        verbalStatus: 'Sí, realiza y entrega todas sus prácticas de aula',
        submittedCount: 3,
        totalAssigned: 3,
        submissionRate: 100,
        labAttendance: 92,
        avgPracticeScore: 16.0,
        records: [
          {
            title: 'Práctica Calificada 1: Diagnóstico Inicial',
            type: 'Práctica Calificada',
            score: 16,
            maxScore: 20,
            status: 'Entregado a tiempo',
            date: '28/08/2026'
          },
          {
            title: 'Taller Práctico 1: Aplicación de la Unidad',
            type: 'Guía de Ejercicios',
            score: 17,
            maxScore: 20,
            status: 'Entregado a tiempo',
            date: '02/09/2026'
          },
          {
            title: 'Guía de Laboratorio 1',
            type: 'Laboratorio',
            score: 15,
            maxScore: 20,
            status: 'Entregado a tiempo',
            date: '04/09/2026'
          }
        ]
      },
      pedagogicalRecommendation:
        'Estudiante con constancia académica demostrada. Mantener seguimiento a sus entregas y fomentar su participación activa en preguntas de debate.'
    };
  }
}
