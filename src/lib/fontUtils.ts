import { FontFamily } from '../types';

export interface FontOption {
  id: FontFamily;
  name: string;
  sub: string;
  description?: string;
  sample: string;
  cssClass: string;
  className?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'sans',
    name: 'Moderna (Sans)',
    sub: 'Plus Jakarta Sans',
    description: 'Plus Jakarta Sans',
    sample: 'f(x) = ax² + bx + c',
    cssClass: 'font-style-sans',
    className: 'font-style-sans',
  },
  {
    id: 'serif',
    name: 'Académica (Serif)',
    sub: 'Lora / Clásica',
    description: 'Lora / Clásica',
    sample: '∫ e^x dx = e^x + C',
    cssClass: 'font-style-serif',
    className: 'font-style-serif',
  },
  {
    id: 'mono',
    name: 'Código (Mono)',
    sub: 'JetBrains Mono',
    description: 'JetBrains Mono',
    sample: 'const v = dx / dt;',
    cssClass: 'font-style-mono',
    className: 'font-style-mono',
  },
  {
    id: 'rounded',
    name: 'Redonda (Friendly)',
    sub: 'Nunito',
    description: 'Nunito',
    sample: 'E = mc² • Dinámica',
    cssClass: 'font-style-rounded',
    className: 'font-style-rounded',
  },
  {
    id: 'handwriting',
    name: 'Manuscrita (Apuntes)',
    sub: 'Caveat / Libreta',
    description: 'Caveat / Libreta',
    sample: 'Apuntes de Física UNSAAC',
    cssClass: 'font-style-handwriting',
    className: 'font-style-handwriting',
  },
];

export function getFontFamilyClass(font?: FontFamily | string): string {
  switch (font) {
    case 'serif':
      return 'font-style-serif';
    case 'mono':
      return 'font-style-mono';
    case 'rounded':
      return 'font-style-rounded';
    case 'handwriting':
      return 'font-style-handwriting';
    case 'sans':
    default:
      return 'font-style-sans';
  }
}
