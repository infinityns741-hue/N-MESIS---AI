export interface EnrolledStudent {
  id: string;
  code: string;
  fullName: string;
  email: string;
  career?: string;
  avatarBg?: string;
  enrolledAt: number;
}

export interface StudentDirectoryEntry {
  id: string;
  code: string;
  fullName: string;
  email: string;
  career: string;
  semester: number;
}

export interface CourseScheduleSlot {
  day: 'LUNES' | 'MARTES' | 'MIÉRCOLES' | 'JUEVES' | 'VIERNES' | 'SÁBADO';
  startTime: string; // "07:00", "09:00", etc.
  endTime: string;   // "09:00", "11:00", etc.
  timeLabel: string; // "7:00–9:00"
  type: 'Teoría' | 'Práctica' | 'Laboratorio';
  classroom: string; // "C-117"
  hours: number;
  group?: string;    // 'A' | 'B'
}

export interface CatalogCourseItem {
  code: string;
  name: string;
  credits: number;
  category: string; // 'ESG' | 'EEF'
  curricula: string; // 'PLAN CURRICULAR 2024'
  requisite?: string;
  department?: string;
  schedule: CourseScheduleSlot[];
}

export interface TeacherCourse {
  id: string;
  teacherEmail: string;
  semester: number; // 1 to 10
  courseName: string;
  courseCode: string;
  group: string; // 'A' | 'B' | 'C' | 'Único'
  credits?: number;
  category?: string;
  curricula?: string;
  schedule: CourseScheduleSlot[];
  description?: string;
  createdAt: number;
  students: EnrolledStudent[];
  status: 'active' | 'archived';
}

export interface ScheduleConflict {
  day: string;
  timeRange: string;
  classroom: string;
  courseA: {
    name: string;
    code: string;
    group: string;
    type: string;
  };
  courseB: {
    name: string;
    code: string;
    group: string;
    type: string;
  };
}
