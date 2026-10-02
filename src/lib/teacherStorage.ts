import { 
  TeacherCourse, 
  EnrolledStudent, 
  StudentDirectoryEntry,
  CatalogCourseItem,
  CourseScheduleSlot,
  ScheduleConflict
} from '../types/teacher';

export interface SemesterCoursesCatalog {
  semester: number;
  romanNumeral: string;
  courses: CatalogCourseItem[];
}

export const SEMESTER_COURSES_CATALOG: SemesterCoursesCatalog[] = [
  {
    semester: 1,
    romanNumeral: 'I',
    courses: [
      {
        code: 'MEG01AFI',
        name: 'ÁLGEBRA Y GEOMETRÍA ANALÍTICA',
        credits: 4,
        category: 'ESG',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Matemática y Estadística',
        schedule: [
          { day: 'MARTES', startTime: '07:00', endTime: '09:00', timeLabel: '7:00–9:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
          { day: 'JUEVES', startTime: '07:00', endTime: '09:00', timeLabel: '7:00–9:00', type: 'Práctica', classroom: 'C-117', hours: 2 },
          { day: 'VIERNES', startTime: '08:00', endTime: '09:00', timeLabel: '8:00–9:00', type: 'Teoría', classroom: 'C-117', hours: 1 }
        ]
      },
      {
        code: 'MEG02AFI',
        name: 'CÁLCULO I',
        credits: 4,
        category: 'ESG',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Matemática y Estadística',
        schedule: [
          { day: 'LUNES', startTime: '09:00', endTime: '11:00', timeLabel: '9:00–11:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
          { day: 'MIÉRCOLES', startTime: '09:00', endTime: '11:00', timeLabel: '9:00–11:00', type: 'Práctica', classroom: 'C-117', hours: 2 },
          { day: 'VIERNES', startTime: '09:00', endTime: '10:00', timeLabel: '9:00–10:00', type: 'Teoría', classroom: 'C-117', hours: 1 }
        ]
      },
      {
        code: 'CBG01AFI',
        name: 'ECOLOGÍA Y MEDIO AMBIENTE',
        credits: 3,
        category: 'ESG',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Biología y Ecología',
        schedule: [
          { day: 'MIÉRCOLES', startTime: '11:00', endTime: '13:00', timeLabel: '11:00–13:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
          { day: 'VIERNES', startTime: '11:00', endTime: '13:00', timeLabel: '11:00–13:00', type: 'Laboratorio', classroom: 'C-117', hours: 2 }
        ]
      },
      {
        code: 'HIG01AFI',
        name: 'HISTORIA CRÍTICA DEL PERÚ E IDENTIDAD NACIONAL',
        credits: 3,
        category: 'ESG',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Humanidades y Ciencias Sociales',
        schedule: [
          { day: 'MARTES', startTime: '11:00', endTime: '13:00', timeLabel: '11:00–13:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
          { day: 'JUEVES', startTime: '11:00', endTime: '13:00', timeLabel: '11:00–13:00', type: 'Práctica', classroom: 'C-117', hours: 2 }
        ]
      },
      {
        code: 'LCG01AFI',
        name: 'LINGÜÍSTICA Y COMUNICACIÓN HUMANA',
        credits: 4,
        category: 'ESG',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Lingüística y Literatura',
        schedule: [
          { day: 'LUNES', startTime: '07:00', endTime: '09:00', timeLabel: '7:00–9:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
          { day: 'MIÉRCOLES', startTime: '07:00', endTime: '09:00', timeLabel: '7:00–9:00', type: 'Práctica', classroom: 'C-117', hours: 2 },
          { day: 'VIERNES', startTime: '07:00', endTime: '08:00', timeLabel: '7:00–8:00', type: 'Teoría', classroom: 'C-117', hours: 1 }
        ]
      },
      {
        code: 'QUG01AFI',
        name: 'QUÍMICA GENERAL',
        credits: 4,
        category: 'ESG',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Química',
        schedule: [
          { day: 'MARTES', startTime: '09:00', endTime: '11:00', timeLabel: '9:00–11:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
          { day: 'JUEVES', startTime: '09:00', endTime: '11:00', timeLabel: '9:00–11:00', type: 'Práctica', classroom: 'C-117', hours: 2 },
          { day: 'VIERNES', startTime: '10:00', endTime: '11:00', timeLabel: '10:00–11:00', type: 'Teoría', classroom: 'C-117', hours: 1 }
        ]
      }
    ]
  },
  {
    semester: 2,
    romanNumeral: 'II',
    courses: [
      {
        code: 'MEF05AFI',
        name: 'ALGEBRA LINEAL',
        credits: 4,
        category: 'EEF',
        requisite: 'FIG01',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Matemática y Estadística',
        schedule: [
          { day: 'LUNES', startTime: '18:00', endTime: '20:00', timeLabel: '18:00–20:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
          { day: 'MARTES', startTime: '18:00', endTime: '20:00', timeLabel: '18:00–20:00', type: 'Práctica', classroom: 'C-117', hours: 2 },
          { day: 'JUEVES', startTime: '18:00', endTime: '19:00', timeLabel: '18:00–19:00', type: 'Teoría', classroom: 'C-117', hours: 1 }
        ]
      },
      {
        code: 'MEG04AFI',
        name: 'CÁLCULO II',
        credits: 4,
        category: 'ESG',
        requisite: 'MEG02',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Matemática y Estadística',
        schedule: [
          { day: 'MARTES', startTime: '16:00', endTime: '18:00', timeLabel: '16:00–18:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
          { day: 'JUEVES', startTime: '16:00', endTime: '18:00', timeLabel: '16:00–18:00', type: 'Práctica', classroom: 'C-117', hours: 2 },
          { day: 'VIERNES', startTime: '17:00', endTime: '18:00', timeLabel: '17:00–18:00', type: 'Teoría', classroom: 'C-117', hours: 1 }
        ]
      },
      {
        code: 'FIF02AFI',
        name: 'COMPOSICIÓN CIENTÍFICA',
        credits: 3,
        category: 'EEF',
        requisite: '—',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Filosofía y Humanidades',
        schedule: [
          { day: 'LUNES', startTime: '16:00', endTime: '18:00', timeLabel: '16:00–18:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
          { day: 'MIÉRCOLES', startTime: '16:00', endTime: '18:00', timeLabel: '16:00–18:00', type: 'Práctica', classroom: 'C-117', hours: 2 }
        ]
      },
      {
        code: 'MEG03AFI',
        name: 'ESTADÍSTICA GENERAL',
        credits: 4,
        category: 'ESG',
        requisite: '—',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Matemática y Estadística',
        schedule: [
          { day: 'MARTES', startTime: '14:00', endTime: '16:00', timeLabel: '14:00–16:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
          { day: 'JUEVES', startTime: '14:00', endTime: '16:00', timeLabel: '14:00–16:00', type: 'Práctica', classroom: 'C-117', hours: 2 },
          { day: 'VIERNES', startTime: '15:00', endTime: '16:00', timeLabel: '15:00–16:00', type: 'Teoría', classroom: 'C-117', hours: 1 }
        ]
      },
      {
        code: 'FIG01AFI',
        name: 'FÍSICA I',
        credits: 4,
        category: 'ESG',
        requisite: '—',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Física',
        schedule: [
          { day: 'LUNES', startTime: '14:00', endTime: '16:00', timeLabel: '14:00–16:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
          { day: 'MIÉRCOLES', startTime: '14:00', endTime: '16:00', timeLabel: '14:00–16:00', type: 'Práctica', classroom: 'C-117', hours: 2 },
          { day: 'VIERNES', startTime: '14:00', endTime: '15:00', timeLabel: '14:00–15:00', type: 'Teoría', classroom: 'C-117', hours: 1 }
        ]
      },
      {
        code: 'IFG01AFI',
        name: 'PENSAMIENTO COMPUTACIONAL E INTELIGENCIA ARTIFICIAL',
        credits: 3,
        category: 'ESG',
        requisite: '—',
        curricula: 'PLAN CURRICULAR 2024',
        department: 'Ingeniería Informática y de Sistemas',
        schedule: [
          { day: 'LUNES', startTime: '09:00', endTime: '11:00', timeLabel: '9:00–11:00', type: 'Laboratorio', classroom: 'IN312', hours: 2, group: 'A' },
          { day: 'LUNES', startTime: '11:00', endTime: '13:00', timeLabel: '11:00–13:00', type: 'Laboratorio', classroom: 'IN312', hours: 2, group: 'B' },
          { day: 'MIÉRCOLES', startTime: '18:00', endTime: '20:00', timeLabel: '18:00–20:00', type: 'Teoría', classroom: 'C-117', hours: 2 }
        ]
      }
    ]
  }
];

// Institutional directory of UNSAAC students with real names and @unsaac.edu.pe emails
export const UNSAAC_STUDENT_DIRECTORY: StudentDirectoryEntry[] = [
  {
    id: 'unsaac-212867',
    code: '212867',
    fullName: 'Jhonatan Quispe Condori',
    email: '212867@unsaac.edu.pe',
    career: 'Ingeniería Informática y de Sistemas',
    semester: 1
  },
  {
    id: 'unsaac-211890',
    code: '211890',
    fullName: 'Jhonas Mendoza Huamán',
    email: '211890@unsaac.edu.pe',
    career: 'Ingeniería Informática y de Sistemas',
    semester: 1
  },
  {
    id: 'unsaac-215012',
    code: '215012',
    fullName: 'Jhon Anthony Vargas Huanca',
    email: '215012@unsaac.edu.pe',
    career: 'Ingeniería Electrónica',
    semester: 1
  },
  {
    id: 'unsaac-214532',
    code: '214532',
    fullName: 'Jhonatan Ramos Ccama',
    email: '214532@unsaac.edu.pe',
    career: 'Ingeniería Civil',
    semester: 2
  },
  {
    id: 'unsaac-204891',
    code: '204891',
    fullName: 'Jhoselyn Karen Paucar Alvarez',
    email: '204891@unsaac.edu.pe',
    career: 'Física',
    semester: 3
  },
  {
    id: 'unsaac-213401',
    code: '213401',
    fullName: 'Jhonny Alexandro Flores Tupa',
    email: '213401@unsaac.edu.pe',
    career: 'Ingeniería Mecánica',
    semester: 1
  },
  {
    id: 'unsaac-210982',
    code: '210982',
    fullName: 'Jhon Franco Huillca Farfán',
    email: '210982@unsaac.edu.pe',
    career: 'Ingeniería Informática y de Sistemas',
    semester: 2
  },
  {
    id: 'unsaac-214781',
    code: '214781',
    fullName: 'Juan Carlos Huamán Quispe',
    email: '214781@unsaac.edu.pe',
    career: 'Ingeniería Informática y de Sistemas',
    semester: 2
  },
  {
    id: 'unsaac-212390',
    code: '212390',
    fullName: 'Juan Diego Condori Tupa',
    email: '212390@unsaac.edu.pe',
    career: 'Física',
    semester: 1
  },
  {
    id: 'unsaac-215882',
    code: '215882',
    fullName: 'Juan Manuel Pérez Ochoa',
    email: '215882@unsaac.edu.pe',
    career: 'Ingeniería Mecánica',
    semester: 3
  },
  {
    id: 'unsaac-203419',
    code: '203419',
    fullName: 'Juan Pablo Farfán Ccama',
    email: '203419@unsaac.edu.pe',
    career: 'Ingeniería Electrónica',
    semester: 2
  },
  {
    id: 'unsaac-212903',
    code: '212903',
    fullName: 'Katherine Soto Cardenas',
    email: '212903@unsaac.edu.pe',
    career: 'Ingeniería Informática y de Sistemas',
    semester: 1
  },
  {
    id: 'unsaac-210455',
    code: '210455',
    fullName: 'Marco Antonio Alvarez Miranda',
    email: '210455@unsaac.edu.pe',
    career: 'Ingeniería Civil',
    semester: 1
  },
  {
    id: 'unsaac-212440',
    code: '212440',
    fullName: 'Rodrigo Sebastian Choque Nina',
    email: '212440@unsaac.edu.pe',
    career: 'Ingeniería Química',
    semester: 1
  },
  {
    id: 'unsaac-213890',
    code: '213890',
    fullName: 'Luciana Nicole Estrada Rios',
    email: '213890@unsaac.edu.pe',
    career: 'Matemática',
    semester: 2
  },
  {
    id: 'unsaac-203112',
    code: '203112',
    fullName: 'Carlos Eduardo Huaman Callo',
    email: '203112@unsaac.edu.pe',
    career: 'Ingeniería Informática y de Sistemas',
    semester: 3
  },
  {
    id: 'unsaac-214902',
    code: '214902',
    fullName: 'Diana Carolina Mamani Quispe',
    email: '214902@unsaac.edu.pe',
    career: 'Ingeniería Electrónica',
    semester: 1
  },
  {
    id: 'unsaac-211567',
    code: '211567',
    fullName: 'Alvaro Gabriel Delgado Vera',
    email: '211567@unsaac.edu.pe',
    career: 'Ingeniería Industrial',
    semester: 2
  },
  {
    id: 'unsaac-212198',
    code: '212198',
    fullName: 'Valeria Sofia Guzman Torres',
    email: '212198@unsaac.edu.pe',
    career: 'Física',
    semester: 1
  },
  {
    id: 'unsaac-210321',
    code: '210321',
    fullName: 'Sebastian Mateo Cruz Cahuana',
    email: '210321@unsaac.edu.pe',
    career: 'Ingeniería Informática y de Sistemas',
    semester: 2
  },
  {
    id: 'unsaac-214119',
    code: '214119',
    fullName: 'Camila Andrea Silva Peña',
    email: '214119@unsaac.edu.pe',
    career: 'Ingeniería Civil',
    semester: 1
  }
];

const AVATAR_COLORS = [
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-indigo-600',
  'from-rose-500 to-pink-600',
  'from-sky-500 to-cyan-600',
];

/**
 * Searches the student directory in real time by query
 * Can match by first name, last name, code, or institutional email
 */
export function searchUnsaacStudents(query: string, excludeEmails: string[] = []): StudentDirectoryEntry[] {
  const trimmed = query.trim().toLowerCase();
  const excludeSet = new Set(excludeEmails.map(e => e.toLowerCase()));

  if (!trimmed) {
    // Return first 6 available students
    return UNSAAC_STUDENT_DIRECTORY.filter(s => !excludeSet.has(s.email.toLowerCase())).slice(0, 6);
  }

  // Normalize query removing accents for easy search
  const cleanQ = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  return UNSAAC_STUDENT_DIRECTORY.filter(student => {
    if (excludeSet.has(student.email.toLowerCase())) return false;

    const cleanName = student.fullName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cleanEmail = student.email.toLowerCase();
    const cleanCode = student.code.toLowerCase();

    return (
      cleanName.includes(cleanQ) ||
      cleanEmail.includes(cleanQ) ||
      cleanCode.includes(cleanQ)
    );
  });
}

/**
 * Creates an EnrolledStudent instance from a directory entry or custom valid input
 */
export function createEnrolledStudent(data: {
  fullName: string;
  email: string;
  code?: string;
  career?: string;
}): EnrolledStudent {
  const code = data.code || (data.email.split('@')[0] || 'UNSAAC');
  const hash = (data.fullName + data.email).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarBg = AVATAR_COLORS[hash % AVATAR_COLORS.length];

  return {
    id: `stud-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    code,
    fullName: data.fullName,
    email: data.email.toLowerCase().trim(),
    career: data.career || 'Estudiante UNSAAC',
    avatarBg,
    enrolledAt: Date.now()
  };
}

// STORAGE KEY
function getStorageKey(teacherEmail: string): string {
  const safe = (teacherEmail || 'docente_default').toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `danael_teacher_courses_${safe}`;
}

/**
 * Loads all created courses for a teacher
 */
export function getTeacherCourses(teacherEmail: string): TeacherCourse[] {
  try {
    const raw = localStorage.getItem(getStorageKey(teacherEmail));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading teacher courses:', err);
  }
  return [];
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function formatMinutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Detects any schedule conflicts across all courses taught by the teacher
 */
export function detectScheduleConflicts(courses: TeacherCourse[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const seenPair = new Set<string>();

  for (let i = 0; i < courses.length; i++) {
    const courseA = courses[i];
    const schedA = courseA.schedule || [];

    for (let j = i + 1; j < courses.length; j++) {
      const courseB = courses[j];
      const schedB = courseB.schedule || [];

      for (const slotA of schedA) {
        for (const slotB of schedB) {
          if (slotA.day === slotB.day) {
            const startA = parseTimeToMinutes(slotA.startTime);
            const endA = parseTimeToMinutes(slotA.endTime);
            const startB = parseTimeToMinutes(slotB.startTime);
            const endB = parseTimeToMinutes(slotB.endTime);

            // Check if intervals overlap: startA < endB && startB < endA
            if (startA < endB && startB < endA) {
              const overlapStart = Math.max(startA, startB);
              const overlapEnd = Math.min(endA, endB);
              const key = `${courseA.id}-${slotA.day}-${overlapStart}-${courseB.id}`;
              
              if (!seenPair.has(key)) {
                seenPair.add(key);
                conflicts.push({
                  day: slotA.day,
                  timeRange: `${formatMinutesToTime(overlapStart)} – ${formatMinutesToTime(overlapEnd)}`,
                  classroom: slotA.classroom || slotB.classroom || 'C-117',
                  courseA: {
                    name: courseA.courseName,
                    code: courseA.courseCode,
                    group: courseA.group,
                    type: slotA.type
                  },
                  courseB: {
                    name: courseB.courseName,
                    code: courseB.courseCode,
                    group: courseB.group,
                    type: slotB.type
                  }
                });
              }
            }
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Saves or updates a course for a teacher
 */
export function saveTeacherCourse(
  teacherEmail: string,
  courseData: {
    semester: number;
    courseName: string;
    courseCode: string;
    group: string;
    credits?: number;
    category?: string;
    curricula?: string;
    schedule?: CourseScheduleSlot[];
    description?: string;
    students: EnrolledStudent[];
  }
): TeacherCourse {
  const currentCourses = getTeacherCourses(teacherEmail);

  // If schedule wasn't provided, try to find matching slots in the catalog
  let finalSchedule = courseData.schedule || [];
  let finalCredits = courseData.credits;
  let finalCategory = courseData.category;
  let finalCurricula = courseData.curricula || 'PLAN CURRICULAR 2024';

  if (!finalSchedule || finalSchedule.length === 0) {
    for (const sem of SEMESTER_COURSES_CATALOG) {
      const match = sem.courses.find(c => c.code === courseData.courseCode || c.name.toLowerCase() === courseData.courseName.toLowerCase());
      if (match) {
        finalSchedule = match.schedule || [];
        if (!finalCredits) finalCredits = match.credits;
        if (!finalCategory) finalCategory = match.category;
        if (!finalCurricula) finalCurricula = match.curricula;
        break;
      }
    }
  }

  // If still empty (e.g. custom course), provide a standard 2-session schedule
  if (finalSchedule.length === 0) {
    finalSchedule = [
      { day: 'MARTES', startTime: '07:00', endTime: '09:00', timeLabel: '7:00–9:00', type: 'Teoría', classroom: 'C-117', hours: 2 },
      { day: 'JUEVES', startTime: '07:00', endTime: '09:00', timeLabel: '7:00–9:00', type: 'Práctica', classroom: 'C-117', hours: 2 }
    ];
  }

  const newCourse: TeacherCourse = {
    id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
    teacherEmail: teacherEmail.toLowerCase().trim(),
    semester: courseData.semester,
    courseName: courseData.courseName,
    courseCode: courseData.courseCode,
    group: courseData.group || 'A',
    credits: finalCredits || 4,
    category: finalCategory || 'ESG',
    curricula: finalCurricula || 'PLAN CURRICULAR 2024',
    schedule: finalSchedule,
    description: courseData.description,
    createdAt: Date.now(),
    students: courseData.students,
    status: 'active'
  };

  const updated = [newCourse, ...currentCourses];
  try {
    localStorage.setItem(getStorageKey(teacherEmail), JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving teacher course:', err);
  }

  return newCourse;
}

/**
 * Removes a student from a course dynamically (a medida que avanza el curso)
 */
export function removeStudentFromCourse(
  teacherEmail: string,
  courseId: string,
  studentIdOrEmail: string
): TeacherCourse | null {
  const currentCourses = getTeacherCourses(teacherEmail);
  const courseIndex = currentCourses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return null;

  const targetCourse = currentCourses[courseIndex];
  const updatedStudents = targetCourse.students.filter(
    s => s.id !== studentIdOrEmail && s.email.toLowerCase() !== studentIdOrEmail.toLowerCase()
  );

  const updatedCourse: TeacherCourse = {
    ...targetCourse,
    students: updatedStudents
  };

  currentCourses[courseIndex] = updatedCourse;
  try {
    localStorage.setItem(getStorageKey(teacherEmail), JSON.stringify(currentCourses));
  } catch (err) {
    console.error('Error updating course students:', err);
  }

  return updatedCourse;
}

/**
 * Adds a student to an existing course
 */
export function addStudentToCourse(
  teacherEmail: string,
  courseId: string,
  student: EnrolledStudent
): TeacherCourse | null {
  const currentCourses = getTeacherCourses(teacherEmail);
  const courseIndex = currentCourses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return null;

  const targetCourse = currentCourses[courseIndex];
  // check if already enrolled
  if (targetCourse.students.some(s => s.email.toLowerCase() === student.email.toLowerCase())) {
    return targetCourse;
  }

  const updatedCourse: TeacherCourse = {
    ...targetCourse,
    students: [...targetCourse.students, student]
  };

  currentCourses[courseIndex] = updatedCourse;
  try {
    localStorage.setItem(getStorageKey(teacherEmail), JSON.stringify(currentCourses));
  } catch (err) {
    console.error('Error adding student to course:', err);
  }

  return updatedCourse;
}

/**
 * Deletes an entire course
 */
export function deleteTeacherCourse(teacherEmail: string, courseId: string): TeacherCourse[] {
  const currentCourses = getTeacherCourses(teacherEmail);
  const filtered = currentCourses.filter(c => c.id !== courseId);
  try {
    localStorage.setItem(getStorageKey(teacherEmail), JSON.stringify(filtered));
  } catch (err) {
    console.error('Error deleting course:', err);
  }
  return filtered;
}
