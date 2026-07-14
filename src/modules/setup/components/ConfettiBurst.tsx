import { useEffect, useMemo, useRef } from 'react';

interface ConfettiPiece {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
}

const COLORS = ['#0d9488', '#14b8a6', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

/**
 * Confeti ligero en canvas (sin dependencias).
 */
export function ConfettiBurst({ durationMs = 4500 }: { durationMs?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  useEffect(() => {
    if (reduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    const pieces: ConfettiPiece[] = [];
    const started = performance.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (count: number) => {
      const cx = canvas.width / 2;
      for (let i = 0; i < count; i++) {
        pieces.push({
          x: cx + (Math.random() - 0.5) * canvas.width * 0.35,
          y: -20 - Math.random() * 40,
          w: 6 + Math.random() * 8,
          h: 8 + Math.random() * 10,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
          vx: (Math.random() - 0.5) * 8,
          vy: 2 + Math.random() * 5,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.25,
        });
      }
    };

    spawn(120);

    const tick = (now: number) => {
      if (!running) return;
      const elapsed = now - started;
      if (elapsed < durationMs * 0.55 && pieces.length < 280) {
        spawn(8);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.vy += 0.08;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (elapsed < durationMs + 1200) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [durationMs, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden
    />
  );
}
