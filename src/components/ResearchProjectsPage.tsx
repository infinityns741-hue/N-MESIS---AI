import React, { useState, useMemo, useEffect } from 'react';
import {
  FlaskConical,
  Search,
  ArrowLeft,
  X,
  Users,
  Building2,
  Calendar,
  Sparkles,
  BookOpen,
  CheckCircle2,
  MessageSquare,
  Brain,
  PlusCircle,
  TrendingUp,
  Check,
  AlertTriangle,
  Send,
  UserCheck
} from 'lucide-react';
import { UserSession } from '../types';
import { UserAvatar } from './UserAvatar';

interface ResearchProjectsPageProps {
  session: UserSession;
  onBack: () => void;
  onOpenChatWithAdvisor?: (advisorEmail: string) => void;
}

export interface ResearchProject {
  id: string;
  code: string;
  title: string;
  category: 'fisica' | 'ia' | 'energias' | 'robotica' | 'biotech';
  categoryLabel: string;
  advisor: {
    name: string;
    email: string;
    department: string;
  };
  studentResearchers: string[];
  status: 'Convocatoria Abierta' | 'En Desarrollo' | 'Fase Experimental' | 'Publicación Indexada';
  labName: string;
  summary: string;
  keywords: string[];
  startDate: string;
}

export const INITIAL_RESEARCH_PROJECTS: ResearchProject[] = [
  {
    id: 'proj-fis-01',
    code: 'UNSAAC-INV-042',
    title: 'Modelamiento y Análisis Numérico de Ondas Gravitatorias y Dinámica de Fluidos en la Alta Atmósfera Andina',
    category: 'fisica',
    categoryLabel: 'Física y Astrofísica',
    advisor: {
      name: 'Dr. Leoncio Mendoza Flores',
      email: '109923@unsaac.edu.pe',
      department: 'Departamento Académico de Física'
    },
    studentResearchers: ['Renato Condori Huallpa', 'Lucía Farfán Cárdenas'],
    status: 'En Desarrollo',
    labName: 'Laboratorio de Mecánica y Ondas (Pabellón C, Perayoc)',
    summary: 'Investigación experimental y computacional de perfiles cinemáticos y fenómenos oscilatorios en microclimas de Cusco mediante ecuaciones diferenciales parciales y sensores barométricos de precisión.',
    keywords: ['Cinemática', 'Mecánica de Fluidos', 'Cálculo Numérico', 'Simulación'],
    startDate: 'Marzo 2025'
  },
  {
    id: 'proj-ia-02',
    code: 'UNSAAC-INV-118',
    title: 'Redes Neuronales Convolucionales y Transformers para Diagnóstico Geofísico de Fallas en la Cuenca de Cusco',
    category: 'ia',
    categoryLabel: 'Inteligencia Artificial',
    advisor: {
      name: 'Dr. Juvenal Valdivia Quispe',
      email: '112890@unsaac.edu.pe',
      department: 'Ingeniería Informática y Sistemas'
    },
    studentResearchers: ['Camila Quispe Almirón', 'Jhonatan Quispe Condori'],
    status: 'Convocatoria Abierta',
    labName: 'Centro de Cómputo de Alto Rendimiento e Inteligencia Artificial',
    summary: 'Desarrollo de algoritmos de Deep Learning y visión computacional entrenados con datos sísmicos del IGP para predecir desplazamientos tectónicos y deslizamientos en la región sur del Perú.',
    keywords: ['Deep Learning', 'PyTorch', 'Geotecnia', 'Big Data'],
    startDate: 'Enero 2025'
  },
  {
    id: 'proj-ene-03',
    code: 'UNSAAC-INV-087',
    title: 'Optimización de Celdas Fotovoltaicas de Perovskita para Alta Radiación UV en Altura Solar (>3300 msnm)',
    category: 'energias',
    categoryLabel: 'Energías Renovables',
    advisor: {
      name: 'Dr. Leoncio Mendoza Flores',
      email: '109923@unsaac.edu.pe',
      department: 'Departamento Académico de Física'
    },
    studentResearchers: ['Álvaro Huamán Ttito', 'Katherine Soto Cárdenas'],
    status: 'Fase Experimental',
    labName: 'Laboratorio de Óptica y Estado Sólido',
    summary: 'Diseño y caracterización de nanoestructuras de perovskita para maximizar la absorción del espectro ultravioleta característico de la sierra andina peruana, aumentando el rendimiento en un 18%.',
    keywords: ['Perovskita', 'Energía Solar', 'Óptica', 'Semiconductores'],
    startDate: 'Noviembre 2024'
  },
  {
    id: 'proj-rob-04',
    code: 'UNSAAC-INV-201',
    title: 'Desarrollo de Rover Autónomo con Cinemática Diferencial y ROS 2 para Exploración de Terrenos Escarpados',
    category: 'robotica',
    categoryLabel: 'Robótica y Mecatrónica',
    advisor: {
      name: 'Dr. Juvenal Valdivia Quispe',
      email: '112890@unsaac.edu.pe',
      department: 'Ingeniería Mecánica y Electrónica'
    },
    studentResearchers: ['Marco Antonio Álvarez Miranda', 'Renato Condori Huallpa'],
    status: 'Convocatoria Abierta',
    labName: 'Taller de Prototipado y Robótica Móvil',
    summary: 'Construcción de chasis balancín con suspensión tipo rocker-bogie, LiDAR 3D e integración de control PID adaptativo para navegación autónoma en topografías accidentadas.',
    keywords: ['ROS 2', 'LiDAR', 'Control PID', 'Cinemática Inversa'],
    startDate: 'Febrero 2025'
  },
  {
    id: 'proj-bio-05',
    code: 'UNSAAC-INV-312',
    title: 'Biorremediación de Aguas Residuales Mineras con Microalgas Nativas y Reactores de Flujo Continuo',
    category: 'biotech',
    categoryLabel: 'Biotecnología y Medio Ambiente',
    advisor: {
      name: 'Dra. Rosa Huayta Quispe',
      email: '114502@unsaac.edu.pe',
      department: 'Ingeniería Química y Ambiental'
    },
    studentResearchers: ['Katherine Soto Cárdenas', 'Luciana Estrada Ríos'],
    status: 'Publicación Indexada',
    labName: 'Laboratorio de Biotecnología y Análisis Químico',
    summary: 'Aislamiento de cepas de Chlorella sp. en lagunas altoandinas para bioabsorción de metales pesados (plomo y arsénico) con una eficiencia comprobada del 94.2% a escala piloto.',
    keywords: ['Biorremediación', 'Microalgas', 'Metales Pesados', 'Química Ambiental'],
    startDate: 'Agosto 2024'
  }
];

export const ResearchProjectsPage: React.FC<ResearchProjectsPageProps> = ({
  session,
  onBack,
  onOpenChatWithAdvisor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);

  // Modals
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showAnalyzeModal, setShowAnalyzeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  // Form for creating/editing a research center
  const [newCenterTitle, setNewCenterTitle] = useState('');
  const [newCenterAdvisor, setNewCenterAdvisor] = useState(session.fullName || 'Dr. Catedrático UNSAAC');
  const [newCenterLab, setNewCenterLab] = useState('Laboratorio de Investigación');
  const [newCenterStartDate, setNewCenterStartDate] = useState('Abril 2025');
  const [newCenterCategory, setNewCenterCategory] = useState<'fisica' | 'ia' | 'energias' | 'robotica' | 'biotech'>('fisica');
  const [newCenterSummary, setNewCenterSummary] = useState('');

  // Persisted custom centers
  const [projectsList, setProjectsList] = useState<ResearchProject[]>(() => {
    try {
      const saved = localStorage.getItem('unsaac_custom_research_centers_v2');
      if (saved) {
        const custom = JSON.parse(saved);
        return [...custom, ...INITIAL_RESEARCH_PROJECTS];
      }
    } catch {
      // ignore
    }
    return INITIAL_RESEARCH_PROJECTS;
  });

  // Track applied projects
  const [appliedProjects, setAppliedProjects] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('unsaac_research_applied_projects');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Check if interest was previously registered
  useEffect(() => {
    try {
      const saved = localStorage.getItem('unsaac_interest_registered');
      if (saved === 'true') {
        setInterestSent(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleApplyToProject = (projectId: string) => {
    const next = { ...appliedProjects, [projectId]: true };
    setAppliedProjects(next);
    try {
      localStorage.setItem('unsaac_research_applied_projects', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleRegisterInterest = () => {
    setInterestSent(true);
    try {
      localStorage.setItem('unsaac_interest_registered', 'true');
    } catch {
      // ignore
    }
  };

  const handleCreateCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterTitle.trim()) return;

    const newCode = `UNSAAC-CEN-${Math.floor(100 + Math.random() * 900)}`;
    const newProj: ResearchProject = {
      id: `proj-custom-${Date.now()}`,
      code: newCode,
      title: newCenterTitle.trim(),
      category: newCenterCategory,
      categoryLabel:
        newCenterCategory === 'fisica' ? 'Física y Ondas' :
        newCenterCategory === 'ia' ? 'Inteligencia Artificial' :
        newCenterCategory === 'energias' ? 'Energías Renovables' :
        newCenterCategory === 'robotica' ? 'Robótica y Automatización' : 'Biotecnología',
      advisor: {
        name: newCenterAdvisor.trim() || 'Docente Investigador',
        email: session.email || 'investigacion@unsaac.edu.pe',
        department: 'Facultad de Ciencias e Ingeniería'
      },
      studentResearchers: [session.fullName || 'Estudiante UNSAAC'],
      status: 'Convocatoria Abierta',
      labName: newCenterLab.trim() || 'Laboratorio Central',
      summary: newCenterSummary.trim() || 'Centro de investigación académica y desarrollo científico en la UNSAAC.',
      keywords: ['Investigación', 'UNSAAC', 'Ciencia'],
      startDate: newCenterStartDate.trim() || 'Abril 2025'
    };

    const nextList = [newProj, ...projectsList];
    setProjectsList(nextList);

    try {
      const customOnly = nextList.filter(p => p.id.startsWith('proj-custom-'));
      localStorage.setItem('unsaac_custom_research_centers_v2', JSON.stringify(customOnly));
    } catch {
      // ignore
    }

    setShowCreateModal(false);
    setNewCenterTitle('');
    setNewCenterSummary('');
  };

  const categories = [
    { id: 'all', label: 'Todos los centros' },
    { id: 'fisica', label: 'Física y Ondas' },
    { id: 'ia', label: 'Inteligencia Artificial' },
    { id: 'energias', label: 'Energías Renovables' },
    { id: 'robotica', label: 'Robótica y Automatización' },
    { id: 'biotech', label: 'Biotecnología' },
  ];

  const filteredProjects = useMemo(() => {
    return projectsList.filter((proj) => {
      const matchCat = selectedCategory === 'all' || proj.category === selectedCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        proj.title.toLowerCase().includes(q) ||
        proj.advisor.name.toLowerCase().includes(q) ||
        proj.code.toLowerCase().includes(q) ||
        proj.labName.toLowerCase().includes(q) ||
        proj.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [projectsList, selectedCategory, searchQuery]);

  const studentResolvedName = session.fullName || 'JHONATAN QUISPE CONDORI';

  return (
    <div className="fixed inset-0 z-50 bg-[#060914] text-white flex flex-col overflow-hidden font-sans select-none animate-in fade-in duration-200">
      {/* Top Bar Header */}
      <header className="h-14 px-4 sm:px-6 bg-[#0a0d22]/95 border-b border-cyan-500/25 backdrop-blur-xl flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="btn-volver-from-research"
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-sm hover:border-cyan-500/50 flex-shrink-0"
            title="Volver a la sala y chat"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Volver</span>
          </button>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block flex-shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/90 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] flex-shrink-0">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-black tracking-wider text-white font-mono uppercase truncate flex items-center gap-2">
                <span>CENTROS DE INVESTIGACIÓN Y LABORATORIOS</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Current user badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <UserAvatar
              name={studentResolvedName}
              email={session.email}
              photoUrl={session.avatarUrl}
              size="sm"
            />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-white truncate max-w-[130px]">
                {studentResolvedName.split(' ').slice(0, 2).join(' ')}
              </p>
              <p className="text-[10px] font-mono text-cyan-400">
                {session.role === 'docente' ? 'Catedrático' : 'Estudiante UNSAAC'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 max-w-7xl mx-auto w-full">
        
        {/* Sleek Search & AI Action Bar (NO filler text, compact & small) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0a0f26]/90 border border-cyan-500/30 shadow-xl space-y-2.5">
          {/* Row 1: Small Search Bar + MOSTRAR INTERÉS + Registrar Centro */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Small search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-buscar-centros"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar centros, laboratorios o asesores..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#060814]/90 border border-zinc-700/80 focus:border-cyan-400 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* MOSTRAR INTERÉS Button (Next to search bar) */}
            <button
              id="btn-mostrar-interes"
              type="button"
              onClick={() => setShowInterestModal(true)}
              className="whitespace-nowrap flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 border border-cyan-400/60 text-white text-xs font-mono font-bold shadow-md shadow-cyan-950/60 transition-all cursor-pointer hover:scale-[1.02] flex-shrink-0"
              title="Notificar mis habilidades y dominio a los docentes investigadores"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
              <span>MOSTRAR INTERÉS</span>
              {interestSent && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            {/* Docente / Creador: Registrar Centro */}
            <button
              id="btn-crear-centro"
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="whitespace-nowrap flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer flex-shrink-0"
              title="Registrar un nuevo centro de investigación o círculo de estudio"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Registrar Centro</span>
            </button>
          </div>

          {/* Row 2: ANALIZARME Button (Directly below search bar) */}
          <div>
            <button
              id="btn-analizarme"
              type="button"
              onClick={() => setShowAnalyzeModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-cyan-950/60 hover:from-purple-800/80 hover:to-cyan-900/80 border border-purple-500/40 hover:border-purple-400 text-purple-200 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
              title="Analizar mis pros y contras para recomendar centros de investigación ideales"
            >
              <Brain className="w-4 h-4 text-purple-300 animate-bounce" />
              <span>ANALIZARME (IA: Recomendar centros según lo que domino y lo que no domino)</span>
            </button>
          </div>
        </div>

        {/* Section Header: CONVOCATORIAS Y SEMILLEROS (Clean title, without year or 'Filtro:') */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-white font-mono uppercase">
              CONVOCATORIAS Y SEMILLEROS
            </h2>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30 font-bold'
                    : 'bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Research Centers Grid (Compact, well-proportioned boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredProjects.map((proj) => {
            const hasApplied = !!appliedProjects[proj.id];

            return (
              <div
                key={proj.id}
                className="rounded-2xl bg-[#0c1024]/90 border border-zinc-800/90 hover:border-cyan-500/40 p-4 sm:p-4.5 transition-all duration-200 flex flex-col justify-between group shadow-lg hover:shadow-cyan-950/30"
              >
                <div className="space-y-2.5">
                  {/* Card Header: Code & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800/60">
                      {proj.code}
                    </span>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                      proj.status === 'Convocatoria Abierta' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80' 
                        : proj.status === 'En Desarrollo'
                        ? 'bg-amber-950 text-amber-300 border border-amber-700/80'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-700/80'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {proj.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-200 transition-colors leading-snug">
                    {proj.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-[11px] sm:text-xs text-zinc-300/90 leading-relaxed line-clamp-2">
                    {proj.summary}
                  </p>

                  {/* Meta: Asesor & Laboratorio & Inicio */}
                  <div className="p-2.5 rounded-xl bg-[#060814]/80 border border-zinc-800/80 space-y-1 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-zinc-200">
                      <Users className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="text-zinc-400">Asesor:</span>
                      <span className="font-bold text-amber-300 truncate">{proj.advisor.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Building2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="text-zinc-400">Laboratorio:</span>
                      <span className="truncate text-zinc-200">{proj.labName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Fecha de inicio:</span>
                      <span className="text-emerald-300 font-semibold">{proj.startDate}</span>
                    </div>
                  </div>

                  {/* Keywords tags */}
                  <div className="flex items-center gap-1 flex-wrap pt-0.5">
                    {proj.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions: strictly in a single horizontal row without line wrapping */}
                <div className="pt-3 border-t border-zinc-800/80 mt-3 flex items-center justify-between gap-1.5 whitespace-nowrap overflow-x-auto scrollbar-none">
                  {/* Ficha técnica button */}
                  <button
                    type="button"
                    onClick={() => setSelectedProject(proj)}
                    className="whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-[11px] font-mono font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1 flex-shrink-0"
                    title="Ver ficha técnica completa"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="whitespace-nowrap">Ficha técnica</span>
                  </button>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {onOpenChatWithAdvisor && (
                      <button
                        type="button"
                        onClick={() => onOpenChatWithAdvisor(proj.advisor.email)}
                        className="whitespace-nowrap px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/70 text-cyan-300 text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 flex-shrink-0"
                        title={`Consultar con ${proj.advisor.name}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="whitespace-nowrap">Consultar</span>
                      </button>
                    )}

                    {/* UNIRSE button */}
                    <button
                      type="button"
                      onClick={() => handleApplyToProject(proj.id)}
                      disabled={hasApplied}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md flex-shrink-0 ${
                        hasApplied
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 cursor-default'
                          : 'bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white shadow-cyan-950/60'
                      }`}
                    >
                      {hasApplied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="whitespace-nowrap">Unido</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="whitespace-nowrap">Unirse</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 space-y-3">
            <FlaskConical className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-xs font-mono text-zinc-300">
              No se encontraron centros ni laboratorios para "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-mono font-bold hover:bg-cyan-500 cursor-pointer"
            >
              Ver todos los centros
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: MOSTRAR INTERÉS (Perfil del alumno, DOMINA / NO DOMINA y Tabla Estadística) */}
      {showInterestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0b0f24] border border-cyan-500/40 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm sm:text-base font-black text-white font-mono uppercase">
                  PERFIL DE INTERÉS ACADÉMICO PARA DOCENTES
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInterestModal(false)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Header */}
            <div className="p-3 rounded-2xl bg-[#060814] border border-cyan-900/40 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <UserAvatar
                  name={studentResolvedName}
                  email={session.email}
                  photoUrl={session.avatarUrl}
                  size="md"
                />
                <div>
                  <h4 className="text-sm font-bold text-white uppercase">{studentResolvedName}</h4>
                  <p className="text-xs font-mono text-cyan-400">UNSAAC • Estudiante de Ingeniería / Ciencias</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Docentes Notificados</span>
              </div>
            </div>

            {/* DOMINA & NO DOMINA Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* DOMINA */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>DOMINA (Habilidades destacadas)</span>
                </div>
                <ul className="text-xs space-y-1.5 text-zinc-200">
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span><strong>Programación y Algoritmia:</strong> C++, Python, Lógica matemática (94%)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span><strong>Cálculo Diferencial e Integral:</strong> Modelado computacional (89%)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span><strong>Estructuras de Datos:</strong> Optimización de complejidad O(n) (91%)</span>
                  </li>
                </ul>
              </div>

              {/* NO DOMINA */}
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs uppercase">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>NO DOMINA (Áreas por fortalecer)</span>
                </div>
                <ul className="text-xs space-y-1.5 text-zinc-300">
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span><strong>Física y Cinemática:</strong> Movimiento curvilíneo y vectores (58%)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span><strong>Leyes de Kirchhoff (LCK y LVK):</strong> Análisis nodal de circuitos (52%)</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span><strong>Dinámica de Fluidos:</strong> Ecuaciones de Bernoulli y viscosidad (61%)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* TABLA ESTADÍSTICA DE RENDIMIENTO */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  TABLA ESTADÍSTICA DE DESEMPEÑO
                </span>
                <span className="text-zinc-400 text-[11px]">Evaluado por IA Académica UNSAAC</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#060814]/90">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 text-[11px]">
                      <th className="p-2.5">Materia / Habilidad</th>
                      <th className="p-2.5">Nivel</th>
                      <th className="p-2.5">Efectividad</th>
                      <th className="p-2.5">Perfil para Centro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                    <tr>
                      <td className="p-2.5 font-bold text-white">Programación y Algoritmos</td>
                      <td className="p-2.5 text-emerald-400">Alto (Senior)</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div className="w-[94%] h-full bg-emerald-500 rounded-full" />
                          </div>
                          <span className="text-emerald-300">94%</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-cyan-300">Apto para IA y Cómputo</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Cálculo Diferencial e Integral</td>
                      <td className="p-2.5 text-emerald-400">Alto</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div className="w-[89%] h-full bg-emerald-500 rounded-full" />
                          </div>
                          <span className="text-emerald-300">89%</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-cyan-300">Modelado Matemático</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Física y Cinemática</td>
                      <td className="p-2.5 text-amber-400">Intermedio Bajo</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div className="w-[58%] h-full bg-amber-500 rounded-full" />
                          </div>
                          <span className="text-amber-300">58%</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-amber-300">Semillero de Refuerzo</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Leyes de Kirchhoff y Circuitos</td>
                      <td className="p-2.5 text-rose-400">Inicial</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div className="w-[52%] h-full bg-rose-500 rounded-full" />
                          </div>
                          <span className="text-rose-300">52%</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-rose-300">Asesoría Docente Requerida</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note that user can join directly anytime */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-700/40 text-xs text-zinc-300 leading-relaxed font-mono">
              <strong className="text-cyan-300">Información:</strong> Los docentes que tengan laboratorios o círculos creados (Dr. Mendoza, Dr. Valdivia, Dra. Huayta) podrán revisar tu perfil para invitarte según tus fortalezas. <em>Recuerda que también puedes pulsar "Unirse" de forma directa a cualquier centro sin necesidad de esperar respuesta.</em>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowInterestModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  handleRegisterInterest();
                  setShowInterestModal(false);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white text-xs font-mono font-bold hover:from-cyan-500 hover:to-teal-400 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirmar y Notificar a Docentes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ANALIZARME (IA analiza pros y contras y recomienda centros) */}
      {showAnalyzeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0b0f24] border border-purple-500/40 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="text-sm sm:text-base font-black text-white font-mono uppercase">
                  DIAGNÓSTICO Y RECOMENDACIÓN POR IA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAnalyzeModal(false)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student diagnostic banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 text-xs font-mono text-zinc-200 leading-relaxed">
              <p className="font-bold text-purple-300 mb-1">Diagnóstico para {studentResolvedName}:</p>
              <p className="text-zinc-300">
                La IA ha evaluado tu historial de resolución, dominios lógicos y dificultades reportadas. A continuación se presentan tus pros, contras y los centros recomendados para tu perfil.
              </p>
            </div>

            {/* PROS & CONTRAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase font-mono flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  PROS (Lo que dominas)
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  • Excelente pensamiento abstracto, programación en C++/Python (94%) y resolución de cálculo integral (89%).
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  • Capacidad alta para entrenar modelos computacionales y procesar bases de datos masivas.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-1.5">
                <h4 className="text-xs font-bold text-rose-400 uppercase font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  CONTRAS (Lo que no dominas)
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  • Dificultad en formulación de mallas con Leyes de Kirchhoff y circuitos (52%).
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  • Menor experiencia en cinemática experimental y montaje de sensores físicos de laboratorio (58%).
                </p>
              </div>
            </div>

            {/* CENTROS RECOMENDADOS SEGÚN PROS Y CONTRAS */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                CENTROS RECOMENDADOS POR LA IA PARA TI
              </h4>

              {/* Recomendación 1: Para potenciar lo que domina */}
              <div className="p-3.5 rounded-2xl bg-[#060814] border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    1. Centro de Cómputo de Alto Rendimiento e Inteligencia Artificial
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700">
                    Potencia lo que dominas
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-mono">
                  <strong className="text-amber-300">Asesor:</strong> Dr. Juvenal Valdivia Quispe
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Por qué te conviene:</strong> Tu alto dominio en programación y algoritmos (94%) te permitirá integrarte de inmediato al desarrollo de redes neuronales y visión computacional con datos sísmicos del IGP.
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleApplyToProject('proj-ia-02');
                      setShowAnalyzeModal(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white text-xs font-mono font-bold hover:from-cyan-500 hover:to-teal-400 cursor-pointer"
                  >
                    {appliedProjects['proj-ia-02'] ? 'Ya postulado' : 'Unirse a este centro'}
                  </button>
                </div>
              </div>

              {/* Recomendación 2: Para nivelar y superar contras */}
              <div className="p-3.5 rounded-2xl bg-[#060814] border border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    2. Laboratorio de Mecánica y Ondas (Pabellón C, Perayoc)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-700">
                    Para nivelar tus debilidades
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-mono">
                  <strong className="text-amber-300">Asesor:</strong> Dr. Leoncio Mendoza Flores
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>Por qué te conviene:</strong> Al integrarte a este semillero, recibirás asesoría directa del Dr. Mendoza en cinemática, dinámica de fluidos y sensores experimentales, superando tus dificultades actuales en física mediante proyectos prácticos.
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleApplyToProject('proj-fis-01');
                      setShowAnalyzeModal(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-xs font-mono font-bold hover:from-purple-600 hover:to-indigo-500 cursor-pointer"
                  >
                    {appliedProjects['proj-fis-01'] ? 'Ya postulado' : 'Unirse para nivelación'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAnalyzeModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRAR / EDITAR CENTRO DE INVESTIGACIÓN (Para Docentes) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-[#0c1024] border border-cyan-500/40 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-black text-white font-mono uppercase">
                  REGISTRAR CENTRO O CÍRCULO DE ESTUDIO
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCenter} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Nombre del Centro / Círculo de Investigación:
                </label>
                <input
                  type="text"
                  required
                  value={newCenterTitle}
                  onChange={(e) => setNewCenterTitle(e.target.value)}
                  placeholder="Ej. Círculo de Estudio de Física y Circuitos UNSAAC"
                  className="w-full px-3 py-2 rounded-xl bg-[#060814] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Docente Asesor (Creador):
                  </label>
                  <input
                    type="text"
                    required
                    value={newCenterAdvisor}
                    onChange={(e) => setNewCenterAdvisor(e.target.value)}
                    placeholder="Ej. Dr. Leoncio Mendoza Flores"
                    className="w-full px-3 py-2 rounded-xl bg-[#060814] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Laboratorio / Sede:
                  </label>
                  <input
                    type="text"
                    required
                    value={newCenterLab}
                    onChange={(e) => setNewCenterLab(e.target.value)}
                    placeholder="Ej. Laboratorio de Mecánica y Ondas"
                    className="w-full px-3 py-2 rounded-xl bg-[#060814] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Fecha de Inicio:
                  </label>
                  <input
                    type="text"
                    required
                    value={newCenterStartDate}
                    onChange={(e) => setNewCenterStartDate(e.target.value)}
                    placeholder="Ej. Abril 2025"
                    className="w-full px-3 py-2 rounded-xl bg-[#060814] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Área Temática:
                  </label>
                  <select
                    value={newCenterCategory}
                    onChange={(e) => setNewCenterCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#060814] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  >
                    <option value="fisica">Física y Ondas</option>
                    <option value="ia">Inteligencia Artificial</option>
                    <option value="energias">Energías Renovables</option>
                    <option value="robotica">Robótica y Automatización</option>
                    <option value="biotech">Biotecnología</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Resumen Breve del Centro:
                </label>
                <textarea
                  rows={2}
                  value={newCenterSummary}
                  onChange={(e) => setNewCenterSummary(e.target.value)}
                  placeholder="Describe las actividades, asesorías o investigaciones que se realizan..."
                  className="w-full px-3 py-2 rounded-xl bg-[#060814] border border-zinc-700 text-white focus:outline-none focus:border-cyan-400 text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-mono font-bold hover:from-emerald-500 hover:to-teal-400"
                >
                  Guardar Centro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: FICHA TÉCNICA COMPLETA (Sin mención a financiamiento o convenios) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0c1024] border border-cyan-500/40 p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-mono font-bold text-cyan-400">
                {selectedProject.code}
              </span>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">
                {selectedProject.categoryLabel}
              </span>
              <h2 className="text-sm sm:text-base font-black text-white">
                {selectedProject.title}
              </h2>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5 text-xs font-mono">
              <p><span className="text-zinc-400">Asesor:</span> <strong className="text-amber-300">{selectedProject.advisor.name}</strong> ({selectedProject.advisor.email})</p>
              <p><span className="text-zinc-400">Departamento:</span> {selectedProject.advisor.department}</p>
              <p><span className="text-zinc-400">Laboratorio:</span> {selectedProject.labName}</p>
              <p><span className="text-zinc-400">Fecha de inicio:</span> <span className="text-emerald-300">{selectedProject.startDate}</span></p>
              <p><span className="text-zinc-400">Estudiantes tesistas / integrantes:</span> {selectedProject.studentResearchers.join(', ')}</p>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-300 leading-relaxed">
              <h4 className="font-bold text-white uppercase font-mono text-[11px]">Resumen del Centro</h4>
              <p>{selectedProject.summary}</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleApplyToProject(selectedProject.id);
                  setSelectedProject(null);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white text-xs font-mono font-bold hover:from-cyan-500 hover:to-teal-400"
              >
                {appliedProjects[selectedProject.id] ? 'Unido' : 'Unirse'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
