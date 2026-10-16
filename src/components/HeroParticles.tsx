"use client";
import { useEffect } from "react";

type Particle = {
  x: number;
  y: number;
  z: number;
  phase: number;
  speed: number;
  radius: number;
  color: string;
};

const PALETTE = ["#cbfffc", "#4ce2d0", "#129a8c", "#7c5cff", "#ad97ff", "#fde9ff"];

export default function HeroParticles() {
  useEffect(() => {
    const canvas = document.getElementById("heroParticles") as HTMLCanvasElement | null;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let rotation = 0;
    let lastDrawTime = 0;
    let visible = true;
    let running = false;
    let particles: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Keep the hero constellation decorative rather than CPU-bound; this
      // renderer performs neighbour checks on the main thread every frame.
      const count =
        window.innerWidth < 640 ? 44 : window.innerWidth < 1024 ? 76 : 112;

      particles = Array.from({ length: count }, (_, i) => {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = Math.PI * (3 - Math.sqrt(5)) * i;
        return {
          x: Math.cos(theta) * r,
          y,
          z: Math.sin(theta) * r,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0005 + Math.random() * 0.0012,
          radius: 0.4 + Math.random() * 1.3,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        };
      });
    };

    const draw = (time: number) => {
      if (!visible || document.hidden) {
        running = false;
        return;
      }
      // A restrained 30 fps is enough for a decorative constellation and cuts work
      // on the main thread without affecting content interaction.
      if (lastDrawTime && time - lastDrawTime < 1000 / 30) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastDrawTime = time;
      context.clearRect(0, 0, width, height);
      rotation += 0.0022;
      const compact = width < 640;
      const cx = width * (compact ? 0.5 : 0.72);
      const cy = height * 0.52;
      const R = Math.min(width * (compact ? 0.42 : 0.27), height * 0.43, compact ? 250 : 380);

      const projected = particles.map((p) => {
        const x = p.x * Math.cos(rotation) - p.z * Math.sin(rotation);
        const z = p.x * Math.sin(rotation) + p.z * Math.cos(rotation);
        const perspective = 1.25 / (1.8 - z * 0.48);
        return {
          x: cx + x * R * perspective,
          y: cy + p.y * R * perspective,
          z,
          r: p.radius * perspective,
          color: p.color,
          alpha: Math.max(0.12, Math.min(0.86, (z + 1.25) / 2.25)),
        };
      });

      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        for (let j = i + 1; j < Math.min(i + 8, projected.length); j++) {
          const b = projected[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < R * 0.2) {
            context.beginPath();
            context.strokeStyle = `rgba(124,92,255,${
              (1 - d / (R * 0.2)) * 0.14 * a.alpha
            })`;
            context.lineWidth = 0.5;
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      projected.forEach((p, i) => {
        const twinkle = 0.78 + Math.sin(rotation * 5 + particles[i].phase) * 0.22;
        context.globalAlpha = p.alpha * twinkle;
        context.fillStyle = p.color;
        context.beginPath();
        context.arc(p.x, p.y, Math.max(0.35, p.r), 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      lastDrawTime = 0;
      frame = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else {
        running = false;
        cancelAnimationFrame(frame);
        frame = 0;
        lastDrawTime = 0;
      }
    });

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
        frame = 0;
        lastDrawTime = 0;
      } else start();
    };

    observer.observe(canvas);
    resize();
    start();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      className="absolute inset-0 w-full h-full pointer-events-none"
      id="heroParticles"
      aria-hidden
    />
  );
}