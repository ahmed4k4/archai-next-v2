"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode, ComponentType } from "react";
import type { Locale } from "@/lib/types";
import DynamicVisual, { type VisualName } from "../visuals/DynamicVisual";
import Hero3DDisplay from "./Hero3DDisplay";
import { type PageKey, stripFor, sceneFor } from "../visuals/PageScenes";
import Backdrop from "../visuals/Backdrop";
import { Reveal, Stagger, StaggerItem, MagneticButton } from "../motion";
import { fadeUp, scaleIn, textReveal } from "@/lib/motion";
import ThreeDContentStage from "./ThreeDContentStage";
import Scroll3DCard from "./Scroll3DCard";

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
  const sectionCopy: Record<PageKey, { kicker: string; title: string; accent: string; body: string }> = {
    home: { kicker: ar ? "منظومة أركاي" : "THE ARCHAI SYSTEM", title: ar ? "تقنية تعمل معًا." : "Technology that works together.", accent: ar ? "نتائج يمكن تطويرها." : "Outcomes built to evolve.", body: ar ? "نجمع المنتج والتصميم والهندسة والتكاملات في حل واحد واضح بدل أدوات متفرقة." : "We connect product thinking, design, engineering and integrations into one coherent solution." },
    services: { kicker: ar ? "قدراتنا التقنية" : "OUR CAPABILITIES", title: ar ? "من الفكرة إلى نظام قابل للتشغيل." : "From idea to working system.", accent: ar ? "خدمات مترابطة." : "Connected capabilities.", body: ar ? "نختار التقنية بناءً على احتياج العمل، ثم نبنيها لتكون قابلة للصيانة والتوسع." : "We select technology around the business need, then build for maintainability and scale." },
    industries: { kicker: ar ? "القطاعات" : "INDUSTRIES", title: ar ? "حلول تناسب طريقة عملك." : "Solutions shaped around your work.", accent: ar ? "لا قوالب جاهزة." : "Not one-size-fits-all.", body: ar ? "نراعي طبيعة المستخدمين والعمليات والبيانات والقيود الخاصة بكل قطاع." : "We account for each sector’s users, workflows, data and operating constraints." },
    about: { kicker: ar ? "من نحن" : "ABOUT ARCHAI", title: ar ? "هندسة واضحة. تعاون حقيقي." : "Clear engineering. Real collaboration.", accent: ar ? "بناء بثقة." : "Built with intent.", body: ar ? "نعمل على تحويل الاحتياجات المعقدة إلى منتجات مفهومة يمكن تشغيلها وقياسها وتطويرها." : "We turn complex needs into understandable products that can be operated, measured and improved." },
    process: { kicker: ar ? "منهجية العمل" : "HOW WE WORK", title: ar ? "خطوات واضحة من البداية." : "A clear path from day one.", accent: ar ? "قرارات بلا تخمين." : "Fewer assumptions.", body: ar ? "نقسم العمل إلى مراحل قابلة للمراجعة، ونوضح النطاق والمخرجات والمخاطر قبل التوسع." : "We work in reviewable stages and clarify scope, deliverables and risks before scaling." },
    insights: { kicker: ar ? "الرؤى والمعرفة" : "INSIGHTS & KNOWLEDGE", title: ar ? "أفكار تساعد على اتخاذ قرار أفضل." : "Ideas for better technical decisions.", accent: ar ? "معرفة قابلة للتطبيق." : "Knowledge you can use.", body: ar ? "نركز على الدروس العملية في بناء المنتجات والأنظمة والاختيارات التقنية." : "Practical perspectives on product delivery, system design and technology choices." },
    contact: { kicker: ar ? "ابدأ محادثة" : "START A CONVERSATION", title: ar ? "لنتحدث عن التحدي الحقيقي." : "Let’s discuss the real challenge.", accent: ar ? "ثم نحدد الخطوة التالية." : "Then define the next step.", body: ar ? "شاركنا الهدف والقيود الحالية، وسنساعدك على تحديد نطاق عملي للبدء." : "Share the goal and current constraints; we’ll help shape a practical starting scope." },
    "case-studies": { kicker: ar ? "دراسات الحالة" : "CASE STUDIES", title: ar ? "من المشكلة إلى التنفيذ." : "From problem to implementation.", accent: ar ? "ما الذي تغيّر؟" : "What changed?", body: ar ? "نستعرض المشاريع من زاوية المشكلة والحل والقرارات التقنية، دون اختلاق نتائج أو أرقام غير موثقة." : "Explore the problem, solution and engineering decisions without invented metrics or unsupported claims." },
    careers: { kicker: ar ? "العمل معنا" : "CAREERS & COLLABORATION", title: ar ? "نبني أفضل عندما نتعاون." : "Better work through collaboration.", accent: ar ? "تعلم. شارك. طوّر." : "Learn. Contribute. Improve.", body: ar ? "نقدّر التفكير المنظم والتواصل الواضح والرغبة في بناء حلول يمكن الاعتماد عليها." : "We value structured thinking, clear communication and a drive to build dependable solutions." },
    faq: { kicker: ar ? "الأسئلة الشائعة" : "FREQUENTLY ASKED QUESTIONS", title: ar ? "إجابات واضحة قبل البداية." : "Clarity before getting started.", accent: ar ? "اسأل بثقة." : "Ask with confidence.", body: ar ? "إليك إجابات أولية عن طريقة العمل وتحديد النطاق والتطوير والتعاون." : "Find initial guidance on delivery, scoping, development and collaboration." },
    project: { kicker: ar ? "تفاصيل المشروع" : "PROJECT DETAILS", title: ar ? "فهم الحل من الداخل." : "Understand the solution inside out.", accent: ar ? "السياق قبل التفاصيل." : "Context before detail.", body: ar ? "استكشف هدف المشروع ومكوناته والتقنيات المستخدمة بحسب المعلومات المتاحة." : "Explore the project goal, components and technologies based on the available information." },
    category: { kicker: ar ? "مجموعة المشاريع" : "PROJECT COLLECTION", title: ar ? "أعمال ضمن مجال واحد." : "Work grouped by capability.", accent: ar ? "استكشف التفاصيل." : "Explore the details.", body: ar ? "تصفح المشاريع المرتبطة بهذا المجال وقارن بين أهدافها وتنفيذها." : "Browse projects within this area and explore their goals and implementation." },
  };
  const pageSection = sectionCopy[pageKey];
  const accentClasses = {
    violet: { text: "text-violet-300", bg: "bg-violet-500/10", border: "border-violet-500/30" },
    mint: { text: "text-mint-300", bg: "bg-mint-500/10", border: "border-mint-500/30" },
    rose: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
  }[accentColor];

  return (
    <main
      lang={lang}
      dir={ar ? "rtl" : "ltr"}
      className={`relative overflow-hidden min-h-screen marketing-${kind}`} data-marketing-page={pageKey}
    >
      {/* A content-aware, low-contrast 3D field remains behind the page while scrolling. */}
      <Backdrop name={pageKey} />
      {/* ============================================================
          HERO — 3D scene + headline
          ============================================================ */}
      <section className="relative min-h-[92vh] flex items-center pt-24 pb-20">
        <div className="wrap grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          {/* Copy */}
          <div className="order-2 lg:order-1 relative">
            <ThreeDContentStage page={pageKey} ar={ar} />
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
                <Scroll3DCard
                  as="span"
                  key={item.n}
                  className="marketing-3d-proof inline-flex items-center gap-2 text-xs text-ink-4 font-mono tracking-wider"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                >
                  <span className="text-mint-400">{item.n}</span>
                  <span className="uppercase">{item.t}</span>
                </Scroll3DCard>
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
                <span className="section-kicker">{pageSection.kicker}</span>
                <h2 className="section-title">
                  {pageSection.title}
                  <br />
                  <span className="accent">
                    {pageSection.accent}
                  </span>
                </h2>
              </div>
              <p className="section-desc md:text-right">
                {pageSection.body}
              </p>
            </div>
          </Reveal>

          <div className="three-d-card-stage">
            <Stagger delay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card, i) => (
              <StaggerItem key={card.number}>
                <Scroll3DCard
                  className="group marketing-3d-card relative h-full p-7 rounded-3xl glass overflow-hidden"
                >
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-grad-primary opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500 rounded-full pointer-events-none" />

                  {/* Shine sweep on hover */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                  <div className="marketing-3d-card-content flex items-start justify-between mb-6">
                    <span className="font-mono text-[10px] text-ink-4 tracking-widest">{card.number}</span>
                    <span className="w-12 h-12 grid place-items-center rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-300 text-2xl group-hover:rotate-[15deg] transition-transform duration-500">
                      {card.icon}
                    </span>
                  </div>

                  <h3 className="marketing-3d-card-content font-display text-2xl font-medium text-ink-0 mb-3">
                    {card.title}
                  </h3>
                  <p className="marketing-3d-card-content text-sm leading-relaxed text-ink-3 mb-5">
                    {card.body}
                  </p>

                  {card.tags && card.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="marketing-3d-chip px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider text-ink-3 border border-violet-500/20 bg-violet-500/5"
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
                </Scroll3DCard>
              </StaggerItem>
            ))}
            </Stagger>
          </div>
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
          <div className="mt-16 max-w-5xl mx-auto">
            <Hero3DDisplay name={strip[1]} />
          </div>
          <p className="mt-5 text-center text-xs font-mono tracking-widest text-ink-4">
            {ar ? "طبقة ثلاثية الأبعاد ثانية تكمل قصة الصفحة" : "A second 3D layer completing the page story"}
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