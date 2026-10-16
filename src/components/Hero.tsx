"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { tr, pick } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { MagneticButton, AnimatedNumber } from "./motion";
import LazyVisual from "./visuals/LazyVisual";

type HeroProps = {
  lang: Locale;
  settings: Record<string, any>;
  count: number;
  categoryCount?: number;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryHref?: string;
  secondaryHref?: string;
  capabilityLabels?: string[];
  eyebrow?: string;
};

export default function Hero({ lang, settings, count, categoryCount = 0, primaryLabel, secondaryLabel, primaryHref, secondaryHref, capabilityLabels, eyebrow }: HeroProps) {
  const T = tr(lang);
  const ar = lang === "ar";
  const reduce = useReducedMotion();
  const localizedTitle = ar
    ? (settings.home_title_ar || T("heroT"))
    : (settings.home_title_en || T("heroT"));
  const desc = pick(settings, "home_desc", lang) || T("heroDesc");
  const appear = (delay = 0) => reduce
    ? { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.42, delay: Math.min(delay, 0.28), ease: [0.2, 0.75, 0.25, 1] as [number, number, number, number] } };

  const facts = [
    { value: count, label: ar ? "مشروع منشور" : "Published projects" },
    ...(categoryCount > 0 ? [{ value: categoryCount, label: ar ? "مجال تخصصي" : "Expertise areas" }] : []),
    ...(Number(settings.years_experience || 0) > 0
      ? [{ value: Number(settings.years_experience), label: ar ? "سنوات خبرة" : "Years of experience" }]
      : []),
  ];
  const capabilityColors = ["#4ce2d0", "#7c5cff", "#ad97ff"];
  const savedCapabilities = Array.isArray(capabilityLabels)
    ? capabilityLabels.map((label) => label.trim()).filter(Boolean).slice(0, 3)
    : [];
  const capabilities = (savedCapabilities.length ? savedCapabilities : [T("metaEmbedded"), T("metaWeb"), T("metaMobile")])
    .map((label, index) => ({ label, color: capabilityColors[index] }));
  const brandName = typeof settings.company_name === "string" && settings.company_name.trim()
    ? settings.company_name.trim()
    : "ARCHAI";
  const brandTagline = (ar ? settings.brand_tagline_ar : settings.brand_tagline_en) || (ar ? "أنظمة متكاملة" : "INTEGRATED SYSTEMS");

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[min(900px,100svh)] items-center overflow-hidden"
      aria-label={ar ? "مقدمة أركاي" : "Archai introduction"}
    >
      {/* The planet lives on the side opposite the copy, with a soft fade into the text. */}
      <div
        className={`pointer-events-none absolute ${ar ? "left-0" : "right-0"} top-14 h-[58%] w-[62%] max-w-[300px] sm:inset-y-0 sm:h-auto sm:w-[43%] sm:max-w-[380px] lg:w-[37%] lg:max-w-[440px]`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_54%_48%,rgba(69,101,196,0.13),transparent_60%)]" />
        <LazyVisual name="HeroCore" className="absolute inset-0" rootMargin="0px" />
        <div className={`absolute inset-0 ${ar ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-[var(--bg-0)] via-[color-mix(in_srgb,var(--bg-0)_55%,transparent)] to-transparent`} />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg-0)] to-transparent" />
      </div>

      <div className="wrap relative z-10 grid w-full grid-cols-1 items-center gap-7 py-24 md:py-28 lg:grid-cols-[1.12fr_.88fr] lg:gap-8">
        <div className="max-w-3xl lg:max-w-[42rem]">
          <motion.div {...appear(0)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-mint-500/25 bg-mint-500/[0.07] px-3.5 py-2 backdrop-blur-sm">
            <span className="relative grid size-2 place-items-center">
              <span className="absolute size-2 rounded-full bg-mint-300 opacity-30 motion-safe:animate-ping" />
              <span className="relative size-1.5 rounded-full bg-mint-300" />
            </span>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-mint-300">
              {ar ? `أهلاً بكم في ${brandName}` : `WELCOME TO ${brandName.toLocaleUpperCase("en")}` }
            </span>
          </motion.div>

          <motion.p {...appear(0.08)} className="mb-4 flex items-center gap-3 text-[11px] font-mono font-semibold uppercase tracking-[0.2em] text-violet-300">
            <span className="h-px w-8 bg-current" />{eyebrow || T("heroEyebrow")}
          </motion.p>

          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="font-display text-[clamp(2.55rem,5.7vw,5.2rem)] font-medium leading-[1.05] tracking-tight text-ink-0"
          >
            <span className="bg-grad-text-light bg-clip-text text-transparent dark:bg-grad-text">{localizedTitle}</span>
          </motion.h1>

          <motion.p initial={false} animate={{ opacity: 1, y: 0 }} className="mt-7 max-w-2xl text-base leading-8 text-ink-3 md:text-lg">
            {desc}
          </motion.p>

          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} className="mt-9 flex flex-wrap gap-3">
            <MagneticButton href={primaryHref || `/${lang}/projects`} className="btn-primary">
              {primaryLabel || T("ctaExplore")}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </MagneticButton>
            <Link href={secondaryHref || `/${lang}/about`} className="btn-ghost">
              {secondaryLabel || (ar ? "عن أركاي" : "About Archai")} <span aria-hidden="true">↗</span>
            </Link>
          </motion.div>

          <motion.div {...appear(0.48)} className={`mt-10 grid max-w-xl ${facts.length > 2 ? "grid-cols-3" : "grid-cols-2"} gap-3 border-t border-violet-500/15 pt-6 sm:gap-6`}>
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-0">
                <div className="font-display text-2xl font-medium text-ink-0 md:text-3xl">
                  <AnimatedNumber value={fact.value} />
                </div>
                <div className="mt-1.5 max-w-[12rem] text-[10px] leading-5 text-ink-4 md:text-xs">{fact.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div {...appear(0.56)} className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
            {capabilities.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.1em] text-ink-3 md:text-[11px]">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 9px ${item.color}55` }} />
                {item.label}
              </span>
            ))}
          </motion.div>
        </div>
        <div className="hidden min-h-[320px] lg:block" aria-hidden="true" />
      </div>

      <motion.a
        href="#home-overview"
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-ink-4 transition-colors hover:text-mint-300"
        aria-label={T("scroll")}
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 0.8, duration: reduce ? 0 : 0.4 }}
      >
        <span className="text-[9px] font-mono uppercase tracking-[0.22em]">{T("scroll")}</span>
        <span className="grid size-7 place-items-center rounded-full border border-current/25 text-sm" aria-hidden="true">↓</span>
      </motion.a>
    </section>
  );
}
