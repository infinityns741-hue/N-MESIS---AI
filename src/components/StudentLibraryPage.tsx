import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Search,
  Download,
  Eye,
  Bookmark,
  BookmarkCheck,
  UploadCloud,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  FileText,
  CheckCircle2,
  Star,
  ExternalLink,
  Sun,
  Moon,
  Coffee,
  ZoomIn,
  ZoomOut,
  FolderKanban,
  Check
} from 'lucide-react';
import { UserSession } from '../types';
import { getStoredSupabaseConfig, isSupabaseReady } from '../lib/supabase';

export interface PDFBook {
  id: string;
  title: string;
  author: string;
  category: string;
  pages: number;
  fileSize: string;
  year: number;
  rating: number;
  coverGradient: string;
  description: string;
  tags: string[];
  chapters: { title: string; page: number; content: string }[];
  downloadUrl?: string;
  isUserAdded?: boolean;
}

const INITIAL_BOOKS: PDFBook[] = [
  {
    id: 'book-1',
    title: 'Estructuras de Datos y Algoritmos Avanzados',
    author: 'Dr. Michael T. Goodrich & Roberto Tamassia',
    category: 'Ingeniería de Software y Sistemas',
    pages: 486,
    fileSize: '14.8 MB',
    year: 2023,
    rating: 4.9,
    coverGradient: 'from-blue-600 to-indigo-900',
    description: 'Manual exhaustivo de análisis asintótico, árboles balanceados, grafos dirigidos, programación dinámica y complejidad computacional con implementación en Java y C++.',
    tags: ['Árboles AVL', 'Grafos Dijkstra', 'Backtracking', 'Programación Dinámica'],
    chapters: [
      { 
        title: 'Capítulo 1: Fundamentos de Notación O-Grande', 
        page: 1, 
        content: `UNIVERSIDAD NACIONAL DE SAN ANTONIO ABAD DEL CUSCO\nFACULTAD DE INGENIERÍA ELÉCTRICA, ELECTRÓNICA, INFORMÁTICA Y MECÁNICA\n\n1.1 INTRODUCCIÓN AL ANÁLISIS ASINTÓTICO\nEl análisis asintótico de algoritmos nos permite predecir el comportamiento temporal y espacial conforme la entrada n tiende a infinito. En problemas computacionales de escala universitaria, la diferencia entre una complejidad O(n log n) y una O(n²) determina la viabilidad operativa.\n\nReglas fundamentales:\n- Regla de la suma: O(f(n)) + O(g(n)) = O(max(f(n), g(n)))\n- Regla del producto: O(f(n)) * O(g(n)) = O(f(n) * g(n))\n\nEjemplo práctico: Un recorrido lineal sobre n elementos con una búsqueda binaria interna de log(n) pasos da lugar a O(n log n).` 
      },
      { 
        title: 'Capítulo 2: Grafos y Algoritmos de Caminos Mínimos', 
        page: 45, 
        content: `2.1 DEFINICIONES FORMALES DE GRAFOS DIRIGIDOS\nUn grafo G=(V,E) se compone de un conjunto de vértices V y un conjunto de aristas dirigidas E. Para ponderaciones no negativas w: E -> R+, el algoritmo de Dijkstra encuentra el camino de costo mínimo desde una fuente s hacia todo vértice v con complejidad O((V + E) log V) usando una cola de prioridad basada en montículos de Fibonacci.` 
      },
      { 
        title: 'Capítulo 3: Tablas Hash y Resolución de Colisiones', 
        page: 112, 
        content: `3.1 DISPERSIÓN Y FACTOR DE CARGA\nLas tablas de dispersión garantizan accesos en tiempo promedio O(1). Cuando dos claves colisionan en la misma ranura, el encadenamiento separado o el direccionamiento abierto con doble hashing aseguran dispersión uniforme bajo la hipótesis SUHA (Simple Uniform Hashing Assumption).` 
      }
    ]
  },
  {
    id: 'book-2',
    title: 'Inteligencia Artificial Moderna y Redes Neuronales Profundas',
    author: 'Stuart Russell & Peter Norvig',
    category: 'Inteligencia Artificial y ML',
    pages: 620,
    fileSize: '22.4 MB',
    year: 2024,
    rating: 5.0,
    coverGradient: 'from-emerald-600 to-teal-950',
    description: 'El texto estándar universitario sobre agentes racionales, aprendizaje supervisado, transformers, redes convolucionales y modelos de lenguaje de gran escala.',
    tags: ['Transformers', 'Backpropagation', 'LLMs', 'Reinforcement Learning'],
    chapters: [
      { 
        title: 'Capítulo 1: Agentes Racionales y Entornos de Decisión', 
        page: 1, 
        content: `NÉMESIS IA DOCENTE - REPOSITORIO UNIVERSITARIO UNSAAC\n\n1.1 ARQUITECTURA DE AGENTES INTELIGENTES\nUn agente es todo aquello capaz de percibir su entorno con la ayuda de sensores y actuar en ese medio utilizando actuadores. La función de agente f: P* -> A mapea secuencias de percepciones a acciones concretas bajo métricas de rendimiento objetivas.\n\nEntornos deterministas vs. estocásticos: En entornos estocásticos, las probabilidades de transición condicionadas P(s' | s, a) guían la toma de decisiones basada en la maximización de la utilidad esperada.` 
      },
      { 
        title: 'Capítulo 2: Mecanismos de Auto-Atención y Modelos Transformers', 
        page: 98, 
        content: `2.1 EL OPERADOR DE ATENCIÓN DE PRODUCTO ESCALAR ESCALADO\nLa ecuación fundamental formulada por Vaswani et al.:\nAttention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V\nPermite a las redes procesar dependencias de largo alcance sin recurrencias secuenciales, permitiendo el entrenamiento masivo en arquitecturas GPU/TPU.` 
      }
    ]
  },
  {
    id: 'book-3',
    title: 'Diseño e Implementación de Bases de Datos Relacionales y NoSQL',
    author: 'Ramez Elmasri & Shamkant B. Navathe',
    category: 'Bases de Datos y Cloud',
    pages: 540,
    fileSize: '18.1 MB',
    year: 2023,
    rating: 4.8,
    coverGradient: 'from-amber-600 to-orange-950',
    description: 'Normalización de esquemas relacionales hasta BCNF, transacciones ACID, aislamiento, álgebra relacional, índices B-Tree y modelos de almacenamiento distribuido.',
    tags: ['SQL', 'PostgreSQL', 'Normalización 3FN', 'Transacciones ACID', 'Supabase'],
    chapters: [
      { 
        title: 'Capítulo 1: Modelo Relacional y Álgebra Relacional', 
        page: 1, 
        content: `BIBLIOTECA UNSAAC - INGENIERÍA DE SISTEMAS\n\n1.1 RELACIONES, TUPLAS Y CLAVES PRIMARIAS\nUna relación formal se define como un subconjunto del producto cartesiano de dominios D1 x D2 x ... x Dn. Los operadores de selección (sigma), proyección (pi) y reunión natural (bowtie) forman la base matemática del lenguaje declarativo SQL utilizado en motores modernos como PostgreSQL y Supabase.` 
      },
      { 
        title: 'Capítulo 2: Formas Normales y Dependencias Funcionales', 
        page: 78, 
        content: `2.1 ELIMINACIÓN DE ANOMALÍAS DE MODIFICACIÓN\nUna relación R se encuentra en Tercera Forma Normal (3FN) si para toda dependencia funcional X -> A no trivial, se cumple que X es superclave o A es atributo primo. Esto previene redundancias y pérdida de integridad en esquemas académicos y de producción.` 
      }
    ]
  },
  {
    id: 'book-4',
    title: 'Cálculo Multivariable y Álgebra Lineal con Aplicaciones',
    author: 'James Stewart & Gilbert Strang',
    category: 'Matemáticas y Cálculo',
    pages: 710,
    fileSize: '29.3 MB',
    year: 2022,
    rating: 4.9,
    coverGradient: 'from-purple-600 to-slate-900',
    description: 'Vectores en el espacio tridimensional, matrices, valores propios, derivadas parciales, integrales dobles y triples, teoremas de Green, Stokes y Gauss.',
    tags: ['Gradiente', 'Matriz Hessiana', 'Valores Propios', 'Teorema de Stokes'],
    chapters: [
      { 
        title: 'Capítulo 1: Espacios Vectoriales y Ortogonalidad', 
        page: 1, 
        content: `DEPARTAMENTO ACADÉMICO DE MATEMÁTICAS - UNSAAC\n\n1.1 BASES Y TRANSFORMACIONES LINEALES\nDado un espacio vectorial V sobre un cuerpo K, un conjunto de vectores B es base si es linealmente independiente y genera a V. El proceso de Gram-Schmidt permite construir una base ortonormal a partir de cualquier base arbitraria, fundamental en transformadas de Fourier y optimización de gradiente descendente.` 
      }
    ]
  },
  {
    id: 'book-5',
    title: 'Física para Ciencias e Ingeniería con Física Moderna',
    author: 'Raymond A. Serway & John W. Jewett',
    category: 'Física Universitaria',
    pages: 830,
    fileSize: '34.5 MB',
    year: 2023,
    rating: 4.7,
    coverGradient: 'from-cyan-600 to-blue-950',
    description: 'Mecánica clásica, termodinámica, campos electromagnéticos, ecuaciones de Maxwell, relatividad especial e introducción a la física cuántica.',
    tags: ['Cinemática', 'Electromagnetismo', 'Leyes de Newton', 'Óptica'],
    chapters: [
      { 
        title: 'Capítulo 1: Dinámica Newtoniana y Trabajo', 
        page: 1, 
        content: `TEXTO DE CÁTEDRA UNSAAC\n\n1.1 LEYES DEL MOVIMIENTO Y SISTEMAS INERCIALES\nLa segunda ley de Newton F = dp/dt establece la proporcionalidad entre la fuerza neta aplicada a un cuerpo y la tasa temporal de cambio de su cantidad de movimiento. Para masa constante m, F = m*a.` 
      }
    ]
  },
  {
    id: 'book-6',
    title: 'Ciberseguridad Ofensiva, Redes TCP/IP y Criptografía',
    author: 'Andrew S. Tanenbaum & David J. Wetherall',
    category: 'Ciberseguridad y Redes',
    pages: 512,
    fileSize: '16.7 MB',
    year: 2024,
    rating: 4.9,
    coverGradient: 'from-rose-600 to-zinc-950',
    description: 'Capas del modelo OSI y suite TCP/IP, protocolos de enrutamiento BGP/OSPF, criptografía de clave pública RSA y curvas elípticas, auditoría de vulnerabilidades.',
    tags: ['TCP Handshake', 'Criptografía RSA', 'Firewalls', 'Wireshark'],
    chapters: [
      { 
        title: 'Capítulo 1: Arquitectura de Redes y Protocolo TCP', 
        page: 1, 
        content: `LABORATORIO DE REDES Y TELECOMUNICACIONES UNSAAC\n\n1.1 EL ACUERDO DE TRES VÍAS (THREE-WAY HANDSHAKE)\nPara establecer un canal de transporte confiable, el cliente envía un segmento con el flag SYN activo y un número de secuencia inicial x. El servidor responde con SYN-ACK reconociendo x+1 y proponiendo y. Finalmente, el cliente confirma con ACK y=y+1, pasando al estado ESTABLISHED.` 
      }
    ]
  },
  {
    id: 'book-7',
    title: 'Guía de Metodología de Investigación Científica y Redacción de Tesis',
    author: 'Roberto Hernández Sampieri',
    category: 'Metodología y Tesis',
    pages: 390,
    fileSize: '11.2 MB',
    year: 2023,
    rating: 4.8,
    coverGradient: 'from-teal-600 to-slate-950',
    description: 'Estructuración del proyecto de tesis universitaria, formulación del problema, marco teórico, diseño metodológico, muestreo y normas APA 7ma edición.',
    tags: ['Tesis UNSAAC', 'Normas APA 7', 'Marco Teórico', 'Prueba de Hipótesis'],
    chapters: [
      { 
        title: 'Capítulo 1: Planteamiento del Problema de Investigación', 
        page: 1, 
        content: `ESCUELA DE POSGRADO Y PREGRADO UNSAAC\n\n1.1 CRITERIOS PARA PLANTEAR EL PROBLEMA\nEl problema debe expresar una relación entre dos o más conceptos o variables, estar formulado con claridad y sin ambigüedades como pregunta concreta, e implicar la posibilidad de someterse a prueba empírica en el ámbito de estudio.` 
      }
    ]
  },
  {
    id: 'book-8',
    title: 'Revista de Investigación Científica Antoniana - Edición Especial',
    author: 'Vicerrectorado de Investigación UNSAAC',
    category: 'Revistas y Artículos',
    pages: 280,
    fileSize: '9.6 MB',
    year: 2024,
    rating: 4.9,
    coverGradient: 'from-amber-700 to-stone-900',
    description: 'Compendio de artículos indexados sobre inteligencia artificial aplicada a la agricultura andina, hidrología en cuencas del Cusco y procesamiento de lenguaje Quechua.',
    tags: ['Investigación Cusco', 'NLP Quechua', 'Publicación Indexada', 'Scopus'],
    chapters: [
      { 
        title: 'Artículo 1: Modelos de Deep Learning para Detección Temprana de Plagas', 
        page: 1, 
        content: `REVISTA CIENTÍFICA ANTONIANA - VOL. 18, NO. 2 (2024)\n\nRESUMEN EJECUTIVO:\nSe evaluó una arquitectura Convolutional Neural Network (CNN) con transfer learning basada en ResNet50 para la detección temprana de tizón tardío en cultivos de papa andina en la región de Anta y Paucartambo. Los resultados mostraron una precisión de clasificación del 96.4% en condiciones de campo variables.` 
      }
    ]
  }
];

const CATEGORIES = [
  'Todos',
  'Ingeniería de Software y Sistemas',
  'Inteligencia Artificial y ML',
  'Bases de Datos y Cloud',
  'Matemáticas y Cálculo',
  'Física Universitaria',
  'Ciberseguridad y Redes',
  'Metodología y Tesis',
  'Revistas y Artículos'
];

interface StudentLibraryPageProps {
  session: UserSession;
  onBack: () => void;
}

export const StudentLibraryPage: React.FC<StudentLibraryPageProps> = ({ session, onBack }) => {
  const [books, setBooks] = useState<PDFBook[]>(() => {
    try {
      const saved = localStorage.getItem('nemesis_library_books');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading library from storage', e);
    }
    return INITIAL_BOOKS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingBook, setReadingBook] = useState<PDFBook | null>(null);
  const [readingPage, setReadingPage] = useState<number>(1);
  const [readingTheme, setReadingTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [readingZoom, setReadingZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedBookIds, setSavedBookIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('nemesis_saved_books') || '["book-1", "book-2"]');
    } catch {
      return ['book-1'];
    }
  });

  // Modal para subir libro PDF
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState(CATEGORIES[1]);
  const [newBookPages, setNewBookPages] = useState('120');
  const [newBookDesc, setNewBookDesc] = useState('');
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nemesis_library_books', JSON.stringify(books));
    } catch (e) {
      console.warn('Could not save books to localStorage', e);
    }
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem('nemesis_saved_books', JSON.stringify(savedBookIds));
    } catch (e) {
      console.warn('Could not save favorites', e);
    }
  }, [savedBookIds]);

  const toggleSaveBook = (bookId: string) => {
    setSavedBookIds((prev) => 
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchCategory = selectedCategory === 'Todos' || b.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !query || 
        b.title.toLowerCase().includes(query) || 
        b.author.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.tags.some(t => t.toLowerCase().includes(query));
      return matchCategory && matchSearch;
    });
  }, [books, selectedCategory, searchQuery]);

  const handleOpenReader = (book: PDFBook) => {
    setReadingBook(book);
    setReadingPage(1);
    setReadingZoom(100);
  };

  const handleDownloadPDF = (book: PDFBook) => {
    // Generar un archivo de texto/pdf estructurado para descarga real del estudiante
    const content = `# UNIVERSIDAD NACIONAL DE SAN ANTONIO ABAD DEL CUSCO\n# BIBLIOTECA DIGITAL NÉMESIS\n\n` +
      `Título: ${book.title}\nAutor: ${book.author}\nCategoría: ${book.category}\nAño: ${book.year}\nPáginas: ${book.pages}\n\n` +
      `DESCRIPCIÓN:\n${book.description}\n\n` +
      `CONTENIDO ACADÉMICO:\n` +
      book.chapters.map(c => `=== ${c.title} (Pág. ${c.page}) ===\n${c.content}\n`).join('\n');
    
    const blob = new Blob([content], { type: 'application/pdf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_UNSAAC.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const newBook: PDFBook = {
      id: `book-${Date.now()}`,
      title: newBookTitle.trim(),
      author: newBookAuthor.trim() || session.fullName || 'Estudiante UNSAAC',
      category: newBookCategory,
      pages: parseInt(newBookPages) || 85,
      fileSize: '7.4 MB',
      year: new Date().getFullYear(),
      rating: 5.0,
      coverGradient: 'from-emerald-700 to-cyan-900',
      description: newBookDesc.trim() || 'Documento PDF académico registrado por el estudiante en la biblioteca universitaria NÉMESIS.',
      tags: ['PDF Universitario', 'Cátedra UNSAAC', 'Aporte Estudiantil'],
      isUserAdded: true,
      chapters: [
        {
          title: 'Capítulo 1: Introducción y Resumen del Documento',
          page: 1,
          content: `DOCUMENTO DIGITAL REGISTRADO EN NÉMESIS UNSAAC\n\nTítulo: ${newBookTitle}\nRegistrado por: ${session.fullName} (${session.code})\nFecha: ${new Date().toLocaleDateString()}\n\nContenido:\n${newBookDesc || 'Texto del documento PDF disponible para lectura universitaria.'}`
        }
      ]
    };

    setBooks((prev) => [newBook, ...prev]);
    setIsUploadModalOpen(false);
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookDesc('');
    setUploadSuccessToast(`¡Libro "${newBook.title}" añadido con éxito a la biblioteca!`);
    setTimeout(() => setUploadSuccessToast(null), 3500);
  };

  const supabaseConfig = getStoredSupabaseConfig();
  const isConnectedToSupabase = isSupabaseReady();

  return (
    <div className="fixed inset-0 z-50 bg-[#070914] text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <header className="h-16 px-4 sm:px-6 bg-[#0c0f24]/95 border-b border-indigo-500/20 backdrop-blur-xl flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-sm hover:border-indigo-500/50"
            title="Volver al Chat"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Volver al Chat</span>
          </button>

          <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-extrabold tracking-wider text-white font-mono uppercase">
                  BIBLIOTECA DIGITAL UNIVERSITARIA
                </h1>
                <span className="whitespace-nowrap px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PDF Libros
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
                Colección general de libros universitarios, textos de cátedra y apuntes
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Status */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer hover:shadow-indigo-600/30"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Subir PDF</span>
          </button>
        </div>
      </header>

      {/* Upload Toast */}
      {uploadSuccessToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-emerald-950/95 border border-emerald-500 text-emerald-200 text-xs font-mono font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{uploadSuccessToast}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search & Category Filter Section */}
        <div className="p-4 sm:px-8 border-b border-zinc-800/80 bg-[#090b1c]/80 backdrop-blur-md flex flex-col gap-3.5 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, autor, tema o palabras clave..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">
                {filteredBooks.length} {filteredBooks.length === 1 ? 'libro' : 'libros'} disponibles
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-300">
                {savedBookIds.length} en estantería
              </span>
            </div>
          </div>

          {/* Categorías en chips navegables */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
            <span className="text-xs font-mono text-zinc-500 flex items-center gap-1.5 flex-shrink-0 pr-1">
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
              Categorías:
            </span>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = cat === 'Todos' ? books.length : books.filter(b => b.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-900 text-indigo-200' : 'bg-zinc-800 text-zinc-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Books Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {filteredBooks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-zinc-300 font-mono">No se encontraron libros PDF</h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                No hay resultados para "{searchQuery}" en la categoría seleccionada. Prueba con otro término o sube un nuevo documento.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todos');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
              {filteredBooks.map((book) => {
                const isSaved = savedBookIds.includes(book.id);
                return (
                  <div
                    key={book.id}
                    className="flex flex-col rounded-2xl bg-[#0e1227]/90 border border-zinc-800/90 hover:border-indigo-500/50 transition-all duration-200 overflow-hidden shadow-lg group hover:-translate-y-1"
                  >
                    {/* Visual Cover Top Banner */}
                    <div className={`h-36 bg-gradient-to-br ${book.coverGradient} p-4 flex flex-col justify-between relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between relative z-10">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono border border-white/10">
                          {book.category}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => toggleSaveBook(book.id)}
                          className={`p-1.5 rounded-lg backdrop-blur-md transition-all cursor-pointer ${
                            isSaved ? 'bg-amber-500 text-black shadow-md' : 'bg-black/40 text-white hover:bg-black/60'
                          }`}
                          title={isSaved ? 'Quitar de estantería' : 'Guardar en mi estantería'}
                        >
                          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="relative z-10 flex items-end justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-white/90">
                          <FileText className="w-3.5 h-3.5 text-white/80" />
                          <span>{book.pages} Páginas</span>
                          <span className="text-white/40">•</span>
                          <span>{book.fileSize}</span>
                        </div>

                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 text-[10px] font-mono font-bold text-amber-300">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          <span>{book.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Book Details Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-zinc-400 font-mono truncate">
                          {book.author} ({book.year})
                        </p>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {book.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {book.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenReader(book)}
                          className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-indigo-600/30"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Leer PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(book)}
                          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 transition-all cursor-pointer"
                          title="Descargar PDF completo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* LECTOR INTERACTIVO DE PDF MODAL */}
      {readingBook && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          {/* Reader Top Bar */}
          <div className="h-14 px-4 sm:px-6 bg-[#0c0f20] border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setReadingBook(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                title="Cerrar Lector"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                  {readingBook.title}
                </h2>
                <p className="text-[10px] text-zinc-400 font-mono truncate">
                  {readingBook.author} • {readingBook.category}
                </p>
              </div>
            </div>

            {/* Reader Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Zoom controls */}
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
                <button
                  type="button"
                  onClick={() => setReadingZoom((z) => Math.max(75, z - 15))}
                  className="p-1 hover:text-white"
                  title="Alejar"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center">{readingZoom}%</span>
                <button
                  type="button"
                  onClick={() => setReadingZoom((z) => Math.min(160, z + 15))}
                  className="p-1 hover:text-white"
                  title="Acercar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Theme modes: Dark, Sepia, Light */}
              <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setReadingTheme('dark')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${readingTheme === 'dark' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
                  title="Modo Oscuro"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setReadingTheme('sepia')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${readingTheme === 'sepia' ? 'bg-[#3b2d1f] text-amber-200' : 'text-zinc-400'}`}
                  title="Modo Sepia"
                >
                  <Coffee className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setReadingTheme('light')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${readingTheme === 'light' ? 'bg-zinc-200 text-black' : 'text-zinc-400'}`}
                  title="Modo Claro"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Download */}
              <button
                type="button"
                onClick={() => handleDownloadPDF(readingBook)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold cursor-pointer"
                title="Descargar este PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Descargar</span>
              </button>
            </div>
          </div>

          {/* Reader Main Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Chapters sidebar */}
            <div className="w-64 border-r border-zinc-800 bg-[#090c1a] p-3 hidden md:flex flex-col overflow-y-auto">
              <span className="text-[11px] font-mono uppercase font-bold text-zinc-400 px-2 mb-2">
                Índice de Capítulos
              </span>
              <div className="space-y-1">
                {readingBook.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReadingPage(ch.page)}
                    className={`w-full text-left p-2 rounded-xl text-xs font-mono transition-colors flex items-start gap-2 ${
                      readingPage === ch.page ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{ch.title}</p>
                      <span className="text-[10px] text-zinc-500">Página {ch.page}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Reading Sheet */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-black/40">
              <div 
                className={`w-full max-w-3xl rounded-2xl shadow-2xl p-6 sm:p-10 border transition-all ${
                  readingTheme === 'dark' 
                    ? 'bg-[#101428] text-zinc-200 border-zinc-800' 
                    : readingTheme === 'sepia'
                    ? 'bg-[#f4ecd8] text-[#3d2e1e] border-[#dfd2be]'
                    : 'bg-white text-zinc-900 border-zinc-200'
                }`}
                style={{ fontSize: `${readingZoom}%` }}
              >
                {/* Header inside sheet */}
                <div className="border-b pb-4 mb-6 flex items-center justify-between text-xs font-mono opacity-60">
                  <span>UNSAAC - SISTEMA DE BIBLIOTECA DIGITAL</span>
                  <span>PÁGINA {readingPage} DE {readingBook.pages}</span>
                </div>

                {/* Chapter Title */}
                <h1 className="text-xl sm:text-2xl font-bold mb-4">
                  {readingBook.chapters[0]?.title || readingBook.title}
                </h1>

                {/* Page Content */}
                <div className="space-y-4 whitespace-pre-line leading-relaxed font-serif text-sm sm:text-base">
                  {readingBook.chapters[0]?.content || readingBook.description}
                </div>

                {/* Footer sheet */}
                <div className="mt-12 pt-6 border-t flex items-center justify-between text-xs font-mono opacity-50">
                  <span>{readingBook.title}</span>
                  <span>{readingBook.author}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reader Bottom Pagination Bar */}
          <div className="h-12 px-4 sm:px-6 bg-[#0c0f20] border-t border-zinc-800 flex items-center justify-between flex-shrink-0 text-xs font-mono">
            <button
              type="button"
              onClick={() => setReadingPage((p) => Math.max(1, p - 1))}
              disabled={readingPage <= 1}
              className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <span className="text-zinc-400">
              Página <strong className="text-white">{readingPage}</strong> de {readingBook.pages}
            </span>

            <button
              type="button"
              onClick={() => setReadingPage((p) => Math.min(readingBook.pages, p + 1))}
              disabled={readingPage >= readingBook.pages}
              className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUBIR LIBRO PDF */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0d1024] border border-indigo-500/40 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Subir Libro o Apunte PDF
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Añade un texto digital al repositorio universitario general
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Título del Libro PDF *</label>
                <input
                  type="text"
                  required
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="Ej: Análisis Numérico y Métodos Iterativos"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Autor / Docente</label>
                  <input
                    type="text"
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    placeholder="Ej: Ing. Cárdenas (UNSAAC)"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">N° de Páginas</label>
                  <input
                    type="number"
                    min="1"
                    value={newBookPages}
                    onChange={(e) => setNewBookPages(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Categoría General *</label>
                <select
                  value={newBookCategory}
                  onChange={(e) => setNewBookCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {CATEGORIES.filter(c => c !== 'Todos').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Resumen / Descripción Breve</label>
                <textarea
                  rows={2}
                  value={newBookDesc}
                  onChange={(e) => setNewBookDesc(e.target.value)}
                  placeholder="Describe de qué trata el libro o temas que cubre..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-mono"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Publicar en Biblioteca</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
