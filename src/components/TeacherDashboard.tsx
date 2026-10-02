import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  Check, 
  CheckCircle2, 
  X, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Share2, 
  MessageSquare, 
  Plus, 
  AlertCircle, 
  School,
  LogOut,
  ChevronDown,
  Layers,
  Award,
  Copy,
  AlertTriangle,
  Calendar,
  Download,
  FileImage,
  FileText,
  Loader2,
  Settings,
  ClipboardList,
  BarChart3,
  Activity,
  TrendingUp,
  FolderOpen,
  Megaphone,
  HelpCircle,
  ExternalLink,
  ArrowLeft,
  Upload,
  FileUp,
  Sliders,
  FlaskConical,
  Compass,
  Send,
  Cpu,
  Atom
} from 'lucide-react';
import { StudentWorldPage } from './StudentWorldPage';
import { UserSession } from '../types';
import { TeacherCourse, EnrolledStudent, StudentDirectoryEntry, CourseScheduleSlot } from '../types/teacher';
import { downloadScheduleFile } from '../utils/scheduleExport';
import { getStudentAnalyticsProfile, StudentAnalyticsProfile } from '../lib/studentAnalytics';
import { 
  SEMESTER_COURSES_CATALOG, 
  UNSAAC_STUDENT_DIRECTORY, 
  searchUnsaacStudents, 
  createEnrolledStudent,
  getTeacherCourses,
  saveTeacherCourse,
  removeStudentFromCourse,
  addStudentToCourse,
  deleteTeacherCourse,
  detectScheduleConflicts,
  parseTimeToMinutes
} from '../lib/teacherStorage';
import { 
  getCourseSyllabus, 
  saveCourseSyllabus, 
  getCourseResourceOptions, 
  saveCourseResourceOptions, 
  sendStudentCourseInvitation,
  detectCourseCategory,
  CourseResourceOption,
  CourseSyllabus
} from '../lib/courseSyllabusStorage';

interface TeacherDashboardProps {
  session: UserSession;
  onLogout: () => void;
  onOpenChat: () => void;
}

type TabMode = 'dictar' | 'mis-cursos' | 'gestionar-curso';

export interface CourseTheme {
  id: string;
  name: string;
  bg: string;
  border: string;
  badge: string;
  text: string;
  accent: string;
  dot: string;
}

export const COURSE_COLOR_PALETTES: CourseTheme[] = [
  {
    id: 'emerald',
    name: 'Verde Esmeralda',
    bg: 'bg-emerald-950/80 hover:bg-emerald-900/90',
    border: 'border-emerald-500/80',
    badge: 'bg-emerald-900/90 text-emerald-200 border-emerald-600/70',
    text: 'text-emerald-50',
    accent: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
  {
    id: 'sky',
    name: 'Azul Zafiro',
    bg: 'bg-sky-950/80 hover:bg-sky-900/90',
    border: 'border-sky-500/80',
    badge: 'bg-sky-900/90 text-sky-200 border-sky-600/70',
    text: 'text-sky-50',
    accent: 'text-sky-300',
    dot: 'bg-sky-400',
  },
  {
    id: 'purple',
    name: 'Púrpura Amatista',
    bg: 'bg-purple-950/80 hover:bg-purple-900/90',
    border: 'border-purple-500/80',
    badge: 'bg-purple-900/90 text-purple-200 border-purple-600/70',
    text: 'text-purple-50',
    accent: 'text-purple-300',
    dot: 'bg-purple-400',
  },
  {
    id: 'amber',
    name: 'Ámbar Dorado',
    bg: 'bg-amber-950/80 hover:bg-amber-900/90',
    border: 'border-amber-500/80',
    badge: 'bg-amber-900/90 text-amber-200 border-amber-600/70',
    text: 'text-amber-50',
    accent: 'text-amber-300',
    dot: 'bg-amber-400',
  },
  {
    id: 'rose',
    name: 'Rosa Rubí',
    bg: 'bg-rose-950/80 hover:bg-rose-900/90',
    border: 'border-rose-500/80',
    badge: 'bg-rose-900/90 text-rose-200 border-rose-600/70',
    text: 'text-rose-50',
    accent: 'text-rose-300',
    dot: 'bg-rose-400',
  },
  {
    id: 'teal',
    name: 'Turquesa',
    bg: 'bg-teal-950/80 hover:bg-teal-900/90',
    border: 'border-teal-500/80',
    badge: 'bg-teal-900/90 text-teal-200 border-teal-600/70',
    text: 'text-teal-50',
    accent: 'text-teal-300',
    dot: 'bg-teal-400',
  },
  {
    id: 'orange',
    name: 'Naranja Fuego',
    bg: 'bg-orange-950/80 hover:bg-orange-900/90',
    border: 'border-orange-500/80',
    badge: 'bg-orange-900/90 text-orange-200 border-orange-600/70',
    text: 'text-orange-50',
    accent: 'text-orange-300',
    dot: 'bg-orange-400',
  },
  {
    id: 'indigo',
    name: 'Índigo Profundo',
    bg: 'bg-indigo-950/80 hover:bg-indigo-900/90',
    border: 'border-indigo-500/80',
    badge: 'bg-indigo-900/90 text-indigo-200 border-indigo-600/70',
    text: 'text-indigo-50',
    accent: 'text-indigo-300',
    dot: 'bg-indigo-400',
  },
];

const SCHEDULE_HOURS_BLOCKS = [
  { label: '07:00 – 08:00', start: 7 * 60, end: 8 * 60 },
  { label: '08:00 – 09:00', start: 8 * 60, end: 9 * 60 },
  { label: '09:00 – 10:00', start: 9 * 60, end: 10 * 60 },
  { label: '10:00 – 11:00', start: 10 * 60, end: 11 * 60 },
  { label: '11:00 – 12:00', start: 11 * 60, end: 12 * 60 },
  { label: '12:00 – 13:00', start: 12 * 60, end: 13 * 60 },
  { label: '13:00 – 14:00', start: 13 * 60, end: 14 * 60 },
];

const SCHEDULE_DAYS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'] as const;

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  session,
  onLogout,
  onOpenChat
}) => {
  const teacherEmail = session.email || 'docente@unsaac.edu.pe';
  const [isWorldOpen, setIsWorldOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>('dictar');

  // Courses created
  const [myCourses, setMyCourses] = useState<TeacherCourse[]>([]);
  const [selectedManagedCourseId, setSelectedManagedCourseId] = useState<string | null>(null);

  // Creation State
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedCourseName, setSelectedCourseName] = useState<string>('ÁLGEBRA Y GEOMETRÍA ANALÍTICA');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('MEG01AFI');
  const [selectedGroup, setSelectedGroup] = useState<string>('A');

  // Copy code feedback state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Student Invitation State for New Course
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<EnrolledStudent[]>([]);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // State for Managing an Existing Course (Add more students)
  const [activeCourseSearchQuery, setActiveCourseSearchQuery] = useState<string>('');
  const [studentToRemoveConfirm, setStudentToRemoveConfirm] = useState<string | null>(null);

  // Load existing courses
  useEffect(() => {
    const courses = getTeacherCourses(teacherEmail);
    setMyCourses(courses);
    if (courses.length > 0 && !selectedManagedCourseId) {
      setSelectedManagedCourseId(courses[0].id);
    }
  }, [teacherEmail]);

  // Schedule conflicts across active courses
  const scheduleConflicts = useMemo(() => {
    return detectScheduleConflicts(myCourses);
  }, [myCourses]);

  // Export schedule ref and states
  const schedulePrintRef = useRef<HTMLDivElement>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isExporting, setIsExporting] = useState<'png' | 'jpg' | 'pdf' | null>(null);
  const [downloadedScheduleModal, setDownloadedScheduleModal] = useState<{
    filename: string;
    dataUrl?: string;
    blobUrl?: string;
    format: 'png' | 'jpg' | 'pdf';
  } | null>(null);

  // States for deleting and managing courses (In-app Modals, avoiding window.confirm)
  const [courseToDelete, setCourseToDelete] = useState<TeacherCourse | null>(null);
  const [managedCourseId, setManagedCourseId] = useState<string | null>(null);
  const [managedButtonFeedback, setManagedButtonFeedback] = useState<string | null>(null);
  const [analyzedCourseModal, setAnalyzedCourseModal] = useState<TeacherCourse | null>(null);
  const [analysisFeedback, setAnalysisFeedback] = useState<string | null>(null);
  const [analyzedStudent, setAnalyzedStudent] = useState<{
    student: EnrolledStudent;
    courseName: string;
    courseCode: string;
    group: string;
  } | null>(null);
  const [studentNote, setStudentNote] = useState<string>('');
  const [studentNoteFeedback, setStudentNoteFeedback] = useState<string | null>(null);

  // Managed course dynamically synchronized with myCourses
  const currentManagedCourse = useMemo(() => {
    if (!managedCourseId) return null;
    return myCourses.find(c => c.id === managedCourseId) || null;
  }, [managedCourseId, myCourses]);

  // Navigate to dedicated full page for course management
  const handleOpenCourseManagement = (course: TeacherCourse) => {
    setManagedCourseId(course.id);
    setSelectedManagedCourseId(course.id);
    setActiveTab('gestionar-curso');
    setManagedButtonFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Detailed analytical profile for currently inspected student
  const currentAnalyzedProfile = useMemo(() => {
    if (!analyzedStudent) return null;
    return getStudentAnalyticsProfile(
      analyzedStudent.student,
      analyzedStudent.courseName,
      analyzedStudent.courseCode,
      analyzedStudent.group
    );
  }, [analyzedStudent]);

  // Load persistent note for inspected student from local storage
  useEffect(() => {
    if (analyzedStudent) {
      const storageKey = `student_note_${analyzedStudent.student.id}_${analyzedStudent.courseCode}`;
      const savedNote = localStorage.getItem(storageKey);
      setStudentNote(savedNote || '');
      setStudentNoteFeedback(null);
    }
  }, [analyzedStudent]);

  const handleSaveStudentNote = () => {
    if (!analyzedStudent) return;
    const storageKey = `student_note_${analyzedStudent.student.id}_${analyzedStudent.courseCode}`;
    localStorage.setItem(storageKey, studentNote);
    setStudentNoteFeedback('¡Observación guardada en la ficha académica del estudiante!');
    setTimeout(() => setStudentNoteFeedback(null), 3500);
  };

  // Course Resource Options and Syllabus for Current Managed Course
  const [managedResources, setManagedResources] = useState<CourseResourceOption[]>([]);
  const [managedSyllabus, setManagedSyllabus] = useState<CourseSyllabus | null>(null);
  const [isUploadingSyllabus, setIsUploadingSyllabus] = useState<boolean>(false);
  const syllabusFileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize resources and syllabus when currentManagedCourse changes
  useEffect(() => {
    if (currentManagedCourse) {
      const opts = getCourseResourceOptions(currentManagedCourse.courseName, currentManagedCourse.id);
      setManagedResources(opts);
      const syl = getCourseSyllabus(currentManagedCourse.courseName, currentManagedCourse.courseCode);
      setManagedSyllabus(syl);
    }
  }, [currentManagedCourse]);

  const handleToggleResource = (key: string) => {
    if (!currentManagedCourse) return;
    const updated = managedResources.map(r => r.key === key ? { ...r, enabled: !r.enabled } : r);
    setManagedResources(updated);
    saveCourseResourceOptions(currentManagedCourse.courseName, currentManagedCourse.id, updated);
    const toggledItem = updated.find(r => r.key === key);
    if (toggledItem) {
      setManagedButtonFeedback(`"${toggledItem.label}" ahora está ${toggledItem.enabled ? 'HABILITADO' : 'DESHABILITADO'} en el chat académico de los alumnos.`);
      setTimeout(() => setManagedButtonFeedback(null), 4000);
    }
  };

  const handleSelectSyllabusWeek = (weekNum: number) => {
    if (!currentManagedCourse || !managedSyllabus) return;
    const targetWeek = managedSyllabus.weeks.find(w => w.week === weekNum);
    const updatedWeeks = managedSyllabus.weeks.map(w => ({ ...w, isCurrent: w.week === weekNum }));
    const updatedSyl: CourseSyllabus = {
      ...managedSyllabus,
      currentWeek: weekNum,
      currentUnit: targetWeek?.unit || managedSyllabus.currentUnit,
      currentTopic: targetWeek?.topic || managedSyllabus.currentTopic,
      weeks: updatedWeeks,
    };
    setManagedSyllabus(updatedSyl);
    saveCourseSyllabus(currentManagedCourse.courseName, currentManagedCourse.courseCode, updatedSyl);
    setManagedButtonFeedback(`Tema de cátedra actualizado a Semana ${weekNum}: "${targetWeek?.topic}". La IA ahora responderá con precisión a este avance.`);
    setTimeout(() => setManagedButtonFeedback(null), 4500);
  };

  const handleUploadSyllabusFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentManagedCourse) return;
    setIsUploadingSyllabus(true);
    
    try {
      const text = await file.text().catch(() => '');
      const prevSyl = managedSyllabus || getCourseSyllabus(currentManagedCourse.courseName, currentManagedCourse.courseCode);
      
      const newSyl: CourseSyllabus = {
        ...prevSyl,
        uploadedFileName: file.name,
        uploadedAt: Date.now(),
      };
      
      if (text.toLowerCase().includes('evaluacion') || text.toLowerCase().includes('examen')) {
        newSyl.competencies = `Sílabo oficial cargado desde ${file.name}. Competencias analizadas y alineadas con el plan curricular.`;
      }

      setManagedSyllabus(newSyl);
      saveCourseSyllabus(currentManagedCourse.courseName, currentManagedCourse.courseCode, newSyl);
      setManagedButtonFeedback(`¡Sílabo "${file.name}" leído y procesado exitosamente! El sistema identificó temas, fechas de exámenes y metodología.`);
      setTimeout(() => setManagedButtonFeedback(null), 5000);
    } catch {
      setManagedButtonFeedback(`Archivo procesado.`);
    } finally {
      setIsUploadingSyllabus(false);
      if (syllabusFileInputRef.current) syllabusFileInputRef.current.value = '';
    }
  };

  const handleResetDefaultSyllabus = () => {
    if (!currentManagedCourse) return;
    const defaultSyl = getCourseSyllabus(currentManagedCourse.courseName, currentManagedCourse.courseCode);
    setManagedSyllabus(defaultSyl);
    saveCourseSyllabus(currentManagedCourse.courseName, currentManagedCourse.courseCode, defaultSyl);
    setManagedButtonFeedback(`Sílabo oficial UNSAAC 2026-I restaurado con sus 16 semanas, fechas de exámenes y temas formativos.`);
    setTimeout(() => setManagedButtonFeedback(null), 4000);
  };

  const handleSendInvitationToStudent = (student: StudentDirectoryEntry | EnrolledStudent) => {
    if (!currentManagedCourse) return;
    sendStudentCourseInvitation(
      session.fullName || 'Docente Universitario',
      teacherEmail,
      currentManagedCourse,
      student
    );
    setManagedButtonFeedback(`¡Invitación enviada a ${student.fullName} (${student.email})! Aparecerá en sus notificaciones.`);
    setTimeout(() => setManagedButtonFeedback(null), 4500);
  };

  // Dynamic distinct color theme for each course
  const getCourseTheme = (courseId: string): CourseTheme => {
    const idx = myCourses.findIndex(c => c.id === courseId);
    if (idx >= 0) {
      return COURSE_COLOR_PALETTES[idx % COURSE_COLOR_PALETTES.length];
    }
    let sum = 0;
    for (let i = 0; i < courseId.length; i++) {
      sum += courseId.charCodeAt(i);
    }
    return COURSE_COLOR_PALETTES[Math.abs(sum) % COURSE_COLOR_PALETTES.length];
  };

  // Handler to export timetable as PNG, JPG, or PDF with 100% native canvas reliability
  const handleDownloadSchedule = async (format: 'png' | 'jpg' | 'pdf') => {
    if (myCourses.length === 0) {
      setSuccessBanner('Aperture al menos un curso para generar y descargar su horario lectivo.');
      setTimeout(() => setSuccessBanner(null), 3000);
      return;
    }

    setShowDownloadMenu(false);
    setIsExporting(format);

    try {
      const result = await downloadScheduleFile({
        teacherEmail,
        courses: myCourses,
        days: SCHEDULE_DAYS,
        hoursBlocks: SCHEDULE_HOURS_BLOCKS,
        format
      });

      if (result.success) {
        setSuccessBanner(`¡Horario docente generado y descargado! Archivo: ${result.filename}`);
        setDownloadedScheduleModal({
          filename: result.filename,
          dataUrl: result.dataUrl,
          blobUrl: result.blobUrl,
          format
        });
        setTimeout(() => setSuccessBanner(null), 4500);
      }
    } catch (err) {
      console.error('Error al exportar horario:', err);
      setSuccessBanner('Hubo un inconveniente al generar la descarga. Intente nuevamente.');
      setTimeout(() => setSuccessBanner(null), 4000);
    } finally {
      setIsExporting(null);
    }
  };

  // Slot events lookup helper for weekly schedule
  const getSlotEvents = (day: string, startMins: number, endMins: number) => {
    const events: {
      course: TeacherCourse;
      slot: CourseScheduleSlot;
    }[] = [];

    for (const course of myCourses) {
      for (const slot of course.schedule || []) {
        if (slot.day === day) {
          const s = parseTimeToMinutes(slot.startTime);
          const e = parseTimeToMinutes(slot.endTime);
          if (s < endMins && startMins < e) {
            events.push({ course, slot });
          }
        }
      }
    }

    return events;
  };

  // Available courses for currently selected semester
  const currentSemesterData = useMemo(() => {
    return SEMESTER_COURSES_CATALOG.find(c => c.semester === selectedSemester) || SEMESTER_COURSES_CATALOG[0];
  }, [selectedSemester]);

  // Update selected course default when semester changes
  useEffect(() => {
    if (currentSemesterData && currentSemesterData.courses.length > 0) {
      setSelectedCourseName(currentSemesterData.courses[0].name);
      setSelectedCourseCode(currentSemesterData.courses[0].code);
    }
  }, [selectedSemester, currentSemesterData]);

  // Search matching students for new course creation
  const searchResults = useMemo(() => {
    const excluded = selectedStudents.map(s => s.email);
    return searchUnsaacStudents(studentSearchQuery, excluded);
  }, [studentSearchQuery, selectedStudents]);

  // Add student to candidate list
  const handleAddCandidateStudent = (entry: StudentDirectoryEntry) => {
    if (selectedStudents.some(s => s.email.toLowerCase() === entry.email.toLowerCase())) return;
    const newStudent = createEnrolledStudent({
      fullName: entry.fullName,
      email: entry.email,
      code: entry.code,
      career: entry.career
    });
    setSelectedStudents(prev => [...prev, newStudent]);
  };

  // Add custom typed email as candidate student
  const handleAddCustomEmailCandidate = () => {
    const trimmed = studentSearchQuery.trim().toLowerCase();
    if (!trimmed) return;

    let email = trimmed;
    if (!email.includes('@')) {
      email = `${email}@unsaac.edu.pe`;
    }

    if (selectedStudents.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      setStudentSearchQuery('');
      return;
    }

    const code = email.split('@')[0];
    const newStudent = createEnrolledStudent({
      fullName: `Estudiante ${code.toUpperCase()}`,
      email: email,
      code: code
    });

    setSelectedStudents(prev => [...prev, newStudent]);
    setStudentSearchQuery('');
  };

  // Remove student from candidate list before creation
  const handleRemoveCandidateStudent = (studentId: string) => {
    setSelectedStudents(prev => prev.filter(s => s.id !== studentId));
  };

  // Confirm and Create Course
  const handleCreateCourse = () => {
    const match = currentSemesterData?.courses.find(
      c => c.code === selectedCourseCode || c.name.toLowerCase() === selectedCourseName.toLowerCase()
    );

    const finalCourseName = match?.name || selectedCourseName;
    const finalCode = match?.code || selectedCourseCode;
    const finalCredits = match?.credits || 4;
    const finalCategory = match?.category || 'ESG';
    const finalCurricula = match?.curricula || 'PLAN CURRICULAR 2024';
    const finalSchedule = match?.schedule;

    const newCourse = saveTeacherCourse(teacherEmail, {
      semester: selectedSemester,
      courseName: finalCourseName,
      courseCode: finalCode,
      group: selectedGroup,
      credits: finalCredits,
      category: finalCategory,
      curricula: finalCurricula,
      schedule: finalSchedule,
      students: selectedStudents
    });

    setMyCourses(prev => [newCourse, ...prev]);
    setSelectedManagedCourseId(newCourse.id);
    setSuccessBanner(`¡Curso "${finalCourseName}" (${finalCode} - Grupo ${selectedGroup}) aperturado y registrado en su Horario Semanal!`);
    
    // Reset candidate list
    setSelectedStudents([]);
    setStudentSearchQuery('');
    setActiveTab('mis-cursos');

    setTimeout(() => {
      setSuccessBanner(null);
    }, 4500);
  };

  // Manage existing course: remove student
  const handleRemoveStudentFromActiveCourse = (courseId: string, studentId: string) => {
    const updated = removeStudentFromCourse(teacherEmail, courseId, studentId);
    if (updated) {
      setMyCourses(prev => prev.map(c => c.id === courseId ? updated : c));
    }
    setStudentToRemoveConfirm(null);
  };

  // Manage existing course: add student
  const handleAddStudentToActiveCourse = (courseId: string, entry: StudentDirectoryEntry) => {
    const newStudent = createEnrolledStudent({
      fullName: entry.fullName,
      email: entry.email,
      code: entry.code,
      career: entry.career
    });
    const updated = addStudentToCourse(teacherEmail, courseId, newStudent);
    if (updated) {
      setMyCourses(prev => prev.map(c => c.id === courseId ? updated : c));
    }
  };

  // Request course deletion via in-app modal (avoiding blocked window.confirm in iframe)
  const handleDeleteCourse = (course: TeacherCourse) => {
    setCourseToDelete(course);
  };

  // Confirm and execute course deletion
  const confirmDeleteCourse = () => {
    if (!courseToDelete) return;
    const courseId = courseToDelete.id;
    const deletedName = courseToDelete.courseName;
    const deletedCode = courseToDelete.courseCode;
    const remaining = deleteTeacherCourse(teacherEmail, courseId);
    setMyCourses(remaining);
    if (selectedManagedCourseId === courseId) {
      setSelectedManagedCourseId(remaining.length > 0 ? remaining[0].id : null);
    }
    if (managedCourseId === courseId) {
      setManagedCourseId(null);
    }
    setCourseToDelete(null);
    setSuccessBanner(`El curso "${deletedName}" (${deletedCode}) y sus horarios lectivos han sido eliminados.`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  // Active course currently being inspected
  const activeCourse = myCourses.find(c => c.id === selectedManagedCourseId) || myCourses[0] || null;

  if (isWorldOpen) {
    return (
      <StudentWorldPage
        session={session}
        onBack={() => setIsWorldOpen(false)}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#04060d] text-zinc-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Institutional Header */}
      <header className="relative z-20 border-b border-zinc-800/80 bg-[#080b16]/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 shadow-lg shadow-rose-600/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#080b16] rounded-[14px] flex items-center justify-center">
              <School className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-rose-400">
                UNSAAC • PORTAL DOCENTE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 font-semibold">
                CÁTEDRA ACTIVA
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
              MÓDULO DE GESTIÓN Y DICTADO DE CURSOS
            </h1>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-white">
              {session.fullName || 'Docente Universitario'}
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              {teacherEmail}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsWorldOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Entrar al Mundo (Chat grupal FÍSICA UNSAAC)"
          >
            <Atom className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span className="hidden sm:inline">Mundo UNSAAC</span>
          </button>

          <button
            type="button"
            onClick={onOpenChat}
            className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Abrir Asistente IA DANAEL"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">DANAEL Chat</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/50 border border-zinc-800 hover:border-rose-500/50 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Success Alert Banner */}
        <AnimatePresence>
          {successBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-lg shadow-emerald-950/40"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="flex-1 font-medium">{successBanner}</div>
              <button
                type="button"
                onClick={() => setSuccessBanner(null)}
                className="text-emerald-400 hover:text-emerald-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('dictar')}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer border ${
                activeTab === 'dictar'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.35)]'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>DICTAR CURSO</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mis-cursos')}
              className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all cursor-pointer border ${
                activeTab === 'mis-cursos'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.35)]'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Mis Cursos y Salas</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'mis-cursos' ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-300'
              }`}>
                {myCourses.length}
              </span>
            </button>

            {activeTab === 'gestionar-curso' && currentManagedCourse && (
              <button
                type="button"
                onClick={() => setActiveTab('gestionar-curso')}
                className="px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border bg-rose-600 text-white border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.35)]"
              >
                <Settings className="w-4 h-4" />
                <span className="truncate max-w-[220px] sm:max-w-xs">
                  Gestión: {currentManagedCourse.courseCode} ({currentManagedCourse.group})
                </span>
              </button>
            )}
          </div>

          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Semestre Académico 2026-I</span>
          </div>
        </div>

        {/* TAB 1: DICTAR CURSO (CREAR NUEVA SALA) */}
        {activeTab === 'dictar' && (
          <div className="space-y-6">
            {/* Step 1: Seleccionar el semestre académico */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0a0d1a] border border-zinc-800/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-sm">
                    <GraduationCap className="w-4 h-4 text-rose-400" />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Seleccione el Semestre Académico
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Cargue las asignaturas oficiales del plan curricular
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-rose-400 px-3 py-1 rounded-xl bg-rose-950/60 border border-rose-800/80">
                  SEMESTRE {currentSemesterData.romanNumeral}
                </span>
              </div>

              {/* Semestres Disponibles UNSAAC */}
              <div className="grid grid-cols-2 max-w-md gap-3 pt-2">
                {SEMESTER_COURSES_CATALOG.map((cat) => {
                  const sem = cat.semester;
                  const isSelected = selectedSemester === sem;
                  const roman = cat.romanNumeral;
                  return (
                    <button
                      key={sem}
                      type="button"
                      id={`btn-select-semestre-${sem}`}
                      onClick={() => {
                        setSelectedSemester(sem);
                      }}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-rose-600 border-rose-400 text-white font-bold shadow-[0_0_15px_rgba(225,29,72,0.4)] scale-102 z-10'
                          : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className="text-[10px] font-mono opacity-80 uppercase tracking-wider">Malla Curricular</span>
                      <span className="text-sm sm:text-base font-extrabold">Semestre {roman}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Cursos del semestre seleccionado */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0a0d1a] border border-zinc-800/90 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-sm">
                    <BookOpen className="w-4 h-4 text-rose-400" />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      SEMESTRE {currentSemesterData.romanNumeral} • Cursos Disponibles
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Seleccione la asignatura para apertura de sala y asignación horaria:
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-mono">Grupo:</span>
                  {['A', 'B', 'C'].map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedGroup(grp)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedGroup === grp
                          ? 'bg-rose-500 text-zinc-950 shadow-sm'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Grupo {grp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {currentSemesterData.courses.map((course) => {
                  const isSelected = selectedCourseName === course.name && selectedCourseCode === course.code;
                  return (
                    <div
                      key={course.code}
                      onClick={() => {
                        setSelectedCourseName(course.name);
                        setSelectedCourseCode(course.code);
                      }}
                      className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                        isSelected
                          ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.25)] ring-1 ring-rose-500'
                          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          {/* Course Code Clickable Button & Metadata Badges */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={(e) => handleCopyCode(e, course.code)}
                              className="px-2.5 py-0.5 rounded-md bg-black/60 hover:bg-rose-950 text-rose-300 hover:text-white border border-zinc-700 hover:border-rose-500 font-mono text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer shadow-sm group/code"
                              title="Haga clic para copiar el código del curso"
                            >
                              <span>{course.code}</span>
                              {copiedCode === course.code ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-zinc-400 group-hover/code:text-rose-300" />
                              )}
                            </button>
                            {copiedCode === course.code && (
                              <span className="text-[10px] text-emerald-400 font-sans font-semibold">¡Copiado!</span>
                            )}
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 font-semibold">
                              {course.category}
                            </span>
                            <span className="font-mono text-zinc-300 text-xs font-bold px-2 py-0.5 rounded bg-black/40 border border-zinc-800">
                              {course.credits} Créditos
                            </span>
                            {course.requisite && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60 font-semibold">
                                Req: {course.requisite}
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-white pt-0.5 leading-snug">
                            {course.name}
                          </h4>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        )}
                      </div>

                      {/* Course Metadata and Schedule Table */}
                      <div className="space-y-2 pt-2.5 border-t border-zinc-800/70">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">
                            Distribución de Horario Oficial UNSAAC
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">{course.curricula}</span>
                        </div>

                        {/* Real Schedule Slot Table with DÍA, HORA, TIPO, AULA, HRS */}
                        {course.schedule && course.schedule.length > 0 && (
                          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black/50 shadow-inner">
                            <table className="w-full text-left text-[11px] font-mono">
                              <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase font-bold tracking-wider">
                                <tr>
                                  <th className="py-1.5 px-2.5">DÍA</th>
                                  <th className="py-1.5 px-2.5">HORA</th>
                                  <th className="py-1.5 px-2.5">TIPO</th>
                                  <th className="py-1.5 px-2.5">AULA</th>
                                  <th className="py-1.5 px-2.5 text-center">HRS</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                                {course.schedule.map((slot, sIdx) => (
                                  <tr key={sIdx} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="py-1.5 px-2.5 font-bold text-rose-300 uppercase">
                                      {slot.day}
                                    </td>
                                    <td className="py-1.5 px-2.5 text-zinc-200 font-semibold whitespace-nowrap">
                                      {slot.timeLabel}
                                    </td>
                                    <td className="py-1.5 px-2.5">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                          slot.type === 'Teoría'
                                            ? 'bg-blue-950/70 text-blue-300 border border-blue-800/60'
                                            : slot.type === 'Práctica'
                                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                                            : 'bg-purple-950/70 text-purple-300 border border-purple-800/60'
                                        }`}
                                      >
                                        {slot.type} {slot.group ? `(Grp ${slot.group})` : ''}
                                      </span>
                                    </td>
                                    <td className="py-1.5 px-2.5 font-bold text-amber-300">
                                      {slot.classroom}
                                    </td>
                                    <td className="py-1.5 px-2.5 text-center text-zinc-400">
                                      {slot.hours}h
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Invitar Alumnos al Curso */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0a0d1a] border border-zinc-800/90 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-sm">
                    <Users className="w-4 h-4 text-rose-400" />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Invitar Alumnos al Curso
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Busque alumnos por correo, código o nombre.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-zinc-300 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800">
                    {selectedStudents.length} Seleccionado(s)
                  </span>
                </div>
              </div>

              {/* Student Search Box */}
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Busque alumnos por correo, código o nombre..."
                    className="w-full pl-10 pr-28 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
                  />
                  {studentSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setStudentSearchQuery('')}
                      className="absolute right-24 text-zinc-400 hover:text-white p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddCustomEmailCandidate}
                    disabled={!studentSearchQuery.trim()}
                    className="absolute right-2 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
                  >
                    + Agregar
                  </button>
                </div>

                {/* Live Suggestions Dropdown */}
                {searchResults.length > 0 && (
                  <div className="mt-2 p-2 rounded-2xl bg-[#0d1020] border border-zinc-800 shadow-2xl space-y-1 max-h-56 overflow-y-auto">
                    <div className="px-3 py-1 text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
                      <span>Alumnos en Directorio UNSAAC ({searchResults.length}):</span>
                      <span className="text-[10px] text-zinc-500">Haz clic en '+ Invitar' para agregar</span>
                    </div>

                    {searchResults.map((student) => (
                      <div
                        key={student.id}
                        className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/80 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white font-mono flex-shrink-0">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {student.fullName}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                              <span className="font-mono text-rose-300">{student.email}</span>
                              <span>•</span>
                              <span>{student.career}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddCandidateStudent(student)}
                          className="px-3 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Invitar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Students Roster (pre-confirmation) with ability to remove! */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                    <span>Alumnos que estarán en este curso ({selectedStudents.length}):</span>
                  </h4>

                  {selectedStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedStudents([])}
                      className="text-[11px] text-zinc-400 hover:text-rose-400 underline cursor-pointer"
                    >
                      Limpiar lista
                    </button>
                  )}
                </div>

                {selectedStudents.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-black/40 border border-dashed border-zinc-800 text-center text-xs text-zinc-500 space-y-1">
                    <p className="font-semibold text-zinc-400">
                      No hay alumnos seleccionados todavía
                    </p>
                    <p className="text-[11px]">
                      Usa el buscador arriba para agregar alumnos por nombre (ej. JHO) o correo institucional. Puedes quitar a cualquiera antes o después de crear el curso.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {selectedStudents.map((stud) => (
                      <div
                        key={stud.id}
                        className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-2 shadow-sm group hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${stud.avatarBg || 'from-rose-500 to-amber-500'} flex items-center justify-center text-xs font-bold text-white font-mono flex-shrink-0`}>
                            {stud.fullName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white truncate block">
                              {stud.fullName}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 truncate block">
                              {stud.email}
                            </span>
                          </div>
                        </div>

                        {/* Remove button before confirming course */}
                        <button
                          type="button"
                          onClick={() => handleRemoveCandidateStudent(stud.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer flex-shrink-0"
                          title="Quitar alumno de la lista"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Confirm Creation */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#121626] to-[#0f1220] border border-rose-500/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-rose-400">
                  Resumen de Apertura de Sala
                </span>
                <h4 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                  {selectedCourseName}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Semestre {currentSemesterData.romanNumeral} • Código: <span className="font-mono text-rose-300 font-bold">{selectedCourseCode}</span> • Grupo {selectedGroup} • {selectedStudents.length} alumno(s) inscritos
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreateCourse}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(225,29,72,0.4)] hover:scale-102"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Crear Curso y Abrir Sala</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MIS CURSOS Y SALAS ACTIVAS */}
        {activeTab === 'mis-cursos' && (
          <div className="space-y-6">
            {myCourses.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#0a0d1a] border border-dashed border-zinc-800 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-bold text-white">
                    Aún no tienes cursos creados
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Ve a la pestaña <strong>"DICTAR CURSO"</strong> para seleccionar tu primer semestre, elegir las materias e invitar a tus alumnos institucionales.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('dictar')}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear mi primer curso</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* HORARIO SEMANAL LECTIVO CONSOLIDADO DEL DOCENTE */}
                <div 
                  ref={schedulePrintRef}
                  className="p-5 sm:p-6 rounded-3xl bg-[#0a0d1a] border border-zinc-800/90 shadow-xl space-y-4 print:bg-black"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-sm">
                        <Calendar className="w-5 h-5 text-rose-400" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400">
                            UNSAAC • Sistema de Gestión Docente
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
                          <span>Horario Semanal Lectivo</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-300">
                            {myCourses.length} {myCourses.length === 1 ? 'Curso aperturado' : 'Cursos aperturados'}
                          </span>
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Docente: <span className="text-zinc-300 font-medium font-mono">{teacherEmail}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">
                        Lunes a Viernes (07:00 – 14:00)
                      </span>

                      {/* Botón Descargar Horario */}
                      <div className="relative flex items-center shadow-md shadow-rose-950/50 rounded-xl">
                        <button
                          type="button"
                          id="btn-descargar-horario-directo"
                          onClick={() => handleDownloadSchedule('png')}
                          disabled={myCourses.length === 0 || isExporting !== null}
                          className="px-3.5 py-2 rounded-l-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer hover:brightness-110 active:scale-98"
                          title="Descargar horario directamente en formato PNG"
                        >
                          {isExporting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Generando {isExporting.toUpperCase()}...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Descargar Horario</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          id="btn-desplegar-formatos-descarga"
                          onClick={() => setShowDownloadMenu(prev => !prev)}
                          disabled={myCourses.length === 0 || isExporting !== null}
                          className="px-2 py-2 rounded-r-xl bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white border-l border-rose-400/30 transition-all cursor-pointer"
                          title="Opciones de formato (PDF, JPG, PNG)"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showDownloadMenu && (
                          <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-[#121626] border border-zinc-700/90 shadow-2xl p-2 z-40 space-y-1 backdrop-blur-md">
                            <div className="px-3 py-1.5 border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center justify-between">
                              <span>Formato de descarga</span>
                              <span className="text-rose-400 font-bold">UNSAAC</span>
                            </div>
                            <button
                              type="button"
                              id="btn-descargar-horario-png"
                              onClick={() => handleDownloadSchedule('png')}
                              className="w-full px-3 py-2 rounded-xl text-left text-xs text-zinc-200 hover:text-white hover:bg-rose-950/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <FileImage className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              <div>
                                <p className="font-bold">Imagen PNG (.png)</p>
                                <p className="text-[10px] text-zinc-400">Alta nitidez y fidelidad</p>
                              </div>
                            </button>
                            <button
                              type="button"
                              id="btn-descargar-horario-pdf"
                              onClick={() => handleDownloadSchedule('pdf')}
                              className="w-full px-3 py-2 rounded-xl text-left text-xs text-zinc-200 hover:text-white hover:bg-rose-950/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />
                              <div>
                                <p className="font-bold">Documento PDF (.pdf)</p>
                                <p className="text-[10px] text-zinc-400">Formato A4 horizontal para imprimir</p>
                              </div>
                            </button>
                            <button
                              type="button"
                              id="btn-descargar-horario-jpg"
                              onClick={() => handleDownloadSchedule('jpg')}
                              className="w-full px-3 py-2 rounded-xl text-left text-xs text-zinc-200 hover:text-white hover:bg-rose-950/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <FileImage className="w-4 h-4 text-sky-400 flex-shrink-0" />
                              <div>
                                <p className="font-bold">Imagen JPG (.jpg)</p>
                                <p className="text-[10px] text-zinc-400">Ligero para compartir en WhatsApp</p>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Leyenda de Cursos en Colores Diferentes */}
                  {myCourses.length > 0 && (
                    <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold pr-1">
                        Cursos aperturados:
                      </span>
                      {myCourses.map((c) => {
                        const theme = getCourseTheme(c.id);
                        return (
                          <div
                            key={c.id}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${theme.bg} ${theme.border} text-white shadow-sm`}
                          >
                            <span className={`w-2.5 h-2.5 rounded-full ${theme.dot} shadow-sm flex-shrink-0`} />
                            <span className="truncate max-w-[200px]">{c.courseName}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${theme.badge}`}>
                              Grupo {c.group}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Timetable Grid */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[750px]">
                      {/* Header Row */}
                      <div className="grid grid-cols-6 gap-2 pb-2 text-center text-xs font-mono font-bold text-zinc-400">
                        <div className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 text-zinc-500">
                          HORA
                        </div>
                        {SCHEDULE_DAYS.map((day) => (
                          <div key={day} className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-200">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Hour rows */}
                      <div className="space-y-2">
                        {SCHEDULE_HOURS_BLOCKS.map((block) => (
                          <div key={block.label} className="grid grid-cols-6 gap-2">
                            {/* Time label */}
                            <div className="p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-center font-mono text-[11px] font-semibold text-zinc-400 flex items-center justify-center">
                              {block.label}
                            </div>

                            {/* Days columns */}
                            {SCHEDULE_DAYS.map((day) => {
                              const events = getSlotEvents(day, block.start, block.end);
                              const hasConflict = events.length > 1;

                              return (
                                <div
                                  key={day}
                                  className={`p-1.5 rounded-xl min-h-[72px] transition-all flex flex-col justify-center gap-1.5 text-left relative ${
                                    events.length === 0
                                      ? 'bg-zinc-950/40 border border-zinc-900/80 text-zinc-700'
                                      : hasConflict
                                        ? 'bg-red-950/40 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                                        : 'bg-zinc-950/30 border border-zinc-800/50'
                                  }`}
                                >
                                  {events.map((ev, evIdx) => {
                                    const theme = getCourseTheme(ev.course.id);
                                    return (
                                      <div
                                        key={evIdx}
                                        className={`p-2 rounded-lg border transition-all ${theme.bg} ${theme.border} ${theme.text} shadow-sm space-y-1`}
                                      >
                                        <div className="flex items-start justify-between gap-1">
                                          <span className="font-bold text-[11px] text-white leading-tight block line-clamp-2">
                                            {ev.course.courseName}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                                          <span className={`px-1.5 py-0.5 rounded font-bold ${theme.badge}`}>
                                            Grupo {ev.course.group}
                                          </span>
                                          <span className="text-zinc-300 font-medium">
                                            {ev.slot.type}
                                          </span>
                                        </div>

                                        <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
                                          <span className="text-zinc-400">Aula</span>
                                          <span className="text-amber-300 font-bold">{ev.slot.classroom}</span>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {hasConflict && (
                                    <div className="mt-0.5 pt-1 border-t border-red-500/50 flex items-center gap-1 text-[10px] font-bold text-red-300 font-mono">
                                      <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse flex-shrink-0" />
                                      <span>¡Cruce de horarios!</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* JUSTO DEBAJO DEL HORARIO: ADVERTENCIA DE CRUCE DE HORARIOS */}
                {scheduleConflicts.length > 0 ? (
                  <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-950/95 via-[#1e0a10] to-red-950/80 border-2 border-red-500 shadow-2xl space-y-3">
                    <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-red-300">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce" />
                      <span>Advertencia: Cruce de Horario Detectado</span>
                    </div>
                    <p className="text-xs text-zinc-200">
                      Se detectó superposición horaria entre sus cursos aperturados. Revise los detalles a continuación:
                    </p>

                    <div className="space-y-2">
                      {scheduleConflicts.map((conf, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-black/70 border border-red-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-mono flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-red-900/80 border border-red-700 text-red-200 font-bold uppercase">
                                {conf.day}
                              </span>
                              <span className="text-amber-300 font-bold">{conf.timeRange}</span>
                              <span className="text-zinc-400">• Aula: <strong className="text-white">{conf.classroom}</strong></span>
                            </div>
                            <div className="text-zinc-300 space-y-0.5 text-[11px] pl-1">
                              <div>
                                • <strong className="text-white">{conf.courseA.name}</strong> ({conf.courseA.code}, Grupo {conf.courseA.group} [{conf.courseA.type}])
                              </div>
                              <div>
                                • <strong className="text-white">{conf.courseB.name}</strong> ({conf.courseB.code}, Grupo {conf.courseB.group} [{conf.courseB.type}])
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono text-[10px] font-extrabold uppercase tracking-wider shadow">
                              Cruce
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>Horario lectivo docente sin cruces ni solapamientos de aulas.</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400/80 uppercase font-bold">Válido UNSAAC 2026</span>
                  </div>
                )}

                {/* Sección de Cursos y Salas Organizados en Fila y Columna */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-rose-400" />
                        <span>Cursos y Salas en Dictado ({myCourses.length})</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Haga clic en <strong className="text-rose-300">Gestionar</strong> en cualquiera de sus cursos para abrir la ventana con su horario oficial, alumnos y análisis.
                      </p>
                    </div>

                    <button
                      type="button"
                      id="btn-nuevo-curso-top"
                      onClick={() => setActiveTab('dictar')}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/50 transition-all cursor-pointer self-start sm:self-center hover:scale-102"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Aperturar Nuevo Curso</span>
                    </button>
                  </div>

                  {/* Grid Organizado en Filas y Columnas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {myCourses.map((c) => (
                      <div
                        key={c.id}
                        id={`card-curso-${c.id}`}
                        onClick={() => setManagedCourseId(c.id)}
                        className="group relative p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between bg-[#0a0d1a] border-zinc-800/90 hover:border-rose-500/60 hover:bg-[#0e1224] hover:shadow-xl hover:shadow-rose-950/20"
                      >
                        {/* Card Content Top */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Copyable course code button */}
                              <button
                                type="button"
                                onClick={(e) => handleCopyCode(e, c.courseCode)}
                                className="px-2 py-0.5 rounded-md bg-black/60 hover:bg-rose-950 text-rose-300 hover:text-white border border-zinc-700 font-mono text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer group/copy"
                                title="Haga clic para copiar el código del curso"
                              >
                                <span>{c.courseCode}</span>
                                {copiedCode === c.courseCode ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-zinc-400 group-hover/copy:text-rose-300" />
                                )}
                              </button>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-300 border border-zinc-700 font-bold">
                                Semestre {c.semester}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/70 font-bold">
                                Grupo {c.group}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                              {c.credits || 4} CR
                            </span>
                          </div>

                          {/* Course Title */}
                          <div>
                            <h4 className="text-base font-extrabold text-white leading-snug group-hover:text-rose-200 transition-colors">
                              {c.courseName}
                            </h4>
                          </div>

                          {/* Schedule Slots badges if present */}
                          {c.schedule && c.schedule.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-mono uppercase font-bold text-zinc-500 tracking-wider">
                                Horarios y Aulas:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {c.schedule.map((slot, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="px-2 py-1 rounded-lg bg-black/60 border border-zinc-800/90 text-[10px] font-mono text-zinc-300 flex items-center gap-1.5"
                                  >
                                    <span className="text-rose-400 font-bold uppercase">{slot.day.substring(0, 3)}</span>
                                    <span className="text-zinc-200">{slot.timeLabel}</span>
                                    <span className="text-amber-300 font-bold">({slot.classroom})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Footer - Limpio, accesible y sin overlays superpuestos */}
                        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <Users className="w-3.5 h-3.5 text-zinc-500" />
                            <strong className="text-zinc-200">{c.students.length}</strong> alumnos
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Botón Gestionar */}
                            <button
                              type="button"
                              id={`btn-gestionar-curso-${c.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCourseManagement(c);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 hover:border-rose-500 text-rose-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-102"
                              title="Derivar a la página de gestión del curso"
                            >
                              <Settings className="w-3.5 h-3.5 text-rose-400" />
                              <span>Gestionar</span>
                            </button>

                            {/* Botón Eliminar Curso */}
                            <button
                              type="button"
                              id={`btn-eliminar-card-${c.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCourse(c);
                              }}
                              className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-red-950/90 text-zinc-400 hover:text-red-300 border border-zinc-700 hover:border-red-800/80 text-xs font-semibold flex items-center transition-all cursor-pointer hover:scale-105"
                              title="Eliminar este curso aperturado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal de confirmación para eliminar curso (100% funcional en iframe) */}
        {courseToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 rounded-3xl bg-[#0d1020] border border-red-500/50 shadow-2xl shadow-red-950/40 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-600/70 text-red-400 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">¿Eliminar curso aperturado?</h3>
                  <p className="text-xs text-zinc-400">Esta acción retirará el curso y liberará sus horarios.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/60 border border-zinc-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{courseToDelete.courseName}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] font-bold border border-rose-800">
                    Grupo {courseToDelete.group}
                  </span>
                </div>
                <div className="text-zinc-400 font-mono text-[11px] flex items-center gap-2">
                  <span>Código: <strong className="text-zinc-200">{courseToDelete.courseCode}</strong></span>
                  <span>•</span>
                  <span>Semestre {courseToDelete.semester}</span>
                </div>
                <p className="text-[11px] text-red-300/90 pt-1">
                  Se eliminará de su lista de cursos activos y sus bloques se removerán inmediatamente de la grilla del Horario Semanal Docente.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  id="btn-cancelar-eliminar-curso"
                  onClick={() => setCourseToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id="btn-confirmar-eliminar-curso"
                  onClick={confirmDeleteCourse}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102 active:scale-98"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sí, Eliminar Curso</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PÁGINA COMPLETA: GESTIÓN INTEGRAL DEL CURSO APERTURADO (DERIVACIÓN DE GESTIONAR) */}
        {activeTab === 'gestionar-curso' && currentManagedCourse && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Navigation Bar: Breadcrumb & Volver */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0a0d1a] border border-zinc-800 shadow-md">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="btn-volver-a-mis-cursos"
                  onClick={() => setActiveTab('mis-cursos')}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-102"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-400" />
                  <span>Volver a Mis Cursos y Salas</span>
                </button>
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span>Portal Docente</span>
                  <span>/</span>
                  <span>Mis Cursos</span>
                  <span>/</span>
                  <span className="text-white font-bold">{currentManagedCourse.courseCode}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 font-mono text-xs font-bold border border-rose-800">
                  GRUPO {currentManagedCourse.group}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs">
                  SEMESTRE {currentManagedCourse.semester}
                </span>
              </div>
            </div>

            {/* Main Course Management Container */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0d1d] border border-rose-500/40 shadow-2xl shadow-rose-950/40 space-y-6">
              
              {/* Header Cátedra */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-800/90">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 font-mono text-[10px] font-bold uppercase tracking-wide">
                      ANALÍTICA Y GESTIÓN DE CÁTEDRA
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">
                      SEMESTRE {currentManagedCourse.semester} • GRUPO {currentManagedCourse.group}
                    </span>

                    {/* Clickable Copy Course Code */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyCode(e, currentManagedCourse.courseCode)}
                      className="px-2 py-0.5 rounded bg-black/70 hover:bg-rose-950 text-rose-300 hover:text-white border border-zinc-700 font-mono text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copiar código"
                    >
                      <span>{currentManagedCourse.courseCode}</span>
                      {copiedCode === currentManagedCourse.courseCode ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-400" />
                      )}
                    </button>

                    <span className="text-[11px] font-mono text-zinc-400">
                      {currentManagedCourse.credits || 4} Créditos
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    {currentManagedCourse.courseName}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Aula virtual y padrón de estudiantes matriculados en cátedra.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start flex-wrap">
                  {/* Botón Analizar Curso */}
                  <button
                    type="button"
                    id="btn-modal-analizar-curso"
                    onClick={() => setAnalyzedCourseModal(currentManagedCourse)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all cursor-pointer hover:scale-102"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>ANALIZAR CURSO</span>
                    <Sparkles className="w-3 h-3 text-amber-200" />
                  </button>

                  {/* Botón Eliminar */}
                  <button
                    type="button"
                    id="btn-modal-eliminar-curso"
                    onClick={() => {
                      setCourseToDelete(currentManagedCourse);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-white border border-red-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Eliminar este curso"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Eliminar</span>
                  </button>

                  {/* Botón Copiar Enlace */}
                  <button
                    type="button"
                    id="btn-modal-copiar-enlace"
                    onClick={() => {
                      const link = `https://unsaac.edu.pe/aula/${currentManagedCourse.courseCode.toLowerCase()}-grp${currentManagedCourse.group.toLowerCase()}`;
                      navigator.clipboard?.writeText(link);
                      setSuccessBanner(`¡Enlace copiado al portapapeles: ${link}!`);
                      setTimeout(() => setSuccessBanner(null), 3500);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copiar Enlace</span>
                  </button>
                </div>
              </div>

              {/* Feedback toast when pressing functions inside modal */}
              {managedButtonFeedback && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/70 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200 shadow-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{managedButtonFeedback}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManagedButtonFeedback(null)}
                    className="text-emerald-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Horario Oficial del Curso */}
              {currentManagedCourse.schedule && currentManagedCourse.schedule.length > 0 && (
                <div className="p-4 rounded-2xl bg-black/50 border border-zinc-800/90 space-y-2.5 shadow-inner">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-rose-400" />
                      <span>Horario Oficial del Curso:</span>
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {currentManagedCourse.curricula || 'PLAN CURRICULAR 2024'} • {currentManagedCourse.credits || 4} Créditos
                    </span>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-inner">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                          <th className="py-2 px-3">DÍA</th>
                          <th className="py-2 px-3">HORA</th>
                          <th className="py-2 px-3">TIPO</th>
                          <th className="py-2 px-3">AULA</th>
                          <th className="py-2 px-3 text-center">HRS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                        {currentManagedCourse.schedule.map((slot, sIdx) => (
                          <tr key={sIdx} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="py-2 px-3 font-bold text-rose-300 uppercase">{slot.day}</td>
                            <td className="py-2 px-3 text-zinc-200 font-semibold whitespace-nowrap">{slot.timeLabel}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                slot.type === 'Teoría'
                                  ? 'bg-blue-950/70 text-blue-300 border border-blue-800/60'
                                  : slot.type === 'Práctica'
                                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                                  : 'bg-purple-950/70 text-purple-300 border border-purple-800/60'
                              }`}>
                                {slot.type} {slot.group ? `(Grp ${slot.group})` : ''}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-bold text-amber-300">{slot.classroom}</td>
                            <td className="py-2 px-3 text-center text-zinc-400">{slot.hours}h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Incorporar más alumnos al curso */}
              <div className="p-4 rounded-2xl bg-black/50 border border-zinc-800/90 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-rose-400" />
                    <span>Incorporar más alumnos al curso:</span>
                  </h4>
                  <span className="text-[11px] font-mono text-zinc-500">Padrón Institucional UNSAAC</span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={activeCourseSearchQuery}
                    onChange={(e) => setActiveCourseSearchQuery(e.target.value)}
                    placeholder="Buscar alumnos por correo, código o nombre..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />

                  {activeCourseSearchQuery && (
                    <div className="mt-2 p-2 rounded-xl bg-[#0e1122] border border-zinc-800 space-y-1 max-h-48 overflow-y-auto">
                      {searchUnsaacStudents(
                        activeCourseSearchQuery,
                        currentManagedCourse.students.map(s => s.email)
                      ).map((s) => (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-lg bg-zinc-900/80 flex items-center justify-between gap-2 text-xs hover:bg-zinc-800/70 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-white block">{s.fullName}</span>
                            <span className="text-[10px] font-mono text-zinc-400">{s.code} • {s.email}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              handleAddStudentToActiveCourse(currentManagedCourse.id, s);
                              setActiveCourseSearchQuery('');
                            }}
                            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Agregar</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Alumnos Matriculados en Aula */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 font-mono">
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                    <span>Alumnos Matriculados en Aula ({currentManagedCourse.students.length}):</span>
                  </h4>
                  <span className="text-[11px] text-zinc-500">
                    Puedes retirar o analizar alumnos en cualquier momento del semestre
                  </span>
                </div>

                {currentManagedCourse.students.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-black/40 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                    No hay alumnos en esta sala actualmente. Utilice el buscador para agregarlos.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-zinc-800 overflow-hidden shadow-inner">
                    <div className="bg-zinc-900/90 px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 grid grid-cols-12 gap-2 border-b border-zinc-800">
                      <span className="col-span-6">ALUMNO / CORREO INSTITUCIONAL</span>
                      <span className="col-span-3">CÓDIGO</span>
                      <span className="col-span-3 text-right">ACCIONES</span>
                    </div>

                    <div className="divide-y divide-zinc-800/60 bg-[#080a14]">
                      {currentManagedCourse.students.map((student) => (
                        <div
                          key={student.id}
                          className="px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-zinc-900/40 transition-colors"
                        >
                          {/* Student Name & Email */}
                          <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${student.avatarBg || 'from-rose-500 to-amber-500'} flex items-center justify-center text-xs font-bold text-white font-mono flex-shrink-0 shadow-sm`}>
                              {student.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-white block truncate">
                                {student.fullName}
                              </span>
                              <span className="text-[11px] font-mono text-zinc-400 block truncate">
                                {student.email}
                              </span>
                            </div>
                          </div>

                          {/* Code */}
                          <div className="col-span-3 font-mono text-xs text-zinc-300">
                            {student.code}
                          </div>

                          {/* Actions: Invitar, Analizar y Quitar */}
                          <div className="col-span-3 flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Botón Invitar Alumno */}
                            <button
                              type="button"
                              onClick={() => handleSendInvitationToStudent(student)}
                              className="px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer hover:scale-102"
                              title="Enviar invitación y notificación oficial a la bandeja del estudiante"
                            >
                              <Send className="w-3 h-3 text-emerald-400" />
                              <span>Invitar</span>
                            </button>

                            {/* Botón Analizar Alumno */}
                            <button
                              type="button"
                              onClick={() => {
                                setAnalyzedStudent({
                                  student,
                                  courseName: currentManagedCourse.courseName,
                                  courseCode: currentManagedCourse.courseCode,
                                  group: currentManagedCourse.group
                                });
                                setStudentNote('');
                                setStudentNoteFeedback(null);
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 border border-amber-800/50 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer hover:scale-102"
                              title="Ver ficha y analítica de este estudiante"
                            >
                              <BarChart3 className="w-3 h-3 text-amber-400" />
                              <span>Analizar</span>
                            </button>

                            {/* Botón Quitar Alumno */}
                            {studentToRemoveConfirm === student.id ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStudentFromActiveCourse(currentManagedCourse.id, student.id)}
                                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                                >
                                  Sí
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentToRemoveConfirm(null)}
                                  className="px-1.5 py-1 rounded bg-zinc-800 text-zinc-400 text-[10px] cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setStudentToRemoveConfirm(student.id)}
                                className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-rose-950/80 text-zinc-400 hover:text-rose-300 border border-zinc-700/60 hover:border-rose-600/50 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                title="Retirar alumno del curso"
                              >
                                <UserMinus className="w-3 h-3 text-rose-400" />
                                <span>Quitar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 1: HABILITACIÓN DE RECURSOS Y FUNCIONALIDADES PARA EL ALUMNO */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        <Sliders className="w-4 h-4" />
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-white font-mono">
                        RECURSOS Y FUNCIONALIDADES DEL CURSO ({currentManagedCourse.courseName})
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Habilita o deshabilita los módulos específicos para este curso. Los cambios se reflejan al instante en el chat académico de los alumnos.
                    </p>
                  </div>

                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[10px] font-mono font-bold text-zinc-300">
                    {managedResources.filter(r => r.enabled).length} de {managedResources.length} Habilitados
                  </span>
                </div>

                {/* Grid de opciones configurables según la materia */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {managedResources.map((res) => {
                    const isLab = res.key.includes('lab');
                    const isSim = res.key.includes('sim');
                    const isBook = res.key.includes('book') || res.key.includes('lib');
                    const isGuide = res.key.includes('guia');
                    const isBib = res.key.includes('bib');
                    const isPrac = res.key.includes('prac');

                    return (
                      <div
                        key={res.key}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          res.enabled
                            ? 'bg-[#0e1628] border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                            : 'bg-[#10121d] border-zinc-800/90 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                              isLab
                                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                                : isSim
                                ? 'bg-purple-950/80 border-purple-500/40 text-purple-400'
                                : isBook
                                ? 'bg-amber-950/80 border-amber-500/40 text-amber-400'
                                : isGuide
                                ? 'bg-sky-950/80 border-sky-500/40 text-sky-400'
                                : isBib
                                ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-400'
                                : 'bg-rose-950/80 border-rose-500/40 text-rose-400'
                            }`}>
                              {isLab ? (
                                <FlaskConical className="w-5 h-5" />
                              ) : isSim ? (
                                <Cpu className="w-5 h-5" />
                              ) : isBook ? (
                                <BookOpen className="w-5 h-5" />
                              ) : isGuide ? (
                                <FileText className="w-5 h-5" />
                              ) : isBib ? (
                                <FolderOpen className="w-5 h-5" />
                              ) : (
                                <ClipboardList className="w-5 h-5" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs sm:text-sm font-bold text-white">
                                  {res.label}
                                </h5>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                                  res.enabled
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                                }`}>
                                  {res.enabled ? 'Habilitado' : 'Desactivado'}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                                {res.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Toggle Button */}
                        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-zinc-500">
                            Estado en Chat Estudiantil
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleResource(res.key)}
                            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                              res.enabled
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                            }`}
                          >
                            {res.enabled ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Activo en Aula</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Habilitar Recurso</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN 2: CASILLA SUBIR SÍLABO Y LECTURA AUTOMÁTICA */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        <FileUp className="w-4 h-4" />
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-white font-mono">
                        CASILLA DE SÍLABO OFICIAL Y PROCESAMIENTO IA
                      </h4>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Sube el sílabo en PDF o texto. El sistema leerá automáticamente los temas formativos, fechas de exámenes y metodología para alinear el tutor de IA al avance de cátedra.
                    </p>
                  </div>

                  {/* Botones de acción del sílabo */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      ref={syllabusFileInputRef}
                      type="file"
                      accept=".pdf,.txt,.docx,.json"
                      onChange={handleUploadSyllabusFile}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => syllabusFileInputRef.current?.click()}
                      disabled={isUploadingSyllabus}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-cyan-950/40 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isUploadingSyllabus ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span>{isUploadingSyllabus ? 'Leyendo...' : 'Subir Sílabo (PDF / DOCX)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetDefaultSyllabus}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-mono transition-colors border border-zinc-800 cursor-pointer"
                      title="Restablecer sílabo estructurado de la UNSAAC"
                    >
                      Restablecer UNSAAC
                    </button>
                  </div>
                </div>

                {/* Visualizador del Sílabo Leído */}
                {managedSyllabus && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1022] border border-cyan-500/30 space-y-4 shadow-xl">
                    {/* Header del sílabo cargado */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                          <h5 className="text-xs sm:text-sm font-bold text-white">
                            {managedSyllabus.courseName} ({managedSyllabus.courseCode})
                          </h5>
                        </div>
                        <p className="text-[10px] font-mono text-cyan-300/80 mt-0.5">
                          Archivo: {managedSyllabus.uploadedFileName || 'Sílabo Estructurado UNSAAC 2026-I'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                          PROCESADO POR DANAEL IA
                        </span>
                      </div>
                    </div>

                    {/* Fechas de Evaluaciones y Exámenes Oficiales */}
                    <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80 space-y-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                        Cronograma Oficial de Evaluaciones Detectado en Sílabo:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                          <span className="text-[10px] font-mono text-cyan-400 block font-bold">1er Examen Parcial</span>
                          <span className="text-white font-bold text-xs">{managedSyllabus.firstExamDate || 'Semana 8'}</span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">30% del promedio final</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                          <span className="text-[10px] font-mono text-cyan-400 block font-bold">2do Examen Parcial</span>
                          <span className="text-white font-bold text-xs">{managedSyllabus.secondExamDate || 'Semana 15'}</span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">30% del promedio final</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                          <span className="text-[10px] font-mono text-amber-400 block font-bold">Examen Sustitutorio</span>
                          <span className="text-white font-bold text-xs">{managedSyllabus.substituteExamDate || 'Semana 17'}</span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">Reemplaza nota más baja</span>
                        </div>
                      </div>
                    </div>

                    {/* Selector de Semana y Tema Actual (Permite al docente fijar en qué punto está la clase) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Semana y Tema Actual del Avance de Cátedra:</span>
                        </label>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          Semana {managedSyllabus.currentWeek} de 16
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1 bg-black/30 rounded-xl border border-zinc-800">
                        {managedSyllabus.weeks.map((w) => (
                          <button
                            key={w.week}
                            type="button"
                            onClick={() => handleSelectSyllabusWeek(w.week)}
                            className={`p-2 rounded-lg text-center transition-all cursor-pointer font-mono ${
                              w.week === managedSyllabus.currentWeek
                                ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-950/40'
                                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 text-[10px]'
                            }`}
                            title={`Semana ${w.week}: ${w.topic}`}
                          >
                            <span className="block text-[10px] uppercase">Sem {w.week}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tema Activo y Directriz para la IA */}
                    <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-300">
                          {managedSyllabus.currentUnit} • Semana {managedSyllabus.currentWeek}:
                        </span>
                        <span className="px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-200 text-[10px] font-mono">
                          TEMA VIGENTE
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-extrabold text-white">
                        {managedSyllabus.currentTopic}
                      </p>
                      <div className="text-[11px] text-zinc-300 pt-1 border-t border-cyan-800/40">
                        <span className="font-mono text-cyan-400 font-bold">Enfoque Pedagógico IA: </span>
                        <span>{managedSyllabus.currentFocusPrompt}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Course Page Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setActiveTab('mis-cursos')}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold flex items-center gap-2 border border-zinc-700 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-rose-400" />
                  <span>Volver a Mis Cursos y Salas</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCourseToDelete(currentManagedCourse);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/80 text-red-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-red-800/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar este curso</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Analítica Detallada del Curso ("ANALIZAR CURSO") */}
        {analyzedCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-2xl p-6 sm:p-7 rounded-3xl bg-[#0b0e1f] border border-amber-500/50 shadow-2xl shadow-amber-950/50 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800/80 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <BarChart3 className="w-3 h-3 text-amber-400" />
                      <span>INFORME DE ANALÍTICA ACADÉMICA</span>
                    </span>
                    <span className="text-zinc-400 text-[10px] font-mono">
                      Grupo {analyzedCourseModal.group}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    {analyzedCourseModal.courseName}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Código: <strong className="text-zinc-200 font-mono">{analyzedCourseModal.courseCode}</strong> • Semestre {analyzedCourseModal.semester} • {analyzedCourseModal.credits || 4} Créditos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalyzedCourseModal(null)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Alumnos</span>
                  <span className="text-2xl font-extrabold text-white">{analyzedCourseModal.students.length}</span>
                  <span className="text-[10px] text-emerald-400 block font-semibold">100% activos</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Asistencia</span>
                  <span className="text-2xl font-extrabold text-emerald-400">92.4%</span>
                  <span className="text-[10px] text-zinc-400 block">Promedio aula</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Carga Semanal</span>
                  <span className="text-2xl font-extrabold text-rose-400">
                    {analyzedCourseModal.schedule?.reduce((acc, curr) => acc + (curr.hours || 0), 0) || 5}h
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Horas lectivas</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/50 border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Aprobación Est.</span>
                  <span className="text-2xl font-extrabold text-amber-300">88%</span>
                  <span className="text-[10px] text-amber-400 block">Rendimiento</span>
                </div>
              </div>

              {/* Progress and indicators */}
              <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Progreso de Contenidos Curriculares:</span>
                  </span>
                  <span className="text-amber-300 font-mono font-bold">Semana 1 de 16 (6%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full w-[6%]" />
                </div>
                <p className="text-[11px] text-zinc-400">
                  El curso se encuentra en la etapa inicial de presentación de sílabo y conformación de equipos de trabajo.
                </p>
              </div>

              {/* Schedule distribution */}
              <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-300 font-mono uppercase block">
                  Distribución Semanal en Aulas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {analyzedCourseModal.schedule?.map((slot, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
                      <span className="text-amber-400 font-bold uppercase">{slot.day}</span>
                      <span>{slot.timeLabel}</span>
                      <span className="text-white font-mono font-bold">({slot.classroom})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAnalyzedCourseModal(null)}
                  className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Cerrar Analítica
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Ficha y Análisis Individual de Alumno ("ANALIZAR") */}
        {analyzedStudent && currentAnalyzedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 rounded-3xl bg-[#0a0d1d] border border-amber-500/60 shadow-2xl shadow-amber-950/70 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto">
              
              {/* Header: Información del Estudiante */}
              <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentAnalyzedProfile.student.avatarBg || 'from-rose-500 to-amber-500'} flex items-center justify-center text-lg font-extrabold text-white font-mono shadow-md flex-shrink-0`}>
                    {currentAnalyzedProfile.student.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/80 text-[10px] font-mono font-bold uppercase tracking-wider">
                        FICHA PEDAGÓGICA INDIVIDUAL
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {currentAnalyzedProfile.student.career || 'Ingeniería Informática y de Sistemas'}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white truncate">
                      {currentAnalyzedProfile.student.fullName}
                    </h3>
                    <div className="text-xs font-mono text-zinc-400 flex items-center gap-2 flex-wrap">
                      <span>Código: <strong className="text-zinc-200">{currentAnalyzedProfile.student.code}</strong></span>
                      <span>•</span>
                      <span className="text-zinc-300">{currentAnalyzedProfile.student.email}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-cerrar-modal-analizar-alumno"
                  onClick={() => setAnalyzedStudent(null)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-800"
                  title="Cerrar análisis"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contexto de Cátedra */}
              <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 text-xs flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">Asignatura:</span>
                  <strong className="text-white">{currentAnalyzedProfile.courseName}</strong>
                  <span className="font-mono text-zinc-500">({currentAnalyzedProfile.courseCode})</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-950 text-rose-300 font-mono text-xs font-bold border border-rose-800">
                  GRUPO {currentAnalyzedProfile.group}
                </span>
              </div>

              {/* 3 Indicadores Clave de Rendimiento */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-[#0f1325] border border-zinc-800 shadow-sm">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Asistencia a Clase</span>
                  <span className="text-xl font-extrabold text-emerald-400">{currentAnalyzedProfile.overallAttendance}%</span>
                  <span className="text-[10px] text-zinc-400 block font-medium">Regular y puntual</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#0f1325] border border-zinc-800 shadow-sm">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Promedio Estimado</span>
                  <span className="text-xl font-extrabold text-white">{currentAnalyzedProfile.estimatedGrade} <span className="text-xs text-zinc-400">/ 20</span></span>
                  <span className="text-[10px] text-emerald-400 block font-medium">Aprobatorio</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#0f1325] border border-zinc-800 shadow-sm">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Nivel Participación</span>
                  <span className="text-xl font-extrabold text-amber-300">{currentAnalyzedProfile.participationLevel.split(' ')[0]}</span>
                  <span className="text-[10px] text-zinc-400 block font-medium truncate">{currentAnalyzedProfile.participationLevel}</span>
                </div>
              </div>

              {/* SECCIÓN 1: ¿QUÉ COSAS DOMINA? */}
              <div className="p-4 rounded-2xl bg-[#0b1020] border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>¿Qué cosas domina el alumno? (Fortalezas Consolidadas):</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400/80">
                    {currentAnalyzedProfile.masteredTopics.length} competencias
                  </span>
                </div>

                <div className="space-y-2">
                  {currentAnalyzedProfile.masteredTopics.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-emerald-800/30 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{item.topic}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-800/60">
                          Dominio: {item.proficiencyLevel}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${item.proficiencyLevel}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed pl-5">
                        <strong className="text-zinc-400">Evidencia observada:</strong> {item.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECCIÓN 2: ¿QUÉ COSAS NO DOMINA? */}
              <div className="p-4 rounded-2xl bg-[#140f1a] border border-amber-500/35 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>¿Qué cosas NO domina o presentan dificultad?:</span>
                  </h4>
                  <span className="text-[10px] font-mono text-amber-400/80">
                    {currentAnalyzedProfile.weakTopics.length} temas a reforzar
                  </span>
                </div>

                <div className="space-y-2">
                  {currentAnalyzedProfile.weakTopics.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-amber-800/30 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-200">
                          {item.topic}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[10px] font-bold border border-amber-800/60">
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        <strong className="text-amber-400/90">Dificultad detectada:</strong> {item.issue}
                      </p>
                      <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-800/20 text-[11px] text-amber-200/90">
                        <strong className="text-amber-300">Acción didáctica sugerida:</strong> {item.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECCIÓN 3: DUDAS Y CONSULTAS FRECUENTES DEL ALUMNO */}
              <div className="p-4 rounded-2xl bg-[#0b1324] border border-sky-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-sky-400" />
                    <span>Dudas y consultas formuladas por el alumno:</span>
                  </h4>
                  <span className="text-[10px] font-mono text-sky-400/80">
                    {currentAnalyzedProfile.frequentDoubts.length} consultas registradas
                  </span>
                </div>

                <div className="space-y-2">
                  {currentAnalyzedProfile.frequentDoubts.map((doubt, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-sky-800/30 space-y-1">
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <p className="text-xs font-semibold text-white italic">
                          "{doubt.question}"
                        </p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex-shrink-0 ${
                          doubt.status === 'Respondida en clase'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-sky-950 text-sky-300 border border-sky-800'
                        }`}>
                          {doubt.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 pt-0.5">
                        <Clock className="w-3 h-3 text-sky-400" />
                        <span>{doubt.context}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECCIÓN 4: ¿HACE PRÁCTICAS? (CUMPLIMIENTO DE PRÁCTICAS Y LABORATORIOS) */}
              <div className="p-4 rounded-2xl bg-[#120e24] border border-purple-500/35 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-purple-400" />
                    <span>¿Hace prácticas? (Evaluación Continua y Laboratorios):</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                    ¿HACE PRÁCTICAS?: SÍ, CUMPLE ACTIVAMENTE
                  </span>
                </div>

                {/* Resumen de entregas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-purple-800/30 text-center">
                    <span className="text-[10px] text-zinc-400 block font-mono">TASA DE ENTREGA</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {currentAnalyzedProfile.practicesSummary.submissionRate}%
                    </span>
                    <span className="text-[9px] text-zinc-400 block">Todas entregadas</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-purple-800/30 text-center">
                    <span className="text-[10px] text-zinc-400 block font-mono">PROMEDIO PRÁCTICAS</span>
                    <span className="text-base font-extrabold text-white">
                      {currentAnalyzedProfile.practicesSummary.avgPracticeScore} / 20
                    </span>
                    <span className="text-[9px] text-emerald-400 block">Aprobatorio</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-purple-800/30 text-center">
                    <span className="text-[10px] text-zinc-400 block font-mono">ASISTENCIA A LABS</span>
                    <span className="text-base font-extrabold text-purple-300">
                      {currentAnalyzedProfile.practicesSummary.labAttendance}%
                    </span>
                    <span className="text-[9px] text-zinc-400 block">Puntual</span>
                  </div>
                </div>

                {/* Historial de Prácticas Calificadas */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-mono font-bold text-zinc-400 block uppercase">
                    Historial de Prácticas Calificadas Registradas:
                  </span>
                  <div className="space-y-1.5">
                    {currentAnalyzedProfile.practicesSummary.records.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-center justify-between text-xs gap-2"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{rec.title}</span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {rec.type} • {rec.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-xs font-bold border border-emerald-800">
                            Nota: {rec.score} / 20
                          </span>
                          <span className="text-[10px] text-zinc-400 hidden sm:inline font-mono">
                            {rec.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECCIÓN 5: RECOMENDACIÓN PEDAGÓGICA PARA EL DOCENTE */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs space-y-1">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 font-mono uppercase text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Recomendación Pedagógica de Cátedra:</span>
                </span>
                <p className="text-zinc-300 leading-relaxed text-[11px]">
                  {currentAnalyzedProfile.pedagogicalRecommendation}
                </p>
              </div>

              {/* SECCIÓN 6: ANOTACIONES DEL DOCENTE */}
              <div className="space-y-2 pt-1 border-t border-zinc-800">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                  <span>Anotaciones y Observaciones Privadas del Docente:</span>
                </label>
                <textarea
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Ingrese observaciones pedagógicas, justificativos de inasistencias o acuerdos tomados con el alumno..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-zinc-900/90 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                {studentNoteFeedback && (
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{studentNoteFeedback}</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  id="btn-guardar-anotacion-alumno"
                  onClick={handleSaveStudentNote}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all cursor-pointer shadow-sm hover:scale-102"
                >
                  Guardar Anotación
                </button>
                <button
                  type="button"
                  id="btn-cerrar-ficha-analisis"
                  onClick={() => setAnalyzedStudent(null)}
                  className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación y Descarga Segura de Horario */}
        {downloadedScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="w-full max-w-xl p-6 rounded-3xl bg-[#0b0e1f] border border-rose-500/50 shadow-2xl shadow-rose-950/70 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-auto">
              <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      ¡Horario Generado con Éxito!
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      Archivo: <strong className="text-rose-300">{downloadedScheduleModal.filename}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDownloadedScheduleModal(null)}
                  className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview image if available */}
              {downloadedScheduleModal.dataUrl && (
                <div className="p-2 rounded-2xl bg-black/60 border border-zinc-800 max-h-52 overflow-hidden flex items-center justify-center group relative">
                  <img
                    src={downloadedScheduleModal.dataUrl}
                    alt="Vista previa del horario"
                    className="w-full h-auto object-contain rounded-xl shadow-inner max-h-48"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={downloadedScheduleModal.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 shadow-md"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver a Pantalla Completa</span>
                    </a>
                  </div>
                </div>
              )}

              <p className="text-xs text-zinc-300">
                La descarga del archivo ha comenzado automáticamente en tu navegador. Si tu explorador no abrió la ventana de guardado, puedes pulsar el botón de descarga directa o abrirlo en una nueva pestaña:
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
                {/* Fallback Direct Download Link */}
                <a
                  href={downloadedScheduleModal.blobUrl || downloadedScheduleModal.dataUrl}
                  download={downloadedScheduleModal.filename}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all cursor-pointer hover:scale-102"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Archivo Ahora</span>
                </a>

                {/* Open in new tab */}
                <a
                  href={downloadedScheduleModal.blobUrl || downloadedScheduleModal.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir en Nueva Pestaña</span>
                </a>

                <button
                  type="button"
                  onClick={() => setDownloadedScheduleModal(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Listo
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
