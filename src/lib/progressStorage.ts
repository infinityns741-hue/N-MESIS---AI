import { ChatMessage, ChatSessionItem, UserSession } from '../types';
import { 
  UserAcademicProgressData, 
  TopicProgress, 
  PracticeRecord, 
  CognitiveProfile, 
  PracticeExercise 
} from '../types/progress';

const PROGRESS_STORAGE_KEY_PREFIX = 'nemesis_academic_progress_v2_';

const EMPTY_COGNITIVE_PROFILE: CognitiveProfile = {
  potentialTitle: 'Perfil en Calibración Inicial',
  primaryField: 'A la espera de tus primeras consultas académicas',
  passions: ['Conversa sobre cualquier tema en el chat para registrar tus intereses'],
  dominantCompetencies: ['Diagnóstico en tiempo real activo'],
  areasToReinforce: ['Formula tus preguntas para evaluar tu nivel teórico y práctico'],
  aiCognitiveSummary: 'DANAEL registrará tu progreso de manera 100% real. Cada vez que formules preguntas en el chat (por ejemplo, sobre Historia de PPK, Programación, Matemáticas o Ciencias), la IA clasificará autónomamente la materia, el subtema y el concepto específico, evaluando en qué eres bueno y qué áreas debes reforzar.',
  totalInteractionsAnalyzed: 0,
  lastAnalysisDate: Date.now()
};

/**
 * Loads progress data for a given user.
 * Returns completely empty real topics if no interactions exist.
 */
export function loadUserProgress(userKey: string): UserAcademicProgressData {
  if (typeof window === 'undefined') {
    return {
      topics: [],
      practiceHistory: [],
      cognitiveProfile: EMPTY_COGNITIVE_PROFILE
    };
  }

  try {
    const raw = localStorage.getItem(`${PROGRESS_STORAGE_KEY_PREFIX}${userKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.topics) && parsed.cognitiveProfile) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading progress data from storage:', e);
  }

  const initialData: UserAcademicProgressData = {
    topics: [],
    practiceHistory: [],
    cognitiveProfile: EMPTY_COGNITIVE_PROFILE
  };
  saveUserProgress(userKey, initialData);
  return initialData;
}

/**
 * Saves progress data to localStorage
 */
export function saveUserProgress(userKey: string, data: UserAcademicProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${PROGRESS_STORAGE_KEY_PREFIX}${userKey}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving progress data to storage:', e);
  }
}

/**
 * Intelligent topic classifier:
 * Analyzes chat sessions dynamically without ANY pre-seeded hardcoded fake topics.
 * Detects Course, Subtopic, Concept, Theory vs Practice, Strengths and Weaknesses.
 */
export function analyzeChatSessionsForProgress(
  userKey: string,
  sessions: ChatSessionItem[]
): UserAcademicProgressData {
  const currentData = loadUserProgress(userKey);
  const allUserMessages: string[] = [];

  sessions.forEach(s => {
    if (Array.isArray(s.messages)) {
      s.messages.forEach(m => {
        if (m.sender === 'user' && m.text && m.text.trim().length > 0) {
          allUserMessages.push(m.text.trim());
        }
      });
    }
  });

  // If no user messages exist in chat, keep it clean and empty
  if (allUserMessages.length === 0) {
    return {
      topics: [],
      practiceHistory: currentData.practiceHistory,
      cognitiveProfile: EMPTY_COGNITIVE_PROFILE
    };
  }

  // Topic buckets map: id -> TopicProgress
  const detectedTopicsMap = new Map<string, TopicProgress>();

  // Helper to get or initialize a topic
  const getOrCreateTopic = (
    id: string,
    course: string,
    subtopic: string,
    concept: string,
    name: string,
    iconName: string,
    defaultStrengths: string[],
    defaultWeaknesses: string[]
  ): TopicProgress => {
    if (!detectedTopicsMap.has(id)) {
      // Check if we already had this topic in currentData to preserve practices
      const existing = currentData.topics.find(t => t.id === id);
      detectedTopicsMap.set(id, {
        id,
        course,
        subtopic,
        concept,
        name,
        category: course,
        iconName,
        masteryOverall: existing ? existing.masteryOverall : 46,
        masteryTheory: existing ? existing.masteryTheory : 50,
        masteryPractice: existing ? existing.masteryPractice : 42,
        theoryQuestionsCount: existing ? existing.theoryQuestionsCount : 0,
        practiceRequestsCount: existing ? existing.practiceRequestsCount : 0,
        completedPracticesCount: existing ? existing.completedPracticesCount : 0,
        strengths: existing && existing.strengths.length > 0 ? existing.strengths : defaultStrengths,
        weaknesses: existing && existing.weaknesses.length > 0 ? existing.weaknesses : defaultWeaknesses,
        reasoningSummary: '',
        sampleQueries: existing?.sampleQueries ? [...existing.sampleQueries] : [],
        lastUpdated: Date.now()
      });
    }
    return detectedTopicsMap.get(id)!;
  };

  // Analyze each user message
  allUserMessages.forEach(rawText => {
    const text = rawText.toLowerCase();

    // Intent detection
    const isTheoryIntent = 
      text.includes('formula') || text.includes('fórmula') || 
      text.includes('como se halla') || text.includes('cómo se halla') || 
      text.includes('que es') || text.includes('qué es') || 
      text.includes('quien es') || text.includes('quién es') || 
      text.includes('quien fue') || text.includes('quién fue') || 
      text.includes('dime la historia') || text.includes('historia de') || 
      text.includes('biografia') || text.includes('biografía') || 
      text.includes('definicion') || text.includes('definición') || 
      text.includes('por que') || text.includes('por qué') || 
      text.includes('teoria') || text.includes('teoría') || 
      text.includes('explica') || text.includes('cuentame') || text.includes('cuéntame');

    const isPracticeIntent = 
      text.includes('resuelve') || text.includes('resolver') || 
      text.includes('ejercicio') || text.includes('calcula') || 
      text.includes('desarrolla') || text.includes('problema') || 
      text.includes('solucion') || text.includes('solución') || 
      text.includes('hazme') || text.includes('escribe un') || 
      text.includes('codigo') || text.includes('código') || 
      text.includes('paso a paso') || text.includes('ayuda con este');

    // 1. Detección: HISTORIA (PPK / Gobernantes del Perú / Historia Contemporánea)
    const isPPK = 
      text.includes('ppk') || text.includes('pedro pablo') || 
      text.includes('kuczynski') || text.includes('kuchizsky') || 
      text.includes('peruanos por el kambio');

    const isPeruvianHistory = 
      isPPK || 
      text.includes('fujimori') || text.includes('velasco') || 
      text.includes('toledo') || text.includes('alan garcia') || 
      text.includes('vizcarra') || text.includes('guerra del pacifico') || 
      text.includes('independencia del peru') || text.includes('incas') || 
      text.includes('virreinato') || text.includes('historia del peru');

    const isGeneralHistory = 
      isPeruvianHistory || 
      text.includes('historia') || text.includes('segunda guerra') || 
      text.includes('primera guerra') || text.includes('guerra fria') || 
      text.includes('revolucion') || text.includes('imperio romano');

    if (isPPK) {
      const topic = getOrCreateTopic(
        'historia-ppk',
        'Historia',
        'Historia Contemporánea / Gobernantes del Perú',
        'Personajes: Pedro Pablo Kuczynski (PPK)',
        'Historia: Pedro Pablo Kuczynski (PPK)',
        'Landmark',
        [
          'Curiosidad e iniciativa por la historia republicana reciente y figuras de gobierno',
          'Interés en vincular la trayectoria biográfica con la coyuntura política y económica'
        ],
        [
          'Análisis crítico independiente de las crisis de gobernabilidad 2016-2018 sin asistencia',
          'Memorización activa y contextualización de cronología y reformas sin ayuda de la IA'
        ]
      );
      if (isTheoryIntent) topic.theoryQuestionsCount++;
      if (isPracticeIntent) topic.practiceRequestsCount++;
      if (!isTheoryIntent && !isPracticeIntent) topic.theoryQuestionsCount++;
      if (!topic.sampleQueries?.includes(rawText) && (topic.sampleQueries?.length || 0) < 3) {
        topic.sampleQueries = [...(topic.sampleQueries || []), rawText];
      }
    } else if (isPeruvianHistory || isGeneralHistory) {
      const topic = getOrCreateTopic(
        'historia-general',
        'Historia',
        'Historia y Acontecimientos Sociopolíticos',
        'Acontecimientos y Procesos Históricos',
        'Historia y Procesos Históricos',
        'Landmark',
        [
          'Interés en causas de acontecimientos históricos y memoria colectiva',
          'Capacidad para plantear dudas sobre procesos sociopolíticos'
        ],
        [
          'Retención de fechas y periodización autónoma',
          'Evaluación comparativa de fuentes históricas'
        ]
      );
      if (isTheoryIntent) topic.theoryQuestionsCount++;
      if (isPracticeIntent) topic.practiceRequestsCount++;
      if (!isTheoryIntent && !isPracticeIntent) topic.theoryQuestionsCount++;
      if (!topic.sampleQueries?.includes(rawText) && (topic.sampleQueries?.length || 0) < 3) {
        topic.sampleQueries = [...(topic.sampleQueries || []), rawText];
      }
    }

    // 2. Detección: PROGRAMACIÓN Y COMPUTACIÓN
    const isProgramming = 
      text.includes('programacion') || text.includes('programación') || 
      text.includes('programar') || text.includes('python') || 
      text.includes('javascript') || text.includes('typescript') || 
      text.includes('react') || text.includes('java') || 
      text.includes('c++') || text.includes('algoritmo') || 
      text.includes('funcion') || text.includes('función') || 
      text.includes('variable') || text.includes('array') || 
      text.includes('bucle') || text.includes('backend') || 
      text.includes('frontend') || text.includes('sql') || 
      text.includes('base de datos') || text.includes('software') || 
      text.includes('bug') || text.includes('compilador') || 
      text.includes('codigo') || text.includes('código');

    if (isProgramming) {
      const topic = getOrCreateTopic(
        'programacion-software',
        'Programación',
        'Desarrollo de Software y Algoritmia',
        'Lógica de Programación, Sintaxis y Funciones',
        'Programación: Desarrollo y Algoritmos',
        'Code',
        [
          'Pensamiento lógico y curiosidad por estructurar soluciones computacionales',
          'Interés en lenguajes modernos, sintaxis y ejecución de algoritmos'
        ],
        [
          'Escritura de código autónoma sin solicitar que la IA resuelva todo el programa',
          'Dominio práctico a medias al depender de fragmentos prediseñados; requiere depuración propia'
        ]
      );
      if (isTheoryIntent) topic.theoryQuestionsCount++;
      if (isPracticeIntent) topic.practiceRequestsCount++;
      if (!isTheoryIntent && !isPracticeIntent) topic.practiceRequestsCount++;
      if (!topic.sampleQueries?.includes(rawText) && (topic.sampleQueries?.length || 0) < 3) {
        topic.sampleQueries = [...(topic.sampleQueries || []), rawText];
      }
    }

    // 3. Detección: MATEMÁTICAS - ÁLGEBRA Y ECUACIONES CUADRÁTICAS
    const isAlgebra = 
      text.includes('cuadratica') || text.includes('cuadrática') || 
      text.includes('raiz') || text.includes('raíz') || 
      text.includes('discriminante') || text.includes('x^2') || 
      text.includes('parabola') || text.includes('parábola') || 
      text.includes('algebra') || text.includes('álgebra') || 
      text.includes('factorizacion') || text.includes('ecuacion') || text.includes('ecuación');

    if (isAlgebra) {
      const topic = getOrCreateTopic(
        'matematicas-algebra',
        'Matemáticas',
        'Álgebra y Ecuaciones',
        'Ecuaciones Cuadráticas, Raíces y Factorización',
        'Matemáticas: Ecuaciones y Álgebra',
        'Calculator',
        [
          'Comprensión conceptual de la parábola, el discriminante y las raíces',
          'Interés en la deducción de fórmulas y propiedades algebraicas'
        ],
        [
          'Autonomía en resolución de ejercicios sin pedir solución paso a paso (conocimiento práctico a medias)',
          'Memorización activa de fórmulas y cálculo mental de signos y discriminantes'
        ]
      );
      if (isTheoryIntent) topic.theoryQuestionsCount++;
      if (isPracticeIntent) topic.practiceRequestsCount++;
      if (!isTheoryIntent && !isPracticeIntent) topic.theoryQuestionsCount++;
      if (!topic.sampleQueries?.includes(rawText) && (topic.sampleQueries?.length || 0) < 3) {
        topic.sampleQueries = [...(topic.sampleQueries || []), rawText];
      }
    }

    // 4. Detección: MATEMÁTICAS - CÁLCULO
    const isCalculus = 
      text.includes('calculo') || text.includes('cálculo') || 
      text.includes('derivada') || text.includes('integral') || 
      text.includes('punto critico') || text.includes('puntos críticos') || 
      text.includes('limite') || text.includes('límite') || 
      text.includes('unsaac');

    if (isCalculus) {
      const topic = getOrCreateTopic(
        'matematicas-calculo',
        'Matemáticas',
        'Cálculo Infinitesimal y Rigor Universitario',
        'Derivadas, Puntos Críticos e Intervalos',
        'Matemáticas: Cálculo Diferencial',
        'Variable',
        [
          'Afinidad con problemas de rigor universitario y análisis de variación',
          'Reconocimiento conceptual de puntos críticos y límites'
        ],
        [
          'Verificación manual de signos y cálculo de derivadas sin comprobación asistida',
          'Autonomía en la demostración formal de teoremas'
        ]
      );
      if (isTheoryIntent) topic.theoryQuestionsCount++;
      if (isPracticeIntent) topic.practiceRequestsCount++;
      if (!isTheoryIntent && !isPracticeIntent) topic.theoryQuestionsCount++;
      if (!topic.sampleQueries?.includes(rawText) && (topic.sampleQueries?.length || 0) < 3) {
        topic.sampleQueries = [...(topic.sampleQueries || []), rawText];
      }
    }

    // 5. Detección: ASTRONOMÍA Y COSMOS
    const isAstronomy = 
      text.includes('astronomia') || text.includes('astronomía') || 
      text.includes('astro') || text.includes('planeta') || 
      text.includes('estrella') || text.includes('galaxia') || 
      text.includes('telescopio') || text.includes('universo') || 
      text.includes('orbita') || text.includes('órbita') || 
      text.includes('kepler') || text.includes('agujero negro') || 
      text.includes('cosmos');

    if (isAstronomy) {
      const topic = getOrCreateTopic(
        'astronomia-cosmos',
        'Astronomía',
        'Ciencias del Espacio y Astrofísica',
        'Mecánica Celeste y Cuerpos Cósmicos',
        'Astronomía y Ciencias del Espacio',
        'Compass',
        [
          'Curiosidad por objetos estelares y fenómenos cosmológicos',
          'Planteamiento de preguntas exploratorias sobre el universo y el espacio'
        ],
        [
          'Cálculo cuantitativo de leyes orbitales de Kepler y magnitudes estelares',
          'Estructuración formal de astrometría teórica sin delegar a la IA'
        ]
      );
      if (isTheoryIntent) topic.theoryQuestionsCount++;
      if (isPracticeIntent) topic.practiceRequestsCount++;
      if (!isTheoryIntent && !isPracticeIntent) topic.theoryQuestionsCount++;
      if (!topic.sampleQueries?.includes(rawText) && (topic.sampleQueries?.length || 0) < 3) {
        topic.sampleQueries = [...(topic.sampleQueries || []), rawText];
      }
    }

    // 6. Detección: FÍSICA
    const isPhysics = 
      text.includes('fisica') || text.includes('física') || 
      text.includes('newton') || text.includes('cinematica') || 
      text.includes('velocidad') || text.includes('aceleracion') || 
      text.includes('termodinamica') || text.includes('fuerza') || 
      text.includes('gravedad') || text.includes('energia') || text.includes('energía');

    if (isPhysics) {
      const topic = getOrCreateTopic(
        'fisica-mecanica',
        'Física',
        'Mecánica Clásica y Dinámica',
        'Leyes de Movimiento y Conservación de Energía',
        'Física: Mecánica y Dinámica',
        'Atom',
        [
          'Interés en modelar fenómenos físicos y fuerzas del entorno',
          'Comprensión intuitiva de vectores y trayectorias'
        ],
        [
          'Despeje manual de ecuaciones cinemáticas sin pedir la resolución paso a paso',
          'Aplicación rigurosa de unidades de medida (SI)'
        ]
      );
      if (isTheoryIntent) topic.theoryQuestionsCount++;
      if (isPracticeIntent) topic.practiceRequestsCount++;
      if (!isTheoryIntent && !isPracticeIntent) topic.theoryQuestionsCount++;
      if (!topic.sampleQueries?.includes(rawText) && (topic.sampleQueries?.length || 0) < 3) {
        topic.sampleQueries = [...(topic.sampleQueries || []), rawText];
      }
    }
  });

  // If no specific domain was matched, but user asked questions:
  if (detectedTopicsMap.size === 0 && allUserMessages.length > 0) {
    const firstSample = allUserMessages[0];
    const topic = getOrCreateTopic(
      'temas-generales',
      'Conocimiento General',
      'Consultas Temáticas Variadas',
      'Conceptos e Interacciones Generales',
      'Conocimiento General e Interdisciplinario',
      'BookOpen',
      [
        'Iniciativa constante por indagar y consultar a la IA',
        'Versatilidad para plantear inquietudes diversas'
      ],
      [
        'Profundización temática continua en un área académica específica',
        'Formulación de problemas prácticos que permitan medir autonomía'
      ]
    );
    topic.theoryQuestionsCount = allUserMessages.length;
    topic.sampleQueries = [firstSample];
  }

  // Calibrate each detected topic based on Theory vs Practice
  const finalizedTopics: TopicProgress[] = Array.from(detectedTopicsMap.values()).map(topic => {
    const theory = Math.max(1, topic.theoryQuestionsCount);
    const practice = topic.practiceRequestsCount;

    // Bonus for successfully completed practice quizzes
    const completionBonus = Math.min(25, topic.completedPracticesCount * 4);

    // Theory starts around 50 + count bonus
    const theoryMastery = Math.min(92, Math.round(48 + Math.min(24, theory * 3.5) + completionBonus * 0.4));

    // Practice: If user asked the AI to solve or write code, assume "lo sabe a medias" (45-52%)
    const practiceMastery = Math.min(88, Math.round(
      practice > 0 
        ? Math.max(42, 46 + Math.min(10, practice * 1.5) + completionBonus) 
        : Math.max(38, 40 + completionBonus * 0.8)
    ));

    const overallMastery = Math.round((theoryMastery * 0.45) + (practiceMastery * 0.55));

    let dynamicReasoning = '';
    if (topic.id === 'historia-ppk') {
      dynamicReasoning = `Has realizado ${theory} consulta(s) sobre la historia y mandato de Pedro Pablo Kuczynski (PPK). La IA destaca tu interés en contextualizar figuras presidenciales; tu comprensión teórica avanza con curiosidad histórica, requiriendo afianzar la síntesis crítica autónoma.`;
    } else if (topic.id === 'programacion-software') {
      dynamicReasoning = `Registras ${theory} consulta(s) teóricas y ${practice} solicitud(es) de desarrollo o resolución de código. Al pedir asistencia o soluciones directas a la IA, tu dominio práctico se calibra a nivel intermedio en desarrollo (~${practiceMastery}%), pues requiere resolución independiente.`;
    } else if (topic.id === 'matematicas-algebra') {
      dynamicReasoning = `Has realizado ${theory} consulta(s) teóricas (como raíces y fórmulas) y ${practice} peticiones de resolución. Al pedir resolución asistida a la IA, se infiere que comprendes el procedimiento pero estás consolidando tu destreza autónoma.`;
    } else {
      dynamicReasoning = `Registras ${theory} pregunta(s) teórica(s) y ${practice} práctica(s). Tu perfil refleja interés activo con dominio teórico en progreso y dominio práctico en calibración continua.`;
    }

    return {
      ...topic,
      masteryTheory: theoryMastery,
      masteryPractice: practiceMastery,
      masteryOverall: overallMastery,
      reasoningSummary: dynamicReasoning,
      lastUpdated: Date.now()
    };
  });

  // Calculate Cognitive Profile dynamically from detected topics
  const hasHistory = finalizedTopics.some(t => t.course === 'Historia');
  const hasProgramming = finalizedTopics.some(t => t.course === 'Programación');
  const hasMath = finalizedTopics.some(t => t.course === 'Matemáticas');
  const hasAstronomy = finalizedTopics.some(t => t.course === 'Astronomía');
  const hasPhysics = finalizedTopics.some(t => t.course === 'Física');

  let potentialTitle = 'Perfil en Desarrollo Académico';
  let primaryField = 'Áreas Académicas Detectadas';
  const passions: string[] = [];
  const dominantCompetencies: string[] = [];
  const areasToReinforce: string[] = [];

  if (hasHistory && hasProgramming) {
    potentialTitle = 'Perfil Polímata: Humanista Tecnológico';
    primaryField = 'Interdisciplinario: Ciencias de la Computación y Ciencias Sociales';
    passions.push('Historia republicana y análisis institucional', 'Desarrollo de software y pensamiento algorítmico');
    dominantCompetencies.push(
      'Pensamiento interdisciplinario capaz de cruzar humanidades con tecnología',
      'Curiosidad por entender cómo funcionan tanto los sistemas históricos como los digitales'
    );
    areasToReinforce.push(
      'Programación independiente de algoritmos sin pedir a la IA el código terminado',
      'Análisis crítico de cronología y reformas históricas con argumentación propia'
    );
  } else if (hasHistory) {
    potentialTitle = 'Perfil: Analista Histórico-Político y Humanista';
    primaryField = 'Humanidades y Ciencias Sociales';
    passions.push('Historia política del Perú y gobernantes contemporáneos', 'Comprensión de procesos y actores institucionales');
    dominantCompetencies.push(
      'Interés en memoria histórica y causalidad política',
      'Capacidad para vincular personajes con la coyuntura del país'
    );
    areasToReinforce.push(
      'Síntesis cronológica autónoma sin depender de consultas asistidas',
      'Ejercitar la evaluación crítica en el Modo Práctica (hasta 20 preguntas)'
    );
  } else if (hasProgramming) {
    potentialTitle = 'Potencial Ingeniero de Software y Algoritmia';
    primaryField = 'Ciencias de la Computación y Tecnología';
    passions.push('Desarrollo de software y resolución algorítmica', 'Lógica computacional y sintaxis de programación');
    dominantCompetencies.push(
      'Iniciativa para abordar desafíos técnicos mediante código',
      'Interés en la arquitectura y flujo de ejecución'
    );
    areasToReinforce.push(
      'Escribir y depurar código de manera autónoma sin pedir la solución prediseñada',
      'Fortalecer conceptos de estructuras de datos y complejidad'
    );
  } else if (hasMath || hasPhysics || hasAstronomy) {
    potentialTitle = 'Potencial Investigador Científico';
    primaryField = 'Ciencias Exactas e Investigación Académica';
    if (hasMath) passions.push('Álgebra, raíces y deducción rigurosa de fórmulas');
    if (hasAstronomy) passions.push('Astronomía observacional y ciencias del cosmos');
    if (hasPhysics) passions.push('Física mecánica y modelamiento de fuerzas');
    dominantCompetencies.push(
      'Búsqueda activa del método y deducciones teóricas',
      'Afinidad con problemas universitarios y pensamiento analítico'
    );
    areasToReinforce.push(
      'Resolución matemática autónoma sin pedir soluciones paso a paso inmediatas',
      'Consolidación práctica cuantitativa continua'
    );
  } else {
    potentialTitle = 'Estudiante Curioso e Investigador Interdisciplinario';
    primaryField = 'Consultas Generales y Exploración de Temas';
    passions.push('Exploración continua del conocimiento');
    dominantCompetencies.push('Planteamiento activo de dudas y diálogo intelectual');
    areasToReinforce.push('Practicar ejercicios autónomos para consolidar habilidades');
  }

  const cognitiveSummary = `La IA ha analizado tus mensajes reales: has abordado ${finalizedTopics.map(t => `${t.course} (${t.subtopic})`).join(', ')}. Tu perfil demuestra una inclinación ${hasHistory ? 'hacia el análisis reflexivo e histórico' : hasProgramming ? 'hacia la creación algorítmica' : 'analítica y científica'}. La IA registra tus fortalezas conceptuales y calibra tu dominio práctico a un nivel moderado, reconociendo que el aprendizaje auténtico madura con la práctica autónoma.`;

  const updatedProfile: CognitiveProfile = {
    potentialTitle,
    primaryField,
    passions: passions.length > 0 ? passions : ['Curiosidad intelectual activa'],
    dominantCompetencies: dominantCompetencies.length > 0 ? dominantCompetencies : ['Iniciativa para consultar y aprender'],
    areasToReinforce: areasToReinforce.length > 0 ? areasToReinforce : ['Resolver ejercicios sin asistencia directa de la IA'],
    aiCognitiveSummary: cognitiveSummary,
    totalInteractionsAnalyzed: allUserMessages.length,
    lastAnalysisDate: Date.now()
  };

  const finalData: UserAcademicProgressData = {
    topics: finalizedTopics,
    practiceHistory: currentData.practiceHistory,
    cognitiveProfile: updatedProfile
  };

  saveUserProgress(userKey, finalData);
  return finalData;
}

/**
 * Records completion of a practice session:
 * Increments mastery slightly (+2.0% to +6%) without assuming the user already knows everything completely
 */
export function recordPracticeCompletion(
  userKey: string,
  topicId: string,
  totalQuestions: number,
  correctCount: number
): { delta: number; newOverall: number; updatedData: UserAcademicProgressData } {
  const currentData = loadUserProgress(userKey);
  const scorePercent = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);

  // Scaled delta: conservative and realistic
  let delta = 2.0;
  if (scorePercent >= 90) delta = 5.5;
  else if (scorePercent >= 75) delta = 4.2;
  else if (scorePercent >= 50) delta = 3.0;
  else delta = 1.5;

  let newOverall = 50;
  let topicName = 'Práctica';

  currentData.topics = currentData.topics.map(topic => {
    if (topic.id === topicId) {
      topicName = topic.name;
      const updatedOverall = Math.min(94, Math.round(topic.masteryOverall + delta));
      const updatedPractice = Math.min(92, Math.round(topic.masteryPractice + (delta * 1.3)));
      const updatedTheory = Math.min(96, Math.round(topic.masteryTheory + (delta * 0.7)));
      newOverall = updatedOverall;

      return {
        ...topic,
        masteryOverall: updatedOverall,
        masteryPractice: updatedPractice,
        masteryTheory: updatedTheory,
        completedPracticesCount: topic.completedPracticesCount + 1,
        lastUpdated: Date.now()
      };
    }
    return topic;
  });

  const newRecord: PracticeRecord = {
    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    topicId,
    topicName,
    date: Date.now(),
    totalQuestions,
    correctCount,
    scorePercent,
    deltaMastery: delta
  };

  currentData.practiceHistory.unshift(newRecord);
  saveUserProgress(userKey, currentData);

  return { delta, newOverall, updatedData: currentData };
}

/**
 * High-grade curated pool of up to 20 exercises per topic (Teórica y Práctica)
 */
export const PRACTICE_EXERCISES_REPOSITORY: Record<string, PracticeExercise[]> = {
  // 1. HISTORIA: PEDRO PABLO KUCZYNSKI (PPK) & GOBERNANTES
  'historia-ppk': [
    // Teóricas
    {
      id: 'ppk_t_1',
      topicId: 'historia-ppk',
      type: 'teorica',
      question: '¿En qué año asumió Pedro Pablo Kuczynski (PPK) la Presidencia Constitucional de la República del Perú tras ganar la segunda vuelta electoral?',
      options: [
        '2011',
        '2016',
        '2018',
        '2020'
      ],
      correctIndex: 1,
      explanation: 'PPK asumió la presidencia el 28 de julio de 2016 tras vencer en una ajustada segunda vuelta a Keiko Fujimori por un margen de apenas 42,000 votos.'
    },
    {
      id: 'ppk_t_2',
      topicId: 'historia-ppk',
      type: 'teorica',
      question: '¿Qué partido político postuló a Pedro Pablo Kuczynski en las elecciones generales de 2016?',
      options: [
        'Fuerza Popular',
        'Peruanos Por el Kambio (PPK)',
        'Alianza Popular Revolucionaria',
        'Unión por el Perú'
      ],
      correctIndex: 1,
      explanation: 'PPK postuló con el partido Peruanos Por el Kambio, utilizando sus iniciales como acrónimo de la organización política.'
    },
    {
      id: 'ppk_t_3',
      topicId: 'historia-ppk',
      type: 'teorica',
      question: 'Antes de ser Presidente del Perú, ¿qué importante cartera ministerial lideró PPK durante el gobierno de Alejandro Toledo (2001-2006)?',
      options: [
        'Ministerio de Educación y Cultura',
        'Ministerio de Economía y Finanzas (MEF) y Presidente del Consejo de Ministros',
        'Ministerio de Defensa y Relaciones Exteriores',
        'Ministerio de Salud'
      ],
      correctIndex: 1,
      explanation: 'PPK fue Ministro de Economía y Finanzas en dos periodos durante el régimen toledista y posteriormente ejerció como Presidente del Consejo de Ministros (Premier).'
    },
    {
      id: 'ppk_t_4',
      topicId: 'historia-ppk',
      type: 'teorica',
      question: '¿Qué acontecimiento político decisivo en diciembre de 2017 generó masivas protestas ciudadanas y renuncias en su propio gabinete?',
      options: [
        'El cierre del Congreso de la República',
        'El indulto humanitario otorgado al expresidente Alberto Fujimori',
        'La firma de un tratado de libre comercio',
        'La censura del ministro Jaime Saavedra'
      ],
      correctIndex: 1,
      explanation: 'La noche del 24 de diciembre de 2017, PPK concedió el indulto y derecho de gracia por razones humanitarias a Alberto Fujimori, poco después de que una facción fujimorista liderada por Kenji Fujimori se abstuviera en el primer intento de vacancia.'
    },
    {
      id: 'ppk_t_5',
      topicId: 'historia-ppk',
      type: 'teorica',
      question: '¿Quiénes fueron los dos vicepresidentes electos en la plancha presidencial de PPK en 2016?',
      options: [
        'Martín Vizcarra y Mercedes Aráoz',
        'César Villanueva y Marisol Espinoza',
        'Luis Galarreta y Rosa Bartra',
        'Francisco Sagasti y Mirtha Vásquez'
      ],
      correctIndex: 0,
      explanation: 'La plancha presidencial estuvo conformada por Martín Vizcarra Cornejo (Primer Vicepresidente) y Mercedes Aráoz Fernández (Segunda Vicepresidenta).'
    },
    {
      id: 'ppk_t_6',
      topicId: 'historia-ppk',
      type: 'teorica',
      question: '¿Cuál fue la principal característica de la composición del Congreso de la República durante el mandato de PPK que causó continua fricción política?',
      options: [
        'El partido oficialista tenía la mayoría absoluta de curules',
        'La oposición (Fuerza Popular) contaba con una abrumadora mayoría absoluta de 73 de 130 congresistas',
        'El parlamento estaba fragmentado en diez bancadas con idéntico número de votos',
        'No existía oposición partidaria activa'
      ],
      correctIndex: 1,
      explanation: 'Fuerza Popular obtuvo 73 escaños de 130, lo que derivó en un escenario de gobierno dividido con severos enfrentamientos, censura de ministros y crisis de gabinete constante.'
    },
    // Prácticas / Análisis de Casos
    {
      id: 'ppk_p_1',
      topicId: 'historia-ppk',
      type: 'practica',
      question: 'Analiza el detonante inmediato: ¿Qué revelación audiovisual en marzo de 2018 forzó la renuncia de Pedro Pablo Kuczynski antes del segundo debate de vacancia?',
      options: [
        'Los vladivideos de Montesinos',
        'Los "Mamanivideos", grabaciones encubiertas donde congresistas negociaban obras y votos contra la vacancia',
        'La interceptación de llamadas de Business Track',
        'Audios del caso Cuellos Blancos del Puerto'
      ],
      correctIndex: 1,
      explanation: 'El congresista Moisés Mamani presentó grabaciones secretas que mostraban a parlamentarios y funcionarios negociando proyectos y prebendas a cambio de votar en contra de la vacancia presidencial, lo que precipitó la renuncia de PPK el 21 de marzo de 2018.'
    },
    {
      id: 'ppk_p_2',
      topicId: 'historia-ppk',
      type: 'practica',
      question: 'En términos constitucionales peruanos, tras la renuncia de PPK aprobada por el Congreso, ¿quién asumió la Presidencia según la línea de sucesión de la Carta Magna de 1993?',
      options: [
        'El Presidente del Congreso, Luis Galarreta',
        'La Segunda Vicepresidenta, Mercedes Aráoz',
        'El Primer Vicepresidente, Martín Vizcarra, quien fungía como embajador en Canadá',
        'El Primer Ministro de turno'
      ],
      correctIndex: 2,
      explanation: 'Siguiendo el artículo 115 de la Constitución Política del Perú, el Primer Vicepresidente Martín Vizcarra juramentó como Presidente de la República el 23 de marzo de 2018.'
    },
    {
      id: 'ppk_p_3',
      topicId: 'historia-ppk',
      type: 'practica',
      question: '¿Qué vínculo comercial previo de la consultora Westfield Capital (propiedad de PPK) fue el foco de las investigaciones del caso Lava Jato que motivaron los pedidos de vacancia por incapacidad moral?',
      options: [
        'Contratos con la constructora OAS para la Vía Expresa Sur',
        'Asesorías financieras a proyectos de la empresa Odebrecht (como IIRSA e Irrigación Olmos) mientras PPK era ministro de Estado',
        'Comisiones por la venta de acciones en refinerías de petróleo',
        'Préstamos no declarados al Banco Mundial'
      ],
      correctIndex: 1,
      explanation: 'La Comisión Lava Jato reveló documentos donde Westfield Capital, empresa uninominal de Kuczynski, facturó asesorías financieras a Odebrecht entre 2004 y 2007, periodo en el que PPK era Ministro de Economía y Premier.'
    },
    {
      id: 'ppk_p_4',
      topicId: 'historia-ppk',
      type: 'practica',
      question: 'Durante el gobierno de PPK en 2017, ¿qué desastre natural azotó la costa norte del Perú, originando la creación de la Autoridad para la Reconstrucción con Cambios (ARCC)?',
      options: [
        'El Terremoto de Pisco',
        'El Fenómeno de El Niño Costero',
        'La erupción del volcán Ubinas',
        'Heladas en el altiplano de Puno'
      ],
      correctIndex: 1,
      explanation: 'A principios de 2017, El Niño Costero causó severas lluvias, huaicos e inundaciones en Piura, Lambayeque y La Libertad, lo que llevó a la creación de la ARCC.'
    }
  ],

  // 2. PROGRAMACIÓN & ALGORITMOS
  'programacion-software': [
    // Teóricas
    {
      id: 'prog_t_1',
      topicId: 'programacion-software',
      type: 'teorica',
      question: '¿Cuál es la diferencia fundamental entre una variable declarada con "const" y una declarada con "let" en JavaScript / TypeScript?',
      options: [
        '"const" tiene alcance global obligatorio y "let" tiene alcance de archivo',
        '"const" no permite la reasignación de su identificador en memoria, mientras que "let" sí permite ser reasignada',
        '"let" solo almacena números y "const" solo almacena strings',
        'No existe ninguna diferencia funcional, solo sintáctica'
      ],
      correctIndex: 1,
      explanation: 'En JavaScript moderno, const previene la reasignación de la referencia de la variable, mientras que let permite reasignar nuevos valores respetando el alcance de bloque.'
    },
    {
      id: 'prog_t_2',
      topicId: 'programacion-software',
      type: 'teorica',
      question: 'En ciencias de la computación, ¿qué representa la notación "Big O" (como O(n) o O(log n))?',
      options: [
        'El número exacto de líneas de código escritas por el programador',
        'El límite superior del crecimiento asintótico en tiempo de ejecución o espacio en memoria según el tamaño de la entrada',
        'El tamaño en bytes que ocupa el archivo fuente en el disco duro',
        'La velocidad de reloj en GHz del procesador que ejecuta el script'
      ],
      correctIndex: 1,
      explanation: 'Big O mide la complejidad temporal o espacial de un algoritmo en el peor escenario respecto al tamaño N de los datos que procesa.'
    },
    {
      id: 'prog_t_3',
      topicId: 'programacion-software',
      type: 'teorica',
      question: '¿Qué condición indispensable debe tener una función recursiva para evitar un desbordamiento de pila (Stack Overflow)?',
      options: [
        'Debe usar obligatoriamente un bucle for anidado',
        'Debe contar con al menos un caso base que termine la recursión sin realizar una nueva llamada a sí misma',
        'Debe ser ejecutada en un hilo secundario asíncrono',
        'Debe retornar siempre un número primo'
      ],
      correctIndex: 1,
      explanation: 'El caso base (base case) es el criterio de parada que detiene las llamadas recursivas y permite desapilar el stack de ejecución.'
    },
    {
      id: 'prog_t_4',
      topicId: 'programacion-software',
      type: 'teorica',
      question: 'En Programación Orientada a Objetos (POO), ¿qué principio consiste en ocultar el estado interno y obligar a interactuar mediante métodos públicos autorizados?',
      options: [
        'Polimorfismo',
        'Encapsulamiento',
        'Herencia múltiple',
        'Recursividad'
      ],
      correctIndex: 1,
      explanation: 'El encapsulamiento protege la integridad del estado interno de un objeto, limitando el acceso directo a sus atributos mediante getters, setters y métodos específicos.'
    },
    // Prácticas
    {
      id: 'prog_p_1',
      topicId: 'programacion-software',
      type: 'practica',
      question: 'Dado el array en Python: nums = [1, 2, 3, 4, 5]. ¿Qué produce la operación nums[1:4]?',
      options: [
        '[1, 2, 3]',
        '[2, 3, 4]',
        '[2, 3, 4, 5]',
        '[1, 2, 3, 4]'
      ],
      correctIndex: 1,
      explanation: 'El rebanado (slice) en Python toma desde el índice de inicio (índice 1 = valor 2) hasta antes del índice final no inclusivo (índice 4 = valor 5), produciendo [2, 3, 4].'
    },
    {
      id: 'prog_p_2',
      topicId: 'programacion-software',
      type: 'practica',
      question: '¿Qué imprime el siguiente fragmento de JavaScript?: console.log([10, 2, 5].sort());',
      options: [
        '[2, 5, 10]',
        '[10, 2, 5]',
        '[10, 5, 2]',
        'Error de tipo en consola'
      ],
      correctIndex: 1,
      explanation: 'Por defecto, Array.prototype.sort() en JS convierte los elementos a string y los ordena lexicográficamente ("10" viene antes de "2" porque empieza con "1"), por lo que da [10, 2, 5] a menos que se use una función comparadora (a, b) => a - b.'
    },
    {
      id: 'prog_p_3',
      topicId: 'programacion-software',
      type: 'practica',
      question: 'Para buscar eficientemente un elemento en una lista ya ordenada de 1,000,000 de elementos, ¿qué algoritmo ofrece complejidad O(log n)?',
      options: [
        'Búsqueda lineal secuencial',
        'Búsqueda binaria (Binary Search)',
        'Bubble Sort',
        'Búsqueda en profundidad (DFS)'
      ],
      correctIndex: 1,
      explanation: 'La búsqueda binaria divide a la mitad el rango en cada comparación, encontrando cualquier elemento en máximo ~20 operaciones (log₂ 1,000,000 ≈ 19.9).'
    },
    {
      id: 'prog_p_4',
      topicId: 'programacion-software',
      type: 'practica',
      question: '¿Qué estructura de datos opera bajo el principio LIFO (Last In, First Out)?',
      options: [
        'Cola (Queue)',
        'Pila (Stack)',
        'Árbol binario',
        'Grafo disperso'
      ],
      correctIndex: 1,
      explanation: 'Una Pila (Stack) apila elementos y el último en ingresar es el primero en salir (LIFO), como una pila de platos.'
    }
  ],

  // 3. MATEMÁTICAS: ECUACIONES Y ÁLGEBRA
  'matematicas-algebra': [
    {
      id: 'eq_t_1',
      topicId: 'matematicas-algebra',
      type: 'teorica',
      question: '¿Qué indica un discriminante Δ = b² - 4ac negativo (Δ < 0) en una ecuación cuadrática ax² + bx + c = 0 con coeficientes reales?',
      options: [
        'Tiene dos raíces reales iguales y únicas',
        'Tiene dos raíces complejas conjugadas (sin cortes con el eje X real)',
        'Tiene una raíz real y una raíz imaginaria pura',
        'La parábola pasa por el origen de coordenadas (0,0)'
      ],
      correctIndex: 1,
      explanation: 'Cuando el discriminante es estrictamente menor a cero, la raíz produce un número imaginario puro, generando dos soluciones complejas conjugadas x = (-b ± i√|Δ|) / (2a).'
    },
    {
      id: 'eq_t_2',
      topicId: 'matematicas-algebra',
      type: 'teorica',
      question: 'En la fórmula general x = (-b ± √(b² - 4ac)) / (2a), ¿qué representa geométricamente la abscisa x = -b / (2a)?',
      options: [
        'El punto de corte con el eje Y',
        'El eje de simetría y la coordenada X del vértice de la parábola',
        'La distancia entre ambas raíces',
        'La pendiente de la recta tangente en el origen'
      ],
      correctIndex: 1,
      explanation: 'La expresión x = -b/(2a) corresponde exactamente al eje de simetría de la parábola y la posición horizontal de su vértice.'
    },
    {
      id: 'eq_p_1',
      topicId: 'matematicas-algebra',
      type: 'practica',
      question: 'Calcula las raíces de la ecuación cuadrática: x² - 7x + 10 = 0 mediante factorización:',
      options: [
        'x = 2 y x = 5',
        'x = -2 y x = -5',
        'x = 1 y x = 10',
        'x = -1 y x = -10'
      ],
      correctIndex: 0,
      explanation: '(x - 2)(x - 5) = 0 ⟹ x₁ = 2, x₂ = 5. El producto es 10 y la suma es 7.'
    },
    {
      id: 'eq_p_2',
      topicId: 'matematicas-algebra',
      type: 'practica',
      question: 'Determina el valor del discriminante Δ de la ecuación: 2x² + 4x + 5 = 0:',
      options: [
        '56',
        '-24',
        '16',
        '-4'
      ],
      correctIndex: 1,
      explanation: 'Δ = b² - 4ac = 4² - 4(2)(5) = 16 - 40 = -24. Como es negativo, no tiene raíces reales.'
    }
  ],

  // 4. ASTRONOMÍA
  'astronomia-cosmos': [
    {
      id: 'ast_t_1',
      topicId: 'astronomia-cosmos',
      type: 'teorica',
      question: 'Según la Primera Ley de Kepler sobre el movimiento planetario:',
      options: [
        'Los planetas describen órbitas circulares concéntricas',
        'Los planetas describen órbitas elípticas alrededor del Sol, estando este en uno de los focos',
        'La velocidad orbital planetaria es exactamente constante en todo punto',
        'El período orbital es inversamente proporcional al radio'
      ],
      correctIndex: 1,
      explanation: 'Kepler postuló que las trayectorias de los planetas son elipses en uno de cuyos focos se encuentra el Sol.'
    },
    {
      id: 'ast_p_1',
      topicId: 'astronomia-cosmos',
      type: 'practica',
      question: 'Un telescopio tiene una distancia focal de 1000 mm y se usa un ocular de 10 mm. ¿Cuál es el aumento resultante (A = F / f)?',
      options: [
        '50x',
        '100x',
        '200x',
        '1000x'
      ],
      correctIndex: 1,
      explanation: 'Aumento = Foco objetivo / Foco ocular = 1000 / 10 = 100 aumentos.'
    }
  ]
};

/**
 * Generates an interactive practice quiz for a given topic with up to requested count (max 20)
 */
export function generatePracticeQuiz(topicId: string, requestedCount: number = 10): PracticeExercise[] {
  const pool = PRACTICE_EXERCISES_REPOSITORY[topicId] || PRACTICE_EXERCISES_REPOSITORY['historia-ppk'] || PRACTICE_EXERCISES_REPOSITORY['matematicas-algebra'];
  const count = Math.min(20, Math.max(3, requestedCount));

  // Separate theoretical and practical questions
  const teoricas = pool.filter(e => e.type === 'teorica');
  const practicas = pool.filter(e => e.type === 'practica');

  const halfCount = Math.floor(count / 2);
  const selectedTeoricas = teoricas.slice(0, halfCount);
  const selectedPracticas = practicas.slice(0, count - halfCount);

  // Combine
  const combined: PracticeExercise[] = [];
  const maxLen = Math.max(selectedTeoricas.length, selectedPracticas.length, 1);

  for (let i = 0; i < maxLen; i++) {
    if (i < selectedTeoricas.length) combined.push(selectedTeoricas[i]);
    if (i < selectedPracticas.length) combined.push(selectedPracticas[i]);
  }

  // If pool is smaller than requested, repeat with slight variations or cap
  if (combined.length < count && pool.length > 0) {
    while (combined.length < count) {
      const template = pool[combined.length % pool.length];
      combined.push({
        ...template,
        id: `${template.id}_r${combined.length}`
      });
    }
  }

  return combined.slice(0, count);
}
