"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { tr, pick } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { MagneticButton, AnimatedNumber } from "./motion";
import { textReveal } from "@/lib/motion";

const DynamicVisual = dynamic(() => import("./visuals/DynamicVisual"), { ssr: false, loading: () => null });
const HeroParticles = dynamic(() => import("./HeroParticles"), { ssr: false });

type HeroProps = {
  lang: Locale;
  settings: Record<string, any>;
  count: number;
};

export default function Hero({ lang, settings, count }: HeroProps) {
  const T = tr(lang);
  const ar = lang === "ar";
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  const titleAr = settings.home_title_ar || tr("ar")("heroT");
  const titleEn = settings.home_title_en || tr("en")("heroT");
  const desc = pick(settings, "home_desc", lang) || T("heroDesc");

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-[100vh] flex items-center overflow-hidden"
      aria-label="Hero"
    >
      {/* ============================================================
          LAYER 1: Animated grid floor
          ============================================================ */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60vh] grid-floor opacity-50"
        aria-hidden
      />

      {/* ============================================================
          LAYER 2: Radial gradient orbs (background)
          ============================================================ */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <motion.div
          className="absolute top-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-30"
          style={{ background: "radial-gradient(circle, #7c5cff 0%, transparent 70%)" }}
          animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[15%] left-[5%] w-[45vw] h-[45vw] rounded-full blur-[120px] opacity-25"
          style={{ background: "radial-gradient(circle, #4ce2d0 0%, transparent 70%)" }}
          animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full blur-[140px] opacity-15"
          style={{ background: "radial-gradient(circle, #ff6b9d 0%, transparent 70%)" }}
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ============================================================
          LAYER 3: 3D Scene (right side)
          ============================================================ */}
      <div
        className="absolute inset-y-0 right-0 w-full lg:w-[55%] pointer-events-none"
        aria-hidden
      >
        <DynamicVisual name="HeroCore" className="absolute inset-0" />
      </div>

      {/* ============================================================
          LAYER 4: Constellation particles
          ============================================================ */}
      <HeroParticles />

      {/* ============================================================
          LAYER 5: Decorative circuit lines
          ============================================================ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="heroCircuitGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity="0" />
            <stop offset="50%" stopColor="#7c5cff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#4ce2d0" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[200, 300, 400].map((y, i) => (
          <path
            key={i}
            d={`M0,${y} Q300,${y - 100} 600,${y} T1200,${y}`}
            stroke="url(#heroCircuitGrad)"
            strokeWidth={1.5 - i * 0.3}
            fill="none"
          />
        ))}
        {[
          { cx: 600, cy: 300 },
          { cx: 700, cy: 400 },
          { cx: 500, cy: 200 },
        ].map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.cx}
            cy={dot.cy}
            r={4}
            fill="#4ce2d0"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.8] }}
            transition={{
              duration: 2,
              delay: 1.5 + i * 0.3,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 2,
            }}
          />
        ))}
      </svg>

      {/* ============================================================
          LAYER 6: Content
          ============================================================ */}
      <motion.div
        style={{ y, opacity, scale }}
        className="wrap relative z-10 py-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Stat orb (left on desktop) */}
          <motion.div
            className="lg:col-span-3 order-2 lg:order-1"
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative w-[180px] h-[180px] lg:w-[220px] lg:h-[220px] mx-auto lg:mx-0">
              {/* Rotating ring */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden
              >
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="rgba(124,92,255,0.15)"
                  strokeWidth="0.8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="url(#statRingGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="289"
                  initial={{ strokeDashoffset: 289 }}
                  animate={{ strokeDashoffset: 60 }}
                  transition={{ duration: 2.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                />
                <defs>
                  <linearGradient id="statRingGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7c5cff" />
                    <stop offset="100%" stopColor="#4ce2d0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Stat center */}
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="font-display text-5xl lg:text-6xl font-medium bg-grad-text-light dark:bg-grad-text bg-clip-text text-transparent animate-gradient-flow bg-[length:200%_100%]">
                    <AnimatedNumber value={count} />
                  </div>
                  <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-ink-3">
                    {T("engineered")}
                  </div>
                </div>
              </div>

              {/* Floating decorations */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-mint-400 shadow-glow-mint"
                  style={{
                    top: `${20 + i * 30}%`,
                    left: `${i % 2 === 0 ? -8 : 105}%`,
                  }}
                  animate={{
                    y: [0, -12, 0],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Main content */}
          <div className="lg:col-span-9 order-1 lg:order-2">
            {/* Welcome badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-mint-500/30 bg-mint-500/10"
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-mint-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mint-300">
                {ar ? "أهلاً بكم في أركاي" : "WELCOME TO ARCHAI"}
              </span>
            </motion.div>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 backdrop-blur-sm"
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-mint-400 shadow-glow-mint"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-200">
                {T("heroEyebrow")}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="mt-8 font-display font-medium tracking-tight leading-[0.95] text-[clamp(2.5rem,8vw,6rem)]"
              variants={textReveal}
              initial="hidden"
              animate="show"
            >
              <span className="block text-ink-0">{titleAr}</span>
              <span
                className="block bg-grad-text-light dark:bg-grad-text bg-clip-text text-transparent animate-gradient-flow bg-[length:200%_100%]"
                dir="ltr"
              >
                {titleEn}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              className="mt-8 text-lg lg:text-xl leading-relaxed text-ink-3 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              {desc}
            </motion.p>

            {/* Actions */}
            <motion.div
              className="mt-10 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <MagneticButton href="#list" className="btn-primary">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
                {T("ctaExplore")}
              </MagneticButton>
              <Link href="#sl" className="btn-ghost">
                ★ {T("ctaFeatured")}
              </Link>
            </motion.div>

            {/* Meta strip */}
            {/* Stats */}
            <motion.div
              className="mt-10 grid grid-cols-3 gap-4 max-w-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              {[
                { v: count, l: ar ? "مشروع في المعرض" : "Projects showcased" },
                { v: 2, l: ar ? "لغتان للموقع" : "Site languages" },
                { v: 4, l: ar ? "مراحل للتنفيذ" : "Delivery stages" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl font-medium bg-grad-text-light dark:bg-grad-text bg-clip-text text-transparent">
                    <AnimatedNumber value={s.v} />
                  </div>
                  <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-ink-4">
                    {s.l}
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              className="mt-8 pt-6 border-t border-violet-500/15 flex flex-wrap gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              {[
                { label: T("metaEmbedded"), color: "#4ce2d0" },
                { label: T("metaWeb"), color: "#7c5cff" },
                { label: T("metaMobile"), color: "#ad97ff" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.12em] text-ink-3"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                >
                  <motion.span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: item.color,
                      boxShadow: `0 0 12px ${item.color}`,
                    }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                  />
                  {item.label}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ============================================================
          LAYER 7: Scroll indicator
          ============================================================ */}
      <motion.a
        href="#list"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-ink-4 hover:text-mint-400 transition-colors"
        aria-label={T("scroll")}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-current relative overflow-hidden">
          <motion.div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-2 rounded-full bg-current"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
          {T("scroll")}
        </span>
      </motion.a>
    </section>
  );
}