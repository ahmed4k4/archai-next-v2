import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/types";
import type { VisualName } from "../visuals/DynamicVisual";
import LazyVisual from "../visuals/LazyVisual";
import Hero3DDisplay from "./Hero3DDisplay";
import { type PageKey, stripFor, sceneFor } from "../visuals/PageScenes";

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
  sections?: Record<string, unknown> | null;
};

export default function MarketingPage({
  lang,
  kind,
  eyebrow,
  title,
  accent,
  description,
  primary = "Start a project",
  primaryHref = `/${lang}/contact`,
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
  sections,
}: MarketingPageProps) {
  const ar = lang === "ar";
  const isProjectsArchiveHref = (value?: string) => Boolean(value && (/(?:^|\/)projects\/?$/.test(value) || /\/(?:ar|en)\/projects\/?$/.test(value)));
  const pageKey = (kind in { home: 1, services: 1, industries: 1, about: 1, process: 1, insights: 1, contact: 1, "case-studies": 1, careers: 1, faq: 1 } ? kind : "services") as PageKey;
  const cmsSections = sections && typeof sections === "object" ? sections : {};
  const validVisuals = new Set<VisualName>(["HeroCore", "ServiceConstellation", "IndustryRings", "DNAHelix", "WorkflowGraph", "KnowledgeFragments", "SignalBeacon", "SuccessMetrics", "TeamOrbit", "QABubbles", "ProjectOrbit"]);
  const selectedHero = typeof cmsSections.heroVisual === "string" && validVisuals.has(cmsSections.heroVisual as VisualName)
    ? cmsSections.heroVisual as VisualName : undefined;
  const configuredStrip = Array.isArray(cmsSections.stripVisuals)
    ? cmsSections.stripVisuals.filter((value): value is VisualName => typeof value === "string" && validVisuals.has(value as VisualName)).slice(0, 2)
    : [];
  const strip = stripVisuals ?? (configuredStrip.length === 2 ? configuredStrip as [VisualName, VisualName] : stripFor(pageKey));
  const heroScene: VisualName = visual ?? selectedHero ?? sceneFor(pageKey);
  const sectionEyebrow = (cmsSections.cardsEyebrow as string) || (ar ? "ما نقدمه" : "WHAT WE DO");
  const sectionTitle = (cmsSections.cardsTitle as string) || (ar ? "حلول عملية." : "Practical solutions.");
  const sectionAccent = (cmsSections.cardsAccent as string) || (ar ? "هندسة دقيقة." : "Precise engineering.");
  const sectionDescription = (cmsSections.cardsDescription as string) || (ar
    ? "نربط الاستراتيجية والتصميم والهندسة في منظومة واحدة لبناء منتجات قابلة للاستخدام والتطوير."
    : "Strategy, design and engineering work as one system to build digital products that scale.");
  const proofItems = Array.isArray(cmsSections.proofPoints)
    ? cmsSections.proofPoints.filter((value): value is { n: string; t: string } => Boolean(value && typeof value === "object" && typeof (value as any).t === "string")).slice(0, 5)
    : [
        { n: "01", t: ar ? "هندسة واضحة" : "Clear engineering" },
        { n: "02", t: ar ? "تصميم قابل للتوسع" : "Built to scale" },
        { n: "03", t: ar ? "تركيز على الأثر" : "Outcome focused" },
      ];
  const liveSystemsLabel = (cmsSections.liveSystemsEyebrow as string) || (ar ? "أنظمة مرئية" : "LIVE SYSTEMS");
  const outroEyebrow = (cmsSections.outroEyebrow as string) || (ar ? "الخطوة التالية" : "NEXT STEP");
  const accentClasses = {
    violet: { text: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/30" },
    mint: { text: "text-mint-300", bg: "bg-mint-500/10", border: "border-mint-500/30" },
    rose: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
  }[accentColor];

  return (
    <main
      lang={lang}
      dir={ar ? "rtl" : "ltr"}
      data-route-ready="true"
      className={`relative overflow-hidden min-h-screen marketing-${kind}`}
    >

      {/* ============================================================
          HERO — 3D scene + headline
          ============================================================ */}
      <section data-gsap-scene className="relative min-h-[min(78vh,760px)] lg:min-h-[92vh] flex items-center pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="wrap grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          {/* Copy */}
          <div className="order-1 min-w-0 lg:order-1">
            <span
              className={`marketing-copy-reveal marketing-reveal-1 inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase ${accentClasses.text}`}
            >
              <span className="w-6 h-px bg-current" />
              {eyebrow}
            </span>

            <h1
              className="marketing-copy-reveal marketing-reveal-2 mt-6 max-w-full break-words font-display text-[clamp(2rem,9vw,3.25rem)] sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.02] text-ink-0"
            >
              {title}
              <br />
              <span className="bg-grad-text-light dark:bg-grad-text bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-flow">
                {accent}
              </span>
            </h1>

            <p
              className="marketing-copy-reveal marketing-reveal-3 mt-6 text-lg leading-relaxed text-ink-3 max-w-2xl"
            >
              {description}
            </p>

            <div className="marketing-copy-reveal marketing-reveal-4 mt-10 flex flex-wrap gap-4">
              {primaryHref.startsWith("/") && !primaryHref.startsWith("//") ? (
                <Link href={primaryHref} prefetch={false} className="btn-primary">
                  {primary}<span className="text-xl">↗</span>
                </Link>
              ) : (
                <a href={primaryHref} className="btn-primary">
                  {primary}<span className="text-xl">↗</span>
                </a>
              )}
              {secondary && secondaryHref && (
                <Link href={secondaryHref} prefetch={isProjectsArchiveHref(secondaryHref) ? true : undefined} className="btn-ghost">
                  {secondary}
                  <span className="text-lg">↗</span>
                </Link>
              )}
            </div>

            {/* Proof strip */}
            <div className="marketing-proof-strip mt-12 pt-6 border-t border-violet-500/15 flex flex-wrap gap-6">
              {proofItems.map((item, i) => (
                <div
                  key={item.n}
                  className="marketing-proof-item flex items-center gap-2 text-xs text-ink-4 font-mono tracking-wider"
                  style={{ animationDelay: `${Math.min(i, 5) * 45}ms` }}
                >
                  <span className="text-mint-400">{item.n}</span>
                  <span className="uppercase">{item.t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Scene */}
          <div
            className="marketing-visual-reveal order-2 lg:order-2 relative h-[170px] w-full max-w-[340px] mx-auto sm:aspect-square sm:h-auto sm:max-w-[440px] lg:max-w-[600px]"
          >
            <div className="absolute inset-0">
              <LazyVisual name={heroScene} className="absolute inset-0" rootMargin="360px 0px" />
            </div>
            {heroExtra}
          </div>
        </div>

        {/* Bottom index line */}
        <div className="absolute bottom-8 left-6 right-6 hidden justify-between text-[10px] font-mono text-ink-4 tracking-widest sm:flex">
          <span>ARCHAI — INTEGRATED SYSTEMS</span>
          <span className={accentClasses.text}>/{kind.toUpperCase()}</span>
        </div>
      </section>

      {/* ============================================================
          CARDS GRID
          ============================================================ */}
      <section className="marketing-cards-section relative py-20 sm:py-24 lg:py-32">
        <div className="wrap">
          <div className="marketing-section-reveal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-end mb-10 md:mb-16">
              <div>
                <span className="section-kicker">{sectionEyebrow}</span>
                <h2 className="section-title">
                  {sectionTitle}
                  <br />
                  <span className="accent">{sectionAccent}</span>
                </h2>
              </div>
              <p className="section-desc md:text-right">{sectionDescription}</p>
            </div>
          </div>

          <div className="marketing-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {cards.map((card, i) => (
              <div
                key={card.number}
                className="marketing-card-item h-full"
                style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
              >
                <article
                  id={kind === "services" ? `service-${(["software-engineering", "business-systems", "artificial-intelligence", "embedded-systems", "mobile-applications", "continuous-improvement"][i] || i + 1)}` : undefined}
                  className="marketing-card-shell group relative h-full scroll-mt-28 rounded-3xl glass overflow-hidden p-5 sm:p-7"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-grad-primary opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500 rounded-full pointer-events-none" />
                  <div className="marketing-card-shine pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                  <div className="flex items-start justify-between mb-6">
                    <span className="font-mono text-[10px] text-ink-4 tracking-widest">{card.number}</span>
                    <span className="marketing-card-icon w-12 h-12 grid place-items-center rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-2xl">
                      {card.icon}
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-medium text-ink-0 mb-3">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-3 mb-5">{card.body}</p>

                  {card.tags && card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider text-ink-3 border border-violet-500/20 bg-violet-500/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="marketing-card-hairline absolute bottom-0 left-0 right-0 h-[2px] bg-grad-signal origin-left" />
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          MID-PAGE 3D VISUAL STRIP — every marketing page gets two more
          distinct animated scenes (fallback keeps them unique per hero).
          ============================================================ */}
      <section className="marketing-visual-strip relative py-20 lg:py-28 hidden md:block">
        <div className="wrap">
          <div className="marketing-section-reveal">
            <span className="section-kicker">{liveSystemsLabel}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {strip.map((v) => (
              <Hero3DDisplay key={v} name={v} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          OPTIONAL EXTRA SECTION
          ============================================================ */}
      {sectionExtra}

      {/* ============================================================
          CTA OUTRO
          ============================================================ */}
      <section className="marketing-outro relative py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none hidden md:block" aria-hidden>
          <LazyVisual name={strip[1]} className="absolute inset-0" rootMargin="180px 0px" />
        </div>

        <div className="wrap relative text-center max-w-4xl mx-auto">
          <div className="marketing-outro-reveal">
            <span className="section-kicker justify-center inline-flex">
              {outroEyebrow}
            </span>
            <h2 className="section-title text-4xl md:text-5xl lg:text-6xl mt-6">
              {outroTitle}
            </h2>
            <p className="section-desc mx-auto mt-6">
              {outroText}
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              {primaryHref.startsWith("/") && !primaryHref.startsWith("//") ? (
                <Link href={primaryHref} prefetch={false} className="btn-primary">
                  {primary}<span className="text-xl">↗</span>
                </Link>
              ) : (
                <a href={primaryHref} className="btn-primary">
                  {primary}<span className="text-xl">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
