import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  TrendingUp, 
  Award, 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Compass, 
  Calculator, 
  Variable, 
  BookOpen, 
  Target, 
  Flame, 
  BarChart3,
  PieChart as PieChartIcon,
  Code,
  Landmark,
  Atom,
  PenTool,
  HelpCircle,
  MessageSquareQuote,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TopicProgress, 
  PracticeRecord, 
  CognitiveProfile, 
  PracticeExercise, 
  UserAcademicProgressData 
} from '../types/progress';
import { 
  loadUserProgress, 
  recordPracticeCompletion, 
  generatePracticeQuiz,
  analyzeChatSessionsForProgress
} from '../lib/progressStorage';
import { UserSession, ChatSessionItem } from '../types';

interface ProgressDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  sessions?: ChatSessionItem[];
}

type TabType = 'overview' | 'charts' | 'topics' | 'practice' | 'history';
type ChartViewType = 'bars' | 'pie';

const PIE_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#a855f7', '#f43f5e', '#6366f1'];

export const ProgressDashboardModal: React.FC<ProgressDashboardModalProps> = ({
  isOpen,
  onClose,
  userSession,
  sessions
}) => {
  const userKey = userSession.email || 'guest';
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [chartView, setChartView] = useState<ChartViewType>('bars');
  const [progressData, setProgressData] = useState<UserAcademicProgressData | null>(null);

  // Practice State
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isPracticing, setIsPracticing] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<PracticeExercise[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<Record<number, boolean>>({});
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [lastPracticeResult, setLastPracticeResult] = useState<{
    score: number;
    total: number;
    delta: number;
    newOverall: number;
  } | null>(null);

  // Load progress
  useEffect(() => {
    if (isOpen) {
      if (sessions && sessions.length > 0) {
        analyzeChatSessionsForProgress(userKey, sessions);
      }
      const data = loadUserProgress(userKey);
      setProgressData(data);
      if (data.topics && data.topics.length > 0 && !selectedTopicId) {
        setSelectedTopicId(data.topics[0].id);
      }
    }
  }, [isOpen, userKey, selectedTopicId, sessions]);

  if (!isOpen || !progressData) return null;

  const { topics, cognitiveProfile, practiceHistory } = progressData;
  const hasRealTopics = topics && topics.length > 0;

  // Chart data preparation
  const barChartData = topics.map(t => ({
    name: t.name.length > 22 ? t.name.slice(0, 20) + '…' : t.name,
    fullName: t.name,
    course: t.course,
    subtopic: t.subtopic,
    teoria: t.masteryTheory,
    practica: t.masteryPractice,
    overall: t.masteryOverall
  }));

  const pieChartData = topics.map(t => ({
    name: t.course + ': ' + (t.concept || t.subtopic),
    value: Math.max(1, t.theoryQuestionsCount + t.practiceRequestsCount),
    mastery: t.masteryOverall
  }));

  // Start Practice
  const handleStartPractice = (topicId: string, count: number) => {
    if (!topicId && hasRealTopics) {
      topicId = topics[0].id;
    }
    const questions = generatePracticeQuiz(topicId, count);
    setQuizQuestions(questions);
    setSelectedTopicId(topicId);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsAnswerSubmitted({});
    setQuizFinished(false);
    setLastPracticeResult(null);
    setIsPracticing(true);
  };

  // Submit Answer for Current Question
  const handleSelectOption = (optionIndex: number) => {
    if (isAnswerSubmitted[currentQuestionIndex]) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    setIsAnswerSubmitted(prev => ({ ...prev, [currentQuestionIndex]: true }));
  };

  // Finish Practice and Record Progress
  const handleFinishPractice = () => {
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    const result = recordPracticeCompletion(userKey, selectedTopicId, quizQuestions.length, correctCount);
    setLastPracticeResult({
      score: correctCount,
      total: quizQuestions.length,
      delta: result.delta,
      newOverall: result.newOverall
    });
    setProgressData(result.updatedData);
    setQuizFinished(true);
  };

  const getTopicIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Landmark': return <Landmark className="w-5 h-5 text-rose-400" />;
      case 'Code': return <Code className="w-5 h-5 text-cyan-400" />;
      case 'Calculator': return <Calculator className="w-5 h-5 text-amber-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-sky-400" />;
      case 'Variable': return <Variable className="w-5 h-5 text-emerald-400" />;
      case 'Atom': return <Atom className="w-5 h-5 text-indigo-400" />;
      case 'PenTool': return <PenTool className="w-5 h-5 text-purple-400" />;
      default: return <BookOpen className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090b14] border border-zinc-800/90 shadow-2xl text-zinc-100 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-zinc-800/80 flex items-center justify-between bg-[#0e111d]/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">Mi Progreso Académico</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                  IA Cognitiva Real
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Clasificación autónoma de materias, subtemas, teoría vs. práctica y fortalezas reales
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        {!isPracticing && (
          <div className="px-5 sm:px-6 pt-3 border-b border-zinc-800/60 bg-[#0c0e18] flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'overview'
                  ? 'border-cyan-400 text-cyan-300 bg-zinc-800/40'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>Resumen y Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('charts')}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'charts'
                  ? 'border-cyan-400 text-cyan-300 bg-zinc-800/40'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Gráficas Estadísticas</span>
              {hasRealTopics && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  {topics.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('topics')}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'topics'
                  ? 'border-cyan-400 text-cyan-300 bg-zinc-800/40'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Cursos y Subtemas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('practice')}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'practice'
                  ? 'border-cyan-400 text-cyan-300 bg-zinc-800/40'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span>Modo Práctica</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                Hasta 20
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'history'
                  ? 'border-cyan-400 text-cyan-300 bg-zinc-800/40'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Historial ({practiceHistory.length})</span>
            </button>
          </div>
        )}

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* VIEW: PRACTICE QUIZ IN PROGRESS */}
          {isPracticing ? (
            <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-150">
              {quizFinished && lastPracticeResult ? (
                /* Practice Finished Summary */
                <div className="p-6 rounded-3xl bg-[#111422] border border-cyan-500/30 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Award className="w-8 h-8 text-emerald-400" />
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      ¡Práctica Registrada en tu Expediente!
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      Has acertado {lastPracticeResult.score} de {lastPracticeResult.total} preguntas (
                      {Math.round((lastPracticeResult.score / lastPracticeResult.total) * 100)}%)
                    </h3>
                  </div>

                  {/* Calibration explanation */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 text-left text-xs space-y-2 text-zinc-300">
                    <div className="flex items-center justify-between text-sm font-semibold text-white">
                      <span>Incremento Ponderado a tu Dominio Real:</span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        +{lastPracticeResult.delta}%
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      💡 <strong>Principio de Aprendizaje Real:</strong> Tu promedio sube moderadamente a <strong>{lastPracticeResult.newOverall}%</strong>. La IA no asume que ya lo sabes al 100% de inmediato: la retención y la resolución autónoma requieren consolidación continua a lo largo del tiempo.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPracticing(false)}
                      className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Volver a Mi Progreso
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartPractice(selectedTopicId, questionCount)}
                      className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reintentar Práctica</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Question Screen */
                <div>
                  {/* Top Bar of Quiz */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        quizQuestions[currentQuestionIndex]?.type === 'teorica'
                          ? 'bg-purple-950/80 border border-purple-800 text-purple-300'
                          : 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                      }`}>
                        {quizQuestions[currentQuestionIndex]?.type === 'teorica' ? 'Pregunta Teórica' : 'Ejercicio Práctico'}
                      </span>
                      <span className="text-xs text-zinc-400">
                        Pregunta {currentQuestionIndex + 1} de {quizQuestions.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPracticing(false)}
                      className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Salir de la práctica
                    </button>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-5">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>

                  {/* Question Card */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-[#111422] border border-zinc-800/90 shadow-xl space-y-5">
                    <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                      {quizQuestions[currentQuestionIndex]?.question}
                    </h3>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {quizQuestions[currentQuestionIndex]?.options.map((option, idx) => {
                        const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                        const isSubmitted = isAnswerSubmitted[currentQuestionIndex];
                        const isCorrect = idx === quizQuestions[currentQuestionIndex].correctIndex;

                        let btnStyle = 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-600';
                        if (isSubmitted) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-medium';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                          } else {
                            btnStyle = 'bg-zinc-900/50 border-zinc-800/50 text-zinc-500';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-cyan-950/80 border-cyan-500 text-cyan-200';
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectOption(idx)}
                            disabled={isSubmitted}
                            className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-xs sm:text-sm flex items-start justify-between gap-3 transition-all cursor-pointer ${btnStyle}`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-[11px] font-mono flex items-center justify-center flex-shrink-0 text-zinc-300">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="pt-0.5 leading-relaxed">{option}</span>
                            </div>

                            {isSubmitted && isCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            )}
                            {isSubmitted && isSelected && !isCorrect && (
                              <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback & Explanation */}
                    {isAnswerSubmitted[currentQuestionIndex] && (
                      <div className="p-4 rounded-2xl bg-[#090b14] border border-zinc-800/90 text-xs space-y-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 font-bold">
                          {selectedAnswers[currentQuestionIndex] === quizQuestions[currentQuestionIndex].correctIndex ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> ¡Correcto!
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1">
                              <XCircle className="w-4 h-4" /> Respuesta Incorrecta
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                          {quizQuestions[currentQuestionIndex]?.explanation}
                        </p>
                      </div>
                    )}

                    {/* Quiz Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 text-xs transition-colors cursor-pointer"
                      >
                        Anterior
                      </button>

                      {currentQuestionIndex < quizQuestions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                          disabled={!isAnswerSubmitted[currentQuestionIndex]}
                          className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-zinc-950 font-bold text-xs transition-all cursor-pointer shadow-md"
                        >
                          Siguiente Pregunta
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleFinishPractice}
                          disabled={!isAnswerSubmitted[currentQuestionIndex]}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Finalizar y Calibrar Progreso</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'overview' ? (
            /* TAB: OVERVIEW & COGNITIVE PROFILE */
            <div className="space-y-6">
              {/* Cognitive & Vocational Profile Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#121626] to-[#0c0e18] border border-cyan-500/30 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
                      <Flame className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Perfil Vocacional & Potencial Cognitivo
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {cognitiveProfile.potentialTitle}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {cognitiveProfile.primaryField}
                      </p>
                    </div>
                  </div>

                  {hasRealTopics && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('charts')}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto shadow-md"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Ver Gráficas</span>
                    </button>
                  )}
                </div>

                {/* AI Cognitive Observation Summary */}
                <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed">
                  <p className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    Estudio de tus interacciones por la IA:
                  </p>
                  <p>{cognitiveProfile.aiCognitiveSummary}</p>
                </div>

                {/* Detected Passions & Intentions Tags */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-zinc-400 mr-1">
                    Inclinaciones Detectadas:
                  </span>
                  {cognitiveProfile.passions.map((passion, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-950/70 border border-cyan-800 text-cyan-200"
                    >
                      ✦ {passion}
                    </span>
                  ))}
                </div>
              </div>

              {/* REAL TOPICS OR EMPTY STATE */}
              {!hasRealTopics ? (
                /* Clean zero-state with no fake topics */
                <div className="p-8 rounded-3xl bg-[#101322] border border-dashed border-zinc-800 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <MessageSquareQuote className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h4 className="text-base font-bold text-white">
                      Tu progreso nace de tus preguntas en el chat
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Aquí no hay materias simuladas ni ficticias. Cuando conversas con DANAEL en el chat, la IA clasifica automáticamente cada tema, detecta si preguntas teoría o práctica y mide tus fortalezas reales.
                    </p>
                  </div>

                  {/* Suggestions cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                        <Landmark className="w-4 h-4 text-rose-400" />
                        <span>Historia</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Prueba preguntando: <em>"Dime la historia de PPK"</em> o personajes políticos del Perú.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                        <Code className="w-4 h-4 text-cyan-400" />
                        <span>Programación</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Prueba pidiendo: <em>"Cómo programo una función recursiva en Python o JavaScript"</em>.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <Calculator className="w-4 h-4 text-amber-400" />
                        <span>Matemáticas</span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Prueba preguntando: <em>"¿Cómo se halla la raíz de una ecuación cuadrática?"</em>.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Topic cards with Real Topics */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Materias y Cursos Detectados en tu Chat
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Clasificación jerárquica: Curso → Subtema → Concepto Específico
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {topics.length} curso(s) activo(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topics.map((topic) => (
                      <div 
                        key={topic.id}
                        className="p-5 rounded-3xl bg-[#101322] border border-zinc-800/90 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div>
                          {/* Course Badge & Concept */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2.5 rounded-2xl bg-zinc-800/80 border border-zinc-700/80">
                                {getTopicIcon(topic.iconName)}
                              </div>
                              <div>
                                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-cyan-300 border border-zinc-700">
                                  CURSO: {topic.course.toUpperCase()}
                                </span>
                                <h5 className="text-sm font-bold text-white mt-1">{topic.name}</h5>
                                <p className="text-[11px] text-zinc-400">
                                  Subtema: {topic.subtopic}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-base font-extrabold text-white font-mono">
                                {topic.masteryOverall}%
                              </span>
                              <p className="text-[10px] text-zinc-500">Dominio Real</p>
                            </div>
                          </div>

                          {/* Concept Highlight */}
                          <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 text-xs text-zinc-300">
                            <span className="text-[10px] uppercase font-mono text-zinc-500 block">
                              Enfoque / Concepto Clave:
                            </span>
                            <span className="font-semibold text-white">{topic.concept}</span>
                          </div>

                          {/* Teórica vs Práctica breakdown */}
                          <div className="grid grid-cols-2 gap-2 text-xs pt-3">
                            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/50">
                              <span className="text-purple-300 block text-[11px] font-semibold">
                                Nivel Teórico: {topic.masteryTheory}%
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                {topic.theoryQuestionsCount} consulta(s) conceptuales
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50">
                              <span className="text-emerald-300 block text-[11px] font-semibold">
                                Nivel Práctico: {topic.masteryPractice}%
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                {topic.practiceRequestsCount > 0 ? 'Conocimiento a medias (~50%)' : 'Sin ejercicios delegados'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Button to practice this specific topic */}
                        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                          <span className="text-[11px] text-zinc-400">
                            Prácticas rendidas: <strong>{topic.completedPracticesCount}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTopicId(topic.id);
                              setActiveTab('practice');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Target className="w-3.5 h-3.5 text-amber-400" />
                            <span>Practicar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'charts' ? (
            /* TAB: REAL CHARTS (BARS & CIRCULAR / DONUT) */
            <div className="space-y-6">
              {!hasRealTopics ? (
                <div className="p-8 rounded-3xl bg-[#101322] border border-dashed border-zinc-800 text-center space-y-3">
                  <BarChart3 className="w-10 h-10 text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No hay datos gráficos aún</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Las gráficas se generarán en cuanto converses con DANAEL en el chat sobre cualquier tema (Historia de PPK, Programación, etc.).
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Chart View Toggle Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#101322] border border-zinc-800">
                    <div>
                      <h4 className="text-sm font-bold text-white">Visualización Gráfica del Aprendizaje</h4>
                      <p className="text-xs text-zinc-400">
                        Comparación directa de Dominio Teórico vs. Práctico y Distribución Temática
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setChartView('bars')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          chartView === 'bars'
                            ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Gráfica de Barras</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChartView('pie')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          chartView === 'pie'
                            ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <PieChartIcon className="w-3.5 h-3.5" />
                        <span>Gráfica Circular</span>
                      </button>
                    </div>
                  </div>

                  {/* VIEW 1: BAR CHART (Teoría vs Práctica) */}
                  {chartView === 'bars' && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-[#101322] border border-zinc-800/90 shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-cyan-400" />
                          <h5 className="text-sm font-bold text-white">
                            Comparativa: Dominio Teórico vs. Dominio Práctico (%)
                          </h5>
                        </div>
                        <span className="text-[11px] text-zinc-500">
                          Escala 0% a 100%
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        📊 La barra <strong>Teórica (Azul cian)</strong> refleja tus preguntas conceptuales. La barra <strong>Práctica (Verde esmeralda)</strong> refleja tu resolución: si pides que la IA te resuelva los ejercicios, se calibra a medias (~45-50%), subiendo progresivamente con el Modo Práctica.
                      </p>

                      <div className="w-full h-72 sm:h-80 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barChartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              stroke="#71717a" 
                              fontSize={11}
                              tickLine={false}
                            />
                            <YAxis 
                              stroke="#71717a" 
                              fontSize={11} 
                              domain={[0, 100]} 
                              tickLine={false}
                              unit="%"
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#090b14', 
                                borderColor: '#3f3f46',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#f4f4f5'
                              }}
                              formatter={(value: any, name: string) => [
                                `${value}%`, 
                                name === 'teoria' ? 'Dominio Teórico' : 'Dominio Práctico'
                              ]}
                              labelFormatter={(_, payload) => {
                                if (payload && payload.length > 0) {
                                  return (payload[0].payload as any).fullName || '';
                                }
                                return '';
                              }}
                            />
                            <Legend 
                              verticalAlign="top" 
                              height={36} 
                              formatter={(value) => (
                                <span className="text-xs text-zinc-300">
                                  {value === 'teoria' ? 'Dominio Teórico (%)' : 'Dominio Práctico (%)'}
                                </span>
                              )}
                            />
                            <Bar 
                              dataKey="teoria" 
                              name="teoria" 
                              fill="#38bdf8" 
                              radius={[6, 6, 0, 0]} 
                              maxBarSize={45} 
                            />
                            <Bar 
                              dataKey="practica" 
                              name="practica" 
                              fill="#34d399" 
                              radius={[6, 6, 0, 0]} 
                              maxBarSize={45} 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: PIE / DONUT CHART (Distribución de Materias) */}
                  {chartView === 'pie' && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-[#101322] border border-zinc-800/90 shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PieChartIcon className="w-5 h-5 text-amber-400" />
                          <h5 className="text-sm font-bold text-white">
                            Distribución de tu Aprendizaje por Cursos y Materias
                          </h5>
                        </div>
                        <span className="text-[11px] text-zinc-500">
                          Basado en tus consultas reales
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        🥧 Proporción del volumen de interacciones y conceptos estudiados en el chat. Cada gajo representa un curso autónomo detectado.
                      </p>

                      <div className="w-full h-72 sm:h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={65}
                              outerRadius={105}
                              paddingAngle={4}
                              dataKey="value"
                              label={({ name, percent }: { name: string; percent: number }) => 
                                `${name.split(':')[0]} (${((percent || 0) * 100).toFixed(0)}%)`
                              }
                            >
                              {pieChartData.map((_, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={PIE_COLORS[index % PIE_COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#090b14', 
                                borderColor: '#3f3f46',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#f4f4f5'
                              }}
                              formatter={(value: any, name: string) => [
                                `${value} consulta(s)`, 
                                name
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'topics' ? (
            /* TAB: TOPIC DETAILS (FORTALEZAS & COSAS POR MEJORAR) */
            <div className="space-y-6">
              {!hasRealTopics ? (
                <div className="p-8 rounded-3xl bg-[#101322] border border-dashed border-zinc-800 text-center space-y-3">
                  <BookOpen className="w-10 h-10 text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No hay cursos registrados</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Conversa con DANAEL en el chat sobre Historia de PPK, Programación o Matemáticas para desglosar tus fortalezas y debilidades reales.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Diagnóstico Cognitivo: En qué eres bueno y en qué debes mejorar
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Evaluación detallada por cada materia detectada en tus conversaciones
                    </p>
                  </div>

                  {topics.map(topic => (
                    <div 
                      key={topic.id}
                      className="p-5 sm:p-6 rounded-3xl bg-[#101322] border border-zinc-800/90 shadow-xl space-y-4"
                    >
                      {/* Topic Header with Course hierarchy */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-2xl bg-zinc-800 border border-zinc-700">
                            {getTopicIcon(topic.iconName)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                CURSO: {topic.course.toUpperCase()}
                              </span>
                              <span className="text-xs text-zinc-400">
                                Subtema: {topic.subtopic}
                              </span>
                            </div>
                            <h5 className="text-base font-bold text-white mt-1">
                              {topic.name}
                            </h5>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-xl font-bold font-mono text-cyan-400">
                            {topic.masteryOverall}%
                          </span>
                          <span className="text-xs text-zinc-400 block">Dominio Ponderado</span>
                        </div>
                      </div>

                      {/* AI Reasoning for this topic */}
                      <div className="p-3.5 rounded-2xl bg-black/40 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                        <span className="text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
                          <Brain className="w-3.5 h-3.5" />
                          Dictamen de la IA sobre tu avance:
                        </span>
                        <p>{topic.reasoningSummary}</p>
                      </div>

                      {/* Strengths & Weaknesses (Bueno vs Malo) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* En qué eres bueno */}
                        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/60 space-y-2">
                          <h6 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-400" />
                            En qué cosas eres bueno (Fortalezas)
                          </h6>
                          <ul className="space-y-1.5 text-xs text-zinc-300">
                            {topic.strengths.map((str, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span className="leading-relaxed">{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* En qué eres débil / Por mejorar */}
                        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/60 space-y-2">
                          <h6 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            En qué eres débil o debes reforzar
                          </h6>
                          <ul className="space-y-1.5 text-xs text-zinc-300">
                            {topic.weaknesses.map((weak, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-amber-400 font-bold">•</span>
                                <span className="leading-relaxed">{weak}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Sample queries that gave birth to this topic */}
                      {topic.sampleQueries && topic.sampleQueries.length > 0 && (
                        <div className="pt-2 text-xs text-zinc-400">
                          <span className="text-[11px] font-mono uppercase text-zinc-500 block mb-1">
                            Consultas reales registradas en tu chat:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {topic.sampleQueries.map((q, qIdx) => (
                              <span 
                                key={qIdx}
                                className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300 font-mono text-[11px]"
                              >
                                "{q}"
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'practice' ? (
            /* TAB: PRACTICE SELECTION */
            <div className="max-w-xl mx-auto space-y-6">
              {!hasRealTopics ? (
                <div className="p-8 rounded-3xl bg-[#101322] border border-dashed border-zinc-800 text-center space-y-3">
                  <Target className="w-10 h-10 text-zinc-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Práctica no disponible aún</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Conversa primero sobre cualquier tema (Historia de PPK, Programación, etc.) para habilitar ejercicios contextualizados.
                  </p>
                </div>
              ) : (
                <div className="p-6 sm:p-7 rounded-3xl bg-[#101322] border border-zinc-800 shadow-xl space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <Target className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Configura tu Sesión de Práctica</h3>
                      <p className="text-xs text-zinc-400">
                        Elige la materia y la cantidad de ejercicios (hasta 20)
                      </p>
                    </div>
                  </div>

                  {/* Topic Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300">
                      Selecciona la materia a ejercitar:
                    </label>
                    <div className="space-y-2">
                      {topics.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTopicId(t.id)}
                          className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            selectedTopicId === t.id
                              ? 'bg-cyan-950/70 border-cyan-500 text-white'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {getTopicIcon(t.iconName)}
                            <div>
                              <p className="text-xs font-bold text-white">{t.name}</p>
                              <p className="text-[10px] text-zinc-400">{t.course} • {t.concept || t.subtopic}</p>
                            </div>
                          </div>

                          <span className="text-xs font-mono font-bold text-cyan-300">
                            {t.masteryOverall}%
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Count Selector (5, 10, 15, 20) */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                      <span>Cantidad de preguntas:</span>
                      <span className="text-cyan-400 font-mono font-bold">{questionCount} ejercicios</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 15, 20].map(count => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setQuestionCount(count)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            questionCount === count
                              ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start Button */}
                  <button
                    type="button"
                    onClick={() => handleStartPractice(selectedTopicId, questionCount)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-zinc-950 font-bold text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    <span>Comenzar Práctica ({questionCount} Preguntas)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* TAB: HISTORY */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Historial de Prácticas Rendidas
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Registro formal de evaluaciones de conocimiento
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {practiceHistory.length} práctica(s) archivadas
                </span>
              </div>

              {practiceHistory.length === 0 ? (
                <div className="p-8 rounded-3xl bg-[#101322] border border-dashed border-zinc-800 text-center space-y-2">
                  <Award className="w-8 h-8 text-zinc-600 mx-auto" />
                  <h5 className="text-xs font-bold text-white">Sin historial de prácticas aún</h5>
                  <p className="text-[11px] text-zinc-400">
                    Completa una sesión en el Modo Práctica para registrar tus calificaciones ponderadas.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {practiceHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#101322] border border-zinc-800/90 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{item.topicName}</p>
                          <p className="text-[10px] text-zinc-400">
                            {new Date(item.date).toLocaleDateString()} a las {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-emerald-400 font-mono text-sm">
                          {item.scorePercent}%
                        </span>
                        <p className="text-[10px] text-zinc-500">
                          {item.correctCount}/{item.totalQuestions} aciertos (+{item.deltaMastery}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
