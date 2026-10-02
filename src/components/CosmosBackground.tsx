import React, { useEffect, useRef } from 'react';

interface CosmosBackgroundProps {
  opacity?: number;
  interactive?: boolean;
}

export const CosmosBackground: React.FC<CosmosBackgroundProps> = ({
  opacity = 0.85,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Mouse parallax
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Stars data
    interface Star {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      speed: number;
      twinkleSpeed: number;
      twinkleOffset: number;
    }

    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
    }

    let stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];
    const STAR_COUNT = Math.min(180, Math.floor((width * height) / 8000));

    const starColors = [
      '#ffffff',
      '#e0f2fe', // sky-100
      '#bae6fd', // sky-200
      '#c4b5fd', // violet-300
      '#fbcfe8', // pink-200
      '#99f6e4', // teal-200
      '#fef08a', // amber-200
    ];

    const initStars = () => {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 2 + 0.5,
          size: Math.random() * 1.8 + 0.4,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          speed: (Math.random() * 0.2 + 0.05),
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    initStars();

    // Spawn shooting star occasionally
    const spawnShootingStar = () => {
      if (Math.random() < 0.015 && shootingStars.filter((s) => s.active).length < 2) {
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * (height * 0.4),
          length: Math.random() * 80 + 40,
          speed: Math.random() * 6 + 7,
          angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
          opacity: 1,
          active: true,
        });
      }
    };

    let tick = 0;

    const render = () => {
      tick++;
      // Smooth mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const parallaxX = ((mouseX - width / 2) / width) * 20;
      const parallaxY = ((mouseY - height / 2) / height) * 20;

      // Dark cosmos background with gentle radial nebula glow
      ctx.fillStyle = '#040611';
      ctx.fillRect(0, 0, width, height);

      // Deep space nebula clouds
      const grad1 = ctx.createRadialGradient(
        width * 0.25 - parallaxX,
        height * 0.3 - parallaxY,
        50,
        width * 0.25,
        height * 0.3,
        width * 0.6
      );
      grad1.addColorStop(0, 'rgba(16, 40, 80, 0.45)');
      grad1.addColorStop(0.5, 'rgba(88, 28, 135, 0.2)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(
        width * 0.75 + parallaxX,
        height * 0.7 + parallaxY,
        50,
        width * 0.75,
        height * 0.7,
        width * 0.55
      );
      grad2.addColorStop(0, 'rgba(6, 78, 99, 0.35)');
      grad2.addColorStop(0.6, 'rgba(13, 148, 136, 0.12)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Render drifting and twinkling stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Drift slowly upwards / sideways to simulate floating through cosmos
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        // Parallax offset based on depth (z)
        const posX = star.x + parallaxX * (star.z * 0.3);
        const posY = star.y + parallaxY * (star.z * 0.3);

        const twinkle = 0.4 + 0.6 * Math.sin(tick * star.twinkleSpeed + star.twinkleOffset);

        ctx.beginPath();
        ctx.arc(posX, posY, star.size * star.z * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = twinkle * 0.85;
        ctx.shadowBlur = star.size > 1.2 ? 6 : 0;
        ctx.shadowColor = star.color;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Shooting stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        if (!s.active) continue;

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.015;

        if (s.opacity <= 0 || s.x > width || s.y > height) {
          s.active = false;
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const sGrad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        sGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        sGrad.addColorStop(1, `rgba(200, 240, 255, ${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = sGrad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full z-0"
      style={{ opacity }}
    />
  );
};
