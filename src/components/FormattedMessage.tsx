import React from 'react';
import katex from 'katex';
import { Copy, Check } from 'lucide-react';
import { ThemeMode, FontSize, FontFamily, TextFontColor } from '../types';
import { getFontFamilyClass } from '../lib/fontUtils';

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
  theme?: ThemeMode;
  fontSize?: FontSize;
  fontFamily?: FontFamily;
  textColor?: TextFontColor;
  isBold?: boolean;
  isItalic?: boolean;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ 
  content, 
  isUser = false,
  theme = 'dark',
  fontSize = 'medium',
  fontFamily = 'sans',
  textColor = 'default',
  isBold = false,
  isItalic = false
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isLight = theme === 'light';
  const isBeige = theme === 'beige' || theme === 'sepia';
  const isYellow = theme === 'yellow';
  const isCyan = theme === 'cyan';
  const isDarkTextTheme = isLight || isBeige || isYellow || isCyan;
  const isRose = theme === 'rose';
  const isPurple = theme === 'purple';
  const isGreen = theme === 'green';
  const isRed = theme === 'red';

  const fontClass = 
    fontSize === 'small' ? 'text-xs sm:text-sm' :
    fontSize === 'large' ? 'text-base sm:text-lg' :
    'text-sm sm:text-base';

  const selectedFontFamilyClass = getFontFamilyClass(fontFamily);

  // High contrast text classes per theme
  let textColorClass = isBeige 
    ? 'text-stone-950 font-normal' 
    : isYellow
    ? 'text-stone-950 font-normal'
    : isCyan
    ? 'text-slate-950 font-normal'
    : isLight 
    ? 'text-slate-900' 
    : isRose 
    ? 'text-rose-950'
    : isPurple
    ? 'text-purple-100'
    : isGreen
    ? 'text-emerald-50'
    : isRed
    ? 'text-red-50'
    : 'text-zinc-200';

  let headingColorClass = isDarkTextTheme
    ? 'text-black font-extrabold' 
    : 'text-white font-bold';

  let mathColorClass = isDarkTextTheme
    ? 'text-black font-medium' 
    : 'text-white font-medium';

  let boldColorClass = isDarkTextTheme
    ? 'text-black font-bold' 
    : 'text-white font-bold';

  // Explicit font color override if user configured one
  if (textColor && textColor !== 'default') {
    if (textColor === 'black') {
      textColorClass = 'text-stone-950';
      headingColorClass = 'text-black font-extrabold';
      mathColorClass = 'text-black font-semibold';
      boldColorClass = 'text-black font-extrabold';
    } else if (textColor === 'white') {
      textColorClass = 'text-white';
      headingColorClass = 'text-white font-extrabold';
      mathColorClass = 'text-white font-semibold';
      boldColorClass = 'text-white font-extrabold';
    } else if (textColor === 'yellow') {
      textColorClass = 'text-amber-300';
      headingColorClass = 'text-amber-200 font-extrabold';
      mathColorClass = 'text-amber-300 font-semibold';
      boldColorClass = 'text-amber-100 font-extrabold';
    } else if (textColor === 'cyan') {
      textColorClass = 'text-cyan-300';
      headingColorClass = 'text-cyan-200 font-extrabold';
      mathColorClass = 'text-cyan-300 font-semibold';
      boldColorClass = 'text-cyan-100 font-extrabold';
    } else if (textColor === 'cream') {
      textColorClass = 'text-[#fef3c7]';
      headingColorClass = 'text-[#fffbeb] font-extrabold';
      mathColorClass = 'text-[#fef3c7] font-semibold';
      boldColorClass = 'text-white font-extrabold';
    } else if (textColor === 'green') {
      textColorClass = 'text-emerald-300';
      headingColorClass = 'text-emerald-200 font-extrabold';
      mathColorClass = 'text-emerald-300 font-semibold';
      boldColorClass = 'text-emerald-100 font-extrabold';
    } else if (textColor === 'purple') {
      textColorClass = 'text-purple-200';
      headingColorClass = 'text-purple-100 font-extrabold';
      mathColorClass = 'text-purple-200 font-semibold';
      boldColorClass = 'text-white font-extrabold';
    }
  }

  const weightClass = isBold ? 'font-bold' : '';
  const italicClass = isItalic ? 'italic' : '';

  const codeBlockClass = isBeige
    ? 'border-amber-400 bg-[#fcead7]'
    : isYellow
    ? 'border-amber-400 bg-[#fff5d6]'
    : isCyan
    ? 'border-cyan-400 bg-[#e0f9fa]'
    : isLight
    ? 'border-slate-300 bg-slate-100'
    : isRose
    ? 'border-rose-200 bg-rose-50'
    : isPurple
    ? 'border-purple-800 bg-[#592477]'
    : isGreen
    ? 'border-emerald-800 bg-[#073d2a]'
    : isRed
    ? 'border-red-800 bg-[#7a1416]'
    : 'border-zinc-800 bg-[#090b12]';

  const codeHeaderClass = isBeige
    ? 'bg-[#f7d6b5] text-stone-950 border-amber-400'
    : isYellow
    ? 'bg-[#ffe499] text-stone-950 border-amber-400'
    : isCyan
    ? 'bg-[#b6f0f3] text-slate-950 border-cyan-400'
    : isLight
    ? 'bg-slate-200 text-slate-700 border-slate-300'
    : isRose
    ? 'bg-rose-100 text-rose-900 border-rose-200'
    : isPurple
    ? 'bg-[#6d2f90] text-purple-100 border-purple-800'
    : isGreen
    ? 'bg-[#0a4f37] text-emerald-100 border-emerald-800'
    : isRed
    ? 'bg-[#991d20] text-red-100 border-red-800'
    : 'bg-[#121524] text-zinc-400 border-zinc-800';

  const codePreClass = isDarkTextTheme
    ? 'text-stone-950'
    : 'text-zinc-100';

  // Helper to convert LaTeX/Math to clear, readable text for students without LaTeX knowledge
  const humanizeMathForStudents = (raw: string): string => {
    return raw
      .replace(/\\text\{([^}]+)\}/g, '($1)')
      .replace(/\\sum\b_?\{?([a-zA-Z0-9\s]+)\}?/g, 'Σ $1')
      .replace(/\\sum\b/g, 'Σ')
      .replace(/\\int\b/g, '∫')
      .replace(/\\Delta\b/g, 'Δ')
      .replace(/\\Omega\b/g, 'Ω')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\frac\{1\}\{2\}/g, '½')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
      .replace(/\\times\b/g, '×')
      .replace(/\\cdot\b/g, '·')
      .replace(/\\pm\b/g, '±')
      .replace(/\\neq\b/g, '≠')
      .replace(/\\le\b/g, '≤')
      .replace(/\\ge\b/g, '≥')
      .replace(/\\infty\b/g, '∞')
      .replace(/\\to\b/g, '→')
      .replace(/\\alpha\b/g, 'α')
      .replace(/\\beta\b/g, 'β')
      .replace(/\\gamma\b/g, 'γ')
      .replace(/\\theta\b/g, 'θ')
      .replace(/\\lambda\b/g, 'λ')
      .replace(/\\mu\b/g, 'μ')
      .replace(/\\pi\b/g, 'π')
      .replace(/\\omega\b/g, 'ω')
      .replace(/[\\]+/g, '')
      .replace(/\$/g, '')
      .replace(/[{}]/g, '')
      .trim();
  };

  // Helper to normalize formulas and symbols for KaTeX
  const cleanMathString = (rawMath: string): string => {
    let m = rawMath
      .replace(/[\r\n]+/g, ' ') // remove line breaks inside formula
      .replace(/\s+/g, ' ')
      .trim();

    // Map common Unicode math symbols to LaTeX equivalents
    m = m
      .replace(/∑/g, '\\sum ')
      .replace(/∫/g, '\\int ')
      .replace(/√/g, '\\sqrt')
      .replace(/Δ/g, '\\Delta ')
      .replace(/Ω/g, '\\Omega ')
      .replace(/μ/g, '\\mu ')
      .replace(/π/g, '\\pi ')
      .replace(/θ/g, '\\theta ')
      .replace(/α/g, '\\alpha ')
      .replace(/β/g, '\\beta ')
      .replace(/γ/g, '\\gamma ')
      .replace(/ω/g, '\\omega ')
      .replace(/λ/g, '\\lambda ')
      .replace(/±/g, '\\pm ')
      .replace(/×/g, '\\times ')
      .replace(/÷/g, '\\div ')
      .replace(/≠/g, '\\neq ')
      .replace(/≤/g, '\\le ')
      .replace(/≥/g, '\\ge ')
      .replace(/≈/g, '\\approx ')
      .replace(/∞/g, '\\infty ')
      .replace(/→/g, '\\to ');

    // Handle common Spanish words in subscript/plain text inside math
    // e.g., \sum I entran = \sum I salen -> \sum I_{\text{entran}} = \sum I_{\text{salen}}
    m = m.replace(/\bI\s+(entran|salen|total|neto|in|out)\b/gi, 'I_{\\text{$1}}');
    m = m.replace(/\bV\s+(total|fuente|resistencia|nodo|neto)\b/gi, 'V_{\\text{$1}}');

    return m;
  };

  // Helper to parse inline `$math$`, `$$math$$`, `\(math\)`, `***bold italic***`, `**bold**`, `*italic*`, and ``code``
  const parseInline = (rawText: string): React.ReactNode => {
    // Normalize \( ... \) to $ ... $ and inline $$ ... $$ to $ ... $
    let text = rawText
      .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$')
      .replace(/\$\$([\s\S]*?)\$\$/g, '$$$1$');

    // Auto-detect math formulas wrapped in plain parentheses containing LaTeX commands or Sigma
    text = text.replace(/\$∑/g, '$\\sum ');
    text = text.replace(/\(([^()\n]*\\[a-zA-Z]+[^()\n]*)\)/g, '($$$1$)');
    text = text.replace(/\(([^()\n]*∑[^()\n]*)\)/g, (_m, p1) => `($$${p1.replace(/∑/g, '\\sum ')}$$)`);

    // Also if there are patterns like "* *Texto:*" -> normalize to "**Texto:**"
    text = text.replace(/\*\s*\*([^*]+)\*:/g, '**$1:**');

    // Regex matches inline math $...$, bold/italic ***...***, bold **...**, italic/emphasis *...*, and code `...`
    const parts = text.split(/(\$[^\$]+\$|\*\*\*[^\*]+\*\*\*|\*\*[^\*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Inline LaTeX: $...$
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        let math = cleanMathString(part.slice(1, -1));
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
            output: 'html',
          });
          return (
            <span
              key={idx}
              className={`inline-block mx-0.5 align-baseline ${mathColorClass}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <span key={idx} className={`mx-0.5 font-mono font-bold ${mathColorClass}`}>
              {humanizeMathForStudents(math)}
            </span>
          );
        }
      }

      // Inline Code: `...`
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={idx}
            className={`px-1.5 py-0.5 rounded-lg text-xs font-mono-code ${codeBlockClass} ${codePreClass}`}
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Bold Italic: ***...***
      if (part.startsWith('***') && part.endsWith('***') && part.length > 6) {
        return (
          <strong 
            key={idx} 
            className={`italic font-extrabold ${boldColorClass}`}
          >
            {part.slice(3, -3)}
          </strong>
        );
      }

      // Bold: **...**
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong 
            key={idx} 
            className={boldColorClass}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Single asterisk emphasis / italic: *...*
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <strong 
            key={idx} 
            className={boldColorClass}
          >
            {part.slice(1, -1)}
          </strong>
        );
      }

      return part;
    });
  };

  // If it's a simple user message, still parse inline math & bolding with selected font
  if (isUser) {
    return (
      <div className={`whitespace-pre-wrap leading-relaxed ${fontClass} ${selectedFontFamilyClass} ${weightClass} ${italicClass} ${textColor && textColor !== 'default' ? textColorClass : ''}`}>
        {parseInline(content)}
      </div>
    );
  }

  // Parse blocks: code blocks, LaTeX display blocks, headers, lists, paragraphs
  const renderFormattedContent = () => {
    // 1. Normalize LaTeX delimiters: \[ ... \] -> $$ ... $$, \( ... \) -> $ ... $
    let normalized = content
      .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$')
      .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$');

    // 2. Preprocess inline $$...$$ that appear inside text or parentheses so they don't break paragraphs
    // If $$...$$ is preceded or followed by non-newline characters (e.g. `($$\sum ...$$)`), convert to inline `$...$`
    normalized = normalized.replace(/([^\n])\$\$([^\$\n]+?)\$\$([^\n])/g, '$1$$$2$$$3');
    normalized = normalized.replace(/\(\$\$([^\$\n]+?)\$\$\)/g, '($$$1$$)');

    // 3. Preprocess inline and display math to collapse newlines so split('\n\n') does not slice formulas
    normalized = normalized.replace(/\$\$([\s\S]*?)\$\$/g, (_match, p1) => {
      return `$$${cleanMathString(p1)}$$`;
    });
    normalized = normalized.replace(/\$([^\$]+?)\$/g, (_match, p1) => {
      return `$${cleanMathString(p1)}$`;
    });

    // Split by block delimiters: ```code``` or standalone $$latex$$ on its own line
    const blocks = normalized.split(/(\n\$\$[\s\S]*?\$\$\n|```[\s\S]*?```)/g);

    return blocks.map((block, bIdx) => {
      if (!block) return null;

      // Check for standalone LaTeX display block $$...$$
      const trimmedBlock = block.trim();
      if (trimmedBlock.startsWith('$$') && trimmedBlock.endsWith('$$') && trimmedBlock.length > 4) {
        const math = cleanMathString(trimmedBlock.slice(2, -2));
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
            output: 'html',
          });
          return (
            <div
              key={`math-block-${bIdx}`}
              className={`my-3 py-1 overflow-x-auto text-center ${mathColorClass}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <div key={`math-err-${bIdx}`} className="my-2 text-center font-mono font-bold text-sm text-cyan-300">
              {humanizeMathForStudents(math)}
            </div>
          );
        }
      }

      // Check for Code Block ```lang ... ```
      if (block.startsWith('```') && block.endsWith('```')) {
        const lines = block.slice(3, -3).split('\n');
        const lang = lines[0].trim();
        const code = (lang ? lines.slice(1) : lines).join('\n');

        return (
          <div 
            key={`code-block-${bIdx}`} 
            className={`my-3 rounded-2xl overflow-hidden border transition-colors ${codeBlockClass}`}
          >
            <div className={`flex items-center justify-between px-3 py-1.5 text-[11px] font-mono-code border-b ${codeHeaderClass}`}>
              <span>{lang || 'código'}</span>
              <button
                type="button"
                onClick={() => handleCopy(code, bIdx)}
                className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {copiedIndex === bIdx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <pre className={`p-3 text-xs sm:text-sm font-mono-code overflow-x-auto ${codePreClass}`}>
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Standard text with inline formatting ($inline math$, **bold**, lists)
      return (
        <div key={`text-block-${bIdx}`} className="space-y-2">
          {block.split('\n\n').map((paragraph, pIdx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            // Heading 3
            if (trimmed.startsWith('### ')) {
              return (
                <h3 
                  key={pIdx} 
                  className={`text-base sm:text-lg mt-4 mb-2 ${headingColorClass}`}
                >
                  {parseInline(trimmed.slice(4))}
                </h3>
              );
            }

            // Heading 2
            if (trimmed.startsWith('## ')) {
              return (
                <h2 
                  key={pIdx} 
                  className={`text-lg sm:text-xl font-extrabold mt-5 mb-2.5 ${headingColorClass}`}
                >
                  {parseInline(trimmed.slice(3))}
                </h2>
              );
            }

            // Bullet list items (- or * or •)
            if (
              trimmed.includes('\n- ') || trimmed.startsWith('- ') || 
              trimmed.includes('\n* ') || trimmed.startsWith('* ') ||
              trimmed.includes('\n• ') || trimmed.startsWith('• ') ||
              trimmed.startsWith('•')
            ) {
              const lines = trimmed.split('\n');
              const items: string[] = [];
              let currentItem = '';

              for (const line of lines) {
                const isBullet = 
                  line.trim().startsWith('- ') || 
                  line.trim().startsWith('* ') || 
                  line.trim().startsWith('• ') ||
                  line.trim().startsWith('•');
                if (isBullet) {
                  if (currentItem) items.push(currentItem);
                  currentItem = line.trim().replace(/^[-*•]\s*/, '');
                } else if (currentItem) {
                  currentItem += ' ' + line.trim();
                } else {
                  currentItem = line.trim();
                }
              }
              if (currentItem) items.push(currentItem);

              if (items.length > 0) {
                return (
                  <ul key={pIdx} className="space-y-1.5 my-2 pl-4">
                    {items.map((it, iIdx) => (
                      <li 
                        key={iIdx} 
                        className={`flex items-start gap-2 ${textColorClass}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mt-2 flex-shrink-0" />
                        <span className="flex-1">{parseInline(it)}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
            }

            // Numbered list items
            if (/^\d+\.\s/.test(trimmed)) {
              const items = trimmed.split('\n').filter(l => /^\d+\.\s/.test(l.trim()));
              if (items.length > 0) {
                return (
                  <ol key={pIdx} className="space-y-1.5 my-2 pl-2">
                    {items.map((it, iIdx) => (
                      <li 
                        key={iIdx} 
                        className={textColorClass}
                      >
                        {parseInline(it)}
                      </li>
                    ))}
                  </ol>
                );
              }
            }

            // Standard paragraph with inline math and bolding
            return (
              <p 
                key={pIdx} 
                className={`leading-relaxed ${textColorClass}`}
              >
                {parseInline(paragraph)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return <div className={`space-y-2.5 ${fontClass} ${selectedFontFamilyClass} ${weightClass} ${italicClass}`}>{renderFormattedContent()}</div>;
};
