import React, { useEffect, useRef } from 'react';
import { ThemeMode, GridColor } from '../types';

interface FluidWaterGridProps {
  theme?: ThemeMode;
  className?: string;
  intensity?: 'normal' | 'subtle';
  gridColor?: GridColor;
}

export const FluidWaterGrid: React.FC<FluidWaterGridProps> = ({ 
  theme = 'black', 
  className = "fixed inset-0 w-full h-full pointer-events-none z-0",
  intensity = 'normal',
  gridColor = 'default'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse interaction for gentle water ripples
    let mouse = { x: width * 0.5, y: height * 0.5, targetX: width * 0.5, targetY: height * 0.5 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let time = 0;

    const isLight = theme === 'light';
    const isBeige = theme === 'beige' || theme === 'sepia';
    const isYellow = theme === 'yellow';
    const isCyan = theme === 'cyan';
    const isRose = theme === 'rose';
    const isPurple = theme === 'purple';
    const isGreen = theme === 'green';
    const isRed = theme === 'red';
    const isBlack = theme === 'black';

    // Base background color according to theme
    const baseBgColor = isBeige
      ? '#F2A65A'
      : isYellow
      ? '#FFB400'
      : isCyan
      ? '#00C2CB'
      : isLight
      ? '#ffffff'
      : isRose
      ? '#fcf0f4'
      : isPurple
      ? '#7A3E9D'
      : isGreen
      ? '#0b5e42'
      : isRed
      ? '#BB2528'
      : isBlack
      ? '#0c0d12'
      : '#060810';

    const isBrightTheme = isLight || isBeige || isYellow || isCyan || isRose;

    const render = () => {
      time += 0.016;

      // Smooth mouse damping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Base hues adjusted by theme
      let primaryHue: number;
      let secondaryHue: number;
      let tertiaryHue: number;

      if (isBeige) {
        primaryHue = 32; // warm amber / gold
        secondaryHue = 22; // terracotta
        tertiaryHue = 42; 
      } else if (isYellow) {
        primaryHue = 45; 
        secondaryHue = 35; 
        tertiaryHue = 52;
      } else if (isCyan) {
        primaryHue = 182; 
        secondaryHue = 195; 
        tertiaryHue = 170;
      } else if (isRed) {
        primaryHue = 358; 
        secondaryHue = 345; 
        tertiaryHue = 10;
      } else if (isPurple) {
        primaryHue = 278; 
        secondaryHue = 295; 
        tertiaryHue = 260;
      } else if (isGreen) {
        primaryHue = 158; 
        secondaryHue = 145; 
        tertiaryHue = 170;
      } else if (isRose) {
        primaryHue = 340; 
        secondaryHue = 320; 
        tertiaryHue = 355; 
      } else {
        primaryHue = (185 + Math.sin(time * 0.18) * 55 + Math.cos(time * 0.09) * 45) % 360; 
        secondaryHue = (primaryHue + 110 + Math.sin(time * 0.12) * 40) % 360;
        tertiaryHue = (primaryHue + 210 + Math.cos(time * 0.15) * 35) % 360;
      }

      // 1. Theme background fill
      ctx.fillStyle = baseBgColor;
      ctx.fillRect(0, 0, width, height);

      // 2. Liquid moving ambient color orbs
      const orbOpacityMultiplier = intensity === 'subtle' ? 0.5 : 1.0;

      // Orb 1 (Top Left / Moving)
      const orb1X = width * 0.25 + Math.sin(time * 0.4) * (width * 0.18);
      const orb1Y = height * 0.3 + Math.cos(time * 0.35) * (height * 0.15);
      const grad1 = ctx.createRadialGradient(orb1X, orb1Y, 10, orb1X, orb1Y, width * 0.55);
      const orb1Alpha = (isBrightTheme ? 0.08 : 0.18) * orbOpacityMultiplier;
      grad1.addColorStop(0, `hsla(${primaryHue}, 80%, ${isBrightTheme ? '65%' : '48%'}, ${orb1Alpha})`);
      grad1.addColorStop(0.5, `hsla(${primaryHue}, 70%, ${isBrightTheme ? '75%' : '35%'}, ${orb1Alpha * 0.4})`);
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Orb 2 (Bottom Right / Moving)
      const orb2X = width * 0.75 + Math.cos(time * 0.3) * (width * 0.18);
      const orb2Y = height * 0.65 + Math.sin(time * 0.45) * (height * 0.18);
      const grad2 = ctx.createRadialGradient(orb2X, orb2Y, 10, orb2X, orb2Y, width * 0.55);
      const orb2Alpha = (isBrightTheme ? 0.07 : 0.16) * orbOpacityMultiplier;
      grad2.addColorStop(0, `hsla(${secondaryHue}, 85%, ${isBrightTheme ? '65%' : '45%'}, ${orb2Alpha})`);
      grad2.addColorStop(0.6, `hsla(${secondaryHue}, 75%, ${isBrightTheme ? '75%' : '30%'}, ${orb2Alpha * 0.4})`);
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Orb 3 (Center / Interactive Follower)
      const orb3X = mouse.x;
      const orb3Y = mouse.y;
      const grad3 = ctx.createRadialGradient(orb3X, orb3Y, 0, orb3X, orb3Y, width * 0.35);
      const orb3Alpha = (isBrightTheme ? 0.05 : 0.1) * orbOpacityMultiplier;
      grad3.addColorStop(0, `hsla(${tertiaryHue}, 75%, 50%, ${orb3Alpha})`);
      grad3.addColorStop(1, 'transparent');
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      // 3. Fluid Undulating Water Grid
      const spacingX = Math.max(34, width / 34);
      const spacingY = Math.max(34, height / 26);
      const cols = Math.ceil(width / spacingX) + 2;
      const rows = Math.ceil(height / spacingY) + 2;

      const points: { x: number; y: number; waveIntensity: number }[][] = [];

      for (let r = 0; r < rows; r++) {
        points[r] = [];
        const baseY = (r - 1) * spacingY;

        for (let c = 0; c < cols; c++) {
          const baseX = (c - 1) * spacingX;

          const wave1 = Math.sin(baseX * 0.005 + time * 1.2) * Math.cos(baseY * 0.005 + time * 0.9) * 14;
          const wave2 = Math.sin((baseX + baseY) * 0.007 + time * 1.6) * 10;
          const wave3 = Math.cos(baseX * 0.009 - time * 0.8) * 8;

          const dx = baseX - mouse.x;
          const dy = baseY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const mouseWave = Math.sin(dist * 0.03 - time * 4) * Math.max(0, (1 - dist / 320)) * 18;

          const totalDisplacementY = wave1 + wave2 + wave3 + mouseWave;
          const totalDisplacementX = Math.cos(baseY * 0.006 + time * 1.1) * 10 + (Math.sin(dist * 0.02 - time * 3) * Math.max(0, (1 - dist / 320)) * 10);

          const px = baseX + totalDisplacementX;
          const py = baseY + totalDisplacementY;
          const waveIntensity = (totalDisplacementY + 30) / 60;

          points[r][c] = { x: px, y: py, waveIntensity };
        }
      }

      // Draw Grid Lines: Horizontal curves
      ctx.lineWidth = 1;
      const baseAlphaFactor = isBrightTheme ? 0.08 : 0.15;
      const lineLightness = isBrightTheme ? '40%' : '65%';

      const getStrokeStyle = (hue: number, alpha: number) => {
        if (gridColor === 'black') {
          return `rgba(0, 0, 0, ${Math.min(0.6, Math.max(0.18, alpha * 2.3))})`;
        }
        if (gridColor === 'white') {
          return `rgba(255, 255, 255, ${Math.min(0.65, Math.max(0.2, alpha * 2.4))})`;
        }
        if (gridColor === 'cyan') {
          return `rgba(0, 216, 230, ${Math.min(0.7, Math.max(0.22, alpha * 2.2))})`;
        }
        if (gridColor === 'gold') {
          return `rgba(245, 158, 11, ${Math.min(0.7, Math.max(0.22, alpha * 2.2))})`;
        }
        return `hsla(${hue}, ${isBrightTheme ? '45%' : '75%'}, ${lineLightness}, ${alpha})`;
      };

      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const p = points[r][c];
          if (c === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            const prev = points[r][c - 1];
            const mx = (prev.x + p.x) * 0.5;
            const my = (prev.y + p.y) * 0.5;
            ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
          }
        }
        const midPoint = points[r][Math.floor(cols / 2)];
        const alpha = Math.min(0.25, Math.max(0.03, baseAlphaFactor + midPoint.waveIntensity * 0.12));
        ctx.strokeStyle = getStrokeStyle(primaryHue, alpha);
        ctx.stroke();
      }

      // Draw Grid Lines: Vertical curves
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const p = points[r][c];
          if (r === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            const prev = points[r - 1][c];
            const mx = (prev.x + p.x) * 0.5;
            const my = (prev.y + p.y) * 0.5;
            ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
          }
        }
        const midPoint = points[Math.floor(rows / 2)][c];
        const alpha = Math.min(0.25, Math.max(0.03, baseAlphaFactor + midPoint.waveIntensity * 0.11));
        ctx.strokeStyle = getStrokeStyle(secondaryHue, alpha);
        ctx.stroke();
      }

      // Draw subtle nodes
      if (!isBrightTheme || gridColor !== 'default') {
        if (gridColor === 'black') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        } else if (gridColor === 'white') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        } else if (gridColor === 'cyan') {
          ctx.fillStyle = 'rgba(0, 216, 230, 0.55)';
        } else if (gridColor === 'gold') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.55)';
        } else {
          ctx.fillStyle = `hsla(${primaryHue}, 90%, 75%, 0.45)`;
        }
        for (let r = 1; r < rows - 1; r += 2) {
          for (let c = 1; c < cols - 1; c += 2) {
            const p = points[r][c];
            if (p.waveIntensity > 0.68) {
              const nodeRadius = (p.waveIntensity - 0.68) * 3.5;
              ctx.beginPath();
              ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [theme, intensity, gridColor]);

  return (
    <canvas
      id="fluid-water-grid-canvas"
      ref={canvasRef}
      className={className}
    />
  );
};
