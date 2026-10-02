export type ExerciseType = 'teorica' | 'practica';

export interface TopicProgress {
  id: string;
  course: string;       // e.g. "Historia", "Programación", "Matemáticas"
  subtopic: string;     // e.g. "Historia Contemporánea / Personajes Políticos"
  concept: string;      // e.g. "Pedro Pablo Kuczynski (PPK) - Trayectoria y Gobierno"
  name: string;         // Display name
  category: string;     // Alias to course
  iconName?: string;
  masteryOverall: number; // 0 - 100
  masteryTheory: number;  // 0 - 100
  masteryPractice: number; // 0 - 100
  theoryQuestionsCount: number;
  practiceRequestsCount: number;
  completedPracticesCount: number;
  strengths: string[];    // En qué cosas es bueno
  weaknesses: string[];   // En qué cosas es débil / necesita mejorar
  reasoningSummary: string; // Explicación de la IA
  sampleQueries?: string[]; // Consultas reales del usuario que originaron este tema
  lastUpdated: number;
}

export interface PracticeExercise {
  id: string;
  topicId: string;
  type: ExerciseType;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface PracticeRecord {
  id: string;
  topicId: string;
  topicName: string;
  date: number;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  deltaMastery: number; // e.g. +3.5%
}

export interface CognitiveProfile {
  potentialTitle: string; // e.g. "Perfil: Analista Histórico-Político" o "Potencial Investigador"
  primaryField: string;
  passions: string[];
  dominantCompetencies: string[];
  areasToReinforce: string[];
  aiCognitiveSummary: string;
  totalInteractionsAnalyzed: number;
  lastAnalysisDate: number;
}

export interface UserAcademicProgressData {
  topics: TopicProgress[];
  practiceHistory: PracticeRecord[];
  cognitiveProfile: CognitiveProfile;
}

