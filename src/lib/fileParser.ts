import mammoth from 'mammoth';
import { AttachmentInfo } from '../types';

export async function processSelectedFile(file: File): Promise<AttachmentInfo> {
  const name = file.name;
  const size = file.size;
  const mimeType = file.type || 'application/octet-stream';

  // 1. If Image
  if (mimeType.startsWith('image/')) {
    const base64 = await readFileAsDataURL(file);
    return {
      type: 'image',
      name,
      mimeType,
      size,
      base64,
    };
  }

  // 2. If PDF
  if (mimeType === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) {
    const base64 = await readFileAsDataURL(file);
    return {
      type: 'document',
      name,
      mimeType: 'application/pdf',
      size,
      base64,
    };
  }

  // 3. If Word (.docx)
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.toLowerCase().endsWith('.docx')
  ) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return {
        type: 'document',
        name,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size,
        textContent: result.value || 'Documento Word vacío o sin texto legible.',
      };
    } catch (e) {
      console.warn('Error extracting docx with mammoth:', e);
      return {
        type: 'document',
        name,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size,
        textContent: `[Archivo Word: ${name}. No se pudo extraer el texto de forma nativa.]`,
      };
    }
  }

  // 4. Text-based documents (.txt, .md, .csv, .json, .tex, .py, .c, .cpp, .java, etc.)
  const textExtensions = ['.txt', '.md', '.csv', '.json', '.tex', '.py', '.c', '.cpp', '.java', '.js', '.ts', '.html', '.xml', '.log', '.sql', '.r', '.m'];
  const hasTextExtension = textExtensions.some((ext) => name.toLowerCase().endsWith(ext));

  if (mimeType.startsWith('text/') || hasTextExtension) {
    const textContent = await readFileAsText(file);
    return {
      type: 'document',
      name,
      mimeType: mimeType || 'text/plain',
      size,
      textContent,
    };
  }

  // 5. Fallback: try reading as text first, if it contains readable characters
  try {
    const textContent = await readFileAsText(file);
    return {
      type: 'document',
      name,
      mimeType: mimeType || 'text/plain',
      size,
      textContent,
    };
  } catch {
    const base64 = await readFileAsDataURL(file);
    return {
      type: 'document',
      name,
      mimeType,
      size,
      base64,
    };
  }
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
