import React, { useMemo } from 'react';
import katex from 'katex';

interface LatexMathProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export const LatexMath: React.FC<LatexMathProps> = React.memo(({
  math,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
        output: 'html',
      });
    } catch {
      return math;
    }
  }, [math, displayMode]);

  return (
    <span
      className={`inline-block select-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
