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

const PALETTE = ["#cbfffc", "#2dd4bf", "#00827c", "#8052ff", "#fde9ff"];
const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function HeroParticles() {
  useEffect(() => {
    const canvas = document.getElementById("heroParticles") as HTMLCanvasElement | null;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || reduceMotion()) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let rotation = 0;
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

      // Fibonacci sphere distribution creates a stable, low-cost 3D orb.
      const count = window.innerWidth < 640 ? 180 : window.innerWidth < 1024 ? 300 : 440;
      particles = Array.from({ length: count }, (_, i) => {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = Math.PI * (3 - Math.sqrt(5)) * i;
        return {
          x: Math.cos(theta) * radius,
          y,
          z: Math.sin(theta) * radius,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0005 + Math.random() * 0.0012,
          radius: 0.45 + Math.random() * 1.2,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        };
      });
    };

    const draw = () => {
      if (!visible || document.hidden) {
        running = false;
        return;
      }
      context.clearRect(0, 0, width, height);
      rotation += 0.0022;
      const compact = width < 640;
      const cx = width * (compact ? 0.72 : 0.72);
      const cy = height * 0.52;
      const radius = Math.min(width * (compact ? 0.42 : 0.27), height * 0.43, compact ? 250 : 360);
      const projected = particles.map((p) => {
        const x = p.x * Math.cos(rotation) - p.z * Math.sin(rotation);
        const z = p.x * Math.sin(rotation) + p.z * Math.cos(rotation);
        const perspective = 1.25 / (1.8 - z * 0.48);
        return {
          x: cx + x * radius * perspective,
          y: cy + p.y * radius * perspective,
          z,
          r: p.radius * perspective,
          color: p.color,
          alpha: Math.max(0.12, Math.min(0.86, (z + 1.25) / 2.25)),
        };
      });

      // Connect only nearby projected particles; subtle lines imply a living constellation.
      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        for (let j = i + 1; j < Math.min(i + 8, projected.length); j++) {
          const b = projected[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.hypot(dx, dy);
          if (distance < radius * 0.2) {
            context.beginPath();
            context.strokeStyle = `rgba(45,212,191,${(1 - distance / (radius * 0.2)) * 0.12 * a.alpha})`;
            context.lineWidth = 0.45;
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
      frame = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else {
        running = false;
        cancelAnimationFrame(frame);
      }
    });
    const onVisibilityChange = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else start();
    };
    observer.observe(canvas);
    resize();
    start();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
