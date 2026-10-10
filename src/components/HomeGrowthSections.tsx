"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Cpu,
  Gauge,
  Layers3,
  Network,
  ShieldCheck,
  Smartphone,
  Workflow,
} from "lucide-react";
import type { Locale } from "@/lib/types";
import Hero3DDisplay from "./marketing/Hero3DDisplay";

const content = {
  ar: {
    eyebrow: "من الفكرة إلى منتج قابل للنمو",
    title: "نبني التقنية التي تحرّك عملك للأمام",
    intro: "منصات ويب، منتجات رقمية، تكاملات ذكاء اصطناعي، وأنظمة متصلة — تبدأ من احتياج واضح وتنتهي بحل يمكن تشغيله وتطويره وقياس أثره.",
    servicesTitle: "منظومة تقنية متكاملة",
    servicesText: "اختَر نقطة البداية، وسنساعدك على ربط التصميم والهندسة والبنية التقنية في منتج واحد متماسك.",
    services: [
      { icon: Code2, title: "تطوير الويب والمنصات", body: "مواقع مؤسسية، لوحات تحكم، بوابات عملاء، وتطبيقات ويب مصممة للأداء والتوسع.", tags: "Next.js · APIs · SaaS" },
      { icon: BrainCircuit, title: "الذكاء الاصطناعي والأتمتة", body: "مساعدات ذكية، بحث في المعرفة، أتمتة تدفقات العمل، وربط النماذج بالأنظمة القائمة.", tags: "AI · LLM · Automation" },
      { icon: Smartphone, title: "المنتجات وتجربة المستخدم", body: "تجربة استخدام واضحة ومتجاوبة، ونماذج تفاعلية تحوّل المتطلبات إلى رحلات مفهومة.", tags: "UX · Prototyping · Design Systems" },
      { icon: Cpu, title: "الأنظمة المدمجة وإنترنت الأشياء", body: "ربط الأجهزة والحساسات والاتصال والواجهات البرمجية ضمن حلول قابلة للمراقبة والصيانة.", tags: "Embedded · IoT · Telemetry" },
      { icon: Workflow, title: "أنظمة الأعمال وERP", body: "رقمنة العمليات، صلاحيات المستخدمين، تدفقات الموافقات، والتقارير التشغيلية.", tags: "Operations · Workflows · Reporting" },
      { icon: ShieldCheck, title: "التكامل والتحسين التقني", body: "مراجعة المشاريع القائمة، معالجة نقاط الضعف، تحسين الأداء، وتوثيق القرارات التقنية.", tags: "Audits · Performance · Integrations" },
    ],
    processTitle: "خطوات واضحة. قرارات مبنية على فهم.",
    processIntro: "نقلل الغموض قبل كتابة الكود، ونراجع المنتج على مراحل بدل انتظار المفاجآت في النهاية.",
    steps: [
      ["01", "الاكتشاف", "نفهم أهداف العمل والمستخدمين والقيود والنتيجة المطلوبة."],
      ["02", "التصميم والتخطيط", "نحدد نطاقًا واقعيًا، ونرسم تجربة المستخدم والبنية التقنية."],
      ["03", "البناء والتحقق", "ننفذ على مراحل مع مراجعات واختبارات وتغذية راجعة مستمرة."],
      ["04", "الإطلاق والتحسين", "نجهز الإطلاق، ونوثق التشغيل، ونحدد فرص التطوير التالية."],
    ],
    principlesTitle: "ما الذي يجعل الحل جيدًا فعلًا؟",
    principles: [
      [Layers3, "بنية قابلة للتطوير", "نختار الأدوات والبنية بحسب الاحتياج، لا بحسب الموضة."],
      [Gauge, "أداء قابل للقياس", "نهتم بسرعة التحميل، الاستجابة، وإمكانية مراقبة الأخطاء."],
      [Network, "تكامل من البداية", "نخطط للبيانات والواجهات والتكاملات بدل إضافتها عشوائيًا لاحقًا."],
      [CheckCircle2, "تسليم مفهوم", "نوضح النطاق والقرارات والمخرجات، ونترك المشروع قابلًا للصيانة."],
    ],
    visualTitle: "التقنية منظومة مترابطة، وليست أجزاء منفصلة",
    visualText: "تتصل الواجهة والبيانات والخدمات والأتمتة في بنية واحدة؛ كل جزء له دور واضح ويمكن تطويره دون إرباك بقية النظام.",
    sectorsTitle: "حلول تناسب طبيعة عملك",
    sectors: ["التجارة والخدمات", "التعليم والتدريب", "العمليات وإدارة الفرق", "الأجهزة والأنظمة المتصلة", "المنتجات الرقمية الناشئة", "البيانات والأتمتة"],
    faqTitle: "أسئلة تساعدك على اتخاذ الخطوة الأولى",
    faqs: [
      ["هل يمكنكم تطوير مشروع قائم؟", "نعم. نبدأ بمراجعة البنية الحالية وتحديد الأولويات والمخاطر قبل اقتراح خطة تحسين."],
      ["هل يجب أن تكون المتطلبات مكتملة؟", "لا. يكفي أن نبدأ بهدف واضح ومشكلة نريد حلها، ثم نحدد النطاق معًا."],
      ["كيف يتم تحديد الوقت والتكلفة؟", "بعد فهم النطاق والتكاملات والمخرجات المطلوبة، نقسم العمل إلى مراحل وتقدير واضح."],
    ],
    ctaTitle: "لديك فكرة أو نظام يحتاج إلى تطوير؟",
    ctaText: "شاركنا الهدف والتحدي الحالي، وسنساعدك على تحديد الخطوة التقنية المناسبة.",
    cta: "ابدأ مناقشة مشروعك",
    more: "استكشف التفاصيل",
  },
  en: {
    eyebrow: "From idea to a product that can grow",
    title: "We build technology that moves your business forward",
    intro: "Web platforms, digital products, AI integrations and connected systems — shaped around a clear need and built to run, evolve and deliver measurable value.",
    servicesTitle: "An integrated technology practice",
    servicesText: "Start with the problem you need to solve. We connect design, engineering and infrastructure into one coherent product.",
    services: [
      { icon: Code2, title: "Websites and platforms", body: "Corporate websites, dashboards, customer portals and web apps engineered for speed and growth.", tags: "Next.js · APIs · SaaS" },
      { icon: BrainCircuit, title: "AI and automation", body: "AI assistants, knowledge search, workflow automation and integrations with existing systems.", tags: "AI · LLM · Automation" },
      { icon: Smartphone, title: "Digital products and UX", body: "Responsive user journeys and interactive prototypes that turn requirements into usable experiences.", tags: "UX · Prototyping · Design Systems" },
      { icon: Cpu, title: "Embedded systems and IoT", body: "Connect devices, sensors, communication and software interfaces into maintainable solutions.", tags: "Embedded · IoT · Telemetry" },
      { icon: Workflow, title: "Business systems and ERP", body: "Digitized operations, user permissions, approval flows and operational reporting.", tags: "Operations · Workflows · Reporting" },
      { icon: ShieldCheck, title: "Integration and engineering", body: "Review existing products, address weak points, improve performance and document technical decisions.", tags: "Audits · Performance · Integrations" },
    ],
    processTitle: "Clear steps. Decisions grounded in understanding.",
    processIntro: "We reduce uncertainty before implementation and review the product in stages instead of leaving surprises until the end.",
    steps: [
      ["01", "Discover", "Understand business goals, users, constraints and the desired outcome."],
      ["02", "Design and plan", "Define a realistic scope, user experience and technical architecture."],
      ["03", "Build and validate", "Deliver in stages with reviews, testing and continuous feedback."],
      ["04", "Launch and improve", "Prepare the release, document operations and identify the next improvements."],
    ],
    principlesTitle: "What makes a solution work well?",
    principles: [
      [Layers3, "Scalable architecture", "Choose tools and architecture for the actual need, not the trend."],
      [Gauge, "Measurable performance", "Care about load speed, responsiveness and observability."],
      [Network, "Integration by design", "Plan data, APIs and integrations rather than bolting them on later."],
      [CheckCircle2, "Clear handover", "Make scope, decisions and deliverables clear and keep the product maintainable."],
    ],
    visualTitle: "Technology is a connected system, not isolated parts",
    visualText: "Interfaces, data, services and automation work together in one architecture. Each component has a clear role and can evolve without destabilizing the rest.",
    sectorsTitle: "Solutions shaped around your work",
    sectors: ["Commerce and services", "Education and training", "Operations and teams", "Connected devices", "Emerging digital products", "Data and automation"],
    faqTitle: "Questions that help you take the first step",
    faqs: [
      ["Can you improve an existing product?", "Yes. We review the current architecture and identify priorities and risks before proposing an improvement plan."],
      ["Do requirements need to be complete?", "No. A clear goal and problem are enough to start defining the scope together."],
      ["How are timeline and cost estimated?", "Once we understand scope, integrations and deliverables, we break the work into clear phases and estimates."],
    ],
    ctaTitle: "Have an idea or a system that needs improvement?",
    ctaText: "Tell us about your goal and current challenge. We will help identify a suitable technical next step.",
    cta: "Discuss your project",
    more: "Explore details",
  },
} as const;

export default function HomeGrowthSections({ lang }: { lang: Locale }) {
  const ar = lang === "ar";
  const c = content[lang];
  const reduce = useReducedMotion();
  const reveal = reduce ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 } };

  return (
    <div className="home-growth relative overflow-hidden">
      <div className="home-growth-orbit home-growth-orbit-a" aria-hidden="true" />
      <div className="home-growth-orbit home-growth-orbit-b" aria-hidden="true" />

      <section className="relative py-24 lg:py-32">
        <div className="wrap grid lg:grid-cols-[.85fr_1.15fr] gap-12 lg:gap-20 items-end">
          <motion.div {...reveal}>
            <span className="section-kicker">{c.eyebrow}</span>
            <h2 className="section-title mt-5">{c.title}</h2>
            <p className="section-desc mt-6">{c.intro}</p>
            <Link href={`/${lang}/services`} className="btn-primary inline-flex mt-8 items-center gap-2">
              {c.more}<ArrowUpRight size={18} />
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            {[
              { n: "01", t: ar ? "فهم المشكلة" : "Problem clarity", d: ar ? "أهداف وحدود واضحة" : "Clear goals and constraints" },
              { n: "02", t: ar ? "تصميم الحل" : "Solution design", d: ar ? "تجربة وبنية متماسكة" : "Coherent UX and architecture" },
              { n: "03", t: ar ? "بناء واختبار" : "Build and validate", d: ar ? "مراحل قابلة للمراجعة" : "Reviewable delivery stages" },
              { n: "04", t: ar ? "تطوير مستمر" : "Continuous improvement", d: ar ? "قياس وتحسين" : "Measure and improve" },
            ].map((item, i) => (
              <motion.article key={item.n} {...reveal} transition={{ duration: 0.6, delay: i * 0.07 }} className="home-step-card">
                <span>{item.n}</span><h3>{item.t}</h3><p>{item.d}</p>
                <div className="home-step-line" />
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 lg:py-28 border-y border-violet-500/10">
        <div className="wrap">
          <motion.div {...reveal} className="max-w-3xl mb-12">
            <span className="section-kicker">{ar ? "قدراتنا" : "CAPABILITIES"}</span>
            <h2 className="section-title mt-4">{c.servicesTitle}</h2>
            <p className="section-desc mt-5">{c.servicesText}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {c.services.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.article key={service.title} {...reveal} transition={{ duration: 0.55, delay: i * 0.055 }} whileHover={reduce ? undefined : { y: -6, rotateX: 1.5 }} className="home-service-card">
                  <div className="home-service-icon"><Icon size={23} strokeWidth={1.7} /></div>
                  <h3>{service.title}</h3><p>{service.body}</p>
                  <div className="home-service-tags">{service.tags}</div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-20 lg:py-28">
        <div className="wrap grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div {...reveal}>
              <span className="section-kicker">{ar ? "طريقة العمل" : "HOW WE WORK"}</span>
              <h2 className="section-title mt-4">{c.processTitle}</h2>
              <p className="section-desc mt-5">{c.processIntro}</p>
            </motion.div>
            <div className="mt-9 space-y-4">
              {c.steps.map(([n, title, body], i) => (
                <motion.div key={n} {...reveal} transition={{ duration: 0.5, delay: i * 0.06 }} className="home-process-row">
                  <span className="home-process-number">{n}</span><div><h3>{title}</h3><p>{body}</p></div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="home-visual-panel">
            <Hero3DDisplay name="WorkflowGraph" caption={ar ? "من الاكتشاف إلى الإطلاق" : "From discovery to launch"} />
            <div className="home-visual-note"><Workflow size={18} /><span>{ar ? "تدفق عمل واضح، ومخرجات يمكن مراجعتها" : "A clear workflow with reviewable deliverables"}</span></div>
          </div>
        </div>
      </section>

      <section className="relative py-20 lg:py-28 bg-violet-500/[0.035]">
        <div className="wrap">
          <motion.div {...reveal} className="max-w-3xl mb-12">
            <span className="section-kicker">{ar ? "معايير التنفيذ" : "ENGINEERING PRINCIPLES"}</span>
            <h2 className="section-title mt-4">{c.principlesTitle}</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {c.principles.map(([Icon, title, body], i) => (
              <motion.article key={title} {...reveal} transition={{ duration: 0.5, delay: i * 0.07 }} className="home-principle-card">
                <Icon size={23} /><h3>{title}</h3><p>{body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 lg:py-28">
        <div className="wrap grid lg:grid-cols-[.9fr_1.1fr] gap-12 items-center">
          <motion.div {...reveal}>
            <span className="section-kicker">{ar ? "هندسة مترابطة" : "CONNECTED ENGINEERING"}</span>
            <h2 className="section-title mt-4">{c.visualTitle}</h2>
            <p className="section-desc mt-5">{c.visualText}</p>
            <Link href={`/${lang}/process`} className="btn-ghost inline-flex mt-7 items-center gap-2">{ar ? "تعرّف على منهجيتنا" : "Explore our process"}<ArrowUpRight size={17} /></Link>
          </motion.div>
          <div className="home-visual-panel">
            <Hero3DDisplay name="ServiceConstellation" caption={ar ? "واجهات · بيانات · خدمات · أتمتة" : "Interfaces · Data · Services · Automation"} />
          </div>
        </div>
      </section>

      <section className="relative py-20 lg:py-28 border-y border-violet-500/10">
        <div className="wrap">
          <motion.div {...reveal} className="max-w-3xl mb-10">
            <span className="section-kicker">{ar ? "مجالات التطبيق" : "WHERE WE HELP"}</span>
            <h2 className="section-title mt-4">{c.sectorsTitle}</h2>
          </motion.div>
          <div className="flex flex-wrap gap-3">
            {c.sectors.map((sector, i) => <motion.span key={sector} {...reveal} transition={{ duration: 0.4, delay: i * 0.04 }} className="home-sector-pill">{sector}<span>↗</span></motion.span>)}
          </div>
          <div className="mt-8"><Link href={`/${lang}/industries`} className="btn-ghost inline-flex items-center gap-2">{ar ? "استكشف القطاعات" : "Explore industries"}<ArrowUpRight size={17} /></Link></div>
        </div>
      </section>

      <section className="relative py-20 lg:py-28">
        <div className="wrap grid lg:grid-cols-[.7fr_1.3fr] gap-12">
          <motion.div {...reveal}>
            <span className="section-kicker">{ar ? "إجابات سريعة" : "QUICK ANSWERS"}</span>
            <h2 className="section-title mt-4">{c.faqTitle}</h2>
            <p className="section-desc mt-5">{ar ? "لو عندك سؤال عن النطاق أو التعاون، ستجد هنا نقطة بداية واضحة." : "If you have questions about scope or collaboration, start with these practical answers."}</p>
            <Link href={`/${lang}/faq`} className="btn-ghost inline-flex mt-6 items-center gap-2">{ar ? "كل الأسئلة" : "All FAQs"}<ArrowUpRight size={17} /></Link>
          </motion.div>
          <div className="space-y-3">
            {c.faqs.map(([q, a], i) => <motion.details key={q} {...reveal} transition={{ duration: 0.45, delay: i * 0.06 }} className="home-faq"><summary>{q}<span>+</span></summary><p>{a}</p></motion.details>)}
          </div>
        </div>
      </section>

      <section className="home-cta-section relative py-24 lg:py-32 overflow-hidden">
        <div className="home-cta-orbit" aria-hidden="true" />
        <motion.div {...reveal} className="wrap relative z-10 max-w-4xl text-center">
          <span className="section-kicker justify-center">{ar ? "الخطوة التالية" : "YOUR NEXT STEP"}</span>
          <h2 className="section-title mt-5">{c.ctaTitle}</h2>
          <p className="section-desc mx-auto mt-5">{c.ctaText}</p>
          <Link href={`/${lang}/contact`} className="btn-primary inline-flex items-center gap-2 mt-8">{c.cta}<ArrowUpRight size={18} /></Link>
        </motion.div>
      </section>
    </div>
  );
}
