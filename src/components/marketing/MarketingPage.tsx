"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode, ComponentType } from "react";
import type { Locale } from "@/lib/types";
import DynamicVisual, { type VisualName } from "../visuals/DynamicVisual";
import Hero3DDisplay from "./Hero3DDisplay";
import { type PageKey, stripFor, sceneFor } from "../visuals/PageScenes";
import { Reveal, Stagger, StaggerItem, MagneticButton } from "../motion";
import { fadeUp, scaleIn, textReveal } from "@/lib/motion";

export type MarketingCard = {
  number: string;
  icon: string;
  title: string;
  body: string;
  tags?: readonly string[];
};

export type MarketingPageProps = {
  lang: Locale;
  kind: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  primary?: string;
  primaryHref?: string;
  secondary?: string;
  secondaryHref?: string;
  cards: readonly MarketingCard[];
  outroTitle: string;
  outroText: string;
  /** 3D visual scene to use for the hero (defaults to the scene mapped to `kind`) */
  visual?: VisualName;
  /** Extra 3D scenes shown mid-page (defaults to two, distinct from the hero) */
  stripVisuals?: [VisualName, VisualName];
  /** Optional custom hero render (overrides visual) */
  heroExtra?: ReactNode;
  /** Optional section before outro */
  sectionExtra?: ReactNode;
  /** Accent color for the page (violet | mint | rose) */
  accentColor?: "violet" | "mint" | "rose";
};

export default function MarketingPage({
  lang,
  kind,
  eyebrow,
  title,
  accent,
  description,
  primary = "Start a project",
  primaryHref = "https://landing-ideas.web.app/",
  secondary,
  secondaryHref,
  cards,
  outroTitle,
  outroText,
  visual,
  stripVisuals,
  heroExtra,
  sectionExtra,
  accentColor = "violet",
}: MarketingPageProps) {
  const ar = lang === "ar";
  const pageKey = (kind in { home: 1, services: 1, industries: 1, about: 1, process: 1, insights: 1, contact: 1, "case-studies": 1, careers: 1, faq: 1 } ? kind : "services") as PageKey;
  const strip = stripVisuals ?? stripFor(pageKey);
  const heroScene: VisualName = visual ?? sceneFor(pageKey);
  const accentClasses = {
    violet: { text: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/30" },
    mint: { text: "text-mint-300", bg: "bg-mint-500/10", border: "border-mint-500/30" },
    rose: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
  }[accentColor];

  return (
    <main
      lang={lang}
      dir={ar ? "rtl" : "ltr"}
      className={`relative overflow-hidden min-h-screen marketing-${kind}`}
    >
      {/* Page-long ambient motion layer: lightweight CSS 3D shapes behind content. */}
      <div className="marketing-ambient-field" aria-hidden="true">
        <span className="marketing-ambient-orb marketing-ambient-orb-a" />
        <span className="marketing-ambient-orb marketing-ambient-orb-b" />
        <span className="marketing-ambient-ring marketing-ambient-ring-a" />
        <span className="marketing-ambient-ring marketing-ambient-ring-b" />
        <span className="marketing-ambient-grid" />
      </div>

      {/* ============================================================
          HERO — 3D scene + headline
          ============================================================ */}
      <section className="relative min-h-[92vh] flex items-center pt-24 pb-20">
        {/* Grid backdrop */}
        <div className="absolute inset-0 grid-floor opacity-40" aria-hidden />

        <div className="wrap grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          {/* Copy */}
          <div className="order-2 lg:order-1">
            <motion.span
              className={`inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase ${accentClasses.text}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="w-6 h-px bg-current" />
              {eyebrow}
            </motion.span>

            <motion.h1
              className="mt-6 font-display text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.02] text-ink-0"
              variants={textReveal}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.1 }}
            >
              {title}
              <br />
              <span className="bg-grad-text-light dark:bg-grad-text bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-flow">
                {accent}
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg leading-relaxed text-ink-3 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {description}
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
            >
              <MagneticButton href={primaryHref} className="btn-primary">
                {primary}
                <span className="text-xl">↗</span>
              </MagneticButton>
              {secondary && secondaryHref && (
                <Link href={secondaryHref} className="btn-ghost">
                  {secondary}
                  <span className="text-lg">↗</span>
                </Link>
              )}
            </motion.div>

            {/* Proof strip */}
            <motion.div
              className="mt-12 pt-6 border-t border-violet-500/15 flex flex-wrap gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.6 }}
            >
              {[
                { n: "01", t: ar ? "هندسة واضحة" : "Clear engineering" },
                { n: "02", t: ar ? "تصميم قابل للتوسع" : "Built to scale" },
                { n: "03", t: ar ? "تركيز على الأثر" : "Outcome focused" },
              ].map((item, i) => (
                <motion.div
                  key={item.n}
                  className="flex items-center gap-2 text-xs text-ink-4 font-mono tracking-wider"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.85 + i * 0.08 }}
                >
                  <span className="text-mint-400">{item.n}</span>
                  <span className="uppercase">{item.t}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* 3D Scene */}
          <motion.div
            className="order-1 lg:order-2 relative aspect-square w-full max-w-[600px] mx-auto"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <DynamicVisual name={heroScene} className="absolute inset-0" />
            {heroExtra}
          </motion.div>
        </div>

        {/* Bottom index line */}
        <div className="absolute bottom-8 left-6 right-6 flex justify-between text-[10px] font-mono text-ink-4 tracking-widest">
          <span>ARCHAI — INTEGRATED SYSTEMS</span>
          <span className={accentClasses.text}>/{kind.toUpperCase()}</span>
        </div>
      </section>

      {/* ============================================================
          CARDS GRID
          ============================================================ */}
      <section className="relative py-24 lg:py-32">
        <div className="wrap">
          <Reveal variant={fadeUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end mb-16">
              <div>
                <span className="section-kicker">{ar ? "ما نقدمه" : "WHAT WE DO"}</span>
                <h2 className="section-title">
                  {ar ? "حلول عملية." : "Practical solutions."}
                  <br />
                  <span className="accent">
                    {ar ? "هندسة دقيقة." : "Precise engineering."}
                  </span>
                </h2>
              </div>
              <p className="section-desc md:text-right">
                {ar
                  ? "نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير."
                  : "Strategy, design and engineering work as one system to build digital products that scale."}
              </p>
            </div>
          </Reveal>

          <Stagger delay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card, i) => (
              <StaggerItem key={card.number}>
                <motion.article
                  className="group relative h-full p-7 rounded-3xl glass overflow-hidden"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-grad-primary opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500 rounded-full pointer-events-none" />

                  {/* Shine sweep on hover */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                  <div className="flex items-start justify-between mb-6">
                    <span className="font-mono text-[10px] text-ink-4 tracking-widest">{card.number}</span>
                    <span className="w-12 h-12 grid place-items-center rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-2xl group-hover:rotate-[15deg] transition-transform duration-500">
                      {card.icon}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-medium text-ink-0 mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-3 mb-5">
                    {card.body}
                  </p>

                  {card.tags && card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider text-ink-3 border border-violet-500/20 bg-violet-500/5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom hairline animation */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-grad-signal origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ============================================================
          MID-PAGE 3D VISUAL STRIP — every marketing page gets two more
          distinct animated scenes (fallback keeps them unique per hero).
          ============================================================ */}
      <section className="relative py-20 lg:py-28">
        <div className="wrap">
          <Reveal variant={fadeUp}>
            <span className="section-kicker">{ar ? "أنظمة مرئية" : "LIVE SYSTEM"}</span>
          </Reveal>
          <div className="mt-6 max-w-5xl mx-auto">
            <Hero3DDisplay name={strip[0]} />
          </div>
          <p className="mt-5 text-center text-xs font-mono tracking-widest text-ink-4">
            {ar ? "مشهد تفاعلي مرتبط بموضوع الصفحة" : "An interactive visual system tied to this page"}
          </p>
        </div>
      </section>

      {/* ============================================================
          OPTIONAL EXTRA SECTION
          ============================================================ */}
      {sectionExtra}

      {/* ============================================================
          CTA OUTRO
          ============================================================ */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 nebula opacity-40" aria-hidden />
        <div className="wrap relative text-center max-w-4xl mx-auto">
          <Reveal variant={scaleIn}>
            <span className="section-kicker justify-center inline-flex">
              {ar ? "الخطوة التالية" : "NEXT STEP"}
            </span>
            <h2 className="section-title text-4xl md:text-5xl lg:text-6xl mt-6">
              {outroTitle}
            </h2>
            <p className="section-desc mx-auto mt-6">
              {outroText}
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <MagneticButton href={primaryHref} className="btn-primary">
                {primary}
                <span className="text-xl">↗</span>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}