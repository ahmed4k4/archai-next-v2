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
      className="relative min-h-[92vh] flex items-center overflow-hidden hero-premium"
      aria-label="Hero"
    >
      {/* Calm atmospheric lighting only. The previous animated grid/line field is removed. */}
      <div className="hero-atmosphere absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="hero-light-pool hero-light-pool-violet" />
        <div className="hero-light-pool hero-light-pool-mint" />
      </div>

      {/* ============================================================
          LAYER 3: 3D Scene (right side)
          ============================================================ */}
      <div
        className="absolute inset-y-0 right-[-6%] w-full lg:w-[58%] pointer-events-none opacity-90 hero-visual-stage"
        aria-hidden
      >
        <DynamicVisual name="HeroCore" className="absolute inset-0" />
      </div>

      {/* ============================================================
          LAYER 6: Content
          ============================================================ */}
      <motion.div
        style={{ y, opacity, scale }}
        className="wrap relative z-10 py-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Compact engineering signature — avoids competing with the 3D hero object. */}
          <motion.div
            className="lg:col-span-3 order-2 lg:order-1 hidden lg:block hero-signature-slot"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            <div className="hero-signature-card">
              <span className="hero-signature-mark" aria-hidden="true"><span /><span /><span /></span>
              <div className="font-mono text-[10px] tracking-[.2em] text-ink-4 uppercase">ARCHAI / ENGINEERING</div>
              <div className="mt-3 text-sm text-ink-2">{ar ? "منظومة تقنية مترابطة" : "Connected by design"}</div>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-violet-500/15 pt-4">
                <span className="text-xs text-ink-3">{ar ? "مشاريع المعرض" : "Showcase projects"}</span>
                <strong className="font-display text-2xl text-ink-0"><AnimatedNumber value={count} /></strong>
              </div>
            </div>
          </motion.div>

          {/* Main content */}
          <div className="lg:col-span-9 order-1 lg:order-2 hero-copy">
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