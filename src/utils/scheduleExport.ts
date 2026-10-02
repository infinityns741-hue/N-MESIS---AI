import { jsPDF } from 'jspdf';
import { TeacherCourse, CourseScheduleSlot } from '../types/teacher';

// Color definitions for canvas export (matching our palette)
export const CANVAS_PALETTES = [
  { name: 'Esmeralda', bg: '#064e3b', border: '#10b981', text: '#ecfdf5', badgeBg: '#065f46', badgeText: '#a7f3d0' },
  { name: 'Zafiro', bg: '#0c4a6e', border: '#0ea5e9', text: '#f0f9ff', badgeBg: '#0369a1', badgeText: '#bae6fd' },
  { name: 'Amatista', bg: '#581c87', border: '#a855f7', text: '#faf5ff', badgeBg: '#6b21a8', badgeText: '#e9d5ff' },
  { name: 'Ámbar', bg: '#78350f', border: '#f59e0b', text: '#fffbeb', badgeBg: '#92400e', badgeText: '#fde68a' },
  { name: 'Rubí', bg: '#881337', border: '#f43f5e', text: '#fff1f2', badgeBg: '#9f1239', badgeText: '#fecdd3' },
  { name: 'Turquesa', bg: '#134e4a', border: '#14b8a6', text: '#f0fdfa', badgeBg: '#115e59', badgeText: '#99f6e4' },
  { name: 'Naranja', bg: '#7c2d12', border: '#f97316', text: '#fff7ed', badgeBg: '#9a3412', badgeText: '#fed7aa' },
  { name: 'Índigo', bg: '#312e81', border: '#6366f1', text: '#eef2ff', badgeBg: '#3730a3', badgeText: '#c7d2fe' },
];

export function getCanvasTheme(courseId: string, courses: TeacherCourse[]) {
  const idx = courses.findIndex(c => c.id === courseId);
  if (idx >= 0) {
    return CANVAS_PALETTES[idx % CANVAS_PALETTES.length];
  }
  let sum = 0;
  for (let i = 0; i < courseId.length; i++) {
    sum += courseId.charCodeAt(i);
  }
  return CANVAS_PALETTES[Math.abs(sum) % CANVAS_PALETTES.length];
}

interface ScheduleExportParams {
  teacherEmail: string;
  courses: TeacherCourse[];
  days: readonly string[] | string[];
  hoursBlocks: readonly { label: string; start: number; end: number }[] | { label: string; start: number; end: number }[];
  format: 'png' | 'jpg' | 'pdf';
}

/**
 * Draws a rounded rectangle path on 2D context
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Generates an ultra-crisp, high resolution image of the schedule
 * completely independent of CSS / external styling issues.
 */
export async function generateScheduleCanvas(params: {
  teacherEmail: string;
  courses: TeacherCourse[];
  days: readonly string[] | string[];
  hoursBlocks: readonly { label: string; start: number; end: number }[] | { label: string; start: number; end: number }[];
}): Promise<HTMLCanvasElement> {
  const { teacherEmail, courses, days, hoursBlocks } = params;

  const canvas = document.createElement('canvas');
  const scale = 2; // 2x Retina scale for crystal clear rendering
  const width = 1400;
  const headerHeight = 160;
  const legendHeight = courses.length > 0 ? Math.ceil(courses.length / 3) * 36 + 40 : 20;
  const tableHeaderHeight = 44;
  const rowHeight = 76;
  const footerHeight = 50;
  const height = headerHeight + legendHeight + tableHeaderHeight + (hoursBlocks.length * rowHeight) + footerHeight + 40;

  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2d context');

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#0a0d1a';
  ctx.fillRect(0, 0, width, height);

  // Header background banner
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, '#11162b');
  grad.addColorStop(0.5, '#181e3a');
  grad.addColorStop(1, '#11162b');
  ctx.fillStyle = grad;
  roundRect(ctx, 24, 24, width - 48, 120, 16);
  ctx.fill();
  ctx.strokeStyle = '#272f4e';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Institution Logo / Monogram placeholder
  ctx.fillStyle = '#e11d48';
  roundRect(ctx, 44, 44, 80, 80, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('UNSAAC', 84, 84);

  // Header Titles
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fb7185';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('SISTEMA INTEGRADO DE GESTIÓN ACADÉMICA Y DOCENTE', 140, 56);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('HORARIO SEMANAL LECTIVO DEL DOCENTE', 140, 84);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '13px sans-serif';
  ctx.fillText(`Docente: ${teacherEmail}  •  Semestre Académico 2026  •  Cursos Aperturados: ${courses.length}`, 140, 108);

  let currentY = 164;

  // Courses Legend
  if (courses.length > 0) {
    ctx.fillStyle = '#12172b';
    roundRect(ctx, 24, currentY, width - 48, legendHeight - 10, 14);
    ctx.fill();
    ctx.strokeStyle = '#242b46';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('CURSOS APERTURADOS Y GRUPOS:', 40, currentY + 22);

    let legX = 40;
    let legY = currentY + 36;
    const colWidth = 430;

    courses.forEach((c, idx) => {
      const theme = getCanvasTheme(c.id, courses);
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const itemX = legX + col * colWidth;
      const itemY = legY + row * 34;

      // Color pill
      ctx.fillStyle = theme.bg;
      roundRect(ctx, itemX, itemY, 410, 26, 8);
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dot
      ctx.fillStyle = theme.border;
      ctx.beginPath();
      ctx.arc(itemX + 14, itemY + 13, 5, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      const cName = c.courseName.length > 32 ? c.courseName.substring(0, 30) + '...' : c.courseName;
      ctx.fillText(cName, itemX + 26, itemY + 17);

      // Group badge
      ctx.fillStyle = theme.badgeBg;
      roundRect(ctx, itemX + 320, itemY + 4, 80, 18, 6);
      ctx.fill();
      ctx.fillStyle = theme.badgeText;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Grupo ${c.group}`, itemX + 360, itemY + 16);
      ctx.textAlign = 'left';
    });

    currentY += legendHeight;
  }

  // Schedule Table Grid
  const colHourWidth = 140;
  const dayColWidth = (width - 48 - colHourWidth) / 5;
  const tableX = 24;

  // Table Header Row
  ctx.fillStyle = '#171d33';
  roundRect(ctx, tableX, currentY, width - 48, tableHeaderHeight, 10);
  ctx.fill();
  ctx.strokeStyle = '#272f4e';
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('HORA', tableX + colHourWidth / 2, currentY + tableHeaderHeight / 2);

  days.forEach((day, dIdx) => {
    const dayX = tableX + colHourWidth + dIdx * dayColWidth;
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(day, dayX + dayColWidth / 2, currentY + tableHeaderHeight / 2);
  });

  currentY += tableHeaderHeight + 8;

  // Helper to find slots in this block
  const timeToMins = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const getEvents = (day: string, startM: number, endM: number) => {
    const evs: { course: TeacherCourse; slot: CourseScheduleSlot }[] = [];
    courses.forEach(course => {
      (course.schedule || []).forEach(slot => {
        if (slot.day === day) {
          const s = timeToMins(slot.startTime);
          const e = timeToMins(slot.endTime);
          if (Math.max(startM, s) < Math.min(endM, e)) {
            evs.push({ course, slot });
          }
        }
      });
    });
    return evs;
  };

  // Hour Rows
  hoursBlocks.forEach((block) => {
    const rowY = currentY;

    // Hour label cell
    ctx.fillStyle = '#101424';
    roundRect(ctx, tableX, rowY, colHourWidth - 6, rowHeight - 6, 8);
    ctx.fill();
    ctx.strokeStyle = '#222944';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(block.label, tableX + (colHourWidth - 6) / 2, rowY + (rowHeight - 6) / 2);

    // Days cells
    days.forEach((day, dIdx) => {
      const cellX = tableX + colHourWidth + dIdx * dayColWidth;
      const cellW = dayColWidth - 6;
      const cellH = rowHeight - 6;
      const events = getEvents(day, block.start, block.end);

      if (events.length === 0) {
        // Empty cell
        ctx.fillStyle = '#080a14';
        roundRect(ctx, cellX, rowY, cellW, cellH, 8);
        ctx.fill();
        ctx.strokeStyle = '#1b2034';
        ctx.stroke();
      } else {
        // Render event
        const ev = events[0];
        const theme = getCanvasTheme(ev.course.id, courses);

        ctx.fillStyle = theme.bg;
        roundRect(ctx, cellX, rowY, cellW, cellH, 8);
        ctx.fill();
        ctx.strokeStyle = events.length > 1 ? '#ef4444' : theme.border;
        ctx.lineWidth = events.length > 1 ? 2 : 1;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Course Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        const nameText = ev.course.courseName.length > 24 ? ev.course.courseName.substring(0, 22) + '...' : ev.course.courseName;
        ctx.fillText(nameText, cellX + 8, rowY + 8);

        // Group & Type
        ctx.fillStyle = theme.badgeText;
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`G-${ev.course.group} • ${ev.slot.type}`, cellX + 8, rowY + 26);

        // Classroom
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`Aula: ${ev.slot.classroom}`, cellX + 8, rowY + 44);

        if (events.length > 1) {
          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(`⚠️ +${events.length - 1} cruce`, cellX + cellW - 60, rowY + 44);
        }
      }
    });

    currentY += rowHeight;
  });

  // Footer
  currentY += 10;
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const nowStr = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillText(`Documento emitido: ${nowStr} • Portal Docente Oficial UNSAAC`, 30, currentY + 15);

  ctx.textAlign = 'right';
  ctx.fillText('Universidad Nacional de San Antonio Abad del Cusco', width - 30, currentY + 15);

  return canvas;
}

/**
 * Triggers direct browser download for schedule and returns both dataUrl and blobUrl for instant fallback preview
 */
export async function downloadScheduleFile(params: ScheduleExportParams): Promise<{ 
  success: boolean; 
  filename: string;
  dataUrl?: string;
  blobUrl?: string;
}> {
  const { teacherEmail, format } = params;
  const canvas = await generateScheduleCanvas(params);

  const cleanTeacher = teacherEmail.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Horario_Docente_UNSAAC_${cleanTeacher}.${format}`;

  if (format === 'png' || format === 'jpg') {
    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 0.95 : undefined;
    const dataUrl = canvas.toDataURL(mime, quality);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          // Fallback to dataUrl if blob fails
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve({ success: true, filename, dataUrl });
          return;
        }

        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = blobUrl;
        link.download = filename;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          resolve({ success: true, filename, dataUrl, blobUrl });
        }, 800);
      }, mime, quality);
    });
  } else if (format === 'pdf') {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const printWidth = pageWidth - margin * 2;
    const printHeight = (canvas.height * printWidth) / canvas.width;

    const yPos = printHeight < pageHeight ? Math.max(margin, (pageHeight - printHeight) / 2) : margin;
    pdf.addImage(imgData, 'PNG', margin, yPos, printWidth, printHeight);
    
    // Direct PDF save
    pdf.save(filename);

    const pdfBlob = pdf.output('blob');
    const pdfBlobUrl = URL.createObjectURL(pdfBlob);

    return { success: true, filename, blobUrl: pdfBlobUrl, dataUrl: imgData };
  }

  return { success: false, filename };
}
