"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
  driftX: number;
  driftY: number;
  tint: string;
  bright: boolean;
  depth: number;
  twinkleAmount: number;
  galacticPlane: boolean;
};

type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  age: number;
  life: number;
  width: number;
  tint: string;
  glow: number;
};

// Stellar colour temperatures stay close to natural white, blue-white and warm stars.
const STAR_TINTS = ["#f4f2ec", "#e2ecff", "#d2e2ff", "#fff0d4", "#c7d8ff", "#f0e1ff"];
const METEOR_TINTS = ["191, 208, 255", "177, 224, 255", "211, 205, 255", "255, 240, 218"];

/**
 * One shared Canvas starfield for the public site. It uses a restrained diagonal
 * stellar plane, depth-scaled drift, low-frequency twinkle and rare tapered meteors.
 * No extra WebGL context or downloaded imagery is required.
 */
export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true, desynchronized: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lightweightMotion = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    let frameId = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let lastTime = 0;
    let lastDrawTime = 0;
    let nextMeteorAt = 0;
    let followUpMeteorAt = 0;
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let disposed = false;
    let lowPower = false;
    let themeIsLight = document.documentElement.dataset.theme === "light";

    const random = (min: number, max: number) => min + Math.random() * (max - min);
    const normalRandom = () => {
      // Box–Muller distribution: more stars gather around the stellar plane, fewer at its edges.
      const u = Math.max(Number.EPSILON, Math.random());
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * Math.random());
    };

    const chooseStarTint = () => {
      const value = Math.random();
      if (value < 0.66) return STAR_TINTS[0];
      if (value < 0.82) return STAR_TINTS[1];
      if (value < 0.91) return STAR_TINTS[2];
      if (value < 0.965) return STAR_TINTS[3];
      if (value < 0.99) return STAR_TINTS[4];
      return STAR_TINTS[5];
    };

    const drawStars = (time: number, still = false) => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";

      for (const star of stars) {
        const pulse = still
          ? 0
          : Math.sin(time * 0.00045 * star.speed + star.phase) * star.twinkleAmount;
        const baseAlpha = star.bright ? 0.82 : star.galacticPlane ? 0.43 : 0.47;
        const alpha = Math.max(0.12, Math.min(1, baseAlpha + pulse));
        context.globalAlpha = themeIsLight ? alpha * (star.bright ? 0.66 : 0.48) : alpha;
        context.fillStyle = themeIsLight ? (star.bright ? "#555e81" : "#7a83a0") : star.tint;

        if (star.bright && !themeIsLight) {
          // Reserve soft glow for the rare foreground stars; avoid shadowBlur on every dot.
          context.shadowColor = star.tint;
          context.shadowBlur = star.depth > 0.72 ? 3.4 : 1.8;
        }

        const radiusPulse = star.bright && !still
          ? 1 + Math.sin(time * 0.00055 * star.speed + star.phase) * 0.07
          : 1;
        context.beginPath();
        context.arc(star.x, star.y, Math.max(0.08, star.radius * radiusPulse), 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;

        // A tiny diffraction cross appears only on exceptionally bright stars.
        if (star.bright && star.phase > 5.2 && !themeIsLight) {
          context.globalAlpha = alpha * 0.2;
          context.strokeStyle = star.tint;
          context.lineWidth = 0.4;
          const glint = 2.2 + star.radius * 1.2;
          context.beginPath();
          context.moveTo(star.x - glint, star.y);
          context.lineTo(star.x + glint, star.y);
          context.moveTo(star.x, star.y - glint);
          context.lineTo(star.x, star.y + glint);
          context.stroke();
        }
      }
      context.globalAlpha = 1;
      context.globalCompositeOperation = "source-over";
    };

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
      lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigatorWithMemory.deviceMemory || 8) <= 4;
      dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : width < 700 ? 1.12 : 1.35);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Uniform field density with a restrained galactic concentration. Avoid
      // placing most of the stars in the centre of the viewport.
      // Keep the sky continuous, but cap per-frame CPU work on smaller devices.
      const baseCount = width < 520 ? 140 : width < 1000 ? 260 : 520;
      const count = lowPower ? Math.round(baseCount * 0.62) : baseCount;
      stars = Array.from({ length: count }, () => {
        const x = Math.random() * width;
        const depth = Math.pow(Math.random(), 0.72);
        // Keep the entire viewport populated. Only a minority of stars sit in a
        // broad diagonal galactic band; the rest are distributed across all edges
        // and vertical positions so the field never collapses into a central stripe.
        const inPlane = Math.random() < 0.24;
        const planeCenter = height * (0.84 - (x / width) * 0.62);
        const planeSpread = height * (0.22 + (1 - depth) * 0.10);
        const y = inPlane
          ? planeCenter + normalRandom() * planeSpread
          : Math.random() * height;
        const bright = Math.random() > 0.976;
        const tint = chooseStarTint();
        const radius = bright
          ? random(0.72, 1.22) * (0.68 + depth * 0.5)
          : random(0.2, 0.68) * (0.48 + depth * 0.68);
        return {
          x,
          y: (y + height) % height,
          radius,
          phase: random(0, Math.PI * 2),
          speed: random(0.42, 1.12),
          driftX: random(-0.72, 0.72) * (0.18 + depth * 0.8),
          driftY: random(-0.3, 0.3) * (0.18 + depth * 0.8),
          tint,
          bright,
          depth,
          twinkleAmount: bright ? random(0.035, 0.14) : random(0.012, 0.055),
          galacticPlane: inPlane,
        } satisfies Star;
      });

      meteors = [];
      followUpMeteorAt = 0;
      nextMeteorAt = performance.now() + random(850, 1650);
      drawStars(0, true);
    };

    const spawnMeteor = () => {
      const speed = random(610, 1080);
      const fromRight = Math.random() < 0.62;
      const angle = random(0.28, 0.72);
      const direction = fromRight ? -1 : 1;
      const brightBolide = Math.random() > 0.84;
      meteors.push({
        x: fromRight ? random(width * 0.58, width * 1.08) : random(-width * 0.08, width * 0.46),
        // Meteors cross different parts of the visible sky instead of appearing
        // exclusively near the top edge.
        y: random(-height * 0.06, height * 0.78),
        vx: direction * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: random(92, Math.min(210, Math.max(124, width * 0.24))) * (brightBolide ? 1.22 : 1),
        age: 0,
        life: random(0.62, 1.05) * (brightBolide ? 1.15 : 1),
        width: random(0.42, 0.82) * (brightBolide ? 1.28 : 1),
        tint: METEOR_TINTS[Math.floor(Math.random() * METEOR_TINTS.length)],
        glow: brightBolide ? 1.42 : random(0.86, 1.13),
      });
    };

    const drawMeteor = (meteor: Meteor) => {
      const progress = Math.min(1, meteor.age / meteor.life);
      const fade = Math.sin(progress * Math.PI);
      const alpha = fade * (themeIsLight ? 0.46 : 0.9) * meteor.glow;
      const speed = Math.hypot(meteor.vx, meteor.vy) || 1;
      const ux = meteor.vx / speed;
      const uy = meteor.vy / speed;
      const tailX = meteor.x - ux * meteor.length;
      const tailY = meteor.y - uy * meteor.length;
      const gradient = context.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
      gradient.addColorStop(0, `rgba(${meteor.tint}, 0)`);
      gradient.addColorStop(0.64, `rgba(${meteor.tint}, ${alpha * 0.11})`);
      gradient.addColorStop(0.88, `rgba(${meteor.tint}, ${alpha * 0.46})`);
      gradient.addColorStop(0.975, `rgba(238, 246, 255, ${alpha * 0.88})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";
      context.strokeStyle = gradient;
      context.lineWidth = meteor.width;
      context.shadowColor = `rgba(${meteor.tint}, 0.45)`;
      context.shadowBlur = 3.1 * meteor.glow;
      context.beginPath();
      context.moveTo(tailX, tailY);
      context.lineTo(meteor.x, meteor.y);
      context.stroke();

      // A thinner, shorter ion trail reinforces the bright head without a uniform neon beam.
      context.shadowBlur = 0;
      context.strokeStyle = `rgba(244, 249, 255, ${alpha * 0.4})`;
      context.lineWidth = Math.max(0.25, meteor.width * 0.28);
      context.beginPath();
      context.moveTo(meteor.x - ux * meteor.length * 0.28, meteor.y - uy * meteor.length * 0.28);
      context.lineTo(meteor.x, meteor.y);
      context.stroke();

      const glowRadius = 3.5 * meteor.glow;
      const headGlow = context.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, glowRadius * 2.2);
      headGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      headGlow.addColorStop(0.18, `rgba(226, 241, 255, ${alpha * 0.76})`);
      headGlow.addColorStop(0.5, `rgba(${meteor.tint}, ${alpha * 0.28})`);
      headGlow.addColorStop(1, `rgba(${meteor.tint}, 0)`);
      context.fillStyle = headGlow;
      context.beginPath();
      context.arc(meteor.x, meteor.y, glowRadius * 2.2, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      context.beginPath();
      context.arc(meteor.x, meteor.y, brightCoreRadius(meteor), 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const brightCoreRadius = (meteor: Meteor) => meteor.glow > 1.2 ? 1.15 : 0.78;

    const render = (now: number) => {
      frameId = 0;
      if (disposed || document.hidden || reducedMotion.matches || lightweightMotion.matches || lowPower) return;
      const minimumFrameMs = lowPower || width < 520 ? 1000 / 20 : width < 700 ? 1000 / 24 : width < 1100 ? 1000 / 26 : 1000 / 28;
      if (lastDrawTime && now - lastDrawTime < minimumFrameMs) {
        frameId = window.requestAnimationFrame(render);
        return;
      }
      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.04) : 0.016;
      lastTime = now;
      lastDrawTime = now;

      for (const star of stars) {
        const parallax = 0.25 + star.depth * 0.75;
        star.x += star.driftX * delta * parallax;
        star.y += star.driftY * delta * parallax;
        if (star.x < -1) star.x = width + 1;
        else if (star.x > width + 1) star.x = -1;
        if (star.y < -1) star.y = height + 1;
        else if (star.y > height + 1) star.y = -1;
      }

      drawStars(now);

      // Occasional staggered pairs make the sky feel alive without turning it into
      // a constant light show. The lower cap and longer cadence on small/low-power
      // screens preserve mobile frame time.
      const maxActiveMeteors = lowPower || width < 520 ? 2 : 3;
      if (followUpMeteorAt > 0 && now >= followUpMeteorAt && meteors.length < maxActiveMeteors) {
        spawnMeteor();
        followUpMeteorAt = 0;
      }
      if (now >= nextMeteorAt && meteors.length < maxActiveMeteors) {
        spawnMeteor();
        if (!followUpMeteorAt && Math.random() < 0.34) {
          followUpMeteorAt = now + random(220, 520);
        }
        const interval = lowPower
          ? random(2100, 3300)
          : width < 700
            ? random(1250, 2050)
            : random(900, 1650);
        nextMeteorAt = now + interval;
      }
      meteors = meteors.filter((meteor) => {
        meteor.age += delta;
        meteor.x += meteor.vx * delta;
        meteor.y += meteor.vy * delta;
        drawMeteor(meteor);
        return meteor.age < meteor.life && meteor.x > -meteor.length && meteor.x < width + meteor.length && meteor.y < height + meteor.length;
      });
      frameId = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (disposed || document.hidden || frameId || reducedMotion.matches || lightweightMotion.matches || lowPower) return;
      lastTime = 0;
      lastDrawTime = 0;
      frameId = window.requestAnimationFrame(render);
    };
    const stop = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      lastTime = 0;
      lastDrawTime = 0;
    };
    const onVisibilityChange = () => document.hidden ? stop() : start();
    const onMotionPreferenceChange = () => {
      meteors = [];
      if (reducedMotion.matches || lightweightMotion.matches || lowPower) {
        stop();
        drawStars(0, true);
      } else {
        start();
      }
    };
    const themeObserver = new MutationObserver(() => {
      themeIsLight = document.documentElement.dataset.theme === "light";
      drawStars(performance.now(), reducedMotion.matches);
    });

    resize();
    if (!reducedMotion.matches && !lightweightMotion.matches && !lowPower) start();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener?.("change", onMotionPreferenceChange);
    lightweightMotion.addEventListener?.("change", onMotionPreferenceChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      disposed = true;
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener?.("change", onMotionPreferenceChange);
      lightweightMotion.removeEventListener?.("change", onMotionPreferenceChange);
      themeObserver.disconnect();
    };
  }, []);

  return <div className="galaxy-background" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
